/**
 * Activity Feed Router
 *
 * Game theory: Activity feeds create FOMO and social proof
 *
 * Feed Types:
 * - Public: Platform-wide highlights (placements, milestones)
 * - College: College-specific activity
 * - Personal: User's own activity history
 * - Following: From users they follow (future feature)
 *
 * Feed Items Include:
 * - Placements (THE GOLD - most visible)
 * - Badge earnings
 * - Streak milestones
 * - Leaderboard changes
 * - Application milestones
 */

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  studentProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";

// ============================================================================
// FEED ITEM TYPES
// ============================================================================

const FEED_ITEM_TYPES = {
  PLACEMENT: "placement",
  PLACEMENT_VERIFIED: "placement_verified",
  BADGE_EARNED: "badge_earned",
  STREAK_MILESTONE: "streak_milestone",
  LEADERBOARD_TOP10: "leaderboard_top10",
  FIRST_APPLICATION: "first_application",
  APPLICATION_MILESTONE: "application_milestone",
  PROFILE_COMPLETE: "profile_complete",
  REFERRAL_SUCCESS: "referral_success",
} as const;

// Priority for feed ordering (higher = more prominent)
const FEED_PRIORITY: Record<string, number> = {
  [FEED_ITEM_TYPES.PLACEMENT_VERIFIED]: 100, // THE GOLD
  [FEED_ITEM_TYPES.PLACEMENT]: 90,
  [FEED_ITEM_TYPES.LEADERBOARD_TOP10]: 80,
  [FEED_ITEM_TYPES.STREAK_MILESTONE]: 70,
  [FEED_ITEM_TYPES.BADGE_EARNED]: 60,
  [FEED_ITEM_TYPES.APPLICATION_MILESTONE]: 50,
  [FEED_ITEM_TYPES.REFERRAL_SUCCESS]: 40,
  [FEED_ITEM_TYPES.PROFILE_COMPLETE]: 30,
  [FEED_ITEM_TYPES.FIRST_APPLICATION]: 20,
};

// ============================================================================
// SCHEMAS
// ============================================================================

const getFeedSchema = z.object({
  type: z.enum(["public", "college", "personal"]),
  limit: z.number().min(5).max(50).default(20),
  cursor: z.string().optional(), // For pagination
  includeTypes: z.array(z.string()).optional(),
});

