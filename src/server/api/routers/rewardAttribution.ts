/**
 * Reward Attribution Router
 *
 * Connects outcomes to touchpoints for RL training
 *
 * Features:
 * - Time-decay attribution (7-day half-life)
 * - Multi-touch attribution
 * - Immediate rewards (notification opened: +1)
 * - Delayed rewards (90-day verified: +100)
 * - Update events with rewardAttributed and rewardValue
 *
 * This is how the platform learns which actions lead to good outcomes
 */

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes, RewardValues } from "@/lib/events";

// ============================================================================
// REWARD CONFIGURATION
// ============================================================================

const REWARD_CONFIG = {
  // Time decay
  HALF_LIFE_DAYS: 7, // Reward decays by 50% every 7 days
  MAX_LOOKBACK_DAYS: 30, // Maximum days to look back for attribution

  // Attribution models
  ATTRIBUTION_MODEL: "time_decay" as const, // 'first_touch' | 'last_touch' | 'linear' | 'time_decay'

  // Reward values (from RewardValues, plus additional)
  IMMEDIATE_REWARDS: {
    NOTIFICATION_OPENED: 1,
    OPPORTUNITY_CLICK: 1,
    RECOMMENDATION_CLICKED: 2,
    APPLICATION_START: 5,
  },

  DELAYED_REWARDS: {
    APPLICATION_SUBMIT: 10,
    OFFER_MADE: 30,
    OFFER_ACCEPTED: 50,
    PLACEMENT_CONFIRMED: 50,
    VERIFICATION_30_COMPLETE: 75,
    VERIFICATION_90_COMPLETE: 100, // THE MOST VALUABLE
  },

  // Negative rewards
  NEGATIVE_REWARDS: {
    APPLICATION_WITHDRAW: -5,
    PLACEMENT_FAILED: -20,
    STREAK_BREAK: -5,
    RECOMMENDATION_DISMISSED: -2,
  },
};

// ============================================================================
// SCHEMAS
// ============================================================================

