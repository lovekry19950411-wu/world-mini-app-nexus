import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq, and } from 'drizzle-orm';

/**
 * 通知系統路由 - 管理用戶通知
 * 使用 Manus 內置的通知 API
 */
export const notificationsRouter = router({
  /**
   * 發送通知給用戶
   */
  sendNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum(['task', 'reward', 'referral', 'exchange', 'general']).optional(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 使用 Manus 內置通知 API
        const response = await fetch(
          `${process.env.BUILT_IN_FORGE_API_URL}/notification/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            },
            body: JSON.stringify({
              userId: ctx.user.id,
              title: input.title,
              content: input.content,
              type: input.type || 'general',
              actionUrl: input.actionUrl,
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          console.error('[Notifications] Send error:', response.statusText);
          return {
            success: false,
            error: 'Failed to send notification',
          };
        }

        return {
          success: true,
          message: 'Notification sent successfully',
        };
      } catch (error) {
        console.error('[Notifications] Send error:', error);
        return {
          success: false,
          error: 'Failed to send notification',
        };
      }
    }),

  /**
   * 發送任務完成通知
   */
  notifyTaskCompleted: protectedProcedure
    .input(
      z.object({
        taskType: z.string(),
        reward: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const taskTypeLabel = {
          daily_checkin: '每日簽到',
          transaction: '交易獎勵',
          referral: '邀請獎勵',
          social_share: '社交分享',
        }[input.taskType] || '任務';

        const response = await fetch(
          `${process.env.BUILT_IN_FORGE_API_URL}/notification/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            },
            body: JSON.stringify({
              userId: ctx.user.id,
              title: '任務完成！',
              content: `您完成了${taskTypeLabel}，獲得 ${input.reward} NEXUS 獎勵`,
              type: 'task',
              actionUrl: '/tasks',
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          return { success: false, error: 'Failed to send notification' };
        }

        return { success: true, message: 'Task notification sent' };
      } catch (error) {
        console.error('[Notifications] Task notification error:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * 發送邀請成功通知
   */
  notifyReferralSuccess: protectedProcedure
    .input(
      z.object({
        referredUserName: z.string(),
        reward: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await fetch(
          `${process.env.BUILT_IN_FORGE_API_URL}/notification/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            },
            body: JSON.stringify({
              userId: ctx.user.id,
              title: '邀請成功！',
              content: `${input.referredUserName} 使用了您的邀請碼，您獲得 ${input.reward} NEXUS 獎勵`,
              type: 'referral',
              actionUrl: '/exchange',
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          return { success: false, error: 'Failed to send notification' };
        }

        return { success: true, message: 'Referral notification sent' };
      } catch (error) {
        console.error('[Notifications] Referral notification error:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * 發送兌換成功通知
   */
  notifyExchangeSuccess: protectedProcedure
    .input(
      z.object({
        fromToken: z.string(),
        toToken: z.string(),
        amount: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await fetch(
          `${process.env.BUILT_IN_FORGE_API_URL}/notification/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            },
            body: JSON.stringify({
              userId: ctx.user.id,
              title: '兌換成功！',
              content: `您成功兌換了 ${input.amount} ${input.toToken.toUpperCase()}`,
              type: 'exchange',
              actionUrl: '/exchange',
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          return { success: false, error: 'Failed to send notification' };
        }

        return { success: true, message: 'Exchange notification sent' };
      } catch (error) {
        console.error('[Notifications] Exchange notification error:', error);
        return { success: false, error: 'Failed to send notification' };
      }
    }),

  /**
   * 廣播通知給所有用戶
   */
  broadcastNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 只允許管理員發送廣播通知
        if (ctx.user.role !== 'admin') {
          return {
            success: false,
            error: 'Only admins can send broadcast notifications',
          };
        }

        const response = await fetch(
          `${process.env.BUILT_IN_FORGE_API_URL}/notification/broadcast`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            },
            body: JSON.stringify({
              title: input.title,
              content: input.content,
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          return { success: false, error: 'Failed to send broadcast' };
        }

        return { success: true, message: 'Broadcast notification sent' };
      } catch (error) {
        console.error('[Notifications] Broadcast error:', error);
        return { success: false, error: 'Failed to send broadcast' };
      }
    }),
});
