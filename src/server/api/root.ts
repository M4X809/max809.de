import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { codesRouter } from "./routers/codes";
import { cubeRouter } from "./routers/cube";
import { managementRouter } from "./routers/management";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	codes: codesRouter,
	cube: cubeRouter,
	management: managementRouter,
	// post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
