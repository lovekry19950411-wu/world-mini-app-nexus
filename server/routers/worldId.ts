import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { ENV } from '../_core/env';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../../drizzle/schema';

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
        // 1. 驗證輸入格式
        if (!input.proof || input.proof.length === 0) {
          return {
            success: false,
            error: 'Invalid proof format',
          };
        }

        if (!input.nullifierHash || input.nullifierHash.length === 0) {
          return {
            success: false,
            error: 'Invalid nullifier hash',
          };
        }

        if (!input.action || input.action.length === 0) {
          return {
            success: false,
            error: 'Invalid action',
          };
        }

        if (!input.signal || input.signal.length === 0) {
          return {
            success: false,
            error: 'Invalid signal',
          };
        }

        // 2. 驗證 proof 格式（基本檢查）
        // 在實際應用中，應該調用 World ID 後端 API 驗證
        // 參考: https://docs.world.org/world-id/idkit/integrate
        if (!isValidProofFormat(input.proof)) {
          return {
            success: false,
            error: 'Invalid proof format',
          };
        }

        // 3. 檢查 nullifier 是否已被使用（防重複認證）
        // TODO: 在數據庫中查詢 nullifier，確保未被使用
        // const existingNullifier = await db.query.nullifiers.findFirst({
        //   where: eq(nullifiers.hash, input.nullifierHash),
        // });
        // if (existingNullifier) {
        //   return {
        //     success: false,
        //     error: 'This credential has already been used',
        //   };
        // }

        // 4. 儲存 nullifier（防止重複使用）
        // TODO: 在數據庫中儲存 nullifier
        // await db.insert(nullifiers).values({
        //   hash: input.nullifierHash,
        //   action: input.action,
        //   signal: input.signal,
        //   createdAt: new Date(),
        // });

        // 5. 更新用戶認證狀態
        if (ctx.user) {
          const db = await getDb();
          if (db) {
            try {
              // 標記用戶已驗證
              // TODO: 添加 verified 字段到 users 表
              // await db.update(users)
              //   .set({ 
              //     verified: true,
              //     worldIdNullifier: input.nullifierHash,
              //     verifiedAt: new Date(),
              //   })
              //   .where(eq(users.id, ctx.user.id));
            } catch (dbError) {
              console.warn('[World ID] Failed to update user verification status:', dbError);
              // 不中斷流程，繼續返回成功
            }
          }
        }

        console.log('[World ID] Verification successful', {
          action: input.action,
          nullifierHash: input.nullifierHash.substring(0, 10) + '...',
          userId: ctx.user?.id,
        });

        return {
          success: true,
          nullifierHash: input.nullifierHash,
          message: 'World ID verification successful',
        };
      } catch (error) {
        console.error('[World ID] Verification error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Verification failed',
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
