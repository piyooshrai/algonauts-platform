/**
 * Root tRPC Router
 * Combines all API routers into a single app router
 */

import { createTRPCRouter } from "./trpc/trpc";
import { authRouter } from "./routers/auth";
import { profileRouter } from "./routers/profile";
import { eventsRouter } from "./routers/events";
import { placementsRouter } from "./routers/placements";
import { opportunitiesRouter } from "./routers/opportunities";
import { applicationsRouter } from "./routers/applications";
import { invitesRouter } from "./routers/invites";

/**
 * This is the primary router for the API.
 * All routers added here will be available on the client.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  profile: profileRouter,
  events: eventsRouter,
  placements: placementsRouter,
  opportunities: opportunitiesRouter,
  applications: applicationsRouter,
  invites: invitesRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
