/**
 * Leaderboards Router
 *
 * Game theory: Leaderboards create competition and social comparison
 *
 * Leaderboard Types:
 * - Student: College, State, National, Skill-based
 * - College: State, National, by Placement Rate
 *
 * Critical Features:
 * - Scarcity signals: "4 points to Top 10%", "10 placements to pass BMS College"
 * - Movement tracking: "You moved up 5 spots this week"
 * - Nearby competition: Show users just above and below
 */

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  studentProcedure,
} from "../trpc/trpc";
import { queueEvent, EventTypes } from "@/lib/events";

// ============================================================================
// SCHEMAS
// ============================================================================

const studentLeaderboardSchema = z.object({
  scope: z.enum(["college", "state", "national"]),
  metric: z.enum(["xp", "placements", "streak", "applications"]).default("xp"),
  skill: z.string().optional(), // For skill-based leaderboards
  limit: z.number().min(5).max(100).default(20),
  includeContext: z.boolean().default(true), // Include users around current user
});

const collegeLeaderboardSchema = z.object({
  scope: z.enum(["state", "national"]),
  metric: z.enum(["placements", "placementRate", "avgPackage", "verified90"]).default("placements"),
  limit: z.number().min(5).max(100).default(20),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculatePercentile(rank: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((total - rank + 1) / total) * 100);
}

function getMotivationalMessage(rank: number, total: number, pointsToNext: number): string {
  const percentile = calculatePercentile(rank, total);

  if (percentile >= 99) {
    return "🏆 You're in the top 1%! Legendary status!";
  } else if (percentile >= 95) {
    return `⭐ Top 5%! Just ${pointsToNext} points to reach top 1%!`;
  } else if (percentile >= 90) {
    return `🔥 Top 10%! ${pointsToNext} points to break into top 5%!`;
  } else if (percentile >= 75) {
    return `📈 Top 25%! ${pointsToNext} points to reach top 10%!`;
  } else if (percentile >= 50) {
    return `💪 Above average! ${pointsToNext} points to reach top 25%!`;
  } else {
    return `🚀 Keep going! ${pointsToNext} points to climb higher!`;
  }
}

// ============================================================================
// LEADERBOARDS ROUTER
// ============================================================================

export const leaderboardsRouter = createTRPCRouter({
  /**
   * Get student leaderboard
   */
  getStudentLeaderboard: studentProcedure
    .input(studentLeaderboardSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's profile for filtering and metrics in one query
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true, collegeName: true, state: true, totalXp: true, currentStreak: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      // Build where clause based on scope
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let whereClause: any = {};
      if (input.scope === "college" && profileData?.collegeId) {
        whereClause = { collegeId: profileData.collegeId };
      } else if (input.scope === "state" && profileData?.state) {
        whereClause = { state: profileData.state };
      }
      // national = no filter

      // Determine order field
      let orderBy: Record<string, string> = { totalXp: "desc" };
      if (input.metric === "streak") {
        orderBy = { currentStreak: "desc" };
      } else if (input.metric === "placements") {
        // Need to count placements separately
      } else if (input.metric === "applications") {
        // Need to count applications separately
      }

      // User's metric value for rank calculation
      const userMetricValue =
        input.metric === "streak"
          ? profileData?.currentStreak || 0
          : profileData?.totalXp || 0;

      // Run all queries in parallel
      const [profiles, totalCount, higherCount] = await Promise.all([
        // Get leaderboard data
        ctx.prisma.profile.findMany({
          where: whereClause,
          orderBy,
          take: input.limit,
          select: {
            userId: true,
            totalXp: true,
            currentStreak: true,
            collegeName: true,
            avatarUrl: true,
            layersRankOverall: true,
            displayName: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        }),
        // Get total count for percentile calculation
        ctx.prisma.profile.count({
          where: whereClause,
        }),
        // Count users with higher score
        ctx.prisma.profile.count({
          where: {
            ...whereClause,
            [input.metric === "streak" ? "currentStreak" : "totalXp"]: {
              gt: userMetricValue,
            },
          },
        }),
      ]);

      const userRank = higherCount + 1;
      const percentile = calculatePercentile(userRank, totalCount);

      // Find points needed to reach next milestone
      let pointsToNextMilestone = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leaderboard = profiles.map((p: any, index: number) => {
        const entry = {
          rank: index + 1,
          userId: p.user?.id,
          name: p.displayName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Anonymous",
          avatarUrl: p.avatarUrl,
          collegeName: p.collegeName,
          score: input.metric === "streak" ? p.currentStreak : p.totalXp,
          layersRank: p.layersRankOverall,
          isCurrentUser: p.user?.id === userId,
        };

        // Calculate points to beat this user if they're just above current user
        if (entry.rank === userRank - 1) {
          pointsToNextMilestone = entry.score - userMetricValue + 1;
        }

        return entry;
      });

      // Get users around the current user if they're not in top list
      let contextUsers: typeof leaderboard = [];
      if (input.includeContext && userRank > input.limit) {
        // Get 2 users above and 2 below
        const contextProfiles = await ctx.prisma.profile.findMany({
          where: whereClause,
          orderBy,
          skip: Math.max(0, userRank - 3),
          take: 5,
          select: {
            userId: true,
            totalXp: true,
            currentStreak: true,
            collegeName: true,
            avatarUrl: true,
            layersRankOverall: true,
            displayName: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contextUsers = contextProfiles.map((p: any, index: number) => ({
          rank: userRank - 2 + index,
          userId: p.user?.id,
          name: p.displayName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Anonymous",
          avatarUrl: p.avatarUrl,
          collegeName: p.collegeName,
          score: input.metric === "streak" ? p.currentStreak : p.totalXp,
          layersRank: p.layersRankOverall,
          isCurrentUser: p.user?.id === userId,
        }));
      }

      // Calculate scarcity signals
      const top10Threshold = Math.ceil(totalCount * 0.1);
      const pointsToTop10 =
        userRank > top10Threshold && leaderboard[top10Threshold - 1]
          ? leaderboard[top10Threshold - 1].score - userMetricValue + 1
          : 0;

      // Log leaderboard view (non-blocking)
      queueEvent(EventTypes.LEADERBOARD_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "leaderboard",
        metadata: {
          scope: input.scope,
          metric: input.metric,
          userRank,
          percentile,
          totalParticipants: totalCount,
        },
      });

      return {
        leaderboard,
        contextUsers,
        userStats: {
          rank: userRank,
          score: userMetricValue,
          percentile,
          totalParticipants: totalCount,
          pointsToNextMilestone,
          pointsToTop10,
          motivationalMessage: getMotivationalMessage(
            userRank,
            totalCount,
            pointsToNextMilestone || pointsToTop10
          ),
        },
        scope: input.scope,
        metric: input.metric,
      };
    }),

  /**
   * Get college leaderboard
   */
  getCollegeLeaderboard: protectedProcedure
    .input(collegeLeaderboardSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's college
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true, collegeName: true, state: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let whereClause: any = {};
      if (input.scope === "state" && profileData?.state) {
        whereClause = { state: profileData.state };
      }

      // Get colleges with their stats
      const colleges = await ctx.prisma.college.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          tier: true,
          logoUrl: true,
          totalPlacements: true,
          placementRate: true,
          averagePackage: true,
          verified90Placements: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
      });

      // Sort by metric
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedColleges = colleges.sort((a: any, b: any) => {
        switch (input.metric) {
          case "placementRate":
            return (b.placementRate || 0) - (a.placementRate || 0);
          case "avgPackage":
            return (b.averagePackage || 0) - (a.averagePackage || 0);
          case "verified90":
            return (b.verified90Placements || 0) - (a.verified90Placements || 0);
          default:
            return (b.totalPlacements || 0) - (a.totalPlacements || 0);
        }
      });

      // Get top colleges
      const topColleges = sortedColleges.slice(0, input.limit);

      // Find user's college rank
      const userCollegeRank = sortedColleges.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c.id === profileData?.collegeId
      );

      // Calculate what's needed to beat the next college
      let metricsToPass: { college: string; gap: number } | null = null;
      if (userCollegeRank > 0) {
        const userCollege = sortedColleges[userCollegeRank];
        const collegeAbove = sortedColleges[userCollegeRank - 1];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getMetricValue = (college: any) => {
          switch (input.metric) {
            case "placementRate":
              return college.placementRate || 0;
            case "avgPackage":
              return college.averagePackage || 0;
            case "verified90":
              return college.verified90Placements || 0;
            default:
              return college.totalPlacements || 0;
          }
        };

        const gap = getMetricValue(collegeAbove) - getMetricValue(userCollege);
        metricsToPass = {
          college: collegeAbove.name,
          gap: Math.ceil(gap) + 1,
        };
      }

      // Log view (non-blocking)
      queueEvent(EventTypes.COLLEGE_LEADERBOARD_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "college_leaderboard",
        metadata: {
          scope: input.scope,
          metric: input.metric,
          userCollegeRank: userCollegeRank + 1,
          totalColleges: sortedColleges.length,
        },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leaderboard: topColleges.map((c: any, index: number) => ({
          rank: index + 1,
          collegeId: c.id,
          name: c.name,
          city: c.city,
          state: c.state,
          tier: c.tier,
          logoUrl: c.logoUrl,
          studentCount: c._count?.students || 0,
          placements: c.totalPlacements,
          placementRate: c.placementRate,
          avgPackage: c.averagePackage,
          verified90: c.verified90Placements,
          isUserCollege: c.id === profileData?.collegeId,
          // Metric-specific score display
          score:
            input.metric === "placementRate"
              ? `${c.placementRate || 0}%`
              : input.metric === "avgPackage"
              ? `₹${((c.averagePackage || 0) / 100000).toFixed(1)}L`
              : input.metric === "verified90"
              ? c.verified90Placements
              : c.totalPlacements,
        })),
        userCollegeStats: {
          rank: userCollegeRank + 1,
          totalColleges: sortedColleges.length,
          percentile: calculatePercentile(userCollegeRank + 1, sortedColleges.length),
          metricsToPass,
          scarcityMessage: metricsToPass
            ? `🎯 ${metricsToPass.gap} more ${
                input.metric === "verified90" ? "verified placements" : "placements"
              } to pass ${metricsToPass.college}!`
            : userCollegeRank === 0
            ? "🏆 Your college is #1!"
            : null,
        },
        scope: input.scope,
        metric: input.metric,
      };
    }),

  /**
   * Get user's ranking summary across all leaderboards
   */
  getUserRankingSummary: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user's profile
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId },
      select: {
        totalXp: true,
        currentStreak: true,
        collegeId: true,
        collegeName: true,
        state: true,
        layersRankOverall: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileData = profile as any;

    // Get rankings in different scopes
    const [collegeRank, stateRank, nationalRank] = await Promise.all([
      // College rank
      profileData?.collegeId
        ? ctx.prisma.profile.count({
            where: {
              collegeId: profileData.collegeId,
              totalXp: { gt: profileData?.totalXp || 0 },
            },
          })
        : Promise.resolve(-1),
      // State rank
      profileData?.state
        ? ctx.prisma.profile.count({
            where: {
              state: profileData.state,
              totalXp: { gt: profileData?.totalXp || 0 },
            },
          })
        : Promise.resolve(-1),
      // National rank
      ctx.prisma.profile.count({
        where: {
          totalXp: { gt: profileData?.totalXp || 0 },
        },
      }),
    ]);

    // Get totals
    const [collegeTotal, stateTotal, nationalTotal] = await Promise.all([
      profileData?.collegeId
        ? ctx.prisma.profile.count({ where: { collegeId: profileData.collegeId } })
        : Promise.resolve(0),
      profileData?.state
        ? ctx.prisma.profile.count({ where: { state: profileData.state } })
        : Promise.resolve(0),
      ctx.prisma.profile.count(),
    ]);

    // Log view (non-blocking)
    queueEvent(EventTypes.RANKING_SUMMARY_VIEWED, {
      userId,
      userType: ctx.session.user.userType,
      entityType: "ranking",
      metadata: {
        collegeRank: collegeRank + 1,
        stateRank: stateRank + 1,
        nationalRank: nationalRank + 1,
      },
    });

    return {
      totalXp: profileData?.totalXp || 0,
      currentStreak: profileData?.currentStreak || 0,
      layersRank: profileData?.layersRankOverall,
      rankings: {
        college: {
          rank: collegeRank + 1,
          total: collegeTotal,
          percentile: calculatePercentile(collegeRank + 1, collegeTotal),
          name: profileData?.collegeName,
        },
        state: {
          rank: stateRank + 1,
          total: stateTotal,
          percentile: calculatePercentile(stateRank + 1, stateTotal),
          name: profileData?.state,
        },
        national: {
          rank: nationalRank + 1,
          total: nationalTotal,
          percentile: calculatePercentile(nationalRank + 1, nationalTotal),
        },
      },
    };
  }),

  /**
   * Get movement/changes since last week
   */
  getWeeklyMovement: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user's leaderboard entry
    const entry = await ctx.prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        leaderboardType: "xp",
      },
      orderBy: { updatedAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entryData = entry as any;

    if (!entryData) {
      return {
        currentRank: null,
        previousRank: null,
        movement: 0,
        movementMessage: "Start engaging to appear on the leaderboard!",
      };
    }

    const movement = (entryData.previousRank || entryData.rank) - entryData.rank;

    let movementMessage = "";
    if (movement > 0) {
      movementMessage = `🚀 You moved up ${movement} spot${movement > 1 ? "s" : ""} this week!`;
    } else if (movement < 0) {
      movementMessage = `⚠️ You dropped ${Math.abs(movement)} spot${Math.abs(movement) > 1 ? "s" : ""}. Time to catch up!`;
    } else {
      movementMessage = "➡️ Holding steady! Keep pushing to climb higher.";
    }

    return {
      currentRank: entryData.rank,
      previousRank: entryData.previousRank,
      movement,
      movementMessage,
      score: entryData.score,
    };
  }),

  /**
   * Get nearby competitors
   */
  getNearbyCompetitors: studentProcedure
    .input(z.object({
      scope: z.enum(["college", "state", "national"]).default("college"),
      range: z.number().min(2).max(10).default(5),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const scope = input?.scope || "college";
      const range = input?.range || 5;

      // Get user's profile
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { totalXp: true, collegeId: true, state: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let whereClause: any = {};
      if (scope === "college" && profileData?.collegeId) {
        whereClause = { collegeId: profileData.collegeId };
      } else if (scope === "state" && profileData?.state) {
        whereClause = { state: profileData.state };
      }

      // Get user's rank and nearby users in parallel
      const [higherCount, usersAbove, usersBelow] = await Promise.all([
        // Get user's rank
        ctx.prisma.profile.count({
          where: {
            ...whereClause,
            totalXp: { gt: profileData?.totalXp || 0 },
          },
        }),
        // Get users above
        ctx.prisma.profile.findMany({
          where: {
            ...whereClause,
            totalXp: { gt: profileData?.totalXp || 0 },
          },
          orderBy: { totalXp: "asc" },
          take: range,
          select: {
            userId: true,
            totalXp: true,
            avatarUrl: true,
            collegeName: true,
            displayName: true,
            firstName: true,
            lastName: true,
          },
        }),
        // Get users below
        ctx.prisma.profile.findMany({
          where: {
            ...whereClause,
            totalXp: { lt: profileData?.totalXp || 0 },
          },
          orderBy: { totalXp: "desc" },
          take: range,
          select: {
            userId: true,
            totalXp: true,
            avatarUrl: true,
            collegeName: true,
            displayName: true,
            firstName: true,
            lastName: true,
          },
        }),
      ]);
      const userRank = higherCount + 1;

      // Log view (non-blocking)
      queueEvent(EventTypes.NEARBY_COMPETITORS_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "leaderboard",
        metadata: {
          scope,
          userRank,
          competitorsAbove: usersAbove.length,
          competitorsBelow: usersBelow.length,
        },
      });

      // Helper to get name from profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getName = (u: any) => u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Anonymous";

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        above: usersAbove.reverse().map((u: any, index: number) => ({
          rank: userRank - (usersAbove.length - index),
          userId: u.userId,
          name: getName(u),
          avatarUrl: u.avatarUrl,
          collegeName: u.collegeName,
          xp: u.totalXp,
          gap: u.totalXp - (profileData?.totalXp || 0),
        })),
        currentUser: {
          rank: userRank,
          userId,
          xp: profileData?.totalXp || 0,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        below: usersBelow.map((u: any, index: number) => ({
          rank: userRank + index + 1,
          userId: u.userId,
          name: getName(u),
          avatarUrl: u.avatarUrl,
          collegeName: u.collegeName,
          xp: u.totalXp,
          gap: (profileData?.totalXp || 0) - u.totalXp,
        })),
        // Scarcity signal
        catchUpMessage: usersAbove[0]
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `🎯 Just ${(usersAbove[0] as any).totalXp - (profileData?.totalXp || 0)} XP to overtake ${getName(usersAbove[0])}!`
          : "🏆 You're #1!",
      };
    }),
});
