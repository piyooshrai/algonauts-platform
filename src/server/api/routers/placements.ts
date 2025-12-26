/**
 * Placements Router
 * THE MOST VALUABLE FEATURE FOR ACQUISITION
 *
 * 90-day verified placements = ground truth for ML training
 * This data is what makes us worth $200M+
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  studentProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";

// ============================================================================
// SCHEMAS
// ============================================================================

const createPlacementSchema = z.object({
  applicationId: z.string().optional(),
  companyName: z.string().min(1).max(200),
  jobTitle: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.coerce.date(),
  salaryOffered: z.number().min(0).optional(),
  offerLetterUrl: z.string().url().optional(),
});

const verifyPlacementSchema = z.object({
  placementId: z.string(),
  stillEmployed: z.boolean(),
  notes: z.string().max(1000).optional(),
  joiningLetterUrl: z.string().url().optional(),
});

const confirmPlacementSchema = z.object({
  placementId: z.string(),
  method: z.enum(["SELF_REPORTED", "EMAIL_VERIFIED", "EMPLOYER_CONFIRMED", "COLLEGE_CONFIRMED", "DOCUMENT_VERIFIED"]),
  notes: z.string().max(1000).optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate days since placement started
 */
function daysSinceStart(startDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if 30-day verification is due
 */
function is30DayVerificationDue(startDate: Date, verification30CompletedAt: Date | null): boolean {
  if (verification30CompletedAt) return false;
  const days = daysSinceStart(startDate);
  return days >= 28 && days <= 45; // Window: day 28-45
}

/**
 * Check if 90-day verification is due
 */
function is90DayVerificationDue(
  startDate: Date,
  verification30CompletedAt: Date | null,
  verification90CompletedAt: Date | null
): boolean {
  if (!verification30CompletedAt) return false; // Must complete 30-day first
  if (verification90CompletedAt) return false;
  const days = daysSinceStart(startDate);
  return days >= 85 && days <= 120; // Window: day 85-120
}

/**
 * Generate shareable placement card data
 */
function generatePlacementCardData(placement: {
  id: string;
  companyName: string;
  jobTitle: string;
  location?: string | null;
  startDate: Date;
  salaryOffered?: number | null;
  user: {
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
      collegeName?: string | null;
    } | null;
  };
}) {
  return {
    placementId: placement.id,
    studentName: `${placement.user.profile?.firstName || ""} ${placement.user.profile?.lastName || ""}`.trim() || "Algonaut",
    avatarUrl: placement.user.profile?.avatarUrl,
    collegeName: placement.user.profile?.collegeName,
    companyName: placement.companyName,
    jobTitle: placement.jobTitle,
    location: placement.location,
    startDate: placement.startDate,
    salaryLPA: placement.salaryOffered ? Math.round(placement.salaryOffered / 100000) : null,
    shareableUrl: `https://algonauts.in/placement/${placement.id}`,
    generatedAt: new Date(),
  };
}

// ============================================================================
// ROUTER
// ============================================================================

