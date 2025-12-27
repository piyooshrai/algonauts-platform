/**
 * Streaks Router
 *
 * Game theory: Streaks create loss aversion and daily habit formation
 *
 * Features:
 * - Daily activity tracking
 * - Streak continue/break logic
 * - Streak freezes (limited)
 * - Streak milestones
 * - Loss-framing notifications for streak at risk
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  studentProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";

// ============================================================================
// STREAK CONFIGURATION
// ============================================================================

const STREAK_CONFIG = {
  // Activities that count towards streak
  QUALIFYING_ACTIVITIES: [
    "application_submitted",
    "profile_updated",
    "assessment_completed",
    "opportunity_viewed",
    "login",
  ],
  // Streak milestones
  MILESTONES: [3, 7, 14, 30, 60, 100, 365],
  // XP rewards for milestones
  MILESTONE_XP: {
    3: 25,
    7: 50,
    14: 100,
    30: 200,
    60: 400,
    100: 750,
    365: 2000,
  } as Record<number, number>,
  // Max streak freezes available
  MAX_FREEZES: 2,
  // How to earn freezes
  FREEZE_EARN_THRESHOLD: 14, // Earn 1 freeze for every 14-day streak
};

// ============================================================================
// SCHEMAS
// ============================================================================

const recordActivitySchema = z.object({
  activityType: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

// ============================================================================
// STREAKS ROUTER
// ============================================================================

export const streaksRouter = createTRPCRouter({
  /**
   * Get current streak status
   */
  getCurrent: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user's streak data
    const streak = await ctx.prisma.streak.findUnique({
      where: { id: `${userId}_daily` },
    });

    if (!streak) {
      // No streak yet, return empty state
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        isActiveToday: false,
        streakAtRisk: false,
        freezesAvailable: 0,
        freezesUsed: 0,
        nextMilestone: 3,
        daysToNextMilestone: 3,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streakData = streak as any;
    const lastActivity = streakData.lastActivityDate ? new Date(streakData.lastActivityDate) : null;
    const isActiveToday = lastActivity ? isSameDay(lastActivity, today) : false;
    const wasActiveYesterday = lastActivity ? isYesterday(lastActivity, today) : false;

    // Check if streak is broken (no activity yesterday and not today)
    let currentStreak = streakData.currentStreak || 0;
    if (lastActivity && !isActiveToday && !wasActiveYesterday) {
      // Streak is broken unless they have a freeze
      if (streakData.freezesAvailable > 0) {
        // Auto-use freeze
        currentStreak = streakData.currentStreak; // Keep streak
      } else {
        currentStreak = 0; // Streak broken
      }
    }

    // Calculate next milestone
    const nextMilestone = STREAK_CONFIG.MILESTONES.find(m => m > currentStreak) || 365;
    const daysToNextMilestone = nextMilestone - currentStreak;

    // Streak is at risk if they haven't been active today
    const streakAtRisk = currentStreak > 0 && !isActiveToday;

    // Log streak view
    await logEvent(EventTypes.STREAK_VIEWED, {
      userId,
      userType: ctx.session.user.userType,
      entityType: "streak",
      metadata: {
        currentStreak,
        streakAtRisk,
        isActiveToday,
      },
    });

    return {
      currentStreak,
      longestStreak: streakData.longestStreak || 0,
      lastActivityDate: lastActivity,
      isActiveToday,
      streakAtRisk,
      freezesAvailable: streakData.freezesAvailable || 0,
      freezesUsed: streakData.freezesUsed || 0,
      nextMilestone,
      daysToNextMilestone,
      milestoneProgress: Math.round((currentStreak / nextMilestone) * 100),
    };
  }),

  /**
   * Record an activity and update streak
   */
  recordActivity: studentProcedure
    .input(recordActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get or create streak record
      const streak = await ctx.prisma.streak.findUnique({
        where: { id: `${userId}_daily` },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streakData = streak as any;

      const wasActiveToday = streakData?.lastActivityDate
        ? isSameDay(new Date(streakData.lastActivityDate), today)
        : false;

      if (wasActiveToday) {
        // Already active today, no streak change needed
        return {
          streakUpdated: false,
          currentStreak: streakData.currentStreak,
          message: "Already active today",
        };
      }

      // Check if this continues the streak
      const wasActiveYesterday = streakData?.lastActivityDate
        ? isYesterday(new Date(streakData.lastActivityDate), today)
        : false;

      let newStreak = 1;
      let streakContinued = false;
      let streakBroken = false;
      let usedFreeze = false;
      let milestoneReached: number | null = null;
      let xpAwarded = 10; // Base XP for daily activity

      if (streakData) {
        if (wasActiveYesterday) {
          // Continue streak
          newStreak = (streakData.currentStreak || 0) + 1;
          streakContinued = true;
        } else if (streakData.lastActivityDate) {
          // Gap in activity
          const daysSinceLastActivity = daysBetween(
            new Date(streakData.lastActivityDate),
            today
          );

          if (daysSinceLastActivity === 2 && streakData.freezesAvailable > 0) {
            // One day gap, can use freeze
            newStreak = (streakData.currentStreak || 0) + 1;
            usedFreeze = true;
            streakContinued = true;
          } else {
            // Streak broken
            streakBroken = true;
            newStreak = 1;
          }
        }
      }

      // Check for milestone
      if (STREAK_CONFIG.MILESTONES.includes(newStreak)) {
        milestoneReached = newStreak;
        xpAwarded += STREAK_CONFIG.MILESTONE_XP[newStreak] || 0;
      }

      // Check if earned new freeze
      let freezesEarned = 0;
      const previousFreezeThreshold = Math.floor(
        (streakData?.currentStreak || 0) / STREAK_CONFIG.FREEZE_EARN_THRESHOLD
      );
      const newFreezeThreshold = Math.floor(newStreak / STREAK_CONFIG.FREEZE_EARN_THRESHOLD);
      if (newFreezeThreshold > previousFreezeThreshold) {
        freezesEarned = newFreezeThreshold - previousFreezeThreshold;
      }

      // Update streak record
      const updatedStreak = await ctx.prisma.streak.upsert({
        where: { id: `${userId}_daily` },
        create: {
          id: `${userId}_daily`,
          userId,
          streakType: "daily",
          currentStreak: newStreak,
          longestStreak: newStreak,
          lastActivityDate: today,
          freezesAvailable: freezesEarned,
          freezesUsed: 0,
          totalXpEarned: xpAwarded,
        },
        update: {
          currentStreak: newStreak,
          longestStreak: {
            set: Math.max(streakData?.longestStreak || 0, newStreak),
          },
          lastActivityDate: today,
          freezesAvailable: usedFreeze
            ? { decrement: 1 }
            : { increment: freezesEarned },
          freezesUsed: usedFreeze ? { increment: 1 } : undefined,
          totalXpEarned: { increment: xpAwarded },
        },
      });

      // Update user's XP
      await ctx.prisma.profile.update({
        where: { userId },
        data: {
          xpTotal: { increment: xpAwarded },
          currentStreak: newStreak,
        },
      });

      // LOG ALL THE EVENTS
      await logEvent(EventTypes.STREAK_ACTIVITY, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "streak",
        metadata: {
          activityType: input.activityType,
          currentStreak: newStreak,
          streakContinued,
          streakBroken,
          usedFreeze,
          xpAwarded,
        },
      });

      if (streakContinued && !streakBroken) {
        await logEvent(EventTypes.STREAK_CONTINUED, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "streak",
          metadata: {
            previousStreak: streakData?.currentStreak || 0,
            newStreak,
            usedFreeze,
          },
        });
      }

      if (streakBroken) {
        await logEvent(EventTypes.STREAK_BROKEN, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "streak",
          metadata: {
            lostStreak: streakData?.currentStreak || 0,
            daysSinceLastActivity: streakData?.lastActivityDate
              ? daysBetween(new Date(streakData.lastActivityDate), today)
              : 0,
          },
        });
      }

      if (milestoneReached) {
        await logEvent(EventTypes.STREAK_MILESTONE, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "streak",
          metadata: {
            milestone: milestoneReached,
            xpAwarded: STREAK_CONFIG.MILESTONE_XP[milestoneReached],
          },
        });
      }

      return {
        streakUpdated: true,
        currentStreak: newStreak,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        longestStreak: (updatedStreak as any).longestStreak,
        streakContinued,
        streakBroken,
        usedFreeze,
        milestoneReached,
        xpAwarded,
        freezesAvailable: usedFreeze
          ? (streakData?.freezesAvailable || 1) - 1 + freezesEarned
          : (streakData?.freezesAvailable || 0) + freezesEarned,
        freezesEarned,
      };
    }),

  /**
   * Use a streak freeze manually
   */
  useFreeze: studentProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const streak = await ctx.prisma.streak.findUnique({
      where: { id: `${userId}_daily` },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streakData = streak as any;

    if (!streakData || streakData.freezesAvailable < 1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No freezes available",
      });
    }

    // Use the freeze
    await ctx.prisma.streak.update({
      where: { id: `${userId}_daily` },
      data: {
        freezesAvailable: { decrement: 1 },
        freezesUsed: { increment: 1 },
        // Extend last activity date to today
        lastActivityDate: new Date(),
      },
    });

    await logEvent(EventTypes.STREAK_FREEZE_USED, {
      userId,
      userType: ctx.session.user.userType,
      entityType: "streak",
      metadata: {
        currentStreak: streakData.currentStreak,
        freezesRemaining: streakData.freezesAvailable - 1,
      },
    });

    return {
      used: true,
      freezesRemaining: streakData.freezesAvailable - 1,
      streakPreserved: streakData.currentStreak,
    };
  }),

  /**
   * Get streak history/calendar
   */
  getHistory: studentProcedure
    .input(z.object({
      days: z.number().min(7).max(365).default(30),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const days = input?.days || 30;

      // Get activity events for the period
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await ctx.prisma.event.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
          eventType: {
            in: [
              "APPLICATION_SUBMIT",
              "PROFILE_UPDATE",
              "ASSESSMENT_COMPLETE",
              "LOGIN",
            ],
          },
        },
        select: {
          createdAt: true,
          eventType: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Group by date
      const activityByDate = new Map<string, number>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activities.forEach((a: any) => {
        const dateKey = a.createdAt.toISOString().split("T")[0];
        activityByDate.set(dateKey, (activityByDate.get(dateKey) || 0) + 1);
      });

      // Generate calendar data
      const calendar = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];

        calendar.push({
          date: dateKey,
          active: activityByDate.has(dateKey),
          activityCount: activityByDate.get(dateKey) || 0,
        });
      }

      return {
        calendar: calendar.reverse(),
        totalActiveDays: activityByDate.size,
        periodDays: days,
        activityRate: Math.round((activityByDate.size / days) * 100),
      };
    }),

  /**
   * Get streak leaderboard for college
   */
  getLeaderboard: studentProcedure
    .input(z.object({
      limit: z.number().min(5).max(50).default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit || 10;

      // Get user's college
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true },
      });

      // Get top streaks in college
      const topStreaks = await ctx.prisma.streak.findMany({
        where: {
          streakType: "daily",
          user: {
            profile: {
              collegeId: (profile as unknown as { collegeId?: string })?.collegeId,
            },
          },
        },
        orderBy: { currentStreak: "desc" },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // Log view
      await logEvent(EventTypes.STREAK_LEADERBOARD_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "streak",
        metadata: {
          collegeId: (profile as unknown as { collegeId?: string })?.collegeId,
        },
      });

      // Find user's position
      const userStreak = await ctx.prisma.streak.findUnique({
        where: { id: `${userId}_daily` },
      });

      let userRank = -1;
      if (userStreak) {
        const higherStreaks = await ctx.prisma.streak.count({
          where: {
            streakType: "daily",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            currentStreak: { gt: (userStreak as any).currentStreak },
            user: {
              profile: {
                collegeId: (profile as unknown as { collegeId?: string })?.collegeId,
              },
            },
          },
        });
        userRank = higherStreaks + 1;
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leaderboard: topStreaks.map((s: any, index: number) => ({
          rank: index + 1,
          userId: s.user?.id,
          name: s.user?.name,
          avatarUrl: s.user?.profile?.avatarUrl,
          currentStreak: s.currentStreak,
          longestStreak: s.longestStreak,
          isCurrentUser: s.user?.id === userId,
        })),
        userRank,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userStreak: (userStreak as any)?.currentStreak || 0,
      };
    }),

  /**
   * Get users at risk of losing streak (for notifications)
   */
  getAtRiskUsers: studentProcedure.query(async ({ ctx }) => {
    // This would typically be a cron job, but exposing for admin use
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find users who were active yesterday but not today
    const atRiskStreaks = await ctx.prisma.streak.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastActivityDate: {
          gte: yesterday,
          lt: today,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return {
      count: atRiskStreaks.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      users: atRiskStreaks.map((s: any) => ({
        userId: s.user?.id,
        email: s.user?.email,
        name: s.user?.name,
        currentStreak: s.currentStreak,
        lastActivityDate: s.lastActivityDate,
        freezesAvailable: s.freezesAvailable,
      })),
    };
  }),
});
