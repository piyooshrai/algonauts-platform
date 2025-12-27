/**
 * Feature Store Router
 *
 * Computes and caches features for ML models
 *
 * Features:
 * - StudentFeatures: score, behavior, preferences, churn risk
 * - OpportunityFeatures: conversion rates, velocity, competitiveness
 * - CompanyFeatures: hiring patterns, response rates
 * - Feature snapshots for ML training
 *
 * This is the foundation for ML-driven recommendations
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

interface StudentFeatures {
  // Core scores
  layersRankOverall: number;
  layersRankTechnical: number;
  layersRankBehavioral: number;
  layersRankContextual: number;

  // Behavior features
  totalApplications: number;
  applicationRate7d: number; // applications per day in last 7 days
  applicationRate30d: number;
  responseRate: number; // % of invites responded to
  avgTimeToApply: number; // hours from opportunity view to apply

  // Engagement features
  loginFrequency7d: number;
  loginFrequency30d: number;
  currentStreak: number;
  longestStreak: number;
  xpTotal: number;
  badgeCount: number;

  // Preference features (learned from behavior)
  preferredRoles: string[];
  preferredLocations: string[];
  preferredCompanySizes: string[];
  preferredSalaryMin: number;
  preferredSalaryMax: number;

  // Churn risk features
  daysSinceLastActivity: number;
  activityTrend: number; // -1 to 1, negative = declining
  churnRiskScore: number; // 0-100

  // Outcome features (THE GOLD)
  placementCount: number;
  verified30Count: number;
  verified90Count: number;
  isPlaced: boolean;
  isRetained90Days: boolean | null;

  // Computed at
  computedAt: Date;
}

interface OpportunityFeatures {
  // Basic info
  opportunityId: string;
  companyId: string;

  // Conversion metrics
  impressionCount: number;
  viewCount: number;
  applicationCount: number;
  impressionToViewRate: number;
  viewToApplyRate: number;
  overallConversionRate: number;

  // Velocity metrics
  applicationsToday: number;
  applicationsThisWeek: number;
  applicationVelocity: number; // applications per hour

  // Competitiveness metrics
  totalSpots: number;
  spotsRemaining: number;
  spotsFilledRate: number;
  avgApplicantScore: number;
  scoreThreshold75: number; // 75th percentile score

  // Time metrics
  hoursOpen: number;
  hoursUntilClose: number | null;
  avgTimeToFill: number; // historical avg hours to fill

  // Quality metrics
  acceptanceRate: number;
  offerRate: number;
  verified90Rate: number; // % of placements that verify at 90 days

  // Computed at
  computedAt: Date;
}

interface CompanyFeatures {
  // Basic info
  companyId: string;

  // Hiring metrics
  totalOpportunities: number;
  activeOpportunities: number;
  totalApplicationsReceived: number;
  totalHires: number;

  // Response metrics
  avgResponseTime: number; // hours to first response
  responseRate: number; // % of applications that get response
  invitesSent: number;
  inviteAcceptRate: number;

  // Quality metrics
  avgCandidateScore: number;
  selectivityRate: number; // % of applicants hired
  retention30Rate: number;
  retention90Rate: number; // THE KEY METRIC

  // Pattern metrics
  preferredColleges: string[];
  preferredSkills: string[];
  avgSalaryOffered: number;
  hiringSeasonality: number[]; // 12 months, 0-1 activity level

  // Engagement metrics
  loginFrequency: number;
  avgSessionDuration: number;
  searchCount30d: number;

  // Computed at
  computedAt: Date;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const getStudentFeaturesSchema = z.object({
  userId: z.string(),
  forceRecompute: z.boolean().default(false),
});

const getOpportunityFeaturesSchema = z.object({
  opportunityId: z.string(),
  forceRecompute: z.boolean().default(false),
});

const getCompanyFeaturesSchema = z.object({
  companyId: z.string(),
  forceRecompute: z.boolean().default(false),
});

const createFeatureSnapshotSchema = z.object({
  userId: z.string(),
  snapshotType: z.enum(["application", "placement", "verification_30", "verification_90"]),
  relatedEntityId: z.string().optional(),
});

// ============================================================================
// FEATURE COMPUTATION HELPERS
// ============================================================================

async function computeStudentFeatures(
  prisma: unknown,
  userId: string
): Promise<StudentFeatures> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get profile
  const profile = await db.profile.findUnique({
    where: { userId },
  });

  // Get applications
  const applications = await db.application.findMany({
    where: { userId },
    include: {
      opportunity: {
        select: { role: true, location: true, salaryMin: true, salaryMax: true },
      },
    },
  });

  // Get placements
  const placements = await db.placement.findMany({
    where: { userId },
  });

  // Get events for behavior analysis
  const events = await db.event.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get streak
  const streak = await db.streak.findUnique({
    where: { id: `${userId}_daily` },
  });

  // Get badges
  const badgeCount = await db.badge.count({
    where: { userId },
  });

  // Get invites
  const invites = await db.invite.findMany({
    where: { studentId: userId },
  });

  // Compute application rates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apps7d = applications.filter((a: any) => new Date(a.createdAt) >= sevenDaysAgo).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apps30d = applications.filter((a: any) => new Date(a.createdAt) >= thirtyDaysAgo).length;

  // Compute login frequency
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logins7d = events.filter((e: any) =>
    e.eventType === "USER_LOGIN" && new Date(e.createdAt) >= sevenDaysAgo
  ).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logins30d = events.filter((e: any) => e.eventType === "USER_LOGIN").length;

  // Compute churn risk
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastEvent = events[0] as any;
  const daysSinceLastActivity = lastEvent
    ? Math.floor((now.getTime() - new Date(lastEvent.createdAt).getTime()) / (24 * 60 * 60 * 1000))
    : 999;

  // Activity trend: compare last 7 days to previous 7 days
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentActivity = events.filter((e: any) => new Date(e.createdAt) >= sevenDaysAgo).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previousActivity = events.filter((e: any) => {
    const date = new Date(e.createdAt);
    return date >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && date < sevenDaysAgo;
  }).length;
  const activityTrend = previousActivity > 0
    ? (recentActivity - previousActivity) / previousActivity
    : recentActivity > 0 ? 1 : 0;

  // Churn risk score (0-100)
  let churnRiskScore = 0;
  if (daysSinceLastActivity > 7) churnRiskScore += 30;
  if (daysSinceLastActivity > 14) churnRiskScore += 30;
  if (activityTrend < 0) churnRiskScore += Math.abs(activityTrend) * 20;
  if ((streak as unknown as { currentStreak?: number })?.currentStreak === 0) churnRiskScore += 10;
  if (applications.length === 0 && daysSinceLastActivity > 3) churnRiskScore += 10;
  churnRiskScore = Math.min(100, churnRiskScore);

  // Learn preferences from applications
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles = applications.map((a: any) => a.opportunity?.role).filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locations = applications.map((a: any) => a.opportunity?.location).filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const salaries = applications.map((a: any) => ({
    min: a.opportunity?.salaryMin,
    max: a.opportunity?.salaryMax,
  })).filter((s: { min?: number; max?: number }) => s.min);

  // Mode function
  const mode = (arr: string[]) => {
    const counts = arr.reduce((acc: Record<string, number>, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([val]) => val);
  };

  // Compute response rate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const respondedInvites = invites.filter((i: any) => i.status !== "PENDING").length;
  const responseRate = invites.length > 0 ? respondedInvites / invites.length : 0;

  // Placement outcomes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verified30Count = placements.filter((p: any) => p.verification30CompletedAt).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verified90Count = placements.filter((p: any) => p.verification90CompletedAt).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isRetained = placements.some((p: any) => p.isRetainedAt90Days === true);

  return {
    // Core scores
    layersRankOverall: (profile as unknown as { layersRankOverall?: number })?.layersRankOverall || 0,
    layersRankTechnical: (profile as unknown as { layersRankTechnical?: number })?.layersRankTechnical || 0,
    layersRankBehavioral: (profile as unknown as { layersRankBehavioral?: number })?.layersRankBehavioral || 0,
    layersRankContextual: (profile as unknown as { layersRankContextual?: number })?.layersRankContextual || 0,

    // Behavior
    totalApplications: applications.length,
    applicationRate7d: apps7d / 7,
    applicationRate30d: apps30d / 30,
    responseRate,
    avgTimeToApply: 24, // TODO: compute from event timestamps

    // Engagement
    loginFrequency7d: logins7d / 7,
    loginFrequency30d: logins30d / 30,
    currentStreak: (streak as unknown as { currentStreak?: number })?.currentStreak || 0,
    longestStreak: (streak as unknown as { longestStreak?: number })?.longestStreak || 0,
    xpTotal: (profile as unknown as { xpTotal?: number })?.xpTotal || 0,
    badgeCount,

    // Preferences
    preferredRoles: mode(roles),
    preferredLocations: mode(locations),
    preferredCompanySizes: [], // TODO: learn from applications
    preferredSalaryMin: salaries.length > 0
      ? Math.min(...salaries.map((s: { min?: number }) => s.min || 0))
      : 0,
    preferredSalaryMax: salaries.length > 0
      ? Math.max(...salaries.map((s: { max?: number }) => s.max || 0))
      : 0,

    // Churn risk
    daysSinceLastActivity,
    activityTrend,
    churnRiskScore,

    // Outcomes
    placementCount: placements.length,
    verified30Count,
    verified90Count,
    isPlaced: placements.length > 0,
    isRetained90Days: verified90Count > 0 ? isRetained : null,

    computedAt: now,
  };
}

async function computeOpportunityFeatures(
  prisma: unknown,
  opportunityId: string
): Promise<OpportunityFeatures> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get opportunity
  const opportunity = await db.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Opportunity not found",
    });
  }

  // Get applications
  const applications = await db.application.findMany({
    where: { opportunityId },
    include: {
      user: {
        select: {
          profile: {
            select: { layersRankOverall: true },
          },
        },
      },
    },
  });

  // Get events
  const events = await db.event.findMany({
    where: {
      entityId: opportunityId,
      entityType: "opportunity",
    },
  });

  // Get placements from this opportunity
  const placements = await db.placement.findMany({
    where: { opportunityId },
  });

  // Compute metrics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const impressions = events.filter((e: any) => e.eventType === "OPPORTUNITY_IMPRESSION").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const views = events.filter((e: any) => e.eventType === "OPPORTUNITY_VIEW").length;
  const applicationCount = applications.length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applicationsToday = applications.filter((a: any) => new Date(a.createdAt) >= today).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applicationsThisWeek = applications.filter((a: any) => new Date(a.createdAt) >= weekAgo).length;

  // Calculate hours open
  const hoursOpen = Math.floor((now.getTime() - new Date(opportunity.createdAt).getTime()) / (60 * 60 * 1000));
  const hoursUntilClose = opportunity.expiresAt
    ? Math.floor((new Date(opportunity.expiresAt).getTime() - now.getTime()) / (60 * 60 * 1000))
    : null;

  // Calculate applicant scores
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scores = applications.map((a: any) => a.user?.profile?.layersRankOverall || 0).filter((s: number) => s > 0);
  const avgApplicantScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
  const sortedScores = [...scores].sort((a, b) => b - a);
  const scoreThreshold75 = sortedScores[Math.floor(sortedScores.length * 0.25)] || 0;

  // Calculate acceptance/offer rates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acceptedApps = applications.filter((a: any) => a.status === "ACCEPTED").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offeredApps = applications.filter((a: any) => a.status === "OFFERED").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verified90Placements = placements.filter((p: any) => p.verification90CompletedAt).length;

  return {
    opportunityId,
    companyId: opportunity.companyId,

    impressionCount: impressions,
    viewCount: views,
    applicationCount,
    impressionToViewRate: impressions > 0 ? views / impressions : 0,
    viewToApplyRate: views > 0 ? applicationCount / views : 0,
    overallConversionRate: impressions > 0 ? applicationCount / impressions : 0,

    applicationsToday,
    applicationsThisWeek,
    applicationVelocity: hoursOpen > 0 ? applicationCount / hoursOpen : 0,

    totalSpots: opportunity.totalSpots || 1,
    spotsRemaining: opportunity.spotsRemaining || 0,
    spotsFilledRate: opportunity.totalSpots > 0
      ? (opportunity.totalSpots - (opportunity.spotsRemaining || 0)) / opportunity.totalSpots
      : 0,
    avgApplicantScore,
    scoreThreshold75,

    hoursOpen,
    hoursUntilClose,
    avgTimeToFill: 168, // Default 7 days, TODO: compute from historical data

    acceptanceRate: applicationCount > 0 ? acceptedApps / applicationCount : 0,
    offerRate: applicationCount > 0 ? offeredApps / applicationCount : 0,
    verified90Rate: placements.length > 0 ? verified90Placements / placements.length : 0,

    computedAt: now,
  };
}

async function computeCompanyFeatures(
  prisma: unknown,
  companyId: string
): Promise<CompanyFeatures> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get company
  const company = await db.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Company not found",
    });
  }

  // Get opportunities
  const opportunities = await db.opportunity.findMany({
    where: { companyId },
    include: {
      applications: true,
      placements: true,
    },
  });

  // Get invites sent
  const invites = await db.invite.findMany({
    where: { companyId },
  });

  // Get events
  const events = await db.event.findMany({
    where: {
      entityId: companyId,
      entityType: "company",
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Compute metrics
  const activeOpportunities = opportunities.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (o: any) => o.status === "PUBLISHED"
  ).length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allApplications = opportunities.flatMap((o: any) => o.applications);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPlacements = opportunities.flatMap((o: any) => o.placements);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acceptedInvites = invites.filter((i: any) => i.status === "ACCEPTED").length;

  // Calculate retention rates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verified30 = allPlacements.filter((p: any) => p.verification30CompletedAt).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verified90 = allPlacements.filter((p: any) => p.verification90CompletedAt).length;

  // Learn preferences from successful hires
  // TODO: Aggregate colleges and skills from hired candidates
  // const hiredCandidates = allPlacements.map((p: any) => p.userId);

  // Calculate login frequency
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logins = events.filter((e: any) => e.eventType === "USER_LOGIN").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searches = events.filter((e: any) => e.eventType === "CANDIDATE_SEARCH").length;

  // Hiring seasonality (placeholder)
  const hiringSeasonality = new Array(12).fill(0.5);

  return {
    companyId,

    totalOpportunities: opportunities.length,
    activeOpportunities,
    totalApplicationsReceived: allApplications.length,
    totalHires: allPlacements.length,

    avgResponseTime: 48, // Default 48 hours, TODO: compute from events
    responseRate: allApplications.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? allApplications.filter((a: any) => a.status !== "PENDING").length / allApplications.length
      : 0,
    invitesSent: invites.length,
    inviteAcceptRate: invites.length > 0 ? acceptedInvites / invites.length : 0,

    avgCandidateScore: 0, // TODO: compute from hired candidates
    selectivityRate: allApplications.length > 0 ? allPlacements.length / allApplications.length : 0,
    retention30Rate: allPlacements.length > 0 ? verified30 / allPlacements.length : 0,
    retention90Rate: allPlacements.length > 0 ? verified90 / allPlacements.length : 0,

    preferredColleges: [], // TODO: aggregate from hires
    preferredSkills: [], // TODO: aggregate from job requirements
    avgSalaryOffered: company.avgSalaryOffered || 0,
    hiringSeasonality,

    loginFrequency: logins / 30,
    avgSessionDuration: 15, // Default 15 minutes
    searchCount30d: searches,

    computedAt: now,
  };
}

// ============================================================================
// IN-MEMORY CACHE (Redis alternative for MVP)
// ============================================================================

const featureCache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
  const cached = featureCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }
  featureCache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  featureCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ============================================================================
// FEATURE STORE ROUTER
// ============================================================================

export const featureStoreRouter = createTRPCRouter({
  /**
   * Get student features
   */
  getStudentFeatures: protectedProcedure
    .input(getStudentFeaturesSchema)
    .query(async ({ ctx, input }) => {
      const cacheKey = `student:${input.userId}`;

      // Check cache
      if (!input.forceRecompute) {
        const cached = getCached<StudentFeatures>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Compute features
      const features = await computeStudentFeatures(ctx.prisma, input.userId);

      // Cache
      setCache(cacheKey, features);

      // Log
      await logEvent(EventTypes.XP_EARNED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "feature_store",
        entityId: input.userId,
        metadata: {
          featureType: "student",
          churnRiskScore: features.churnRiskScore,
        },
      });

      return features;
    }),

  /**
   * Get opportunity features
   */
  getOpportunityFeatures: protectedProcedure
    .input(getOpportunityFeaturesSchema)
    .query(async ({ ctx, input }) => {
      const cacheKey = `opportunity:${input.opportunityId}`;

      if (!input.forceRecompute) {
        const cached = getCached<OpportunityFeatures>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const features = await computeOpportunityFeatures(ctx.prisma, input.opportunityId);
      setCache(cacheKey, features);

      return features;
    }),

  /**
   * Get company features
   */
  getCompanyFeatures: protectedProcedure
    .input(getCompanyFeaturesSchema)
    .query(async ({ ctx, input }) => {
      const cacheKey = `company:${input.companyId}`;

      if (!input.forceRecompute) {
        const cached = getCached<CompanyFeatures>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const features = await computeCompanyFeatures(ctx.prisma, input.companyId);
      setCache(cacheKey, features);

      return features;
    }),

  /**
   * Create a feature snapshot for ML training
   * This captures the state of features at a critical moment
   */
  createFeatureSnapshot: protectedProcedure
    .input(createFeatureSnapshotSchema)
    .mutation(async ({ ctx, input }) => {
      // Compute current features
      const studentFeatures = await computeStudentFeatures(ctx.prisma, input.userId);

      // Store snapshot
      const snapshot = await ctx.prisma.featureSnapshot.create({
        data: {
          userId: input.userId,
          snapshotType: input.snapshotType,
          relatedEntityId: input.relatedEntityId,
          features: studentFeatures as unknown as Record<string, unknown>,
          // These are the key labels for ML training
          wasPlaced: studentFeatures.isPlaced,
          wasRetained90Days: studentFeatures.isRetained90Days,
          churnRiskScore: studentFeatures.churnRiskScore,
        },
      });

      await logEvent(EventTypes.XP_EARNED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "feature_snapshot",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entityId: (snapshot as any).id,
        metadata: {
          snapshotType: input.snapshotType,
          wasPlaced: studentFeatures.isPlaced,
          wasRetained90Days: studentFeatures.isRetained90Days,
        },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snapshotId: (snapshot as any).id,
        features: studentFeatures,
      };
    }),

  /**
   * Batch update features (for hourly cron job)
   */
  batchUpdateFeatures: protectedProcedure
    .input(z.object({
      entityType: z.enum(["student", "opportunity", "company"]),
      limit: z.number().min(1).max(1000).default(100),
    }))
    .mutation(async ({ ctx, input }) => {
      let updated = 0;

      if (input.entityType === "student") {
        // Get active students
        const profiles = await ctx.prisma.profile.findMany({
          take: input.limit,
          orderBy: { updatedAt: "asc" },
          select: { userId: true },
        });

        for (const profile of profiles) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const features = await computeStudentFeatures(ctx.prisma, (profile as any).userId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCache(`student:${(profile as any).userId}`, features);
          updated++;
        }
      } else if (input.entityType === "opportunity") {
        const opportunities = await ctx.prisma.opportunity.findMany({
          where: { status: "PUBLISHED" },
          take: input.limit,
          select: { id: true },
        });

        for (const opp of opportunities) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const features = await computeOpportunityFeatures(ctx.prisma, (opp as any).id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCache(`opportunity:${(opp as any).id}`, features);
          updated++;
        }
      } else if (input.entityType === "company") {
        const companies = await ctx.prisma.company.findMany({
          take: input.limit,
          select: { id: true },
        });

        for (const company of companies) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const features = await computeCompanyFeatures(ctx.prisma, (company as any).id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCache(`company:${(company as any).id}`, features);
          updated++;
        }
      }

      return { updated, entityType: input.entityType };
    }),

  /**
   * Get feature statistics (for monitoring)
   */
  getStats: protectedProcedure.query(async () => {
    let studentCount = 0;
    let opportunityCount = 0;
    let companyCount = 0;

    featureCache.forEach((_value, key) => {
      if (key.startsWith("student:")) studentCount++;
      else if (key.startsWith("opportunity:")) opportunityCount++;
      else if (key.startsWith("company:")) companyCount++;
    });

    return {
      cacheSize: featureCache.size,
      studentFeaturesCached: studentCount,
      opportunityFeaturesCached: opportunityCount,
      companyFeaturesCached: companyCount,
      cacheTTLMinutes: CACHE_TTL_MS / (60 * 1000),
    };
  }),

  /**
   * Clear cache (for debugging/refresh)
   */
  clearCache: protectedProcedure
    .input(z.object({
      entityType: z.enum(["student", "opportunity", "company", "all"]).optional(),
    }).optional())
    .mutation(async ({ input }) => {
      if (!input?.entityType || input.entityType === "all") {
        featureCache.clear();
        return { cleared: "all" };
      }

      const keysToDelete: string[] = [];
      featureCache.forEach((_value, key) => {
        if (key.startsWith(`${input.entityType}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => featureCache.delete(key));

      return { cleared: input.entityType };
    }),
});