export const placementsRouter = createTRPCRouter({
  /**
   * Report a new placement (student self-reports)
   */
  create: studentProcedure
    .input(createPlacementSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if application exists and belongs to user
      if (input.applicationId) {
        const application = await ctx.prisma.application.findUnique({
          where: { id: input.applicationId },
          select: { userId: true, status: true },
        });

        if (!application || application.userId !== userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found",
          });
        }
      }

      // Create placement
      const placement = await ctx.prisma.placement.create({
        data: {
          userId,
          applicationId: input.applicationId,
          companyName: input.companyName,
          jobTitle: input.jobTitle,
          location: input.location,
          startDate: input.startDate,
          salaryOffered: input.salaryOffered,
          offerLetterUrl: input.offerLetterUrl,
          status: "PENDING_CONFIRMATION",
          verificationType: "SELF_REPORTED",
        },
      });

      // Update application status if linked
      if (input.applicationId) {
        await ctx.prisma.application.update({
          where: { id: input.applicationId },
          data: { status: "OFFER_ACCEPTED" },
        });
      }

      // Log placement confirmation event (+50 points)
      await logEvent(EventTypes.PLACEMENT_CONFIRMED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: placement.id,
        metadata: {
          companyName: input.companyName,
          jobTitle: input.jobTitle,
          hasApplication: !!input.applicationId,
          hasOfferLetter: !!input.offerLetterUrl,
        },
      });

      return {
        success: true,
        placement,
        message: "Congratulations! Your placement has been recorded.",
      };
    }),

  /**
   * Get user's placements
   */
  getMyPlacements: studentProcedure.query(async ({ ctx }) => {
    const placements = await ctx.prisma.placement.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        application: {
          select: {
            id: true,
            opportunity: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    companyName: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Add verification status info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return placements.map((p: any) => ({
      ...p,
      daysSinceStart: daysSinceStart(p.startDate),
      is30DayDue: is30DayVerificationDue(p.startDate, p.verification30CompletedAt),
      is90DayDue: is90DayVerificationDue(p.startDate, p.verification30CompletedAt, p.verification90CompletedAt),
    }));
  }),

  /**
   * Get placement by ID (public for sharing)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  collegeName: true,
                },
              },
            },
          },
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      return placement;
    }),

  /**
   * Confirm placement (by company or college)
   */
  confirm: protectedProcedure
    .input(confirmPlacementSchema)
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.findUnique({
        where: { id: input.placementId },
        select: { userId: true, status: true },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      // Update placement
      await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: {
          status: "CONFIRMED",
          verificationType: input.method,
        },
      });

      // Log confirmation event
      await logEvent(EventTypes.PLACEMENT_CONFIRMED, {
        userId: placement.userId,
        entityType: "placement",
        entityId: input.placementId,
        metadata: {
          confirmedBy: ctx.session.user.id,
          confirmedByType: ctx.session.user.userType,
          method: input.method,
        },
      });

      return { success: true };
    }),

  /**
   * Request 30-day verification
   * Called by system scheduler or manually
   */
  request30DayVerification: studentProcedure
    .input(z.object({ placementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.findUnique({
        where: { id: input.placementId, userId: ctx.session.user.id },
        select: {
          id: true,
          startDate: true,
          status: true,
          verification30CompletedAt: true,
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      if (placement.verification30CompletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "30-day verification already completed",
        });
      }

      const days = daysSinceStart(placement.startDate);
      if (days < 25) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `30-day verification available in ${25 - days} days`,
        });
      }

      // Update placement
      await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: {
          status: "VERIFICATION_30_PENDING",
          verification30RequestedAt: new Date(),
        },
      });

      // Log event
      await logEvent(EventTypes.VERIFICATION_30_REQUESTED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        metadata: { daysSinceStart: days },
      });

      return { success: true };
    }),

  /**
   * Complete 30-day verification
   * THE CRITICAL VERIFICATION (+75 points)
   */
  complete30DayVerification: studentProcedure
    .input(verifyPlacementSchema)
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.findUnique({
        where: { id: input.placementId, userId: ctx.session.user.id },
        select: {
          id: true,
          userId: true,
          startDate: true,
          status: true,
          verification30CompletedAt: true,
          attributedToCollegeId: true,
          attributedToReferrerId: true,
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      if (placement.verification30CompletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "30-day verification already completed",
        });
      }

      // Calculate reward points
      const rewardPoints = 75; // Base reward for 30-day verification

      // Update placement
      await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: {
          status: input.stillEmployed ? "VERIFICATION_30_COMPLETE" : "FAILED",
          verification30CompletedAt: new Date(),
          verification30Method: "SELF_REPORTED",
          verification30Notes: input.notes,
          joiningLetterUrl: input.joiningLetterUrl,
          rewardPointsAwarded: { increment: rewardPoints },
        },
      });

      // Award XP to user
      await ctx.prisma.profile.update({
        where: { userId: ctx.session.user.id },
        data: {
          totalXp: { increment: rewardPoints },
        },
      });

      // Log the CRITICAL verification event
      await logEvent(EventTypes.VERIFICATION_30_COMPLETE, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        metadata: {
          stillEmployed: input.stillEmployed, // THE KEY DATA POINT
          daysSinceStart: daysSinceStart(placement.startDate),
          hasJoiningLetter: !!input.joiningLetterUrl,
          rewardPoints,
        },
      });

      // If failed (not still employed), log placement failed event
      if (!input.stillEmployed) {
        await logEvent(EventTypes.PLACEMENT_FAILED, {
          userId: ctx.session.user.id,
          userType: ctx.session.user.userType,
          entityType: "placement",
          entityId: input.placementId,
          metadata: {
            failedAt: "30_day",
            notes: input.notes,
          },
        });
      }

      return {
        success: true,
        stillEmployed: input.stillEmployed,
        rewardPoints,
        message: input.stillEmployed
          ? "Great! 30-day verification complete. We'll check in again at 90 days."
          : "We're sorry to hear that. Your feedback helps us improve.",
      };
    }),

  /**
   * Request 90-day verification
   */
  request90DayVerification: studentProcedure
    .input(z.object({ placementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.findUnique({
        where: { id: input.placementId, userId: ctx.session.user.id },
        select: {
          id: true,
          startDate: true,
          status: true,
          verification30CompletedAt: true,
          verification90CompletedAt: true,
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      if (!placement.verification30CompletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "30-day verification must be completed first",
        });
      }

      if (placement.verification90CompletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "90-day verification already completed",
        });
      }

      const days = daysSinceStart(placement.startDate);
      if (days < 85) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `90-day verification available in ${85 - days} days`,
        });
      }

      // Update placement
      await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: {
          status: "VERIFICATION_90_PENDING",
          verification90RequestedAt: new Date(),
        },
      });

      // Log event
      await logEvent(EventTypes.VERIFICATION_90_REQUESTED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        metadata: { daysSinceStart: days },
      });

      return { success: true };
    }),

  /**
   * Complete 90-day verification
   * THE MOST VALUABLE EVENT (+100 points)
   * This is the ground truth for our ML models
   */
  complete90DayVerification: studentProcedure
    .input(verifyPlacementSchema)
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.findUnique({
        where: { id: input.placementId, userId: ctx.session.user.id },
        select: {
          id: true,
          userId: true,
          startDate: true,
          status: true,
          verification30CompletedAt: true,
          verification90CompletedAt: true,
          attributedToCollegeId: true,
          attributedToReferrerId: true,
          application: {
            select: {
              id: true,
              opportunityId: true,
              source: true,
              recommendationId: true,
            },
          },
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      if (!placement.verification30CompletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "30-day verification must be completed first",
        });
      }

      if (placement.verification90CompletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "90-day verification already completed",
        });
      }

      // Calculate reward points - THIS IS THE BIG ONE
      const rewardPoints = 100; // Base reward for 90-day verification (THE MOST VALUABLE)

      // Update placement with THE CRITICAL isRetainedAt90Days field
      await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: {
          status: input.stillEmployed ? "VERIFICATION_90_COMPLETE" : "FAILED",
          verification90CompletedAt: new Date(),
          verification90Method: "SELF_REPORTED",
          verification90Notes: input.notes,
          isRetainedAt90Days: input.stillEmployed, // THE GOLD - this is what we're training on
          rewardPointsAwarded: { increment: rewardPoints },
        },
      });

      // Award XP to user
      await ctx.prisma.profile.update({
        where: { userId: ctx.session.user.id },
        data: {
          totalXp: { increment: rewardPoints },
        },
      });

      // Create feature snapshot for ML training
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.session.user.id },
        select: {
          layersRankOverall: true,
          layersRankTechnical: true,
          layersRankBehavioral: true,
          layersRankContextual: true,
          skills: true,
          graduationYear: true,
          collegeName: true,
          cgpa: true,
        },
      });

      // Save feature snapshot for ML training
      await ctx.prisma.featureSnapshot.create({
        data: {
          userId: ctx.session.user.id,
          features: {
            ...profile,
            applicationSource: placement.application?.source,
            wasRecommended: !!placement.application?.recommendationId,
          },
          wasPlaced: true,
          wasRetained90Days: input.stillEmployed, // THE TRAINING LABEL
        },
      });

      // Update recommendation outcome if applicable
      if (placement.application?.recommendationId) {
        await ctx.prisma.recommendation.updateMany({
          where: {
            userId: ctx.session.user.id,
            opportunityId: placement.application.opportunityId,
          },
          data: {
            wasHired: true,
          },
        });
      }

      // Log the MOST VALUABLE event
      await logEvent(EventTypes.VERIFICATION_90_COMPLETE, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        metadata: {
          stillEmployed: input.stillEmployed, // THE MOST VALUABLE DATA POINT
          isRetainedAt90Days: input.stillEmployed, // Duplicate for clarity
          daysSinceStart: daysSinceStart(placement.startDate),
          wasFromRecommendation: !!placement.application?.recommendationId,
          applicationSource: placement.application?.source,
          rewardPoints,
        },
      });

      // If failed, log placement failed event
      if (!input.stillEmployed) {
        await logEvent(EventTypes.PLACEMENT_FAILED, {
          userId: ctx.session.user.id,
          userType: ctx.session.user.userType,
          entityType: "placement",
          entityId: input.placementId,
          metadata: {
            failedAt: "90_day",
            notes: input.notes,
          },
        });
      }

      return {
        success: true,
        stillEmployed: input.stillEmployed,
        isRetainedAt90Days: input.stillEmployed,
        rewardPoints,
        message: input.stillEmployed
          ? "Congratulations on completing 90 days! Your verified placement helps the community."
          : "Thank you for your honesty. Your feedback helps improve our predictions.",
      };
    }),

  /**
   * Generate shareable placement card
   */
  generatePlacementCard: studentProcedure
    .input(z.object({ placementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const placement = await ctx.prisma.placement.findUnique({
        where: { id: input.placementId, userId: ctx.session.user.id },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  collegeName: true,
                },
              },
            },
          },
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      const cardData = generatePlacementCardData(placement);

      // Log card generation event
      await logEvent(EventTypes.PLACEMENT_CARD_GENERATED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
      });

      return cardData;
    }),

  /**
   * Track placement card share
   */
  trackShare: studentProcedure
    .input(
      z.object({
        placementId: z.string(),
        platform: z.enum(["whatsapp", "linkedin", "twitter", "instagram", "copy"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Log share event - THIS CREATES VIRAL LOOPS
      await logEvent(EventTypes.PLACEMENT_SHARED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: input.platform as any,
        metadata: {
          platform: input.platform,
        },
      });

      // Award XP for sharing
      await ctx.prisma.profile.update({
        where: { userId: ctx.session.user.id },
        data: {
          totalXp: { increment: 15 },
        },
      });

      return { success: true, xpAwarded: 15 };
    }),

  /**
   * Get placements pending verification (for reminders)
   */
  getPendingVerifications: studentProcedure.query(async ({ ctx }) => {
    const placements = await ctx.prisma.placement.findMany({
      where: {
        userId: ctx.session.user.id,
        OR: [
          {
            verification30CompletedAt: null,
            status: { in: ["CONFIRMED", "VERIFICATION_30_PENDING"] },
          },
          {
            verification30CompletedAt: { not: null },
            verification90CompletedAt: null,
            status: { in: ["VERIFICATION_30_COMPLETE", "VERIFICATION_90_PENDING"] },
          },
        ],
      },
      orderBy: { startDate: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return placements.map((p: any) => {
      const days = daysSinceStart(p.startDate);
      const is30Due = is30DayVerificationDue(p.startDate, p.verification30CompletedAt);
      const is90Due = is90DayVerificationDue(p.startDate, p.verification30CompletedAt, p.verification90CompletedAt);

      return {
        ...p,
        daysSinceStart: days,
        verificationType: is90Due ? "90_day" : is30Due ? "30_day" : null,
        urgency: is30Due || is90Due ? "high" : days >= 20 ? "medium" : "low",
      };
    });
  }),

  /**
   * Get verification stats (for analytics)
   */
  getVerificationStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, verified30, verified90, retained90] = await Promise.all([
      ctx.prisma.placement.count(),
      ctx.prisma.placement.count({
        where: { verification30CompletedAt: { not: null } },
      }),
      ctx.prisma.placement.count({
        where: { verification90CompletedAt: { not: null } },
      }),
      ctx.prisma.placement.count({
        where: { isRetainedAt90Days: true },
      }),
    ]);

    return {
      total,
      verified30,
      verified90,
      retained90,
      verification30Rate: total > 0 ? (verified30 / total) * 100 : 0,
      verification90Rate: verified30 > 0 ? (verified90 / verified30) * 100 : 0,
      retention90Rate: verified90 > 0 ? (retained90 / verified90) * 100 : 0,
    };
  }),
});