const attributeRewardSchema = z.object({
  outcomeEventId: z.string(),
  outcomeType: z.string(),
  rewardValue: z.number(),
  userId: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

const getAttributionChainSchema = z.object({
  userId: z.string(),
  outcomeType: z.string(),
  entityId: z.string().optional(),
  lookbackDays: z.number().min(1).max(90).default(30),
});

const computeUserRewardsSchema = z.object({
  userId: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateTimeDecay(daysSinceEvent: number, halfLife: number): number {
  // Exponential decay: value = 2^(-t/halfLife)
  return Math.pow(2, -daysSinceEvent / halfLife);
}

function calculateAttributionWeight(
  daysSinceEvent: number,
  position: number,
  totalTouchpoints: number,
  model: string
): number {
  switch (model) {
    case "first_touch":
      return position === 0 ? 1 : 0;
    case "last_touch":
      return position === totalTouchpoints - 1 ? 1 : 0;
    case "linear":
      return 1 / totalTouchpoints;
    case "time_decay":
    default:
      return calculateTimeDecay(daysSinceEvent, REWARD_CONFIG.HALF_LIFE_DAYS);
  }
}

// Event types that are considered "touchpoints" for attribution
const TOUCHPOINT_EVENTS = [
  "OPPORTUNITY_CLICK",
  "OPPORTUNITY_VIEW",
  "RECOMMENDATION_CLICKED",
  "APPLICATION_START",
  "NOTIFICATION_CLICKED",
  "FEED_ITEM_CLICK",
  "INVITE_VIEWED",
  "OPPORTUNITY_SEARCH",
];

// ============================================================================
// REWARD ATTRIBUTION ROUTER
// ============================================================================

export const rewardAttributionRouter = createTRPCRouter({
  /**
   * Attribute a reward to preceding touchpoints
   * Called when an outcome event occurs (e.g., placement verified)
   */
  attributeReward: protectedProcedure
    .input(attributeRewardSchema)
    .mutation(async ({ ctx, input }) => {
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - REWARD_CONFIG.MAX_LOOKBACK_DAYS);

      // Find all touchpoints leading to this outcome
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        userId: input.userId,
        createdAt: { gte: lookbackDate },
        eventType: { in: TOUCHPOINT_EVENTS },
      };

      // Filter by entity if specified
      if (input.entityId) {
        whereClause.entityId = input.entityId;
      }

      const touchpoints = await ctx.prisma.event.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
      });

      if (touchpoints.length === 0) {
        return {
          attributed: false,
          reason: "No touchpoints found",
          touchpointCount: 0,
        };
      }

      const now = new Date();
      const totalTouchpoints = touchpoints.length;

      // Calculate attribution for each touchpoint
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attributions = touchpoints.map((tp: any, index: number) => {
        const daysSince = (now.getTime() - new Date(tp.createdAt).getTime()) / (24 * 60 * 60 * 1000);
        const weight = calculateAttributionWeight(
          daysSince,
          index,
          totalTouchpoints,
          REWARD_CONFIG.ATTRIBUTION_MODEL
        );
        const attributedReward = input.rewardValue * weight;

        return {
          eventId: tp.id,
          eventType: tp.eventType,
          weight,
          attributedReward,
          daysSinceEvent: daysSince,
        };
      });

      // Normalize weights to sum to 1
      const totalWeight = attributions.reduce((sum: number, a: { weight: number }) => sum + a.weight, 0);
      const normalizedAttributions = attributions.map((a: { weight: number; eventId: string; eventType: string; daysSinceEvent: number }) => ({
        ...a,
        weight: a.weight / totalWeight,
        attributedReward: (a.weight / totalWeight) * input.rewardValue,
      }));

      // Update each touchpoint event with attributed reward
      for (const attr of normalizedAttributions) {
        await ctx.prisma.event.update({
          where: { id: attr.eventId },
          data: {
            rewardAttributed: true,
            rewardValue: attr.attributedReward,
            attributionWeight: attr.weight,
            outcomeEventId: input.outcomeEventId,
            outcomeType: input.outcomeType,
          },
        });
      }

      // Log attribution
      await logEvent(EventTypes.XP_EARNED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "reward_attribution",
        entityId: input.outcomeEventId,
        metadata: {
          outcomeType: input.outcomeType,
          totalReward: input.rewardValue,
          touchpointCount: totalTouchpoints,
          attributionModel: REWARD_CONFIG.ATTRIBUTION_MODEL,
        },
      });

      return {
        attributed: true,
        touchpointCount: totalTouchpoints,
        attributions: normalizedAttributions,
        totalReward: input.rewardValue,
        model: REWARD_CONFIG.ATTRIBUTION_MODEL,
      };
    }),

  /**
   * Get the attribution chain for an outcome
   */
  getAttributionChain: protectedProcedure
    .input(getAttributionChainSchema)
    .query(async ({ ctx, input }) => {
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - input.lookbackDays);

      // Get attributed events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        userId: input.userId,
        createdAt: { gte: lookbackDate },
        rewardAttributed: true,
        outcomeType: input.outcomeType,
      };

      if (input.entityId) {
        whereClause.entityId = input.entityId;
      }

      const events = await ctx.prisma.event.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
      });

      // Group by outcome
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chains = new Map<string, any[]>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const event of events as any[]) {
        const key = event.outcomeEventId;
        if (!chains.has(key)) {
          chains.set(key, []);
        }
        chains.get(key)!.push({
          eventId: event.id,
          eventType: event.eventType,
          createdAt: event.createdAt,
          rewardValue: event.rewardValue,
          weight: event.attributionWeight,
        });
      }

      return {
        chains: Array.from(chains.entries()).map(([outcomeId, touchpoints]) => ({
          outcomeId,
          outcomeType: input.outcomeType,
          touchpoints,
          totalReward: touchpoints.reduce((sum: number, tp: { rewardValue?: number }) => sum + (tp.rewardValue || 0), 0),
        })),
      };
    }),

  /**
   * Compute total rewards for a user
   */
  computeUserRewards: protectedProcedure
    .input(computeUserRewardsSchema)
    .query(async ({ ctx, input }) => {
      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();

      // Get all events with rewards
      const events = await ctx.prisma.event.findMany({
        where: {
          userId: input.userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          rewardValue: { not: null },
        },
        orderBy: { createdAt: "desc" },
      });

      // Categorize rewards
      let immediateRewards = 0;
      let delayedRewards = 0;
      let attributedRewards = 0;
      const rewardsByType: Record<string, number> = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const event of events as any[]) {
        const reward = event.rewardValue || 0;

        if (event.rewardAttributed) {
          attributedRewards += reward;
        } else if (REWARD_CONFIG.IMMEDIATE_REWARDS[event.eventType as keyof typeof REWARD_CONFIG.IMMEDIATE_REWARDS]) {
          immediateRewards += reward;
        } else {
          delayedRewards += reward;
        }

        rewardsByType[event.eventType] = (rewardsByType[event.eventType] || 0) + reward;
      }

      return {
        period: {
          start: startDate,
          end: endDate,
        },
        totalReward: immediateRewards + delayedRewards + attributedRewards,
        breakdown: {
          immediate: immediateRewards,
          delayed: delayedRewards,
          attributed: attributedRewards,
        },
        byType: rewardsByType,
        eventCount: events.length,
      };
    }),

  /**
   * Process immediate reward for an event
   * Called right after an event is logged
   */
  processImmediateReward: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      eventType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if event type has immediate reward
      const rewardValue = RewardValues[input.eventType] ||
        REWARD_CONFIG.IMMEDIATE_REWARDS[input.eventType as keyof typeof REWARD_CONFIG.IMMEDIATE_REWARDS];

      if (!rewardValue) {
        return { rewarded: false, reason: "No immediate reward for this event type" };
      }

      // Update event with reward
      await ctx.prisma.event.update({
        where: { id: input.eventId },
        data: {
          rewardValue,
          rewardAttributed: false, // Immediate rewards aren't attributed
        },
      });

      return {
        rewarded: true,
        rewardValue,
        eventType: input.eventType,
      };
    }),

  /**
   * Process delayed reward (e.g., placement verified)
   * This triggers full attribution chain
   */
  processDelayedReward: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      eventType: z.string(),
      userId: z.string(),
      entityType: z.string().optional(),
      entityId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get reward value
      const rewardValue = RewardValues[input.eventType] ||
        REWARD_CONFIG.DELAYED_REWARDS[input.eventType as keyof typeof REWARD_CONFIG.DELAYED_REWARDS];

      if (!rewardValue) {
        return { rewarded: false, reason: "No delayed reward for this event type" };
      }

      // Update the outcome event itself
      await ctx.prisma.event.update({
        where: { id: input.eventId },
        data: {
          rewardValue,
          rewardAttributed: false,
        },
      });

      // Attribute to preceding touchpoints
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - REWARD_CONFIG.MAX_LOOKBACK_DAYS);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        userId: input.userId,
        createdAt: { gte: lookbackDate },
        eventType: { in: TOUCHPOINT_EVENTS },
        rewardAttributed: false, // Only attribute to unattributed events
      };

      if (input.entityId) {
        whereClause.entityId = input.entityId;
      }

      const touchpoints = await ctx.prisma.event.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
      });

      if (touchpoints.length === 0) {
        return {
          rewarded: true,
          rewardValue,
          attributed: false,
          touchpointCount: 0,
        };
      }

      const now = new Date();
      const totalTouchpoints = touchpoints.length;

      // Calculate and apply attribution
      let totalWeight = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weightedTouchpoints = touchpoints.map((tp: any, index: number) => {
        const daysSince = (now.getTime() - new Date(tp.createdAt).getTime()) / (24 * 60 * 60 * 1000);
        const weight = calculateAttributionWeight(
          daysSince,
          index,
          totalTouchpoints,
          REWARD_CONFIG.ATTRIBUTION_MODEL
        );
        totalWeight += weight;
        return { ...tp, weight, daysSince };
      });

      // Apply normalized rewards
      for (const tp of weightedTouchpoints) {
        const normalizedWeight = tp.weight / totalWeight;
        const attributedReward = rewardValue * normalizedWeight;

        await ctx.prisma.event.update({
          where: { id: tp.id },
          data: {
            rewardAttributed: true,
            rewardValue: attributedReward,
            attributionWeight: normalizedWeight,
            outcomeEventId: input.eventId,
            outcomeType: input.eventType,
          },
        });
      }

      return {
        rewarded: true,
        rewardValue,
        attributed: true,
        touchpointCount: totalTouchpoints,
        model: REWARD_CONFIG.ATTRIBUTION_MODEL,
      };
    }),

  /**
   * Get reward leaderboard
   */
  getRewardLeaderboard: protectedProcedure
    .input(z.object({
      scope: z.enum(["global", "college"]).default("global"),
      days: z.number().min(1).max(90).default(30),
      limit: z.number().min(5).max(50).default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days || 30;
      const limit = input?.limit || 10;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get user's college for scoping
      let collegeId: string | undefined;
      if (input?.scope === "college") {
        const profile = await ctx.prisma.profile.findUnique({
          where: { userId: ctx.session.user.id },
          select: { collegeId: true },
        });
        collegeId = (profile as unknown as { collegeId?: string })?.collegeId;
      }

      // Aggregate rewards by user
      const rewards = await ctx.prisma.event.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: startDate },
          rewardValue: { not: null },
          ...(collegeId ? {
            user: {
              profile: { collegeId },
            },
          } : {}),
        },
        _sum: { rewardValue: true },
        orderBy: { _sum: { rewardValue: "desc" } },
        take: limit,
      });

      // Get user details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leaderboard = await Promise.all(rewards.map(async (r: any, index: number) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: r.userId },
          select: {
            name: true,
            profile: {
              select: {
                avatarUrl: true,
                collegeName: true,
              },
            },
          },
        });

        return {
          rank: index + 1,
          userId: r.userId,
          name: (user as unknown as { name?: string })?.name,
          avatarUrl: (user as unknown as { profile?: { avatarUrl?: string } })?.profile?.avatarUrl,
          collegeName: (user as unknown as { profile?: { collegeName?: string } })?.profile?.collegeName,
          totalReward: r._sum?.rewardValue || 0,
          isCurrentUser: r.userId === ctx.session.user.id,
        };
      }));

      return {
        period: `Last ${days} days`,
        scope: input?.scope || "global",
        leaderboard,
      };
    }),

  /**
   * Get attribution summary for analytics
   */
  getAttributionSummary: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(30),
    }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all attributed events
      const attributedEvents = await ctx.prisma.event.findMany({
        where: {
          createdAt: { gte: startDate },
          rewardAttributed: true,
        },
        select: {
          eventType: true,
          outcomeType: true,
          rewardValue: true,
          attributionWeight: true,
        },
      });

      // Aggregate by touchpoint type
      const byTouchpoint: Record<string, { count: number; totalReward: number; avgWeight: number }> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const event of attributedEvents as any[]) {
        if (!byTouchpoint[event.eventType]) {
          byTouchpoint[event.eventType] = { count: 0, totalReward: 0, avgWeight: 0 };
        }
        byTouchpoint[event.eventType].count++;
        byTouchpoint[event.eventType].totalReward += event.rewardValue || 0;
        byTouchpoint[event.eventType].avgWeight += event.attributionWeight || 0;
      }

      // Calculate averages
      for (const type in byTouchpoint) {
        byTouchpoint[type].avgWeight /= byTouchpoint[type].count;
      }

      // Aggregate by outcome type
      const byOutcome: Record<string, { count: number; totalReward: number }> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const event of attributedEvents as any[]) {
        if (event.outcomeType) {
          if (!byOutcome[event.outcomeType]) {
            byOutcome[event.outcomeType] = { count: 0, totalReward: 0 };
          }
          byOutcome[event.outcomeType].count++;
          byOutcome[event.outcomeType].totalReward += event.rewardValue || 0;
        }
      }

      return {
        period: `Last ${days} days`,
        totalAttributedEvents: attributedEvents.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalRewardAttributed: attributedEvents.reduce((sum: number, e: any) => sum + (e.rewardValue || 0), 0),
        byTouchpoint: Object.entries(byTouchpoint).map(([type, data]) => ({
          type,
          ...data,
        })).sort((a, b) => b.totalReward - a.totalReward),
        byOutcome: Object.entries(byOutcome).map(([type, data]) => ({
          type,
          ...data,
        })).sort((a, b) => b.totalReward - a.totalReward),
      };
    }),
});
