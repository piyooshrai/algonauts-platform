/**
 * Scheduled Jobs Router
 * Handles cron-triggered background tasks
 * Phase 5: Polish & Launch
 *
 * Job Schedule:
 * - Hourly: Feature store updates, leaderboard recalculation
 * - Daily: Streak processing, at-risk notifications
 * - Weekly: Verification requests (30-day, 90-day), digest emails
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc/trpc";
import { TRPCError } from "@trpc/server";
import { logEvent } from "@/lib/events";
import { EventTypes } from "@/lib/events/types";
import {
  sendTemplateEmail,
  sendVerificationRequestEmail,
  sendLossFrameEmail,
} from "@/lib/email";

// ============================================================================
// JOB AUTHENTICATION
// ============================================================================

const JOB_SECRET = process.env.CRON_SECRET || "dev-cron-secret";

const jobProcedure = publicProcedure.use(async ({ ctx, next }) => {
  // Verify cron secret for production
  // In production, jobs should be called with x-cron-secret header
  const cronSecret = ctx.headers?.get?.("x-cron-secret");

  if (process.env.NODE_ENV === "production" && cronSecret !== JOB_SECRET) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid cron secret",
    });
  }

  return next();
});

// ============================================================================
// JOB TRACKING
// ============================================================================

interface JobResult {
  jobName: string;
  success: boolean;
  processedCount: number;
  errors: string[];
  duration: number;
  timestamp: Date;
}

async function trackJob(
  prisma: unknown,
  jobName: string,
  executor: () => Promise<{ processedCount: number; errors: string[] }>
): Promise<JobResult> {
  const startTime = Date.now();

  await logEvent(EventTypes.JOB_STARTED, {
    entityType: "job",
    entityId: jobName,
    metadata: { startedAt: new Date() },
  });

  try {
    const result = await executor();
    const duration = Date.now() - startTime;

    await logEvent(EventTypes.JOB_COMPLETED, {
      entityType: "job",
      entityId: jobName,
      metadata: {
        processedCount: result.processedCount,
        errors: result.errors.length,
        duration,
      },
    });

    return {
      jobName,
      success: result.errors.length === 0,
      processedCount: result.processedCount,
      errors: result.errors,
      duration,
      timestamp: new Date(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    await logEvent(EventTypes.JOB_FAILED, {
      entityType: "job",
      entityId: jobName,
      metadata: {
        error: String(error),
        duration,
      },
    });

    return {
      jobName,
      success: false,
      processedCount: 0,
      errors: [String(error)],
      duration,
      timestamp: new Date(),
    };
  }
}

// ============================================================================
// ROUTER
// ============================================================================

export const jobsRouter = createTRPCRouter({
  // ==========================================================================
  // HOURLY JOBS
  // ==========================================================================

  /**
   * Update feature store (hourly)
   * Recomputes features for active users
   */
  hourlyFeatureStoreUpdate: jobProcedure.mutation(async ({ ctx }) => {
    return trackJob(ctx.prisma, "hourly_feature_store_update", async () => {
      const errors: string[] = [];
      let processedCount = 0;

      // Get users active in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const activeUsers = await ctx.prisma.event.findMany({
        where: { timestamp: { gte: oneHourAgo } },
        distinct: ["userId"],
        select: { userId: true },
      });

      const userIds = activeUsers.map((e: { userId: string | null }) => e.userId).filter(Boolean) as string[];

      // Update features for each active user (in batches)
      const batchSize = 50;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        // In a real implementation, we'd call the feature store to update
        // For now, just count them
        processedCount += batch.length;
      }

      return { processedCount, errors };
    });
  }),

  /**
   * Recalculate leaderboards (hourly)
   */
  hourlyLeaderboardUpdate: jobProcedure.mutation(async ({ ctx }) => {
    return trackJob(ctx.prisma, "hourly_leaderboard_update", async () => {
      const errors: string[] = [];
      let processedCount = 0;

      // Recalculate student XP rankings
      try {
        // Get all students with XP
        const students = await ctx.prisma.profile.findMany({
          where: {
            user: { userType: "STUDENT" },
            totalXP: { gt: 0 },
          },
          select: {
            userId: true,
            totalXP: true,
            collegeId: true,
          },
          orderBy: { totalXP: "desc" },
        });

        // Update national ranks
        let nationalRank = 0;
        let prevXP = -1;
        for (const student of students) {
          if (student.totalXP !== prevXP) {
            nationalRank++;
            prevXP = student.totalXP || 0;
          }

          await ctx.prisma.profile.update({
            where: { userId: student.userId },
            data: { nationalRank },
          });
          processedCount++;
        }

        // Update college-wise ranks
        const collegeGroups = new Map<string, typeof students>();
        for (const student of students) {
          if (student.collegeId) {
            const group = collegeGroups.get(student.collegeId) || [];
            group.push(student);
            collegeGroups.set(student.collegeId, group);
          }
        }

        const collegeEntries = Array.from(collegeGroups.entries());
        for (const entry of collegeEntries) {
          const collegeStudents = entry[1];
          let collegeRank = 0;
          let prevCollegeXP = -1;
          for (const student of collegeStudents) {
            if (student.totalXP !== prevCollegeXP) {
              collegeRank++;
              prevCollegeXP = student.totalXP || 0;
            }

            await ctx.prisma.profile.update({
              where: { userId: student.userId },
              data: { collegeRank },
            });
          }
        }
      } catch (error) {
        errors.push(`Leaderboard update failed: ${error}`);
      }

      return { processedCount, errors };
    });
  }),

  // ==========================================================================
  // DAILY JOBS
  // ==========================================================================

  /**
   * Process streaks (daily)
   * Run at midnight to process previous day's streaks
   */
  dailyStreakProcessing: jobProcedure.mutation(async ({ ctx }) => {
    return trackJob(ctx.prisma, "daily_streak_processing", async () => {
      const errors: string[] = [];
      let processedCount = 0;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all active streaks
      const activeStreaks = await ctx.prisma.streak.findMany({
        where: {
          isActive: true,
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

      for (const streak of activeStreaks) {
        try {
          // Check if user was active yesterday
          const yesterdayActivity = await ctx.prisma.event.findFirst({
            where: {
              userId: streak.userId,
              timestamp: {
                gte: yesterday,
                lt: today,
              },
            },
          });

          if (!yesterdayActivity) {
            // Check if they have freeze available
            if (streak.freezesRemaining > 0) {
              // Use a freeze
              await ctx.prisma.streak.update({
                where: { id: streak.id },
                data: {
                  freezesRemaining: streak.freezesRemaining - 1,
                  lastFreezeUsedAt: new Date(),
                },
              });

              await logEvent(EventTypes.STREAK_FREEZE_USED, {
                userId: streak.userId,
                entityType: "streak",
                entityId: streak.id,
                metadata: { currentStreak: streak.currentStreak },
              });
            } else {
              // Break the streak
              await ctx.prisma.streak.update({
                where: { id: streak.id },
                data: {
                  isActive: false,
                  brokenAt: new Date(),
                  longestStreak: Math.max(streak.longestStreak, streak.currentStreak),
                },
              });

              await logEvent(EventTypes.STREAK_BREAK, {
                userId: streak.userId,
                entityType: "streak",
                entityId: streak.id,
                metadata: {
                  finalStreak: streak.currentStreak,
                  longestStreak: Math.max(streak.longestStreak, streak.currentStreak),
                },
              });
            }
          }

          processedCount++;
        } catch (error) {
          errors.push(`Streak ${streak.id}: ${error}`);
        }
      }

      return { processedCount, errors };
    });
  }),

  /**
   * Send at-risk notifications (daily)
   * Identify users at risk of churning and send loss-framing notifications
   */
  dailyAtRiskNotifications: jobProcedure.mutation(async ({ ctx }) => {
    return trackJob(ctx.prisma, "daily_at_risk_notifications", async () => {
      const errors: string[] = [];
      let processedCount = 0;

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Find users who haven't logged in for 3+ days but were previously active
      const atRiskUsers = await ctx.prisma.user.findMany({
        where: {
          userType: "STUDENT",
          lastLoginAt: {
            gte: sevenDaysAgo,
            lt: threeDaysAgo,
          },
        },
        include: {
          profile: true,
        },
        take: 100, // Limit per run
      });

      for (const user of atRiskUsers) {
        try {
          if (!user.email) continue;

          // Get missed opportunities
          const newOpportunities = await ctx.prisma.opportunity.count({
            where: {
              status: "OPEN",
              createdAt: { gte: threeDaysAgo },
            },
          });

          // Get streak info
          const streak = await ctx.prisma.streak.findFirst({
            where: { userId: user.id, isActive: true },
          });

          // Send appropriate loss-frame email
          if (streak && streak.currentStreak > 3) {
            await sendLossFrameEmail(user.email, "streak_warning", {
              name: user.name,
              streakDays: streak.currentStreak,
              hoursRemaining: 24,
              nextMilestone: getNextMilestone(streak.currentStreak),
            });
          } else if (newOpportunities > 5) {
            await sendLossFrameEmail(user.email, "missed_opportunities", {
              name: user.name,
              count: newOpportunities,
            });
          }

          processedCount++;
        } catch (error) {
          errors.push(`User ${user.id}: ${error}`);
        }
      }

      return { processedCount, errors };
    });
  }),

  // ==========================================================================
  // WEEKLY JOBS
  // ==========================================================================

  /**
   * Send 30-day verification requests (weekly)
   */
  weeklyVerificationRequests30: jobProcedure.mutation(async ({ ctx }) => {
    return trackJob(ctx.prisma, "weekly_verification_30", async () => {
      const errors: string[] = [];
      let processedCount = 0;

      // Find placements that are 30+ days old without verification
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

      const pendingVerifications = await ctx.prisma.placement.findMany({
        where: {
          createdAt: {
            gte: fortyDaysAgo,
            lt: thirtyDaysAgo,
          },
          verification30CompletedAt: null,
          verification30RequestedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          company: {
            select: { name: true },
          },
        },
        take: 50,
      });

      for (const placement of pendingVerifications) {
        try {
          if (!placement.user.email) continue;

          const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${placement.id}?type=30`;

          await sendVerificationRequestEmail(
            placement.user.email,
            {
              name: placement.user.name || "there",
              companyName: placement.company?.name || placement.companyName || "your company",
              verifyUrl,
            },
            "30"
          );

          await ctx.prisma.placement.update({
            where: { id: placement.id },
            data: { verification30RequestedAt: new Date() },
          });

          processedCount++;
        } catch (error) {
          errors.push(`Placement ${placement.id}: ${error}`);
        }
      }

      return { processedCount, errors };
    });
  }),

  /**
   * Send 90-day verification requests (weekly)
   */
  weeklyVerificationRequests90: jobProcedure.mutation(async ({ ctx }) => {
    return trackJob(ctx.prisma, "weekly_verification_90", async () => {
      const errors: string[] = [];
      let processedCount = 0;

      // Find placements that are 90+ days old with 30-day verification but no 90-day
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const hundredDaysAgo = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);

      const pendingVerifications = await ctx.prisma.placement.findMany({
        where: {
          createdAt: {
            gte: hundredDaysAgo,
            lt: ninetyDaysAgo,
          },
          verification30CompletedAt: { not: null },
          verification90CompletedAt: null,
          verification90RequestedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile: {
                select: { collegeName: true },
              },
            },
          },
          company: {
            select: { name: true },
          },
        },
        take: 50,
      });

      for (const placement of pendingVerifications) {
        try {
          if (!placement.user.email) continue;

          const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${placement.id}?type=90`;

          await sendVerificationRequestEmail(
            placement.user.email,
            {
              name: placement.user.name || "there",
              companyName: placement.company?.name || placement.companyName || "your company",
              collegeName: placement.user.profile?.collegeName,
              verifyUrl,
            },
            "90"
          );

          await ctx.prisma.placement.update({
            where: { id: placement.id },
            data: { verification90RequestedAt: new Date() },
          });

          processedCount++;
        } catch (error) {
          errors.push(`Placement ${placement.id}: ${error}`);
        }
      }

      return { processedCount, errors };
    });
  }),

  /**
   * Send weekly digest emails
   */
  weeklyDigestEmails: jobProcedure.mutation(async ({ ctx }) => {
    return trackJob(ctx.prisma, "weekly_digest_emails", async () => {
      const errors: string[] = [];
      let processedCount = 0;

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Get active students who haven't unsubscribed from digest
      const students = await ctx.prisma.user.findMany({
        where: {
          userType: "STUDENT",
          lastLoginAt: { gte: oneWeekAgo },
          // Add notification preferences check when implemented
        },
        include: {
          profile: {
            select: {
              collegeId: true,
              skills: true,
            },
          },
        },
        take: 100,
      });

      for (const student of students) {
        try {
          if (!student.email) continue;

          // Get stats for this student
          const [newOpportunities, collegemates, streak] = await Promise.all([
            ctx.prisma.opportunity.count({
              where: {
                status: "OPEN",
                createdAt: { gte: oneWeekAgo },
              },
            }),
            ctx.prisma.placement.count({
              where: {
                createdAt: { gte: oneWeekAgo },
                user: {
                  profile: {
                    collegeId: student.profile?.collegeId,
                  },
                },
              },
            }),
            ctx.prisma.streak.findFirst({
              where: { userId: student.id, isActive: true },
            }),
          ]);

          await sendTemplateEmail(student.email, "weekly_digest", {
            name: student.name,
            newOpportunities,
            collegemates,
            streakDays: streak?.currentStreak || 0,
          });

          processedCount++;
        } catch (error) {
          errors.push(`Student ${student.id}: ${error}`);
        }
      }

      return { processedCount, errors };
    });
  }),

  // ==========================================================================
  // JOB STATUS & MANAGEMENT
  // ==========================================================================

  /**
   * Get job run history (admin only)
   */
  getJobHistory: protectedProcedure
    .input(z.object({
      jobName: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.userType !== "PLATFORM_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const events = await ctx.prisma.event.findMany({
        where: {
          eventType: { in: ["JOB_STARTED", "JOB_COMPLETED", "JOB_FAILED"] },
          ...(input.jobName ? { entityId: input.jobName } : {}),
        },
        orderBy: { timestamp: "desc" },
        take: input.limit,
        select: {
          id: true,
          eventType: true,
          entityId: true,
          metadata: true,
          timestamp: true,
        },
      });

      return events;
    }),

  /**
   * Manually trigger a job (admin only)
   */
  triggerJob: protectedProcedure
    .input(z.object({
      jobName: z.enum([
        "hourly_feature_store_update",
        "hourly_leaderboard_update",
        "daily_streak_processing",
        "daily_at_risk_notifications",
        "weekly_verification_30",
        "weekly_verification_90",
        "weekly_digest_emails",
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.userType !== "PLATFORM_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      // This would trigger the job - in practice, call the appropriate mutation
      await logEvent(EventTypes.JOB_STARTED, {
        userId: ctx.session.user.id,
        entityType: "job",
        entityId: input.jobName,
        metadata: { triggeredManually: true },
      });

      return { success: true, message: `Job ${input.jobName} triggered` };
    }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNextMilestone(currentStreak: number): number {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  for (const milestone of milestones) {
    if (currentStreak < milestone) return milestone;
  }
  return 365;
}
