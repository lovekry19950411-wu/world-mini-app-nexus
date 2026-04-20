import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { tokenExchanges, userTokenBalances } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * 代幣兌換路由 - NEXUS ↔ WLD 兌換
 */
export const exchangeRouter = router({
  /**
   * 獲取當前兌換匯率
   */
  getExchangeRate: protectedProcedure.query(async () => {
    try {
      // 固定匯率：1 NEXUS = 0.1 WLD
      const nexusToWldRate = '0.1';
      const wldToNexusRate = '10';

      return {
        success: true,
        rates: {
          nexusToWld: nexusToWldRate,
          wldToNexus: wldToNexusRate,
        },
      };
    } catch (error) {
      console.error('[Exchange] Get rate error:', error);
      return { success: false, error: 'Failed to fetch exchange rate' };
    }
  }),

  /**
   * NEXUS 兌換 WLD
   */
  exchangeNexusToWld: protectedProcedure
    .input(z.object({ amount: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        const nexusAmount = parseFloat(input.amount);
        if (nexusAmount <= 0) {
          return { success: false, error: 'Invalid amount' };
        }

        // 匯率：1 NEXUS = 0.1 WLD
        const exchangeRate = 0.1;
        const wldAmount = nexusAmount * exchangeRate;

        // 獲取用戶當前餘額
        const balance = await db
          .select()
          .from(userTokenBalances)
          .where(eq(userTokenBalances.userId, ctx.user.id));

        if (balance.length === 0) {
          return { success: false, error: 'User balance not found' };
        }

        const currentNexus = parseFloat(balance[0].nexusBalance || '0');
        const currentWld = parseFloat(balance[0].wldBalance || '0');

        if (currentNexus < nexusAmount) {
          return { success: false, error: 'Insufficient NEXUS balance' };
        }

        // 創建兌換記錄
        const exchange = await db.insert(tokenExchanges).values({
          userId: ctx.user.id,
          fromToken: 'nexus',
          toToken: 'wld',
          fromAmount: input.amount,
          toAmount: wldAmount.toString(),
          exchangeRate: exchangeRate.toString(),
          status: 'completed',
        });

        // 更新用戶餘額
        await db
          .update(userTokenBalances)
          .set({
            nexusBalance: (currentNexus - nexusAmount).toString(),
            wldBalance: (currentWld + wldAmount).toString(),
          })
          .where(eq(userTokenBalances.userId, ctx.user.id));

        return {
          success: true,
          message: 'Exchange completed',
          fromAmount: input.amount,
          toAmount: wldAmount.toString(),
          newNexusBalance: (currentNexus - nexusAmount).toString(),
          newWldBalance: (currentWld + wldAmount).toString(),
        };
      } catch (error) {
        console.error('[Exchange] NEXUS to WLD error:', error);
        return { success: false, error: 'Exchange failed' };
      }
    }),

  /**
   * WLD 兌換 NEXUS
   */
  exchangeWldToNexus: protectedProcedure
    .input(z.object({ amount: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        const wldAmount = parseFloat(input.amount);
        if (wldAmount <= 0) {
          return { success: false, error: 'Invalid amount' };
        }

        // 匯率：1 WLD = 10 NEXUS
        const exchangeRate = 10;
        const nexusAmount = wldAmount * exchangeRate;

        // 獲取用戶當前餘額
        const balance = await db
          .select()
          .from(userTokenBalances)
          .where(eq(userTokenBalances.userId, ctx.user.id));

        if (balance.length === 0) {
          return { success: false, error: 'User balance not found' };
        }

        const currentNexus = parseFloat(balance[0].nexusBalance || '0');
        const currentWld = parseFloat(balance[0].wldBalance || '0');

        if (currentWld < wldAmount) {
          return { success: false, error: 'Insufficient WLD balance' };
        }

        // 創建兌換記錄
        await db.insert(tokenExchanges).values({
          userId: ctx.user.id,
          fromToken: 'wld',
          toToken: 'nexus',
          fromAmount: input.amount,
          toAmount: nexusAmount.toString(),
          exchangeRate: exchangeRate.toString(),
          status: 'completed',
        });

        // 更新用戶餘額
        await db
          .update(userTokenBalances)
          .set({
            nexusBalance: (currentNexus + nexusAmount).toString(),
            wldBalance: (currentWld - wldAmount).toString(),
          })
          .where(eq(userTokenBalances.userId, ctx.user.id));

        return {
          success: true,
          message: 'Exchange completed',
          fromAmount: input.amount,
          toAmount: nexusAmount.toString(),
          newNexusBalance: (currentNexus + nexusAmount).toString(),
          newWldBalance: (currentWld - wldAmount).toString(),
        };
      } catch (error) {
        console.error('[Exchange] WLD to NEXUS error:', error);
        return { success: false, error: 'Exchange failed' };
      }
    }),

  /**
   * 獲取兌換歷史
   */
  getExchangeHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const history = await db
        .select()
        .from(tokenExchanges)
        .where(eq(tokenExchanges.userId, ctx.user.id));

      return {
        success: true,
        history,
      };
    } catch (error) {
      console.error('[Exchange] Get history error:', error);
      return { success: false, error: 'Failed to fetch history' };
    }
  }),
});
