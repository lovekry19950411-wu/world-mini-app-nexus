import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../../server/_core/index';

export default createExpressMiddleware({
  router: appRouter,
});
