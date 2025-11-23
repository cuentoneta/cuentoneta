import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

/**
 * Context passed to all procedures
 */
export type CreateContextOptions = {
	req?: trpcExpress.CreateExpressContextOptions['req'];
	res?: trpcExpress.CreateExpressContextOptions['res'];
};

/**
 * Creates the tRPC context
 */
export const createContext = async (opts?: CreateContextOptions) => {
	return {
		req: opts?.req,
		res: opts?.res,
	};
};

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
