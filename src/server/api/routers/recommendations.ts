/**
 * Recommendation Engine Router
 *
 * ML-driven recommendations with exploration
 *
 * Features:
 * - Opportunity ranking for students (V1: heuristic scoring)
 * - Candidate ranking for companies
 * - Position and wasRecommended tracking
 * - 10% exploration (random items mixed in)
 * - Complete event logging for feedback loops
 *
 * Every recommendation is logged for training data
 */

import { z } from "zod";
import {
  createTRPCRouter,
  studentProcedure,
  companyProcedure,
  protectedProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";

// ============================================================================
// CONFIGURATION
// ============================================================================

const RECOMMENDATION_CONFIG = {
  EXPLORATION_RATE: 0.1, // 10% random exploration
  MAX_RECOMMENDATIONS: 20,
  MIN_SCORE_THRESHOLD: 0.1,
  DIVERSITY_PENALTY: 0.1, // Penalty for same company/role
  RECENCY_BOOST: 0.2, // Boost for new opportunities
};

// ============================================================================
// SCORING FUNCTIONS (V1: Heuristic)
// ============================================================================

interface ScoringFactors {
  skillMatch: number; // 0-1
  locationMatch: number; // 0-1
  salaryMatch: number; // 0-1
  experienceMatch: number; // 0-1
  companyFit: number; // 0-1 (based on historical placements)
  recency: number; // 0-1 (newer = higher)
  scarcity: number; // 0-1 (fewer spots = higher)
  engagement: number; // 0-1 (user's engagement level)
}

function computeOpportunityScore(factors: ScoringFactors): number {
  // Weighted sum of factors
  const weights = {
    skillMatch: 0.25,
    locationMatch: 0.15,
    salaryMatch: 0.15,
    experienceMatch: 0.15,
    companyFit: 0.1,
    recency: 0.1,
    scarcity: 0.05,
    engagement: 0.05,
  };

  return (
    factors.skillMatch * weights.skillMatch +
    factors.locationMatch * weights.locationMatch +
    factors.salaryMatch * weights.salaryMatch +
    factors.experienceMatch * weights.experienceMatch +
    factors.companyFit * weights.companyFit +
    factors.recency * weights.recency +
    factors.scarcity * weights.scarcity +
    factors.engagement * weights.engagement
  );
}

function computeCandidateScore(
  candidateScore: number,
  skillMatch: number,
  experienceYears: number,
  collegeReputation: number,
  responseRate: number
): number {
  // Weighted scoring for candidate ranking
  return (
    candidateScore * 0.3 +
    skillMatch * 0.25 +
    Math.min(experienceYears / 5, 1) * 0.15 +
    collegeReputation * 0.15 +
    responseRate * 0.15
  );
}

// ============================================================================
// SCHEMAS
// ============================================================================

const getOpportunityRecommendationsSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  includeExploration: z.boolean().default(true),
  filters: z.object({
    roles: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    skills: z.array(z.string()).optional(),
  }).optional(),
  source: z.enum(["feed", "search", "notification", "email"]).default("feed"),
});

const getCandidateRecommendationsSchema = z.object({
  opportunityId: z.string(),
  limit: z.number().min(1).max(100).default(20),
  includeExploration: z.boolean().default(true),
  filters: z.object({
    minScore: z.number().optional(),
    colleges: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    experienceMin: z.number().optional(),
  }).optional(),
});

