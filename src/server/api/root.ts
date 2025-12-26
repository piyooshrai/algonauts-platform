/**
 * Root tRPC Router
 * Combines all API routers into a single app router
 */

import { createTRPCRouter } from "./trpc/trpc";
import { authRouter } from "./routers/auth";
import { profileRouter } from "./routers/profile";
import { eventsRouter } from "./routers/events";

/**
 * This is the primary router for the API.
 * All routers added here will be available on the client.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  profile: profileRouter,
  events: eventsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
