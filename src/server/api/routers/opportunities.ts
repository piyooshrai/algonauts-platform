/**
 * Opportunities Router
 * Job listings with scarcity signals to drive engagement
 *
 * Key scarcity signals:
 * - spotsRemaining
 * - applicationsToday
 * - applicationsFromYourCollege
 * - closingIn
 * - demandLevel
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  companyProcedure,
  studentProcedure,
} from "../trpc/trpc";
import { logEvent, queueEvent, EventTypes, EventSource } from "@/lib/events";
import type { EventType } from "@/lib/events";

// ============================================================================
// SCHEMAS
// ============================================================================

const createOpportunitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(50).max(10000),
  requirements: z.string().max(5000).optional(),
  responsibilities: z.string().max(5000).optional(),

  type: z.enum(["FULL_TIME", "INTERNSHIP", "CONTRACT", "PART_TIME"]).default("FULL_TIME"),
  isRemote: z.boolean().default(false),
  locations: z.array(z.string()).default([]),

  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().default("INR"),

  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  minExperience: z.number().min(0).default(0),
  maxExperience: z.number().min(0).optional(),

  // LayersRank filters
  minLayersRank: z.number().min(0).max(100).optional(),
  minTechnicalRank: z.number().min(0).max(100).optional(),
  minBehavioralRank: z.number().min(0).max(100).optional(),

  // Scarcity settings
  maxApplications: z.number().min(1).optional(),
  expiresAt: z.coerce.date().optional(),
});

const searchOpportunitiesSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["FULL_TIME", "INTERNSHIP", "CONTRACT", "PART_TIME"]).optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  salaryMin: z.number().optional(),
  minExperience: z.number().optional(),
  maxExperience: z.number().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSlug(title: string): string {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50)}-${Date.now().toString(36)}`;
}

/**
 * Calculate demand level based on applications and views
 */
function calculateDemandLevel(
  applicationCount: number,
  viewCount: number,
  daysSincePublished: number
): "low" | "medium" | "high" | "very_high" {
  const dailyApplicationRate = daysSincePublished > 0 ? applicationCount / daysSincePublished : applicationCount;
  const conversionRate = viewCount > 0 ? (applicationCount / viewCount) * 100 : 0;

  if (dailyApplicationRate >= 20 || conversionRate >= 15) return "very_high";
  if (dailyApplicationRate >= 10 || conversionRate >= 10) return "high";
  if (dailyApplicationRate >= 5 || conversionRate >= 5) return "medium";
  return "low";
}

/**
 * Calculate closing urgency
 */
function getClosingIn(expiresAt: Date | null, maxApplications: number | null, applicationCount: number): {
  type: "time" | "spots" | null;
  value: number | null;
  urgency: "low" | "medium" | "high" | "critical";
} {
  const now = new Date();

  // Check spots remaining
  if (maxApplications) {
    const spotsRemaining = maxApplications - applicationCount;
    if (spotsRemaining <= 0) {
      return { type: "spots", value: 0, urgency: "critical" };
    }
    if (spotsRemaining <= 3) {
      return { type: "spots", value: spotsRemaining, urgency: "critical" };
    }
    if (spotsRemaining <= 10) {
      return { type: "spots", value: spotsRemaining, urgency: "high" };
    }
  }

  // Check time remaining
  if (expiresAt) {
    const hoursRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursRemaining <= 0) {
      return { type: "time", value: 0, urgency: "critical" };
    }
    if (hoursRemaining <= 24) {
      return { type: "time", value: Math.ceil(hoursRemaining), urgency: "critical" };
    }
    if (hoursRemaining <= 72) {
      return { type: "time", value: Math.ceil(hoursRemaining / 24), urgency: "high" };
    }
    if (hoursRemaining <= 168) {
      return { type: "time", value: Math.ceil(hoursRemaining / 24), urgency: "medium" };
    }
  }

  return { type: null, value: null, urgency: "low" };
}

// ============================================================================
// ROUTER
// ============================================================================

