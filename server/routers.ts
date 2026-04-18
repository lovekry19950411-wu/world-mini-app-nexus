import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { worldIdRouter } from "./routers/worldId";
import { paymentRouter } from "./routers/payment";
import { marketplaceRouter } from "./routers/marketplace";
import { transactionsRouter } from "./routers/transactions";
import { tasksRouter } from "./routers/tasks";
import { exchangeRouter } from "./routers/exchange";
import { referralRouter } from "./routers/referral";
import { notificationsRouter } from "./routers/notifications";
import { idkitRouter } from "./routers/idkit";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  worldId: worldIdRouter,
  payment: paymentRouter,
  marketplace: marketplaceRouter,
  transactions: transactionsRouter,
  tasks: tasksRouter,
  exchange: exchangeRouter,
  referral: referralRouter,
  notifications: notificationsRouter,
  idkit: idkitRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
