import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { referrals, tasks, userTokenBalances, users } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * 邀請系統路由 - 用戶邀請朋友獲得獎勵
 */
export const referralRouter = router({
  /**
   * 生成邀請碼
   */
  generateReferralCode: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      // 生成唯一的邀請碼
      const referralCode = `REF-${ctx.user.id}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // 檢查是否已有邀請碼
      const existing = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, ctx.user.id));

      if (existing.length > 0) {
        return {
          success: true,
          referralCode: existing[0].referralCode,
          message: 'You already have a referral code',
        };
      }

      // 創建新的邀請記錄
      await db.insert(referrals).values({
        referrerId: ctx.user.id,
        referredUserId: 0, // 初始值，會在用戶使用時更新
        referralCode,
        status: 'active',
      });

      return {
        success: true,
        referralCode,
        message: 'Referral code generated successfully',
      };
    } catch (error) {
      console.error('[Referral] Generate code error:', error);
      return { success: false, error: 'Failed to generate referral code' };
    }
  }),

  /**
   * 獲取用戶的邀請碼
   */
  getMyReferralCode: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const referral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, ctx.user.id));

      if (referral.length === 0) {
        return {
          success: true,
          referralCode: null,
          message: 'No referral code yet',
        };
      }

      return {
        success: true,
        referralCode: referral[0].referralCode,
        rewardClaimed: referral[0].rewardClaimed || 0,
      };
    } catch (error) {
      console.error('[Referral] Get code error:', error);
      return { success: false, error: 'Failed to fetch referral code' };
    }
  }),

  /**
   * 使用邀請碼註冊
   */
  useReferralCode: protectedProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // 查找邀請碼
        const referralRecord = await db
          .select()
          .from(referrals)
          .where(eq(referrals.referralCode, input.referralCode));

        if (referralRecord.length === 0) {
          return { success: false, error: 'Invalid referral code' };
        }

        const referrer = referralRecord[0];

        // 檢查是否已使用過邀請碼
        const existingUse = await db
          .select()
          .from(referrals)
          .where(
            and(
              eq(referrals.referralCode, input.referralCode),
              eq(referrals.referredUserId, ctx.user.id)
            )
          );

        if (existingUse.length > 0) {
          return { success: false, error: 'You already used this referral code' };
        }

        // 更新邀請記錄
        await db
          .update(referrals)
          .set({
            referredUserId: ctx.user.id,
            status: 'active',
          })
          .where(eq(referrals.referralCode, input.referralCode));

        // 給邀請者獎勵
        const referrerReward = '50'; // 邀請者獲得 50 NEXUS
        const referredReward = '25'; // 被邀請者獲得 25 NEXUS

        // 創建邀請任務
        await db.insert(tasks).values({
          userId: referrer.referrerId,
          taskType: 'referral',
          status: 'completed',
          rewardAmount: referrerReward,
          rewardType: 'nexus',
          metadata: JSON.stringify({ referredUserId: ctx.user.id }),
          completedAt: new Date(),
          claimedAt: new Date(),
        });

        // 創建被邀請者任務
        await db.insert(tasks).values({
          userId: ctx.user.id,
          taskType: 'referral',
          status: 'completed',
          rewardAmount: referredReward,
          rewardType: 'nexus',
          metadata: JSON.stringify({ referrerId: referrer.referrerId }),
          completedAt: new Date(),
          claimedAt: new Date(),
        });

        // 更新邀請者的 NEXUS 餘額
        const referrerBalance = await db
          .select()
          .from(userTokenBalances)
          .where(eq(userTokenBalances.userId, referrer.referrerId));

        if (referrerBalance.length > 0) {
          const currentBalance = parseFloat(referrerBalance[0].nexusBalance || '0');
          await db
            .update(userTokenBalances)
            .set({
              nexusBalance: (currentBalance + parseFloat(referrerReward)).toString(),
            })
            .where(eq(userTokenBalances.userId, referrer.referrerId));
        } else {
          await db.insert(userTokenBalances).values({
            userId: referrer.referrerId,
            nexusBalance: referrerReward,
            wldBalance: '0',
          });
        }

        // 更新被邀請者的 NEXUS 餘額
        const referredBalance = await db
          .select()
          .from(userTokenBalances)
          .where(eq(userTokenBalances.userId, ctx.user.id));

        if (referredBalance.length > 0) {
          const currentBalance = parseFloat(referredBalance[0].nexusBalance || '0');
          await db
            .update(userTokenBalances)
            .set({
              nexusBalance: (currentBalance + parseFloat(referredReward)).toString(),
            })
            .where(eq(userTokenBalances.userId, ctx.user.id));
        } else {
          await db.insert(userTokenBalances).values({
            userId: ctx.user.id,
            nexusBalance: referredReward,
            wldBalance: '0',
          });
        }

        return {
          success: true,
          message: 'Referral code used successfully',
          referrerReward,
          referredReward,
        };
      } catch (error) {
        console.error('[Referral] Use code error:', error);
        return { success: false, error: 'Failed to use referral code' };
      }
    }),

  /**
   * 獲取邀請統計
   */
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const referrals_data = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, ctx.user.id));

      const successfulReferrals = referrals_data.filter((r) => r.status === 'active').length;

      // 計算邀請獎勵
      const referralTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, ctx.user.id),
            eq(tasks.taskType, 'referral')
          )
        );

      const totalReferralRewards = referralTasks.reduce(
        (sum, t) => sum + parseFloat(t.rewardAmount || '0'),
        0
      );

      return {
        success: true,
        stats: {
          successfulReferrals,
          totalReferralRewards: totalReferralRewards.toString(),
          referralCode: referrals_data.length > 0 ? referrals_data[0].referralCode : null,
        },
      };
    } catch (error) {
      console.error('[Referral] Get stats error:', error);
      return { success: false, error: 'Failed to fetch referral stats' };
    }
  }),

  /**
   * 獲取邀請的用戶列表
   */
  getReferredUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const referredRecords = await db
        .select()
        .from(referrals)
        .where(
          and(
            eq(referrals.referrerId, ctx.user.id),
            // Only get records where referredUserId is not 0
          )
        );

      // 獲取被邀請者的信息
      const referredUsers = [];
      for (const record of referredRecords) {
        if (record.referredUserId !== 0) {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, record.referredUserId));

          if (user.length > 0) {
            referredUsers.push({
              id: user[0].id,
              name: user[0].name,
              email: user[0].email,
              joinedAt: record.createdAt,
              status: record.status,
            });
          }
        }
      }

      return {
        success: true,
        referredUsers,
      };
    } catch (error) {
      console.error('[Referral] Get referred users error:', error);
      return { success: false, error: 'Failed to fetch referred users' };
    }
  }),
});
