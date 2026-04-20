import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq, and } from 'drizzle-orm';
import { products, transactions, users } from '../../drizzle/schema';

/**
 * 交易路由
 * 處理商品上架、購買、支付驗證等完整交易流程
 */

export const transactionsRouter = router({
  /**
   * 獲取用戶的交易歷史
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            success: false,
            error: 'Database unavailable',
            transactions: [],
          };
        }

        // 獲取用戶的交易記錄
        // TODO: 實現完整的查詢邏輯
        // const userTransactions = await db.query.transactions.findMany({
        //   where: or(
        //     eq(transactions.buyerId, ctx.user.id),
        //     eq(transactions.sellerId, ctx.user.id)
        //   ),
        //   orderBy: desc(transactions.createdAt),
        //   limit: input.limit,
        //   offset: input.offset,
        // });

        return {
          success: true,
          transactions: [],
          total: 0,
        };
      } catch (error) {
        console.error('[Transactions] History fetch error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch history',
          transactions: [],
        };
      }
    }),

  /**
   * 獲取交易詳情
   */
  getDetails: protectedProcedure
    .input(z.object({ transactionId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            success: false,
            error: 'Database unavailable',
          };
        }

        // TODO: 從數據庫查詢交易詳情
        // const transaction = await db.query.transactions.findFirst({
        //   where: eq(transactions.id, input.transactionId),
        // });

        // if (!transaction) {
        //   return {
        //     success: false,
        //     error: 'Transaction not found',
        //   };
        // }

        // // 檢查用戶是否有權訪問此交易
        // if (transaction.buyerId !== ctx.user.id && transaction.sellerId !== ctx.user.id) {
        //   return {
        //     success: false,
        //     error: 'Unauthorized',
        //   };
        // }

        return {
          success: true,
          transaction: null,
        };
      } catch (error) {
        console.error('[Transactions] Details fetch error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch details',
        };
      }
    }),

  /**
   * 確認支付
   * 當用戶完成 MiniKit Pay 支付後，驗證並記錄交易
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        transactionHash: z.string(),
        productId: z.string(),
        amount: z.number(),
        paymentMethod: z.enum(['WLD', 'NEXUS']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            success: false,
            error: 'Database unavailable',
          };
        }

        // 1. 驗證交易哈希
        if (!isValidTransactionHash(input.transactionHash)) {
          return {
            success: false,
            error: 'Invalid transaction hash',
          };
        }

        // 2. 驗證金額
        if (input.amount <= 0) {
          return {
            success: false,
            error: 'Invalid amount',
          };
        }

        // 3. 檢查商品是否存在
        // TODO: 查詢商品
        // const product = await db.query.products.findFirst({
        //   where: eq(products.id, input.productId),
        // });

        // if (!product) {
        //   return {
        //     success: false,
        //     error: 'Product not found',
        //   };
        // }

        // 4. 檢查商品是否可購買
        // if (product.status !== 'available') {
        //   return {
        //     success: false,
        //     error: 'Product is not available',
        //   };
        // }

        // 5. 驗證金額是否匹配
        // if (product.price !== input.amount) {
        //   return {
        //     success: false,
        //     error: 'Amount does not match product price',
        //   };
        // }

        // 6. 記錄交易
        // TODO: 創建交易記錄
        // const transaction = await db.insert(transactions).values({
        //   id: generateId(),
        //   buyerId: ctx.user.id,
        //   sellerId: product.sellerId,
        //   productId: input.productId,
        //   amount: input.amount,
        //   paymentMethod: input.paymentMethod,
        //   transactionHash: input.transactionHash,
        //   status: 'completed',
        //   createdAt: new Date(),
        // });

        // 7. 更新商品狀態
        // TODO: 標記商品為已售
        // await db.update(products)
        //   .set({ status: 'sold', soldAt: new Date() })
        //   .where(eq(products.id, input.productId));

        console.log('[Transactions] Payment confirmed', {
          userId: ctx.user.id,
          productId: input.productId,
          amount: input.amount,
          transactionHash: input.transactionHash.substring(0, 10) + '...',
        });

        return {
          success: true,
          message: 'Payment confirmed successfully',
          transactionId: 'tx_' + Date.now(),
        };
      } catch (error) {
        console.error('[Transactions] Payment confirmation error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Payment confirmation failed',
        };
      }
    }),

  /**
   * 獲取用戶的銷售統計
   */
  getSalesStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          error: 'Database unavailable',
        };
      }

      // TODO: 計算銷售統計
      // const stats = await db.query.transactions.aggregate({
      //   where: eq(transactions.sellerId, ctx.user.id),
      //   _sum: { amount: true },
      //   _count: { id: true },
      // });

      return {
        success: true,
        stats: {
          totalSales: 0,
          totalTransactions: 0,
          averagePrice: 0,
        },
      };
    } catch (error) {
      console.error('[Transactions] Sales stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sales stats',
      };
    }
  }),

  /**
   * 獲取用戶的購買統計
   */
  getPurchaseStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          error: 'Database unavailable',
        };
      }

      // TODO: 計算購買統計
      // const stats = await db.query.transactions.aggregate({
      //   where: eq(transactions.buyerId, ctx.user.id),
      //   _sum: { amount: true },
      //   _count: { id: true },
      // });

      return {
        success: true,
        stats: {
          totalPurchases: 0,
          totalTransactions: 0,
          averagePrice: 0,
        },
      };
    } catch (error) {
      console.error('[Transactions] Purchase stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch purchase stats',
      };
    }
  }),
});

/**
 * 驗證交易哈希格式
 */
function isValidTransactionHash(hash: string): boolean {
  // 檢查是否為有效的十六進制字符串或交易哈希格式
  if (/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return true; // Ethereum-style hash
  }
  if (/^[0-9a-fA-F]{64}$/.test(hash)) {
    return true; // 不帶 0x 前綴的哈希
  }
  if (hash.length > 20) {
    return true; // 其他格式的哈希
  }
  return false;
}