const trackRecommendationSchema = z.object({
  recommendationId: z.string(),
  action: z.enum(["impression", "click", "apply", "dismiss", "save"]),
  position: z.number().optional(),
  source: z.string().optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateRecommendationId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function shuffleWithExploration<T>(
  items: T[],
  explorationRate: number
): { items: T[]; explorationIndices: number[] } {
  const explorationCount = Math.floor(items.length * explorationRate);
  const explorationIndices: number[] = [];

  // Pick random positions for exploration items
  for (let i = 0; i < explorationCount; i++) {
    const pos = Math.floor(Math.random() * items.length);
    if (!explorationIndices.includes(pos)) {
      explorationIndices.push(pos);
    }
  }

  // Shuffle exploration items randomly
  const result = [...items];
  for (const idx of explorationIndices) {
    const randomIdx = Math.floor(Math.random() * items.length);
    [result[idx], result[randomIdx]] = [result[randomIdx], result[idx]];
  }

  return { items: result, explorationIndices };
}

// ============================================================================
// RECOMMENDATIONS ROUTER
// ============================================================================

export const recommendationsRouter = createTRPCRouter({
  /**
   * Get opportunity recommendations for a student
   */
  getOpportunityRecommendations: studentProcedure
    .input(getOpportunityRecommendationsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const recommendationBatchId = generateRecommendationId();

      // Get user profile
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: {
          skills: true,
          location: true,
          expectedSalary: true,
          experienceYears: true,
          layersRankOverall: true,
          collegeId: true,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      // Get user's application history for diversity
      const recentApplications = await ctx.prisma.application.findMany({
        where: { userId },
        select: { opportunityId: true, opportunity: { select: { companyId: true, role: true } } },
        take: 20,
        orderBy: { createdAt: "desc" },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appliedCompanies = new Set(recentApplications.map((a: any) => a.opportunity?.companyId));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appliedRoles = new Set(recentApplications.map((a: any) => a.opportunity?.role));

      // Build base query for opportunities
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        status: "PUBLISHED",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
        spotsRemaining: { gt: 0 },
      };

      // Apply filters
      if (input.filters?.roles?.length) {
        whereClause.role = { in: input.filters.roles };
      }
      if (input.filters?.locations?.length) {
        whereClause.location = { in: input.filters.locations };
      }
      if (input.filters?.salaryMin) {
        whereClause.salaryMin = { gte: input.filters.salaryMin };
      }
      if (input.filters?.skills?.length) {
        whereClause.requiredSkills = { hasSome: input.filters.skills };
      }

      // Get candidate opportunities
      const opportunities = await ctx.prisma.opportunity.findMany({
        where: whereClause,
        include: {
          company: {
            select: { name: true, logoUrl: true, verified: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        take: input.limit * 3, // Get more for scoring and filtering
      });

      // Score each opportunity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoredOpportunities = opportunities.map((opp: any) => {
        const userSkills = (profileData?.skills as string[]) || [];
        const requiredSkills = (opp.requiredSkills as string[]) || [];

        // Skill match
        const matchingSkills = userSkills.filter((s: string) =>
          requiredSkills.some((rs: string) => rs.toLowerCase().includes(s.toLowerCase()))
        );
        const skillMatch = requiredSkills.length > 0
          ? matchingSkills.length / requiredSkills.length
          : 0.5;

        // Location match
        const locationMatch = profileData?.location === opp.location ? 1 : 0.5;

        // Salary match
        const expectedSalary = profileData?.expectedSalary || 0;
        const salaryMatch = expectedSalary > 0 && opp.salaryMin
          ? Math.min(1, opp.salaryMin / expectedSalary)
          : 0.5;

        // Experience match
        const expYears = profileData?.experienceYears || 0;
        const experienceMatch = opp.experienceRequired
          ? expYears >= opp.experienceRequired ? 1 : expYears / opp.experienceRequired
          : 0.5;

        // Company fit (based on historical placements from same college)
        const companyFit = 0.5; // TODO: compute from historical data

        // Recency (newer = higher)
        const hoursSinceCreated = (Date.now() - new Date(opp.createdAt).getTime()) / (60 * 60 * 1000);
        const recency = Math.max(0, 1 - hoursSinceCreated / (24 * 7)); // Decay over 7 days

        // Scarcity
        const scarcity = opp.spotsRemaining < 5 ? 1 : opp.spotsRemaining < 10 ? 0.7 : 0.3;

        // User engagement level
        const engagement = profileData?.layersRankOverall
          ? Math.min(1, profileData.layersRankOverall / 100)
          : 0.5;

        // Compute final score
        let score = computeOpportunityScore({
          skillMatch,
          locationMatch,
          salaryMatch,
          experienceMatch,
          companyFit,
          recency,
          scarcity,
          engagement,
        });

        // Apply diversity penalty
        if (appliedCompanies.has(opp.companyId)) {
          score *= 1 - RECOMMENDATION_CONFIG.DIVERSITY_PENALTY;
        }
        if (appliedRoles.has(opp.role)) {
          score *= 1 - RECOMMENDATION_CONFIG.DIVERSITY_PENALTY / 2;
        }

        return {
          opportunity: opp,
          score,
          factors: {
            skillMatch,
            locationMatch,
            salaryMatch,
            experienceMatch,
            companyFit,
            recency,
            scarcity,
          },
        };
      });

      // Sort by score
      scoredOpportunities.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

      // Take top N
      let topOpportunities = scoredOpportunities.slice(0, input.limit);

      // Apply exploration if enabled
      let explorationIndices: number[] = [];
      if (input.includeExploration) {
        const result = shuffleWithExploration(
          topOpportunities,
          RECOMMENDATION_CONFIG.EXPLORATION_RATE
        );
        topOpportunities = result.items;
        explorationIndices = result.explorationIndices;
      }

      // Create recommendation records and format response
      const recommendations = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topOpportunities.map(async (item: any, position: number) => {
          const recommendationId = generateRecommendationId();
          const isExploration = explorationIndices.includes(position);

          // Store recommendation for tracking
          await ctx.prisma.recommendation.create({
            data: {
              id: recommendationId,
              batchId: recommendationBatchId,
              userId,
              entityType: "opportunity",
              entityId: item.opportunity.id,
              position,
              score: item.score,
              isExploration,
              source: input.source,
              factors: item.factors,
            },
          });

          return {
            recommendationId,
            position,
            isExploration,
            score: item.score,
            opportunity: {
              id: item.opportunity.id,
              title: item.opportunity.title,
              role: item.opportunity.role,
              company: item.opportunity.company,
              location: item.opportunity.location,
              salaryMin: item.opportunity.salaryMin,
              salaryMax: item.opportunity.salaryMax,
              spotsRemaining: item.opportunity.spotsRemaining,
              applicationCount: item.opportunity._count?.applications || 0,
              expiresAt: item.opportunity.expiresAt,
            },
            factors: item.factors,
          };
        })
      );

      // Log recommendation batch
      await logEvent(EventTypes.OPPORTUNITY_RECOMMENDED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "recommendation_batch",
        entityId: recommendationBatchId,
        metadata: {
          count: recommendations.length,
          explorationCount: explorationIndices.length,
          source: input.source,
          avgScore: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length,
        },
      });

      return {
        batchId: recommendationBatchId,
        recommendations,
        metadata: {
          totalCandidates: opportunities.length,
          returned: recommendations.length,
          explorationRate: explorationIndices.length / recommendations.length,
          filters: input.filters,
        },
      };
    }),

  /**
   * Get candidate recommendations for a company (for an opportunity)
   */
  getCandidateRecommendations: companyProcedure
    .input(getCandidateRecommendationsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const recommendationBatchId = generateRecommendationId();

      // Get opportunity
      const opportunity = await ctx.prisma.opportunity.findUnique({
        where: { id: input.opportunityId },
        select: {
          companyId: true,
          requiredSkills: true,
          location: true,
          experienceRequired: true,
        },
      });

      if (!opportunity) {
        return { batchId: recommendationBatchId, recommendations: [], metadata: {} };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oppData = opportunity as any;

      // Build candidate query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        userType: "STUDENT",
        profile: {
          isNot: null,
        },
      };

      // Apply filters
      if (input.filters?.minScore) {
        whereClause.profile = {
          ...whereClause.profile,
          layersRankOverall: { gte: input.filters.minScore },
        };
      }
      if (input.filters?.colleges?.length) {
        whereClause.profile = {
          ...whereClause.profile,
          collegeId: { in: input.filters.colleges },
        };
      }

      // Get candidates
      const candidates = await ctx.prisma.user.findMany({
        where: whereClause,
        include: {
          profile: {
            select: {
              skills: true,
              location: true,
              experienceYears: true,
              layersRankOverall: true,
              collegeId: true,
              collegeName: true,
              avatarUrl: true,
            },
          },
        },
        take: input.limit * 3,
      });

      // Score each candidate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoredCandidates = candidates.map((candidate: any) => {
        const candidateSkills = (candidate.profile?.skills as string[]) || [];
        const requiredSkills = (oppData.requiredSkills as string[]) || [];

        // Skill match
        const matchingSkills = candidateSkills.filter((s: string) =>
          requiredSkills.some((rs: string) => rs.toLowerCase().includes(s.toLowerCase()))
        );
        const skillMatch = requiredSkills.length > 0
          ? matchingSkills.length / requiredSkills.length
          : 0.5;

        const score = computeCandidateScore(
          candidate.profile?.layersRankOverall || 0,
          skillMatch,
          candidate.profile?.experienceYears || 0,
          0.5, // College reputation placeholder
          0.5 // Response rate placeholder
        );

        return {
          candidate,
          score,
          skillMatch,
        };
      });

      // Sort by score
      scoredCandidates.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

      // Take top N with exploration
      let topCandidates = scoredCandidates.slice(0, input.limit);
      let explorationIndices: number[] = [];

      if (input.includeExploration) {
        const result = shuffleWithExploration(
          topCandidates,
          RECOMMENDATION_CONFIG.EXPLORATION_RATE
        );
        topCandidates = result.items;
        explorationIndices = result.explorationIndices;
      }

      // Create recommendation records
      const recommendations = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topCandidates.map(async (item: any, position: number) => {
          const recommendationId = generateRecommendationId();
          const isExploration = explorationIndices.includes(position);

          await ctx.prisma.recommendation.create({
            data: {
              id: recommendationId,
              batchId: recommendationBatchId,
              userId,
              entityType: "candidate",
              entityId: item.candidate.id,
              relatedEntityId: input.opportunityId,
              position,
              score: item.score,
              isExploration,
              source: "company_search",
              factors: { skillMatch: item.skillMatch },
            },
          });

          return {
            recommendationId,
            position,
            isExploration,
            score: item.score,
            candidate: {
              id: item.candidate.id,
              name: item.candidate.name,
              avatarUrl: item.candidate.profile?.avatarUrl,
              collegeName: item.candidate.profile?.collegeName,
              skills: item.candidate.profile?.skills,
              experienceYears: item.candidate.profile?.experienceYears,
              layersRank: item.candidate.profile?.layersRankOverall,
              skillMatch: item.skillMatch,
            },
          };
        })
      );

      // Log
      await logEvent(EventTypes.RECOMMENDATION_SHOWN, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "recommendation_batch",
        entityId: recommendationBatchId,
        metadata: {
          opportunityId: input.opportunityId,
          count: recommendations.length,
          explorationCount: explorationIndices.length,
        },
      });

      return {
        batchId: recommendationBatchId,
        recommendations,
        metadata: {
          totalCandidates: candidates.length,
          returned: recommendations.length,
          explorationRate: explorationIndices.length / recommendations.length,
          filters: input.filters,
        },
      };
    }),

  /**
   * Track recommendation interaction
   */
  trackInteraction: protectedProcedure
    .input(trackRecommendationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get recommendation
      const recommendation = await ctx.prisma.recommendation.findUnique({
        where: { id: input.recommendationId },
      });

      if (!recommendation) {
        return { tracked: false, reason: "Recommendation not found" };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recData = recommendation as any;

      // Update recommendation
      const updateData: Record<string, unknown> = {};

      switch (input.action) {
        case "impression":
          updateData.impressionAt = new Date();
          break;
        case "click":
          updateData.clickedAt = new Date();
          updateData.clickPosition = input.position;
          break;
        case "apply":
          updateData.appliedAt = new Date();
          break;
        case "dismiss":
          updateData.dismissedAt = new Date();
          break;
        case "save":
          updateData.savedAt = new Date();
          break;
      }

      await ctx.prisma.recommendation.update({
        where: { id: input.recommendationId },
        data: updateData,
      });

      // Log the interaction - CRITICAL FOR FEEDBACK LOOPS
      const eventType = {
        impression: EventTypes.RECOMMENDATION_SHOWN,
        click: EventTypes.RECOMMENDATION_CLICKED,
        apply: EventTypes.RECOMMENDATION_APPLIED,
        dismiss: EventTypes.RECOMMENDATION_DISMISSED,
        save: EventTypes.RECOMMENDATION_SHOWN, // Using SHOWN as placeholder
      }[input.action];

      await logEvent(eventType, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "recommendation",
        entityId: input.recommendationId,
        metadata: {
          action: input.action,
          position: input.position || recData.position,
          score: recData.score,
          isExploration: recData.isExploration,
          entityType: recData.entityType,
          entityId: recData.entityId,
          source: input.source || recData.source,
        },
      });

      return { tracked: true, action: input.action };
    }),

  /**
   * Get recommendation performance metrics
   */
  getMetrics: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(7),
      entityType: z.enum(["opportunity", "candidate"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        createdAt: { gte: startDate },
      };

      if (input?.entityType) {
        whereClause.entityType = input.entityType;
      }

      const recommendations = await ctx.prisma.recommendation.findMany({
        where: whereClause,
      });

      // Calculate metrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const total = recommendations.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clicked = recommendations.filter((r: any) => r.clickedAt).length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const applied = recommendations.filter((r: any) => r.appliedAt).length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dismissed = recommendations.filter((r: any) => r.dismissedAt).length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const explorationRecs = recommendations.filter((r: any) => r.isExploration);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const explorationClicked = explorationRecs.filter((r: any) => r.clickedAt).length;

      // Average position of clicked recommendations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clickedRecs = recommendations.filter((r: any) => r.clickedAt);
      const avgClickPosition = clickedRecs.length > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? clickedRecs.reduce((sum: number, r: any) => sum + (r.clickPosition || r.position), 0) / clickedRecs.length
        : 0;

      // Average score of applied vs non-applied
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appliedRecs = recommendations.filter((r: any) => r.appliedAt);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const avgScoreApplied = appliedRecs.length > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? appliedRecs.reduce((sum: number, r: any) => sum + r.score, 0) / appliedRecs.length
        : 0;

      return {
        period: `Last ${days} days`,
        total,
        clicked,
        applied,
        dismissed,
        clickRate: total > 0 ? (clicked / total * 100).toFixed(2) : 0,
        applyRate: clicked > 0 ? (applied / clicked * 100).toFixed(2) : 0,
        dismissRate: total > 0 ? (dismissed / total * 100).toFixed(2) : 0,
        exploration: {
          total: explorationRecs.length,
          clicked: explorationClicked,
          clickRate: explorationRecs.length > 0
            ? (explorationClicked / explorationRecs.length * 100).toFixed(2)
            : 0,
        },
        avgClickPosition,
        avgScoreApplied,
        // This is the key metric: does higher score correlate with more applications?
        scoreCorrelation: avgScoreApplied > 0 ? "Score correlates with applications" : "Insufficient data",
      };
    }),

  /**
   * Get similar opportunities (for "You might also like")
   */
  getSimilarOpportunities: studentProcedure
    .input(z.object({
      opportunityId: z.string(),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      // Get the source opportunity
      const sourceOpp = await ctx.prisma.opportunity.findUnique({
        where: { id: input.opportunityId },
        select: {
          role: true,
          location: true,
          requiredSkills: true,
          salaryMin: true,
          salaryMax: true,
          companyId: true,
        },
      });

      if (!sourceOpp) {
        return { recommendations: [] };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sourceData = sourceOpp as any;

      // Find similar opportunities
      const similar = await ctx.prisma.opportunity.findMany({
        where: {
          id: { not: input.opportunityId },
          status: "PUBLISHED",
          OR: [
            { role: sourceData.role },
            { location: sourceData.location },
            { requiredSkills: { hasSome: sourceData.requiredSkills || [] } },
          ],
        },
        include: {
          company: { select: { name: true, logoUrl: true } },
        },
        take: input.limit,
      });

      // Log
      await logEvent(EventTypes.RECOMMENDATION_SHOWN, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "similar_opportunities",
        entityId: input.opportunityId,
        metadata: {
          count: similar.length,
        },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recommendations: similar.map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          role: opp.role,
          company: opp.company,
          location: opp.location,
          salaryMin: opp.salaryMin,
          salaryMax: opp.salaryMax,
        })),
      };
    }),
});
