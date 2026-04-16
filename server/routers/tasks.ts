import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { tasks, userTokenBalances } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * 任務路由 - 管理用戶任務和獎勵
 */
export const tasksRouter = router({
  /**
   * 獲取用戶的任務列表
   */
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, ctx.user.id));

      return { success: true, tasks: userTasks };
    } catch (error) {
      console.error('[Tasks] Get tasks error:', error);
      return { success: false, error: 'Failed to fetch tasks' };
    }
  }),

  /**
   * 簽到任務 - 每天簽到獲得 NEXUS 獎勵
   */
  dailyCheckin: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingCheckin = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, ctx.user.id),
            eq(tasks.taskType, 'daily_checkin')
          )
        );

      const todayCheckin = existingCheckin.find((t: any) => {
        const createdDate = new Date(t.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === today.getTime();
      });

      if (todayCheckin) {
        return { success: false, error: 'Already checked in today' };
      }

      const rewardAmount = '10';

      await db.insert(tasks).values({
        userId: ctx.user.id,
        taskType: 'daily_checkin',
        status: 'completed',
        rewardAmount,
        rewardType: 'nexus',
        completedAt: new Date(),
        claimedAt: new Date(),
        expiresAt: tomorrow,
      });

      const userBalance = await db
        .select()
        .from(userTokenBalances)
        .where(eq(userTokenBalances.userId, ctx.user.id));

      if (userBalance.length > 0) {
        const currentBalance = parseFloat(userBalance[0].nexusBalance || '0');
        await db
          .update(userTokenBalances)
          .set({
            nexusBalance: (currentBalance + parseFloat(rewardAmount)).toString(),
          })
          .where(eq(userTokenBalances.userId, ctx.user.id));
      } else {
        await db.insert(userTokenBalances).values({
          userId: ctx.user.id,
          nexusBalance: rewardAmount,
          wldBalance: '0',
        });
      }

      return {
        success: true,
        message: 'Daily checkin completed',
        reward: rewardAmount,
      };
    } catch (error) {
      console.error('[Tasks] Daily checkin error:', error);
      return { success: false, error: 'Daily checkin failed' };
    }
  }),

  /**
   * 完成交易獲得獎勵
   */
  claimTransactionReward: protectedProcedure
    .input(z.object({ transactionId: z.number(), amount: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        const rewardAmount = (parseFloat(input.amount) * 0.01).toString();

        await db.insert(tasks).values({
          userId: ctx.user.id,
          taskType: 'transaction',
          status: 'completed',
          rewardAmount,
          rewardType: 'nexus',
          metadata: JSON.stringify({ transactionId: input.transactionId }),
          completedAt: new Date(),
          claimedAt: new Date(),
        });

        const userBalance = await db
          .select()
          .from(userTokenBalances)
          .where(eq(userTokenBalances.userId, ctx.user.id));

        if (userBalance.length > 0) {
          const currentBalance = parseFloat(userBalance[0].nexusBalance || '0');
          await db
            .update(userTokenBalances)
            .set({
              nexusBalance: (currentBalance + parseFloat(rewardAmount)).toString(),
            })
            .where(eq(userTokenBalances.userId, ctx.user.id));
        } else {
          await db.insert(userTokenBalances).values({
            userId: ctx.user.id,
            nexusBalance: rewardAmount,
            wldBalance: '0',
          });
        }

        return {
          success: true,
          message: 'Transaction reward claimed',
          reward: rewardAmount,
        };
      } catch (error) {
        console.error('[Tasks] Claim reward error:', error);
        return { success: false, error: 'Failed to claim reward' };
      }
    }),

  /**
   * 獲取用戶的代幣餘額
   */
  getTokenBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const balance = await db
        .select()
        .from(userTokenBalances)
        .where(eq(userTokenBalances.userId, ctx.user.id));

      if (balance.length === 0) {
        await db.insert(userTokenBalances).values({
          userId: ctx.user.id,
          nexusBalance: '0',
          wldBalance: '0',
        });

        return {
          success: true,
          nexusBalance: '0',
          wldBalance: '0',
        };
      }

      return {
        success: true,
        nexusBalance: balance[0].nexusBalance || '0',
        wldBalance: balance[0].wldBalance || '0',
      };
    } catch (error) {
      console.error('[Tasks] Get balance error:', error);
      return { success: false, error: 'Failed to fetch balance' };
    }
  }),

  /**
   * 獲取任務統計
   */
  getTaskStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, ctx.user.id));

      const completedTasks = userTasks.filter((t: any) => t.status === 'completed').length;
      const claimedTasks = userTasks.filter((t: any) => t.status === 'claimed').length;
      const totalRewards = userTasks.reduce((sum: number, t: any) => sum + parseFloat(t.rewardAmount || '0'), 0);

      return {
        success: true,
        stats: {
          totalTasks: userTasks.length,
          completedTasks,
          claimedTasks,
          totalRewards: totalRewards.toString(),
        },
      };
    } catch (error) {
      console.error('[Tasks] Get stats error:', error);
      return { success: false, error: 'Failed to fetch stats' };
    }
  }),
});
