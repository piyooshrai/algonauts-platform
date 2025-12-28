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
// Phase 3: Game Theory routers
import { badgesRouter } from "./routers/badges";
import { streaksRouter } from "./routers/streaks";
import { leaderboardsRouter } from "./routers/leaderboards";
import { activityFeedRouter } from "./routers/activityFeed";
import { notificationsRouter } from "./routers/notifications";
import { celebrationsRouter } from "./routers/celebrations";
// Phase 4: RL Infrastructure routers
import { featureStoreRouter } from "./routers/featureStore";
import { recommendationsRouter } from "./routers/recommendations";
import { rewardAttributionRouter } from "./routers/rewardAttribution";
import { experimentsRouter } from "./routers/experiments";
// Phase 5: Polish & Launch routers
import { adminRouter } from "./routers/admin";
import { jobsRouter } from "./routers/jobs";
// Launchpad (Knowledge Sharing)
import { postsRouter } from "./routers/posts";

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
  // Phase 3: Game Theory
  badges: badgesRouter,
  streaks: streaksRouter,
  leaderboards: leaderboardsRouter,
  activityFeed: activityFeedRouter,
  notifications: notificationsRouter,
  celebrations: celebrationsRouter,
  // Phase 4: RL Infrastructure
  featureStore: featureStoreRouter,
  recommendations: recommendationsRouter,
  rewardAttribution: rewardAttributionRouter,
  experiments: experimentsRouter,
  // Phase 5: Polish & Launch
  admin: adminRouter,
  jobs: jobsRouter,
  // Launchpad (Knowledge Sharing)
  posts: postsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
