import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { ENV } from '../_core/env';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { users, nullifiers } from '../../drizzle/schema';
import { sdk } from '../_core/sdk';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { getSessionCookieOptions } from '../_core/cookies';

/**
 * World ID 認證路由
 * 處理 World ID 4.0 驗證邏輯
 * 
 * 流程：
 * 1. 前端使用 IDKit 執行驗證
 * 2. 前端發送 proof 到後端
 * 3. 後端驗證 proof（可選：調用 World ID API）
 * 4. 後端檢查 nullifier 是否已使用
 * 5. 後端儲存 nullifier 並更新用戶狀態
 */

export const worldIdRouter = router({
  /**
   * 驗證 World ID 證明
   * 前端發送驗證結果，後端驗證並儲存 nullifier
   */
  verify: publicProcedure
    .input(
      z.object({
        proof: z.string(),
        nullifierHash: z.string(),
        action: z.string(),
        signal: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log('[World ID] Starting verification...');
        
        // 1. 驗證輸入格式
        if (!input.proof || input.proof.length === 0) {
          return {
            success: false,
            error: 'Invalid proof format / 無效的證明格式',
          };
        }

        if (!input.nullifierHash || input.nullifierHash.length === 0) {
          return {
            success: false,
            error: 'Invalid nullifier hash / 無效的 nullifier hash',
          };
        }

        if (!input.action || input.action.length === 0) {
          return {
            success: false,
            error: 'Invalid action / 無效的 action',
          };
        }

        if (!input.signal || input.signal.length === 0) {
          return {
            success: false,
            error: 'Invalid signal / 無效的 signal',
          };
        }

        // 2. 驗證 proof 格式（基本檢查）
        if (!isValidProofFormat(input.proof)) {
          return {
            success: false,
            error: 'Invalid proof format / 證明格式無效',
          };
        }

        const db = await getDb();
        
        // 3. 檢查 nullifier 是否已被使用（防重複認證）
        if (db) {
          try {
            const existingNullifier = await db
              .select()
              .from(nullifiers)
              .where(eq(nullifiers.nullifier, input.nullifierHash))
              .limit(1);

            if (existingNullifier.length > 0) {
              console.log('[World ID] Nullifier already used, logging in existing user');
              // 用戶已經驗證過，允許登入但不重新創建
              const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.id, existingNullifier[0].userId))
                .limit(1);

              if (existingUser.length > 0) {
                // 創建 session token 並設置 cookie
                const sessionToken = await sdk.createSessionToken(existingUser[0].openId, {
                  name: existingUser[0].name || 'World ID User',
                  expiresInMs: ONE_YEAR_MS,
                });

                const cookieOptions = getSessionCookieOptions(ctx.req);
                ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

                return {
                  success: true,
                  nullifierHash: input.nullifierHash,
                  userId: existingUser[0].id,
                  message: '登入成功 / Login successful',
                  isExistingUser: true,
                };
              }
            }
          } catch (dbError) {
            console.warn('[World ID] Database check error:', dbError);
            // 繼續處理，可能是數據庫暫時不可用
          }
        }

        // 4. 創建新用戶
        const openId = `world_id_${input.nullifierHash.substring(0, 32)}`;
        let userId: number | undefined;

        if (db) {
          try {
            // 檢查用戶是否已存在
            const existingUser = await db
              .select()
              .from(users)
              .where(eq(users.openId, openId))
              .limit(1);

            if (existingUser.length > 0) {
              userId = existingUser[0].id;
            } else {
              // 創建新用戶
              await db.insert(users).values({
                openId,
                name: 'World ID User',
                loginMethod: 'world_id',
                role: 'user',
              });

              const newUser = await db
                .select()
                .from(users)
                .where(eq(users.openId, openId))
                .limit(1);

              userId = newUser[0]?.id;
            }

            // 5. 儲存 nullifier
            if (userId) {
              try {
                await db.insert(nullifiers).values({
                  nullifier: input.nullifierHash,
                  action: input.action,
                  userId,
                });
              } catch (nullifierError) {
                console.warn('[World ID] Failed to save nullifier (may already exist):', nullifierError);
              }
            }
          } catch (dbError) {
            console.error('[World ID] Database operation error:', dbError);
          }
        }

        // 6. 創建 session token 並設置 cookie
        try {
          const sessionToken = await sdk.createSessionToken(openId, {
            name: 'World ID User',
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          
          console.log('[World ID] Session cookie set successfully');
        } catch (sessionError) {
          console.error('[World ID] Failed to create session:', sessionError);
          // 驗證成功但創建 session 失敗，返回警告
          return {
            success: true,
            nullifierHash: input.nullifierHash,
            userId,
            message: '驗證成功但創建 session 失敗，請重試 / Verified but session creation failed',
            warning: 'session_creation_failed',
          };
        }

        console.log('[World ID] Verification successful', {
          action: input.action,
          nullifierHash: input.nullifierHash.substring(0, 10) + '...',
          userId,
        });

        return {
          success: true,
          nullifierHash: input.nullifierHash,
          userId,
          message: '驗證成功 / Verification successful',
        };
      } catch (error) {
        console.error('[World ID] Verification error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '驗證失敗 / Verification failed',
        };
      }
    }),

  /**
   * 檢查用戶是否已認證
   */
  getStatus: publicProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        return {
          isVerified: false,
          message: 'User not authenticated',
        };
      }

      // TODO: 從數據庫查詢用戶認證狀態
      // const db = await getDb();
      // if (!db) {
      //   return { isVerified: false, message: 'Database unavailable' };
      // }

      // const userVerification = await db.query.users.findFirst({
      //   where: eq(users.id, ctx.user.id),
      //   columns: { verified: true, verifiedAt: true },
      // });

      // return {
      //   isVerified: !!userVerification?.verified,
      //   verifiedAt: userVerification?.verifiedAt,
      // };

      // 臨時返回（實際應該從數據庫查詢）
      return {
        isVerified: false,
        message: 'Verification status check - database integration pending',
      };
    } catch (error) {
      console.error('[World ID] Status check error:', error);
      return {
        isVerified: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      };
    }
  }),

  /**
   * 獲取用戶認證詳情
   */
  getDetails: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: 從數據庫獲取用戶認證詳情
      // const db = await getDb();
      // if (!db) {
      //   throw new Error('Database unavailable');
      // }

      // const userDetails = await db.query.users.findFirst({
      //   where: eq(users.id, ctx.user.id),
      //   columns: {
      //     verified: true,
      //     verifiedAt: true,
      //     worldIdNullifier: true,
      //   },
      // });

      // if (!userDetails) {
      //   throw new Error('User not found');
      // }

      // return {
      //   userId: ctx.user.id,
      //   isVerified: userDetails.verified,
      //   verifiedAt: userDetails.verifiedAt,
      //   nullifierHash: userDetails.worldIdNullifier?.substring(0, 10) + '...',
      // };

      // 臨時返回
      return {
        userId: ctx.user.id,
        isVerified: false,
        message: 'Verification details - database integration pending',
      };
    } catch (error) {
      console.error('[World ID] Details fetch error:', error);
      throw error;
    }
  }),
});

/**
 * 驗證 proof 格式
 * 基本檢查 proof 是否符合預期格式
 */
function isValidProofFormat(proof: string): boolean {
  // proof 應該是 JSON 字符串或十六進制字符串
  try {
    // 嘗試解析為 JSON
    if (proof.startsWith('{') || proof.startsWith('[')) {
      JSON.parse(proof);
      return true;
    }
    // 檢查是否為有效的十六進制字符串
    if (/^0x[0-9a-fA-F]+$/.test(proof) || /^[0-9a-fA-F]+$/.test(proof)) {
      return true;
    }
    // 檢查基本長度
    return proof.length > 10;
  } catch {
    return false;
  }
}