const createFeedItemSchema = z.object({
  type: z.string(),
  visibility: z.enum(["public", "college", "private"]),
  title: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

// ============================================================================
// ACTIVITY FEED ROUTER
// ============================================================================

export const activityFeedRouter = createTRPCRouter({
  /**
   * Get feed items
   */
  getFeed: protectedProcedure
    .input(getFeedSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's profile for college filtering
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true, collegeName: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      // Build where clause based on feed type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let whereClause: any = {};

      if (input.type === "public") {
        whereClause = { visibility: "public" };
      } else if (input.type === "college") {
        whereClause = {
          OR: [
            { visibility: "public" },
            {
              visibility: "college",
              collegeId: profileData?.collegeId,
            },
          ],
        };
      } else if (input.type === "personal") {
        whereClause = { userId };
      }

      // Add type filter if specified
      if (input.includeTypes && input.includeTypes.length > 0) {
        whereClause.itemType = { in: input.includeTypes };
      }

      // Add cursor for pagination
      if (input.cursor) {
        whereClause.id = { lt: input.cursor };
      }

      // Get feed items
      const feedItems = await ctx.prisma.feedItem.findMany({
        where: whereClause,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: input.limit + 1, // Get one extra for cursor
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                  collegeName: true,
                },
              },
            },
          },
        },
      });

      // Check if there are more items
      let nextCursor: string | undefined;
      if (feedItems.length > input.limit) {
        const nextItem = feedItems.pop();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nextCursor = (nextItem as any)?.id;
      }

      // Log feed view
      await logEvent(EventTypes.FEED_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "feed",
        metadata: {
          feedType: input.type,
          itemCount: feedItems.length,
        },
      });

      // Format feed items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedItems = feedItems.map((item: any) => ({
        id: item.id,
        type: item.itemType,
        visibility: item.visibility,
        title: item.title,
        description: item.description,
        metadata: item.metadata,
        createdAt: item.createdAt,
        user: {
          id: item.user?.id,
          name: item.user?.name,
          avatarUrl: item.user?.profile?.avatarUrl,
          collegeName: item.user?.profile?.collegeName,
        },
        reactions: {
          likes: item.likeCount || 0,
          comments: item.commentCount || 0,
          shares: item.shareCount || 0,
        },
        isLikedByUser: false, // TODO: Check if current user liked
      }));

      return {
        items: formattedItems,
        nextCursor,
        hasMore: !!nextCursor,
      };
    }),

  /**
   * Get highlights/featured items for homepage
   */
  getHighlights: protectedProcedure
    .input(z.object({
      limit: z.number().min(3).max(10).default(5),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit || 5;

      // Get user's college
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      // Get recent high-priority items from college
      const highlights = await ctx.prisma.feedItem.findMany({
        where: {
          OR: [
            { visibility: "public", priority: { gte: 80 } },
            {
              visibility: "college",
              collegeId: profileData?.collegeId,
              priority: { gte: 60 },
            },
          ],
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                  collegeName: true,
                },
              },
            },
          },
        },
      });

      // Log view
      await logEvent(EventTypes.HIGHLIGHTS_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "feed",
        metadata: {
          highlightCount: highlights.length,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return highlights.map((item: any) => ({
        id: item.id,
        type: item.itemType,
        title: item.title,
        description: item.description,
        metadata: item.metadata,
        createdAt: item.createdAt,
        user: {
          name: item.user?.name,
          avatarUrl: item.user?.profile?.avatarUrl,
          collegeName: item.user?.profile?.collegeName,
        },
      }));
    }),

  /**
   * Create a feed item (internal use by other routers)
   */
  createFeedItem: studentProcedure
    .input(createFeedItemSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's college for college-level visibility
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      // Create feed item
      const feedItem = await ctx.prisma.feedItem.create({
        data: {
          userId,
          collegeId: profileData?.collegeId,
          itemType: input.type,
          visibility: input.visibility,
          title: input.title,
          description: input.description,
          metadata: input.metadata || {},
          entityType: input.entityType,
          entityId: input.entityId,
          priority: FEED_PRIORITY[input.type] || 10,
        },
      });

      // Log creation
      await logEvent(EventTypes.FEED_ITEM_CREATED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "feed_item",
        entityId: (feedItem as unknown as { id: string }).id,
        metadata: {
          itemType: input.type,
          visibility: input.visibility,
        },
      });

      return feedItem;
    }),

  /**
   * React to a feed item (like)
   */
  likeFeedItem: protectedProcedure
    .input(z.object({
      feedItemId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if already liked
      const existingLike = await ctx.prisma.feedReaction.findFirst({
        where: {
          feedItemId: input.feedItemId,
          userId,
          type: "like",
        },
      });

      if (existingLike) {
        // Unlike
        await ctx.prisma.feedReaction.delete({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          where: { id: (existingLike as any).id },
        });

        await ctx.prisma.feedItem.update({
          where: { id: input.feedItemId },
          data: { likeCount: { decrement: 1 } },
        });

        return { liked: false };
      }

      // Like
      await ctx.prisma.feedReaction.create({
        data: {
          feedItemId: input.feedItemId,
          userId,
          type: "like",
        },
      });

      await ctx.prisma.feedItem.update({
        where: { id: input.feedItemId },
        data: { likeCount: { increment: 1 } },
      });

      // Log
      await logEvent(EventTypes.FEED_ITEM_LIKED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "feed_item",
        entityId: input.feedItemId,
      });

      return { liked: true };
    }),

  /**
   * Share a feed item
   */
  shareFeedItem: protectedProcedure
    .input(z.object({
      feedItemId: z.string(),
      platform: z.enum(["whatsapp", "instagram", "linkedin", "twitter", "copy"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Increment share count
      await ctx.prisma.feedItem.update({
        where: { id: input.feedItemId },
        data: { shareCount: { increment: 1 } },
      });

      // Log
      await logEvent(EventTypes.FEED_ITEM_SHARED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "feed_item",
        entityId: input.feedItemId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: input.platform as any,
        metadata: {
          platform: input.platform,
        },
      });

      // Generate share URL
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/feed/${input.feedItemId}?ref=${userId}`;

      return { shareUrl };
    }),

  /**
   * Get activity stats for user (for profile)
   */
  getUserActivityStats: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get counts
    const [feedItemCount, totalLikes, totalShares] = await Promise.all([
      ctx.prisma.feedItem.count({ where: { userId } }),
      ctx.prisma.feedItem.aggregate({
        where: { userId },
        _sum: { likeCount: true },
      }),
      ctx.prisma.feedItem.aggregate({
        where: { userId },
        _sum: { shareCount: true },
      }),
    ]);

    // Get recent activity
    const recentActivity = await ctx.prisma.feedItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        itemType: true,
        title: true,
        createdAt: true,
      },
    });

    return {
      totalItems: feedItemCount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalLikes: (totalLikes as any)._sum?.likeCount || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalShares: (totalShares as any)._sum?.shareCount || 0,
      recentActivity,
    };
  }),

  /**
   * Get college activity summary
   */
  getCollegeActivity: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(30).default(7),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const days = input?.days || 7;

      // Get user's college
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true, collegeName: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      if (!profileData?.collegeId) {
        return {
          collegeName: null,
          stats: null,
          message: "Join a college to see activity",
        };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get activity counts by type
      const activityCounts = await ctx.prisma.feedItem.groupBy({
        by: ["itemType"],
        where: {
          collegeId: profileData.collegeId,
          createdAt: { gte: startDate },
        },
        _count: true,
      });

      // Get top performers
      const topPerformers = await ctx.prisma.feedItem.groupBy({
        by: ["userId"],
        where: {
          collegeId: profileData.collegeId,
          createdAt: { gte: startDate },
        },
        _count: true,
        orderBy: { _count: { userId: "desc" } },
        take: 5,
      });

      // Log
      await logEvent(EventTypes.COLLEGE_ACTIVITY_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "college",
        entityId: profileData.collegeId,
        metadata: {
          days,
        },
      });

      return {
        collegeName: profileData.collegeName,
        period: `Last ${days} days`,
        stats: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          placements: activityCounts.find((c: any) => c.itemType === "placement")?._count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          badges: activityCounts.find((c: any) => c.itemType === "badge_earned")?._count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          applications: activityCounts.find((c: any) => c.itemType === "application_milestone")?._count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          total: activityCounts.reduce((sum: number, c: any) => sum + c._count, 0),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topPerformers: topPerformers.map((p: any) => ({
          userId: p.userId,
          activityCount: p._count,
        })),
      };
    }),

  /**
   * Create feed items from significant events (called by system)
   * This should be called when:
   * - Placement is created/verified
   * - Badge is earned
   * - Streak milestone is reached
   * - Leaderboard top 10 is achieved
   */
  createFromEvent: protectedProcedure
    .input(z.object({
      eventType: z.string(),
      eventData: z.record(z.string(), z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's profile
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true },
        include: { user: { select: { name: true } } },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;
      const userName = profileData?.user?.name || "A student";

      // Determine feed item type and content based on event
      let feedItem: {
        type: string;
        visibility: "public" | "college" | "private";
        title: string;
        description: string;
        priority: number;
      } | null = null;

      switch (input.eventType) {
        case "PLACEMENT_CREATED":
          feedItem = {
            type: FEED_ITEM_TYPES.PLACEMENT,
            visibility: "college",
            title: `🎉 ${userName} got placed!`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            description: `Congratulations! Placed at ${(input.eventData as any).companyName}`,
            priority: FEED_PRIORITY[FEED_ITEM_TYPES.PLACEMENT],
          };
          break;

        case "PLACEMENT_90_VERIFIED":
          feedItem = {
            type: FEED_ITEM_TYPES.PLACEMENT_VERIFIED,
            visibility: "public", // THE GOLD - show publicly
            title: `🏆 ${userName} completed 90-day verification!`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            description: `Still thriving at ${(input.eventData as any).companyName} after 90 days!`,
            priority: FEED_PRIORITY[FEED_ITEM_TYPES.PLACEMENT_VERIFIED],
          };
          break;

        case "BADGE_EARNED":
          feedItem = {
            type: FEED_ITEM_TYPES.BADGE_EARNED,
            visibility: "college",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: `${(input.eventData as any).badgeIcon} ${userName} earned "${(input.eventData as any).badgeName}"`,
            description: (input.eventData as { description?: string }).description || "Badge earned!",
            priority: FEED_PRIORITY[FEED_ITEM_TYPES.BADGE_EARNED],
          };
          break;

        case "STREAK_MILESTONE":
          feedItem = {
            type: FEED_ITEM_TYPES.STREAK_MILESTONE,
            visibility: "college",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: `🔥 ${userName} reached a ${(input.eventData as any).milestone}-day streak!`,
            description: "Consistency is key!",
            priority: FEED_PRIORITY[FEED_ITEM_TYPES.STREAK_MILESTONE],
          };
          break;

        case "LEADERBOARD_TOP10":
          feedItem = {
            type: FEED_ITEM_TYPES.LEADERBOARD_TOP10,
            visibility: "college",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: `⭐ ${userName} is now Top 10 in ${(input.eventData as any).scope}!`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            description: `Ranked #${(input.eventData as any).rank}`,
            priority: FEED_PRIORITY[FEED_ITEM_TYPES.LEADERBOARD_TOP10],
          };
          break;
      }

      if (!feedItem) {
        return { created: false, reason: "Unknown event type" };
      }

      // Create the feed item
      const created = await ctx.prisma.feedItem.create({
        data: {
          userId,
          collegeId: profileData?.collegeId,
          itemType: feedItem.type,
          visibility: feedItem.visibility,
          title: feedItem.title,
          description: feedItem.description,
          metadata: input.eventData,
          priority: feedItem.priority,
        },
      });

      return { created: true, feedItemId: (created as unknown as { id: string }).id };
    }),
});
