/**
 * Invites Router
 * Company invitations to candidates
 *
 * Invites are a key monetization lever - companies pay for invites
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  companyProcedure,
  studentProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";

// ============================================================================
// SCHEMAS
// ============================================================================

const sendInviteSchema = z.object({
  userId: z.string(),
  opportunityId: z.string(),
  message: z.string().max(2000).optional(),
  expiresInDays: z.number().min(1).max(30).default(7),
});

const respondToInviteSchema = z.object({
  inviteId: z.string(),
  response: z.enum(["accept", "decline"]),
  declineReason: z.string().max(500).optional(),
});

// ============================================================================
// ROUTER
// ============================================================================

export const invitesRouter = createTRPCRouter({
  /**
   * Send an invite to a candidate (company only)
   * Consumes from company's invite quota
   */
  send: companyProcedure
    .input(sendInviteSchema)
    .mutation(async ({ ctx, input }) => {
      // Get company profile
      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: {
          id: true,
          companyName: true,
          invitesRemaining: true,
        },
      });

      if (!companyProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company profile not found",
        });
      }

      // Check invite quota
      if (companyProfile.invitesRemaining <= 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No invites remaining. Please upgrade your plan.",
        });
      }

      // Verify opportunity belongs to company
      const opportunity = await ctx.prisma.opportunity.findUnique({
        where: { id: input.opportunityId },
        select: {
          id: true,
          companyId: true,
          title: true,
          status: true,
        },
      });

      if (!opportunity || opportunity.companyId !== companyProfile.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity not found",
        });
      }

      if (opportunity.status !== "PUBLISHED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Opportunity must be published to send invites",
        });
      }

      // Check if already invited
      const existingInvite = await ctx.prisma.invite.findUnique({
        where: {
          companyId_userId_opportunityId: {
            companyId: companyProfile.id,
            userId: input.userId,
            opportunityId: input.opportunityId,
          },
        },
      });

      if (existingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Candidate has already been invited to this opportunity",
        });
      }

      // Check if user already applied
      const existingApplication = await ctx.prisma.application.findUnique({
        where: {
          userId_opportunityId: {
            userId: input.userId,
            opportunityId: input.opportunityId,
          },
        },
      });

      if (existingApplication) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Candidate has already applied to this opportunity",
        });
      }

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      // Create invite
      const invite = await ctx.prisma.invite.create({
        data: {
          companyId: companyProfile.id,
          userId: input.userId,
          opportunityId: input.opportunityId,
          message: input.message,
          status: "PENDING",
          expiresAt,
        },
      });

      // Decrement company's invite quota
      await ctx.prisma.companyProfile.update({
        where: { id: companyProfile.id },
        data: {
          invitesRemaining: { decrement: 1 },
          invitesUsedTotal: { increment: 1 },
        },
      });

      // Increment opportunity invite count
      await ctx.prisma.opportunity.update({
        where: { id: input.opportunityId },
        data: { inviteCount: { increment: 1 } },
      });

      // Create notification for user
      await ctx.prisma.notification.create({
        data: {
          userId: input.userId,
          type: "INVITE",
          title: `Interview Invite from ${companyProfile.companyName}`,
          body: `You've been invited to apply for ${opportunity.title}`,
          actionUrl: `/invites/${invite.id}`,
          channels: ["IN_APP", "EMAIL"],
          metadata: {
            inviteId: invite.id,
            companyName: companyProfile.companyName,
            jobTitle: opportunity.title,
          },
        },
      });

      // Log invite sent event
      await logEvent(EventTypes.INVITE_SENT, {
        userId: input.userId,
        userType: "STUDENT",
        entityType: "invite",
        entityId: invite.id,
        metadata: {
          companyId: companyProfile.id,
          opportunityId: input.opportunityId,
          sentBy: ctx.session.user.id,
          expiresAt: expiresAt.toISOString(),
        },
      });

      return {
        success: true,
        invite,
        invitesRemaining: companyProfile.invitesRemaining - 1,
      };
    }),

  /**
   * Get sent invites (company)
   */
  getSent: companyProcedure
    .input(
      z.object({
        opportunityId: z.string().optional(),
        status: z.enum(["PENDING", "VIEWED", "ACCEPTED", "DECLINED", "EXPIRED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!companyProfile) {
        return [];
      }

      const invites = await ctx.prisma.invite.findMany({
        where: {
          companyId: companyProfile.id,
          ...(input?.opportunityId ? { opportunityId: input.opportunityId } : {}),
          ...(input?.status ? { status: input.status } : {}),
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
                  layersRankOverall: true,
                },
              },
            },
          },
          opportunity: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return invites;
    }),

  /**
   * Get received invites (student)
   */
  getReceived: studentProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "VIEWED", "ACCEPTED", "DECLINED", "EXPIRED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const invites = await ctx.prisma.invite.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          company: {
            select: {
              companyName: true,
              logoUrl: true,
              industry: true,
              isVerified: true,
            },
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              type: true,
              locations: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Check for expired invites
      const now = new Date();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeInvites = invites.map((invite: any) => ({
        ...invite,
        isExpired: invite.expiresAt < now && invite.status === "PENDING",
      }));

      return activeInvites;
    }),

  /**
   * Get single invite
   */
  getById: studentProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.prisma.invite.findUnique({
        where: { id: input.id },
        include: {
          company: {
            select: {
              companyName: true,
              logoUrl: true,
              industry: true,
              isVerified: true,
              website: true,
              description: true,
            },
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              locations: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
              requiredSkills: true,
              preferredSkills: true,
            },
          },
        },
      });

      if (!invite || invite.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      // Mark as viewed if first time
      if (invite.status === "PENDING" && !invite.viewedAt) {
        await ctx.prisma.invite.update({
          where: { id: input.id },
          data: {
            status: "VIEWED",
            viewedAt: new Date(),
          },
        });

        // Log invite viewed event
        await logEvent(EventTypes.INVITE_VIEWED, {
          userId: ctx.session.user.id,
          userType: ctx.session.user.userType,
          entityType: "invite",
          entityId: input.id,
          metadata: {
            companyId: invite.companyId,
            opportunityId: invite.opportunityId,
          },
        });
      }

      return {
        ...invite,
        isExpired: invite.expiresAt < new Date() && invite.status !== "ACCEPTED",
      };
    }),

  /**
   * Respond to an invite
   */
  respond: studentProcedure
    .input(respondToInviteSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const invite = await ctx.prisma.invite.findUnique({
        where: { id: input.inviteId },
        select: {
          id: true,
          userId: true,
          companyId: true,
          opportunityId: true,
          status: true,
          expiresAt: true,
        },
      });

      if (!invite || invite.userId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      if (invite.status === "ACCEPTED" || invite.status === "DECLINED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite has already been responded to",
        });
      }

      if (invite.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite has expired",
        });
      }

      const newStatus = input.response === "accept" ? "ACCEPTED" : "DECLINED";

      // Update invite
      await ctx.prisma.invite.update({
        where: { id: input.inviteId },
        data: {
          status: newStatus,
          respondedAt: new Date(),
        },
      });

      // If accepted, create application
      if (input.response === "accept") {
        // Get profile for score snapshot
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

        await ctx.prisma.application.create({
          data: {
            userId,
            opportunityId: invite.opportunityId,
            status: "DRAFT",
            source: "invite",
            resumeUrl: profile?.resumeUrl,
            statusHistory: [
              {
                status: "DRAFT",
                timestamp: new Date().toISOString(),
                fromInvite: true,
                inviteId: invite.id,
                scoreSnapshot: {
                  overall: profile?.layersRankOverall,
                  technical: profile?.layersRankTechnical,
                  behavioral: profile?.layersRankBehavioral,
                  contextual: profile?.layersRankContextual,
                },
              },
            ],
          },
        });

        // Log invite accepted event
        await logEvent(EventTypes.INVITE_ACCEPTED, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "invite",
          entityId: input.inviteId,
          metadata: {
            companyId: invite.companyId,
            opportunityId: invite.opportunityId,
          },
        });

        return {
          success: true,
          message: "Invite accepted! You can now complete your application.",
          nextStep: "apply",
          opportunityId: invite.opportunityId,
        };
      } else {
        // Log invite declined event
        await logEvent(EventTypes.INVITE_DECLINED, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "invite",
          entityId: input.inviteId,
          metadata: {
            companyId: invite.companyId,
            opportunityId: invite.opportunityId,
            reason: input.declineReason,
          },
        });

        return {
          success: true,
          message: "Invite declined.",
        };
      }
    }),

  /**
   * Get invite stats for company
   */
  getStats: companyProcedure.query(async ({ ctx }) => {
    const companyProfile = await ctx.prisma.companyProfile.findUnique({
      where: { userId: ctx.session.user.id },
      select: {
        invitesRemaining: true,
        invitesUsedTotal: true,
      },
    });

    if (!companyProfile) {
      return null;
    }

    const [pending, viewed, accepted, declined, expired] = await Promise.all([
      ctx.prisma.invite.count({
        where: { company: { userId: ctx.session.user.id }, status: "PENDING" },
      }),
      ctx.prisma.invite.count({
        where: { company: { userId: ctx.session.user.id }, status: "VIEWED" },
      }),
      ctx.prisma.invite.count({
        where: { company: { userId: ctx.session.user.id }, status: "ACCEPTED" },
      }),
      ctx.prisma.invite.count({
        where: { company: { userId: ctx.session.user.id }, status: "DECLINED" },
      }),
      ctx.prisma.invite.count({
        where: { company: { userId: ctx.session.user.id }, status: "EXPIRED" },
      }),
    ]);

    const total = pending + viewed + accepted + declined + expired;

    return {
      remaining: companyProfile.invitesRemaining,
      usedTotal: companyProfile.invitesUsedTotal,
      byStatus: {
        pending,
        viewed,
        accepted,
        declined,
        expired,
      },
      acceptanceRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : "0",
      viewRate: total > 0 ? (((viewed + accepted + declined) / total) * 100).toFixed(1) : "0",
    };
  }),

  /**
   * Expire old invites (called by scheduler)
   */
  expireOldInvites: companyProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.prisma.invite.updateMany({
      where: {
        status: { in: ["PENDING", "VIEWED"] },
        expiresAt: { lt: new Date() },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return { expiredCount: result.count };
  }),
});
