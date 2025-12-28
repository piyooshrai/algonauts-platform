/**
 * Applications Router
 * Track applications with recommendation data for ML training
 *
 * Key data points:
 * - wasRecommended
 * - recommendationRank
 * - scoreAtApplication (snapshot of LayersRank at time of apply)
 * - source tracking
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  studentProcedure,
  companyProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes, EventSource } from "@/lib/events";

// ============================================================================
// SCHEMAS
// ============================================================================

const startApplicationSchema = z.object({
  opportunityId: z.string(),
  source: z.enum(["search", "recommendation", "feed", "notification", "direct", "invite"]),
  recommendationId: z.string().optional(),
  recommendationRank: z.number().optional(),
});

const submitApplicationSchema = z.object({
  applicationId: z.string(),
  coverLetter: z.string().max(5000).optional(),
  resumeUrl: z.string().url().optional(),
  answers: z.record(z.string(), z.string()).optional(),
});

const updateStatusSchema = z.object({
  applicationId: z.string(),
  status: z.enum([
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "OFFER_MADE",
    "OFFER_ACCEPTED",
    "OFFER_REJECTED",
    "REJECTED",
  ]),
  note: z.string().max(1000).optional(),
});

// ============================================================================
// ROUTER
// ============================================================================

export const applicationsRouter = createTRPCRouter({
  /**
   * Start an application (creates draft)
   * Captures source and recommendation data for ML
   */
  start: studentProcedure
    .input(startApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if already applied
      const existingApplication = await ctx.prisma.application.findUnique({
        where: {
          userId_opportunityId: {
            userId,
            opportunityId: input.opportunityId,
          },
        },
      });

      if (existingApplication) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already applied to this opportunity",
        });
      }

      // Get opportunity
      const opportunity = await ctx.prisma.opportunity.findUnique({
        where: { id: input.opportunityId },
        select: {
          id: true,
          status: true,
          expiresAt: true,
          minLayersRank: true,
          minTechnicalRank: true,
          minBehavioralRank: true,
        },
      });

      if (!opportunity || opportunity.status !== "PUBLISHED") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity not found or not available",
        });
      }

      if (opportunity.expiresAt && opportunity.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This opportunity has expired",
        });
      }

      // Get user's profile for score snapshot
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: {
          layersRankOverall: true,
          layersRankTechnical: true,
          layersRankBehavioral: true,
          layersRankContextual: true,
          resumeUrl: true,
        },
      });

      // Check LayersRank requirements
      if (opportunity.minLayersRank && (!profile?.layersRankOverall || profile.layersRankOverall < opportunity.minLayersRank)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `This opportunity requires a minimum LayersRank of ${opportunity.minLayersRank}`,
        });
      }

      // Create application with score snapshot
      const application = await ctx.prisma.application.create({
        data: {
          userId,
          opportunityId: input.opportunityId,
          status: "DRAFT",
          source: input.source,
          recommendationId: input.recommendationId,
          resumeUrl: profile?.resumeUrl,
          // Store score snapshot in metadata for ML training
          statusHistory: [
            {
              status: "DRAFT",
              timestamp: new Date().toISOString(),
              scoreSnapshot: {
                overall: profile?.layersRankOverall,
                technical: profile?.layersRankTechnical,
                behavioral: profile?.layersRankBehavioral,
                contextual: profile?.layersRankContextual,
              },
              wasRecommended: !!input.recommendationId,
              recommendationRank: input.recommendationRank,
            },
          ],
        },
      });

      // Update recommendation tracking
      if (input.recommendationId) {
        await ctx.prisma.recommendation.updateMany({
          where: {
            userId,
            opportunityId: input.opportunityId,
          },
          data: {
            wasApplied: true,
            appliedAt: new Date(),
          },
        });
      }

      // Log APPLICATION_START event with full context
      await logEvent(EventTypes.APPLICATION_START, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "application",
        entityId: application.id,
        source: input.source as EventSource,
        metadata: {
          opportunityId: input.opportunityId,
          wasRecommended: !!input.recommendationId,
          recommendationRank: input.recommendationRank,
          scoreAtApplication: {
            overall: profile?.layersRankOverall,
            technical: profile?.layersRankTechnical,
            behavioral: profile?.layersRankBehavioral,
            contextual: profile?.layersRankContextual,
          },
        },
      });

      return {
        success: true,
        applicationId: application.id,
      };
    }),

  /**
   * Submit an application
   */
  submit: studentProcedure
    .input(submitApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
        select: {
          userId: true,
          status: true,
          opportunityId: true,
          source: true,
          recommendationId: true,
          statusHistory: true,
        },
      });

      if (!application || application.userId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (application.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Application has already been submitted",
        });
      }

      // Get current profile for updated score snapshot
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: {
          layersRankOverall: true,
          layersRankTechnical: true,
          layersRankBehavioral: true,
          layersRankContextual: true,
        },
      });

      // Update application
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusHistory = application.statusHistory as any[] || [];
      statusHistory.push({
        status: "SUBMITTED",
        timestamp: new Date().toISOString(),
        scoreSnapshot: {
          overall: profile?.layersRankOverall,
          technical: profile?.layersRankTechnical,
          behavioral: profile?.layersRankBehavioral,
          contextual: profile?.layersRankContextual,
        },
      });

      const updatedApplication = await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          coverLetter: input.coverLetter,
          resumeUrl: input.resumeUrl,
          answers: input.answers,
          statusHistory,
        },
      });

      // Increment opportunity application count
      await ctx.prisma.opportunity.update({
        where: { id: application.opportunityId },
        data: { applicationCount: { increment: 1 } },
      });

      // Award XP for submitting
      await ctx.prisma.profile.update({
        where: { userId },
        data: { totalXp: { increment: 10 } },
      });

      // Log APPLICATION_SUBMIT event with full context
      await logEvent(EventTypes.APPLICATION_SUBMIT, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "application",
        entityId: input.applicationId,
        source: application.source as EventSource,
        metadata: {
          opportunityId: application.opportunityId,
          wasRecommended: !!application.recommendationId,
          hasCoverLetter: !!input.coverLetter,
          hasCustomResume: !!input.resumeUrl,
          scoreAtSubmit: {
            overall: profile?.layersRankOverall,
            technical: profile?.layersRankTechnical,
            behavioral: profile?.layersRankBehavioral,
            contextual: profile?.layersRankContextual,
          },
        },
      });

      return {
        success: true,
        application: updatedApplication,
        xpAwarded: 10,
      };
    }),

  /**
   * Get user's applications
   */
  getMyApplications: studentProcedure
    .input(
      z.object({
        status: z.enum([
          "DRAFT",
          "SUBMITTED",
          "UNDER_REVIEW",
          "SHORTLISTED",
          "INTERVIEW_SCHEDULED",
          "INTERVIEWED",
          "OFFER_MADE",
          "OFFER_ACCEPTED",
          "OFFER_REJECTED",
          "REJECTED",
          "WITHDRAWN",
        ]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const applications = await ctx.prisma.application.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              type: true,
              locations: true,
              company: {
                select: {
                  companyName: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return { applications };
    }),

  /**
   * Get single application
   */
  getById: studentProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.id },
        include: {
          opportunity: {
            include: {
              company: true,
            },
          },
        },
      });

      if (!application || application.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Log view event
      await logEvent(EventTypes.APPLICATION_VIEW, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "application",
        entityId: input.id,
      });

      return application;
    }),

  /**
   * Update application status (company only)
   */
  updateStatus: companyProcedure
    .input(updateStatusSchema)
    .mutation(async ({ ctx, input }) => {
      // Get company profile
      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!companyProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company profile not found",
        });
      }

      // Get application and verify ownership
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
        include: {
          opportunity: {
            select: {
              companyId: true,
            },
          },
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!application || application.opportunity.companyId !== companyProfile.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const previousStatus = application.status;

      // Update status with history
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusHistory = (application.statusHistory as any[]) || [];
      statusHistory.push({
        status: input.status,
        timestamp: new Date().toISOString(),
        note: input.note,
        updatedBy: ctx.session.user.id,
      });

      await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: {
          status: input.status,
          reviewedAt: ["UNDER_REVIEW", "SHORTLISTED", "REJECTED"].includes(input.status)
            ? new Date()
            : undefined,
          statusHistory,
        },
      });

      // Log status change event
      await logEvent(EventTypes.APPLICATION_STATUS_CHANGE, {
        userId: application.user.id,
        entityType: "application",
        entityId: input.applicationId,
        metadata: {
          fromStatus: previousStatus,
          toStatus: input.status,
          updatedBy: ctx.session.user.id,
          note: input.note,
        },
      });

      // If offer made, log that event
      if (input.status === "OFFER_MADE") {
        await logEvent(EventTypes.OFFER_MADE, {
          userId: application.user.id,
          entityType: "application",
          entityId: input.applicationId,
        });
      }

      // If offer accepted, log that event
      if (input.status === "OFFER_ACCEPTED") {
        await logEvent(EventTypes.OFFER_ACCEPTED, {
          userId: application.user.id,
          entityType: "application",
          entityId: input.applicationId,
        });
      }

      // Create notification for user
      await ctx.prisma.notification.create({
        data: {
          userId: application.user.id,
          type: "APPLICATION",
          title: `Application Update`,
          body: `Your application status has been updated to ${input.status.replace(/_/g, " ").toLowerCase()}`,
          actionUrl: `/dashboard/applications/${input.applicationId}`,
          channels: ["IN_APP", "EMAIL"],
        },
      });

      return { success: true };
    }),

  /**
   * Get applications for an opportunity (company only)
   */
  getForOpportunity: companyProcedure
    .input(
      z.object({
        opportunityId: z.string(),
        status: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify company owns this opportunity
      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      const opportunity = await ctx.prisma.opportunity.findUnique({
        where: { id: input.opportunityId },
        select: { companyId: true },
      });

      if (!opportunity || opportunity.companyId !== companyProfile?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity not found",
        });
      }

      const applications = await ctx.prisma.application.findMany({
        where: {
          opportunityId: input.opportunityId,
          status: { not: "DRAFT" }, // Don't show drafts
          ...(input.status ? { status: input.status } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  collegeName: true,
                  graduationYear: true,
                  layersRankOverall: true,
                  layersRankTechnical: true,
                  layersRankBehavioral: true,
                  resumeUrl: true,
                  skills: true,
                },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (applications.length > input.limit) {
        const nextItem = applications.pop();
        nextCursor = nextItem?.id;
      }

      return {
        applications,
        nextCursor,
      };
    }),

  /**
   * Get application stats
   */
  getStats: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [total, submitted, interviews, offers, placements] = await Promise.all([
      ctx.prisma.application.count({ where: { userId } }),
      ctx.prisma.application.count({ where: { userId, status: "SUBMITTED" } }),
      ctx.prisma.application.count({
        where: { userId, status: { in: ["INTERVIEW_SCHEDULED", "INTERVIEWED"] } },
      }),
      ctx.prisma.application.count({
        where: { userId, status: { in: ["OFFER_MADE", "OFFER_ACCEPTED"] } },
      }),
      ctx.prisma.placement.count({ where: { userId } }),
    ]);

    return {
      total,
      submitted,
      interviews,
      offers,
      placements,
      conversionRate: submitted > 0 ? ((offers / submitted) * 100).toFixed(1) : "0",
    };
  }),

  /**
   * Withdraw an application
   * Only allowed for DRAFT, SUBMITTED, or UNDER_REVIEW status
   */
  withdraw: studentProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the application
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
        select: {
          id: true,
          userId: true,
          status: true,
          opportunityId: true,
          opportunity: {
            select: {
              title: true,
              company: {
                select: { companyName: true },
              },
            },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Verify ownership
      if (application.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only withdraw your own applications",
        });
      }

      // Check if status allows withdrawal
      const withdrawableStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"];
      if (!withdrawableStatuses.includes(application.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot withdraw application with status: ${application.status}`,
        });
      }

      // Update status to WITHDRAWN
      await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: {
          status: "WITHDRAWN",
          withdrawnAt: new Date(),
        },
      });

      // Log the event
      await logEvent(EventTypes.APPLICATION_WITHDRAW, {
        userId,
        source: EventSource.DIRECT,
        metadata: {
          applicationId: input.applicationId,
          opportunityId: application.opportunityId,
          opportunityTitle: application.opportunity.title,
          companyName: application.opportunity.company?.companyName,
          previousStatus: application.status,
        },
      });

      return { success: true };
    }),
});