export const opportunitiesRouter = createTRPCRouter({
  /**
   * Create a new opportunity (company only)
   */
  create: companyProcedure
    .input(createOpportunitySchema)
    .mutation(async ({ ctx, input }) => {
      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true, companyName: true },
      });

      if (!companyProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company profile not found",
        });
      }

      const opportunity = await ctx.prisma.opportunity.create({
        data: {
          companyId: companyProfile.id,
          title: input.title,
          slug: generateSlug(input.title),
          description: input.description,
          requirements: input.requirements,
          responsibilities: input.responsibilities,
          type: input.type,
          isRemote: input.isRemote,
          locations: input.locations,
          salaryMin: input.salaryMin,
          salaryMax: input.salaryMax,
          salaryCurrency: input.salaryCurrency,
          requiredSkills: input.requiredSkills,
          preferredSkills: input.preferredSkills,
          minExperience: input.minExperience,
          maxExperience: input.maxExperience,
          minLayersRank: input.minLayersRank,
          minTechnicalRank: input.minTechnicalRank,
          minBehavioralRank: input.minBehavioralRank,
          expiresAt: input.expiresAt,
          status: "DRAFT",
        },
      });

      // Log event
      await logEvent(EventTypes.OPPORTUNITY_CREATE, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "opportunity",
        entityId: opportunity.id,
        metadata: {
          title: input.title,
          type: input.type,
          hasLayersRankFilter: !!(input.minLayersRank || input.minTechnicalRank),
        },
      });

      return { success: true, opportunity };
    }),

  /**
   * Publish an opportunity
   */
  publish: companyProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      const opportunity = await ctx.prisma.opportunity.findUnique({
        where: { id: input.id },
        select: { companyId: true, status: true },
      });

      if (!opportunity || opportunity.companyId !== companyProfile?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity not found",
        });
      }

      await ctx.prisma.opportunity.update({
        where: { id: input.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      // Log event
      await logEvent(EventTypes.OPPORTUNITY_PUBLISH, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "opportunity",
        entityId: input.id,
      });

      return { success: true };
    }),

  /**
   * Search opportunities with scarcity signals
   */
  search: studentProcedure
    .input(searchOpportunitiesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's profile for college matching
      const userProfile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true, collegeName: true, skills: true },
      });

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        status: "PUBLISHED",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      };

      if (input.query) {
        where.OR = [
          { title: { contains: input.query, mode: "insensitive" } },
          { description: { contains: input.query, mode: "insensitive" } },
        ];
      }
      if (input.type) where.type = input.type;
      if (input.isRemote !== undefined) where.isRemote = input.isRemote;
      if (input.location) {
        where.locations = { has: input.location };
      }
      if (input.skills && input.skills.length > 0) {
        where.requiredSkills = { hasSome: input.skills };
      }
      if (input.salaryMin) {
        where.salaryMax = { gte: input.salaryMin };
      }

      // Fetch opportunities
      const opportunities = await ctx.prisma.opportunity.findMany({
        where,
        include: {
          company: {
            select: {
              companyName: true,
              logoUrl: true,
              isVerified: true,
              industry: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { publishedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      // Check for more results
      let nextCursor: string | undefined;
      if (opportunities.length > input.limit) {
        const nextItem = opportunities.pop();
        nextCursor = nextItem?.id;
      }

      // Log search event
      await logEvent(EventTypes.OPPORTUNITY_SEARCH, {
        userId,
        userType: ctx.session.user.userType,
        metadata: {
          query: input.query,
          filters: {
            type: input.type,
            location: input.location,
            isRemote: input.isRemote,
            skills: input.skills,
          },
          resultCount: opportunities.length,
        },
      });

      // Batch fetch scarcity data to avoid N+1 queries
      const opportunityIds = opportunities.map((opp: { id: string }) => opp.id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Single query for today's applications per opportunity
      const applicationsTodayData = await ctx.prisma.application.groupBy({
        by: ["opportunityId"],
        where: {
          opportunityId: { in: opportunityIds },
          submittedAt: { gte: today },
        },
        _count: { id: true },
      });
      const applicationsTodayMap = new Map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applicationsTodayData.map((a: any) => [a.opportunityId, a._count.id])
      );

      // Single query for applications from user's college
      let collegeApplicationsMap = new Map<string, number>();
      if (userProfile?.collegeId) {
        const collegeApplicationsData = await ctx.prisma.application.groupBy({
          by: ["opportunityId"],
          where: {
            opportunityId: { in: opportunityIds },
            user: {
              profile: {
                collegeId: userProfile.collegeId,
              },
            },
          },
          _count: { id: true },
        });
        collegeApplicationsMap = new Map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collegeApplicationsData.map((a: any) => [a.opportunityId, a._count.id])
        );
      }

      // Enrich with scarcity signals (no more N+1 queries)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrichedOpportunities = opportunities.map((opp: any, index: number) => {
        const applicationsToday = applicationsTodayMap.get(opp.id) || 0;
        const applicationsFromYourCollege = collegeApplicationsMap.get(opp.id) || 0;

        // Calculate days since published
        const daysSincePublished = opp.publishedAt
          ? Math.floor((Date.now() - opp.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        // Calculate scarcity signals
        const demandLevel = calculateDemandLevel(
          opp._count.applications,
          opp.viewCount,
          daysSincePublished
        );

        const closingIn = getClosingIn(
          opp.expiresAt,
          null, // maxApplications would go here
          opp._count.applications
        );

        // Log impression event (queued for performance)
        queueEvent("OPPORTUNITY_IMPRESSION" as EventType, {
          userId,
          entityType: "opportunity",
          entityId: opp.id,
          source: "search" as EventSource,
          position: index,
        });

        return {
          id: opp.id,
          title: opp.title,
          slug: opp.slug,
          description: opp.description.slice(0, 300) + (opp.description.length > 300 ? "..." : ""),
          type: opp.type,
          isRemote: opp.isRemote,
          locations: opp.locations,
          salaryMin: opp.salaryMin,
          salaryMax: opp.salaryMax,
          salaryCurrency: opp.salaryCurrency,
          requiredSkills: opp.requiredSkills,
          publishedAt: opp.publishedAt,
          company: opp.company,

          // SCARCITY SIGNALS - these drive engagement
          scarcity: {
            totalApplications: opp._count.applications,
            applicationsToday,
            applicationsFromYourCollege,
            demandLevel,
            closingIn,
            spotsRemaining: closingIn.type === "spots" ? closingIn.value : null,
          },
        };
      });

      return {
        opportunities: enrichedOpportunities,
        nextCursor,
      };
    }),

  /**
   * Get single opportunity with full details
   */
  getById: studentProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const opportunity = await ctx.prisma.opportunity.findUnique({
        where: { id: input.id },
        include: {
          company: {
            select: {
              companyName: true,
              logoUrl: true,
              isVerified: true,
              industry: true,
              website: true,
              description: true,
              companySize: true,
              locations: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      if (!opportunity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity not found",
        });
      }

      // Increment view count
      await ctx.prisma.opportunity.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      // Check if user has already applied
      const existingApplication = await ctx.prisma.application.findUnique({
        where: {
          userId_opportunityId: {
            userId,
            opportunityId: input.id,
          },
        },
        select: { id: true, status: true },
      });

      // Get user's profile for college matching
      const userProfile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true },
      });

      // Get applications from user's college
      let applicationsFromYourCollege = 0;
      if (userProfile?.collegeId) {
        applicationsFromYourCollege = await ctx.prisma.application.count({
          where: {
            opportunityId: input.id,
            user: {
              profile: {
                collegeId: userProfile.collegeId,
              },
            },
          },
        });
      }

      // Get today's applications
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const applicationsToday = await ctx.prisma.application.count({
        where: {
          opportunityId: input.id,
          submittedAt: { gte: today },
        },
      });

      // Calculate scarcity
      const daysSincePublished = opportunity.publishedAt
        ? Math.floor((Date.now() - opportunity.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const demandLevel = calculateDemandLevel(
        opportunity._count.applications,
        opportunity.viewCount,
        daysSincePublished
      );

      const closingIn = getClosingIn(
        opportunity.expiresAt,
        null,
        opportunity._count.applications
      );

      // Log view event
      await logEvent(EventTypes.OPPORTUNITY_VIEW, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "opportunity",
        entityId: input.id,
        metadata: {
          hasApplied: !!existingApplication,
          demandLevel,
        },
      });

      return {
        ...opportunity,
        hasApplied: !!existingApplication,
        applicationStatus: existingApplication?.status,
        scarcity: {
          totalApplications: opportunity._count.applications,
          applicationsToday,
          applicationsFromYourCollege,
          demandLevel,
          closingIn,
        },
      };
    }),

  /**
   * Track opportunity click (for recommendation learning)
   */
  trackClick: studentProcedure
    .input(
      z.object({
        opportunityId: z.string(),
        source: z.enum(["search", "recommendation", "feed", "notification", "direct"]),
        position: z.number().optional(),
        recommendationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Log click event with full context
      await logEvent(EventTypes.OPPORTUNITY_CLICK, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "opportunity",
        entityId: input.opportunityId,
        source: input.source as EventSource,
        position: input.position,
        metadata: {
          recommendationId: input.recommendationId,
        },
      });

      // Update recommendation tracking if applicable
      if (input.recommendationId) {
        await ctx.prisma.recommendation.updateMany({
          where: {
            userId: ctx.session.user.id,
            opportunityId: input.opportunityId,
          },
          data: {
            wasClicked: true,
            clickedAt: new Date(),
          },
        });
      }

      return { success: true };
    }),

  /**
   * Get company's opportunities
   */
  getMyOpportunities: companyProcedure.query(async ({ ctx }) => {
    const companyProfile = await ctx.prisma.companyProfile.findUnique({
      where: { userId: ctx.session.user.id },
      select: { id: true },
    });

    if (!companyProfile) {
      return [];
    }

    const opportunities = await ctx.prisma.opportunity.findMany({
      where: { companyId: companyProfile.id },
      include: {
        _count: {
          select: { applications: true, invites: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return opportunities;
  }),

  /**
   * Close an opportunity
   */
  close: companyProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      const opportunity = await ctx.prisma.opportunity.findUnique({
        where: { id: input.id },
        select: { companyId: true },
      });

      if (!opportunity || opportunity.companyId !== companyProfile?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity not found",
        });
      }

      await ctx.prisma.opportunity.update({
        where: { id: input.id },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
        },
      });

      // Log event
      await logEvent(EventTypes.OPPORTUNITY_CLOSE, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "opportunity",
        entityId: input.id,
      });

      return { success: true };
    }),
});
