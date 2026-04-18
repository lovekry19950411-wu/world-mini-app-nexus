import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';

/**
 * MiniKit Pay 支付路由
 * 處理 WLD 和平台代幣支付
 */

export const paymentRouter = router({
  /**
   * 初始化支付
   * 返回支付參數給前端進行 MiniKit Pay 調用
   */
  initiate: publicProcedure
    .input(
      z.object({
        amount: z.string(),
        currency: z.string(),
        description: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 1. 驗證金額
        const amount = parseFloat(input.amount);
        if (isNaN(amount) || amount <= 0) {
          return {
            success: false,
            error: 'Invalid amount',
          };
        }

        // 2. 驗證貨幣類型
        if (!['WLD', 'NEXUS'].includes(input.currency)) {
          return {
            success: false,
            error: 'Invalid currency',
          };
        }

        // 3. 生成支付 ID
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // 4. 準備支付參數
        const paymentParams = {
          paymentId,
          amount: input.amount,
          currency: input.currency,
          description: input.description || 'Nexus Transaction',
          metadata: input.metadata || {},
          timestamp: new Date().toISOString(),
        };

        console.log('[Payment] Initiated payment:', paymentParams);

        return {
          success: true,
          paymentId,
          params: paymentParams,
        };
      } catch (error) {
        console.error('[Payment] Initiation error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Payment initiation failed',
        };
      }
    }),

  /**
   * 驗證支付結果
   * 前端完成 MiniKit Pay 後調用此端點驗證
   */
  verify: publicProcedure
    .input(
      z.object({
        paymentId: z.string(),
        transactionHash: z.string(),
        amount: z.string(),
        currency: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 1. 驗證支付 ID 格式
        if (!input.paymentId.startsWith('pay_')) {
          return {
            success: false,
            error: 'Invalid payment ID',
          };
        }

        // 2. 驗證交易 hash
        if (!input.transactionHash || input.transactionHash.length === 0) {
          return {
            success: false,
            error: 'Invalid transaction hash',
          };
        }

        // 3. 在實際應用中，這裡應該調用 World Chain RPC 驗證交易
        // 但由於是演示應用，我們接受任何格式正確的 hash

        // 4. 記錄交易（TODO: 存儲到數據庫）
        // await db.insert(transactions).values({
        //   paymentId: input.paymentId,
        //   transactionHash: input.transactionHash,
        //   amount: input.amount,
        //   currency: input.currency,
        //   status: 'completed',
        //   createdAt: new Date(),
        // });

        console.log('[Payment] Verified payment:', {
          paymentId: input.paymentId,
          transactionHash: input.transactionHash.substring(0, 10) + '...',
          amount: input.amount,
          currency: input.currency,
        });

        return {
          success: true,
          message: 'Payment verified successfully',
          transactionHash: input.transactionHash,
        };
      } catch (error) {
        console.error('[Payment] Verification error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Payment verification failed',
        };
      }
    }),

  /**
   * 獲取支付狀態
   */
  getStatus: publicProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ input }) => {
      // TODO: 從數據庫查詢支付狀態
      return {
        paymentId: input.paymentId,
        status: 'pending',
        message: 'Payment status check not yet implemented',
      };
    }),
});
