/**
 * Admin Panel Router
 * User management, company/college verification, metrics dashboard, event viewer
 * Phase 5: Polish & Launch
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc/trpc";
import { TRPCError } from "@trpc/server";
import { logEvent } from "@/lib/events";
import { EventTypes } from "@/lib/events/types";

// ============================================================================
// ADMIN MIDDLEWARE
// ============================================================================

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Check if user is PLATFORM_ADMIN
  if (ctx.session.user.userType !== "PLATFORM_ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next();
});

// ============================================================================
// TYPES
// ============================================================================

interface AcquisitionMetrics {
  // User metrics
  totalUsers: number;
  usersByType: { type: string; count: number }[];
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  // Engagement metrics
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;

  // Conversion metrics
  profileCompletionRate: number;
  applicationRate: number;
  placementRate: number;

  // Viral metrics
  invitesSent: number;
  inviteConversionRate: number;
  shareCount: number;
  kFactor: number;

  // Revenue metrics
  totalPlacements: number;
  verifiedPlacements30: number;
  verifiedPlacements90: number;
  averagePackageLPA: number;

  // Event volume
  eventsToday: number;
  eventsThisWeek: number;
}

// ============================================================================
// ROUTER
// ============================================================================

export const adminRouter = createTRPCRouter({
  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================

  /**
   * List all users with filters
   */
  listUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      userType: z.enum(["STUDENT", "COLLEGE_ADMIN", "COMPANY_ADMIN", "PLATFORM_ADMIN"]).optional(),
      status: z.enum(["active", "suspended", "unverified"]).optional(),
      search: z.string().optional(),
      sortBy: z.enum(["createdAt", "name", "email", "lastLoginAt"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (input.userType) {
        where.userType = input.userType;
      }

      if (input.status === "suspended") {
        where.isSuspended = true;
      } else if (input.status === "unverified") {
        where.emailVerified = null;
      } else if (input.status === "active") {
        where.isSuspended = { not: true };
        where.emailVerified = { not: null };
      }

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { [input.sortBy]: input.sortOrder },
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            emailVerified: true,
            isSuspended: true,
            createdAt: true,
            lastLoginAt: true,
            profile: {
              select: {
                avatarUrl: true,
                collegeName: true,
                currentRole: true,
              },
            },
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      await logEvent(EventTypes.ADMIN_USER_LIST_VIEWED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        metadata: { filters: input, count: users.length },
      });

      return {
        users,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get user details
   */
  getUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          profile: true,
          applications: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          placements: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          badges: {
            take: 20,
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Get event summary
      const recentEvents = await ctx.prisma.event.findMany({
        where: { userId: input.userId },
        take: 50,
        orderBy: { timestamp: "desc" },
        select: {
          eventType: true,
          timestamp: true,
          entityType: true,
        },
      });

      await logEvent(EventTypes.ADMIN_USER_VIEWED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "user",
        entityId: input.userId,
      });

      return {
        user,
        recentEvents,
        stats: {
          totalEvents: recentEvents.length,
          applicationCount: user.applications.length,
          placementCount: user.placements.length,
          badgeCount: user.badges.length,
        },
      };
    }),

  /**
   * Suspend user
   */
  suspendUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent suspending yourself
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot suspend yourself",
        });
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspendedReason: input.reason,
        },
      });

      await logEvent(EventTypes.ADMIN_USER_SUSPENDED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "user",
        entityId: input.userId,
        metadata: { reason: input.reason },
      });

      return { success: true, user };
    }),

  /**
   * Unsuspend user
   */
  unsuspendUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          isSuspended: false,
          suspendedAt: null,
          suspendedReason: null,
        },
      });

      await logEvent(EventTypes.ADMIN_USER_UNSUSPENDED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "user",
        entityId: input.userId,
      });

      return { success: true, user };
    }),

  /**
   * Manually verify user email
   */
  verifyUserEmail: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          emailVerified: new Date(),
        },
      });

      await logEvent(EventTypes.ADMIN_USER_EMAIL_VERIFIED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "user",
        entityId: input.userId,
      });

      return { success: true, user };
    }),

  // ==========================================================================
  // COMPANY VERIFICATION
  // ==========================================================================

  /**
   * List companies pending verification
   */
  listCompanies: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(["pending", "verified", "rejected", "all"]).default("pending"),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (input.status === "pending") {
        where.isVerified = false;
        where.isRejected = { not: true };
      } else if (input.status === "verified") {
        where.isVerified = true;
      } else if (input.status === "rejected") {
        where.isRejected = true;
      }

      const [companies, total] = await Promise.all([
        ctx.prisma.company.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            domain: true,
            industry: true,
            size: true,
            logoUrl: true,
            isVerified: true,
            isRejected: true,
            createdAt: true,
            _count: {
              select: {
                opportunities: true,
                placements: true,
              },
            },
          },
        }),
        ctx.prisma.company.count({ where }),
      ]);

      return {
        companies,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Verify company
   */
  verifyCompany: adminProcedure
    .input(z.object({
      companyId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.update({
        where: { id: input.companyId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: ctx.session.user.id,
          verificationNotes: input.notes,
        },
      });

      await logEvent(EventTypes.ADMIN_COMPANY_VERIFIED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "company",
        entityId: input.companyId,
        metadata: { notes: input.notes },
      });

      return { success: true, company };
    }),

  /**
   * Reject company
   */
  rejectCompany: adminProcedure
    .input(z.object({
      companyId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.update({
        where: { id: input.companyId },
        data: {
          isRejected: true,
          rejectedAt: new Date(),
          rejectedBy: ctx.session.user.id,
          rejectionReason: input.reason,
        },
      });

      await logEvent(EventTypes.ADMIN_COMPANY_REJECTED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "company",
        entityId: input.companyId,
        metadata: { reason: input.reason },
      });

      return { success: true, company };
    }),

  // ==========================================================================
  // COLLEGE VERIFICATION
  // ==========================================================================

  /**
   * List colleges pending verification
   */
  listColleges: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(["pending", "verified", "rejected", "all"]).default("pending"),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (input.status === "pending") {
        where.isVerified = false;
        where.isRejected = { not: true };
      } else if (input.status === "verified") {
        where.isVerified = true;
      } else if (input.status === "rejected") {
        where.isRejected = true;
      }

      const [colleges, total] = await Promise.all([
        ctx.prisma.college.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            location: true,
            tier: true,
            logoUrl: true,
            isVerified: true,
            isRejected: true,
            createdAt: true,
            _count: {
              select: {
                students: true,
                placements: true,
              },
            },
          },
        }),
        ctx.prisma.college.count({ where }),
      ]);

      return {
        colleges,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Verify college
   */
  verifyCollege: adminProcedure
    .input(z.object({
      collegeId: z.string(),
      tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const college = await ctx.prisma.college.update({
        where: { id: input.collegeId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: ctx.session.user.id,
          verificationNotes: input.notes,
          ...(input.tier && { tier: input.tier }),
        },
      });

      await logEvent(EventTypes.ADMIN_COLLEGE_VERIFIED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "college",
        entityId: input.collegeId,
        metadata: { tier: input.tier, notes: input.notes },
      });

      return { success: true, college };
    }),

  /**
   * Reject college
   */
  rejectCollege: adminProcedure
    .input(z.object({
      collegeId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const college = await ctx.prisma.college.update({
        where: { id: input.collegeId },
        data: {
          isRejected: true,
          rejectedAt: new Date(),
          rejectedBy: ctx.session.user.id,
          rejectionReason: input.reason,
        },
      });

      await logEvent(EventTypes.ADMIN_COLLEGE_REJECTED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "college",
        entityId: input.collegeId,
        metadata: { reason: input.reason },
      });

      return { success: true, college };
    }),

  // ==========================================================================
  // LAYERS RANK MANAGEMENT (MVP - Manual Entry)
  // ==========================================================================

  /**
   * Update LayersRank score manually
   */
  updateLayersRank: adminProcedure
    .input(z.object({
      userId: z.string(),
      overallRank: z.number().min(0).max(100),
      communicationScore: z.number().min(0).max(100).optional(),
      technicalScore: z.number().min(0).max(100).optional(),
      problemSolvingScore: z.number().min(0).max(100).optional(),
      leadershipScore: z.number().min(0).max(100).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.update({
        where: { userId: input.userId },
        data: {
          layersRankOverall: input.overallRank,
          layersRankCommunication: input.communicationScore,
          layersRankTechnical: input.technicalScore,
          layersRankProblemSolving: input.problemSolvingScore,
          layersRankLeadership: input.leadershipScore,
          layersRankUpdatedAt: new Date(),
          layersRankUpdatedBy: ctx.session.user.id,
        },
      });

      await logEvent(EventTypes.ADMIN_LAYERS_RANK_UPDATED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "user",
        entityId: input.userId,
        metadata: {
          overallRank: input.overallRank,
          notes: input.notes,
        },
      });

      return { success: true, profile };
    }),

  /**
   * Bulk update LayersRank scores
   */
  bulkUpdateLayersRank: adminProcedure
    .input(z.object({
      updates: z.array(z.object({
        userId: z.string(),
        overallRank: z.number().min(0).max(100),
        communicationScore: z.number().min(0).max(100).optional(),
        technicalScore: z.number().min(0).max(100).optional(),
      })).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.updates.map(async (update) => {
          try {
            await ctx.prisma.profile.update({
              where: { userId: update.userId },
              data: {
                layersRankOverall: update.overallRank,
                layersRankCommunication: update.communicationScore,
                layersRankTechnical: update.technicalScore,
                layersRankUpdatedAt: new Date(),
                layersRankUpdatedBy: ctx.session.user.id,
              },
            });
            return { userId: update.userId, success: true };
          } catch {
            return { userId: update.userId, success: false };
          }
        })
      );

      const successful = results.filter((r) => r.success).length;

      await logEvent(EventTypes.ADMIN_BULK_LAYERS_RANK_UPDATED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        metadata: {
          totalUpdates: input.updates.length,
          successful,
          failed: input.updates.length - successful,
        },
      });

      return {
        success: true,
        results,
        summary: {
          total: input.updates.length,
          successful,
          failed: input.updates.length - successful,
        },
      };
    }),

  // ==========================================================================
  // ACQUISITION METRICS DASHBOARD
  // ==========================================================================

  /**
   * Get acquisition metrics (the numbers from ACQUISITION-METRICS.md)
   */
  getAcquisitionMetrics: adminProcedure.query(async ({ ctx }): Promise<AcquisitionMetrics> => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User metrics
    const [
      totalUsers,
      usersByType,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    ] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.user.groupBy({
        by: ["userType"],
        _count: true,
      }),
      ctx.prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      ctx.prisma.user.count({
        where: { createdAt: { gte: weekStart } },
      }),
      ctx.prisma.user.count({
        where: { createdAt: { gte: monthStart } },
      }),
    ]);

    // Active users (based on events)
    const [dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers] = await Promise.all([
      ctx.prisma.event.findMany({
        where: { timestamp: { gte: todayStart } },
        distinct: ["userId"],
        select: { userId: true },
      }).then((events: { userId: string | null }[]) => events.filter((e) => e.userId).length),
      ctx.prisma.event.findMany({
        where: { timestamp: { gte: weekStart } },
        distinct: ["userId"],
        select: { userId: true },
      }).then((events: { userId: string | null }[]) => events.filter((e) => e.userId).length),
      ctx.prisma.event.findMany({
        where: { timestamp: { gte: monthStart } },
        distinct: ["userId"],
        select: { userId: true },
      }).then((events: { userId: string | null }[]) => events.filter((e) => e.userId).length),
    ]);

    // Conversion metrics
    const [
      totalProfiles,
      completedProfiles,
      studentsWithApplications,
      studentsWithPlacements,
    ] = await Promise.all([
      ctx.prisma.profile.count(),
      ctx.prisma.profile.count({
        where: { isComplete: true },
      }),
      ctx.prisma.application.findMany({
        distinct: ["userId"],
      }).then((apps: unknown[]) => apps.length),
      ctx.prisma.placement.findMany({
        distinct: ["userId"],
      }).then((placements: unknown[]) => placements.length),
    ]);

    const totalStudents = usersByType.find((u: { userType: string; _count: number }) => u.userType === "STUDENT")?._count || 1;

    // Viral metrics
    const [invitesSent, inviteConversions, shareEvents] = await Promise.all([
      ctx.prisma.invite.count(),
      ctx.prisma.invite.count({
        where: { status: "ACCEPTED" },
      }),
      ctx.prisma.event.count({
        where: {
          eventType: { in: ["PLACEMENT_SHARED", "CELEBRATION_SHARED", "OPPORTUNITY_SHARE"] },
        },
      }),
    ]);

    // Placement metrics
    const [totalPlacements, verifiedPlacements30, verifiedPlacements90, avgPackage] = await Promise.all([
      ctx.prisma.placement.count(),
      ctx.prisma.placement.count({
        where: { verification30CompletedAt: { not: null } },
      }),
      ctx.prisma.placement.count({
        where: { verification90CompletedAt: { not: null } },
      }),
      ctx.prisma.placement.aggregate({
        _avg: { packageLPA: true },
      }),
    ]);

    // Event volume
    const [eventsToday, eventsThisWeek] = await Promise.all([
      ctx.prisma.event.count({
        where: { timestamp: { gte: todayStart } },
      }),
      ctx.prisma.event.count({
        where: { timestamp: { gte: weekStart } },
      }),
    ]);

    // Calculate K-factor (viral coefficient)
    // K = invites per user * conversion rate
    const invitesPerUser = totalUsers > 0 ? invitesSent / totalUsers : 0;
    const inviteConversionRate = invitesSent > 0 ? inviteConversions / invitesSent : 0;
    const kFactor = invitesPerUser * inviteConversionRate;

    await logEvent(EventTypes.ADMIN_METRICS_VIEWED, {
      userId: ctx.session.user.id,
      userType: ctx.session.user.userType,
      metadata: { dashboard: "acquisition" },
    });

    return {
      totalUsers,
      usersByType: usersByType.map((u: { userType: string; _count: number }) => ({
        type: u.userType,
        count: u._count,
      })),
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,

      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,

      profileCompletionRate: totalProfiles > 0 ? completedProfiles / totalProfiles : 0,
      applicationRate: totalStudents > 0 ? studentsWithApplications / totalStudents : 0,
      placementRate: totalStudents > 0 ? studentsWithPlacements / totalStudents : 0,

      invitesSent,
      inviteConversionRate,
      shareCount: shareEvents,
      kFactor,

      totalPlacements,
      verifiedPlacements30,
      verifiedPlacements90,
      averagePackageLPA: avgPackage._avg.packageLPA || 0,

      eventsToday,
      eventsThisWeek,
    };
  }),

  /**
   * Get detailed event analytics
   */
  getEventAnalytics: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      groupBy: z.enum(["hour", "day", "week"]).default("day"),
    }))
    .query(async ({ ctx, input }) => {
      const endDate = input.endDate || new Date();
      const startDate = input.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get events by type
      const eventsByType = await ctx.prisma.event.groupBy({
        by: ["eventType"],
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
        orderBy: { _count: { eventType: "desc" } },
        take: 20,
      });

      // Get events by category
      const eventsByCategory = await ctx.prisma.event.groupBy({
        by: ["eventCategory"],
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      });

      // Get top sources
      const eventsBySource = await ctx.prisma.event.groupBy({
        by: ["source"],
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          source: { not: null },
        },
        _count: true,
        orderBy: { _count: { source: "desc" } },
      });

      return {
        eventsByType: eventsByType.map((e: { eventType: string; _count: number }) => ({
          type: e.eventType,
          count: e._count,
        })),
        eventsByCategory: eventsByCategory.map((e: { eventCategory: string | null; _count: number }) => ({
          category: e.eventCategory,
          count: e._count,
        })),
        eventsBySource: eventsBySource.map((e: { source: string | null; _count: number }) => ({
          source: e.source,
          count: e._count,
        })),
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };
    }),

  // ==========================================================================
  // EVENT VIEWER (Debug/Monitor)
  // ==========================================================================

  /**
   * Stream events in real-time (polling-based for MVP)
   */
  getRecentEvents: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(500).default(100),
      eventType: z.string().optional(),
      userId: z.string().optional(),
      entityType: z.string().optional(),
      sinceId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (input.eventType) {
        where.eventType = input.eventType;
      }
      if (input.userId) {
        where.userId = input.userId;
      }
      if (input.entityType) {
        where.entityType = input.entityType;
      }
      if (input.sinceId) {
        where.id = { gt: input.sinceId };
      }

      const events = await ctx.prisma.event.findMany({
        where,
        take: input.limit,
        orderBy: { timestamp: "desc" },
        select: {
          id: true,
          eventType: true,
          eventCategory: true,
          userId: true,
          entityType: true,
          entityId: true,
          source: true,
          metadata: true,
          timestamp: true,
        },
      });

      return {
        events,
        hasMore: events.length === input.limit,
        latestId: events[0]?.id,
      };
    }),

  /**
   * Get event details
   */
  getEventDetails: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      return event;
    }),

  /**
   * Get event type counts
   */
  getEventTypeCounts: adminProcedure.query(async ({ ctx }) => {
    const counts = await ctx.prisma.event.groupBy({
      by: ["eventType"],
      _count: true,
      orderBy: { _count: { eventType: "desc" } },
    });

    return counts.map((c: { eventType: string; _count: number }) => ({
      eventType: c.eventType,
      count: c._count,
    }));
  }),

  // ==========================================================================
  // PLACEMENT MANAGEMENT
  // ==========================================================================

  /**
   * List placements for verification
   */
  listPlacements: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(["pending_30", "pending_90", "verified", "all"]).default("pending_30"),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (input.status === "pending_30") {
        where.verification30CompletedAt = null;
      } else if (input.status === "pending_90") {
        where.verification30CompletedAt = { not: null };
        where.verification90CompletedAt = null;
      } else if (input.status === "verified") {
        where.verification90CompletedAt = { not: null };
      }

      const [placements, total] = await Promise.all([
        ctx.prisma.placement.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        ctx.prisma.placement.count({ where }),
      ]);

      return {
        placements,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Verify placement at 30 days
   */
  verifyPlacement30: adminProcedure
    .input(z.object({
      placementId: z.string(),
      verified: z.boolean(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: {
          verification30CompletedAt: new Date(),
          verification30Status: input.verified ? "VERIFIED" : "FAILED",
          verification30Notes: input.notes,
          verification30By: ctx.session.user.id,
        },
      });

      await logEvent(EventTypes.ADMIN_PLACEMENT_VERIFIED_30, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        metadata: { verified: input.verified, notes: input.notes },
      });

      return { success: true, placement };
    }),

  /**
   * Verify placement at 90 days
   */
  verifyPlacement90: adminProcedure
    .input(z.object({
      placementId: z.string(),
      verified: z.boolean(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: {
          verification90CompletedAt: new Date(),
          verification90Status: input.verified ? "VERIFIED" : "FAILED",
          verification90Notes: input.notes,
          verification90By: ctx.session.user.id,
        },
      });

      await logEvent(EventTypes.ADMIN_PLACEMENT_VERIFIED_90, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        metadata: { verified: input.verified, notes: input.notes },
      });

      return { success: true, placement };
    }),

  // ==========================================================================
  // SYSTEM HEALTH
  // ==========================================================================

  /**
   * Get system health status
   */
  getSystemHealth: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Check database
    let dbStatus = "healthy";
    try {
      await ctx.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "unhealthy";
    }

    // Recent events (data pipeline health)
    const recentEventCount = await ctx.prisma.event.count({
      where: { timestamp: { gte: fiveMinutesAgo } },
    });

    // Queue health (if using queue)
    const pendingNotifications = await ctx.prisma.notification.count({
      where: { isSent: false },
    });

    return {
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      database: dbStatus,
      eventsLast5Min: recentEventCount,
      pendingNotifications,
      timestamp: now,
    };
  }),
});
