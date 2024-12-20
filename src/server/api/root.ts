
import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { profileRouter } from "./routers/profile";
import { chatRouter } from "./routers/chat";
import { marketplaceRouter } from "./routers/market";
import { type inferRouterOutputs } from '@trpc/server';


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  profile:profileRouter,
  chat:chatRouter,
  product:marketplaceRouter
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
export type RouterOutputs = inferRouterOutputs<AppRouter>;
