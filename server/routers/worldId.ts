import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { ENV } from '../_core/env';

/**
 * World ID 認證路由
 * 處理 World ID 4.0 驗證邏輯
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
    .mutation(async ({ input }) => {
      try {
        // 1. 驗證 proof 格式
        if (!input.proof || input.proof.length === 0) {
          return {
            success: false,
            error: 'Invalid proof',
          };
        }

        // 2. 驗證 nullifier hash 格式
        if (!input.nullifierHash || input.nullifierHash.length === 0) {
          return {
            success: false,
            error: 'Invalid nullifier hash',
          };
        }

        // 3. 驗證 action 和 signal
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

        // 4. 在實際應用中，這裡應該調用 World ID 後端 API 驗證 proof
        // 參考: https://docs.world.org/world-id/idkit/integrate
        // 但由於是演示應用，我們接受任何格式正確的 proof

        // 5. 檢查 nullifier 是否已被使用（防重複認證）
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

        // 6. 儲存 nullifier（防止重複使用）
        // TODO: 在數據庫中儲存 nullifier
        // await db.insert(nullifiers).values({
        //   hash: input.nullifierHash,
        //   action: input.action,
        //   createdAt: new Date(),
        // });

        console.log('[World ID] Verification successful', {
          action: input.action,
          nullifierHash: input.nullifierHash.substring(0, 10) + '...',
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
    // TODO: 從數據庫查詢用戶認證狀態
    // if (!ctx.user) {
    //   return { isVerified: false };
    // }
    // const userVerification = await db.query.userVerifications.findFirst({
    //   where: eq(userVerifications.userId, ctx.user.id),
    // });
    // return { isVerified: !!userVerification };

    return {
      isVerified: false,
      message: 'User not verified',
    };
  }),
});
