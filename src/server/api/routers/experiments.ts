/**
 * Experimentation Framework Router
 *
 * A/B testing infrastructure for data-driven decisions
 *
 * Features:
 * - Experiment creation/management
 * - Consistent user assignment (hash-based)
 * - Variant configuration
 * - Metric tracking by variant
 * - Statistical significance calculation
 *
 * This enables continuous improvement through experimentation
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";

// ============================================================================
// CONFIGURATION
// ============================================================================

const EXPERIMENT_CONFIG = {
  MIN_SAMPLE_SIZE: 100, // Minimum users per variant for significance
  SIGNIFICANCE_THRESHOLD: 0.95, // 95% confidence level
  DEFAULT_TRAFFIC_PERCENT: 100, // Default to 100% traffic
};

// ============================================================================
// TYPES
// ============================================================================

interface Variant {
  id: string;
  name: string;
  weight: number; // 0-100, must sum to 100 across variants
  config: Record<string, unknown>;
}

interface ExperimentMetric {
  name: string;
  type: "conversion" | "count" | "revenue" | "duration";
  eventType: string;
  successCondition?: string; // e.g., "status === 'SUBMITTED'"
}

interface VariantStats {
  variantId: string;
  variantName: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  totalValue: number;
  avgValue: number;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const createExperimentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  hypothesis: z.string().optional(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    weight: z.number().min(0).max(100),
    config: z.record(z.string(), z.unknown()),
  })).min(2),
  metrics: z.array(z.object({
    name: z.string(),
    type: z.enum(["conversion", "count", "revenue", "duration"]),
    eventType: z.string(),
    successCondition: z.string().optional(),
  })),
  targetAudience: z.object({
    userTypes: z.array(z.string()).optional(),
    collegeIds: z.array(z.string()).optional(),
    minXp: z.number().optional(),
    maxXp: z.number().optional(),
  }).optional(),
  trafficPercent: z.number().min(1).max(100).default(100),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const getVariantSchema = z.object({
  experimentId: z.string(),
  userId: z.string().optional(),
});

const trackEventSchema = z.object({
  experimentId: z.string(),
  eventType: z.string(),
  eventValue: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Consistent hash-based user assignment to variant
 * Same user always gets same variant for same experiment
 */
function hashUserToVariant(userId: string, experimentId: string, variants: Variant[]): Variant {
  // Create a deterministic hash from userId + experimentId
  const combined = `${userId}:${experimentId}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Normalize to 0-100
  const bucket = Math.abs(hash % 100);

  // Find variant based on weights
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) {
      return variant;
    }
  }

  // Fallback to first variant
  return variants[0];
}

/**
 * Check if user is in target audience for experiment
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInTargetAudience(user: any, profile: any, targetAudience: any): boolean {
  if (!targetAudience) return true;

  if (targetAudience.userTypes?.length && !targetAudience.userTypes.includes(user.userType)) {
    return false;
  }

  if (targetAudience.collegeIds?.length && profile?.collegeId &&
      !targetAudience.collegeIds.includes(profile.collegeId)) {
    return false;
  }

  if (targetAudience.minXp && (profile?.xpTotal || 0) < targetAudience.minXp) {
    return false;
  }

  if (targetAudience.maxXp && (profile?.xpTotal || 0) > targetAudience.maxXp) {
    return false;
  }

  return true;
}

/**
 * Calculate statistical significance using chi-square test
 */
function calculateSignificance(
  control: VariantStats,
  treatment: VariantStats
): { significant: boolean; pValue: number; liftPercent: number } {
  const totalParticipants = control.participants + treatment.participants;
  const totalConversions = control.conversions + treatment.conversions;

  if (totalParticipants < EXPERIMENT_CONFIG.MIN_SAMPLE_SIZE * 2) {
    return { significant: false, pValue: 1, liftPercent: 0 };
  }

  // Expected conversions under null hypothesis
  const expectedRate = totalConversions / totalParticipants;
  const expectedControl = expectedRate * control.participants;
  const expectedTreatment = expectedRate * treatment.participants;

  // Chi-square statistic
  const chiSquare = (
    Math.pow(control.conversions - expectedControl, 2) / expectedControl +
    Math.pow(treatment.conversions - expectedTreatment, 2) / expectedTreatment +
    Math.pow((control.participants - control.conversions) - (control.participants - expectedControl), 2) / (control.participants - expectedControl) +
    Math.pow((treatment.participants - treatment.conversions) - (treatment.participants - expectedTreatment), 2) / (treatment.participants - expectedTreatment)
  );

  // Approximate p-value (chi-square with 1 degree of freedom)
  // Using lookup for common values
  let pValue = 1;
  if (chiSquare > 10.83) pValue = 0.001;
  else if (chiSquare > 6.63) pValue = 0.01;
  else if (chiSquare > 3.84) pValue = 0.05;
  else if (chiSquare > 2.71) pValue = 0.1;
  else if (chiSquare > 1.32) pValue = 0.25;

  // Calculate lift
  const liftPercent = control.conversionRate > 0
    ? ((treatment.conversionRate - control.conversionRate) / control.conversionRate) * 100
    : 0;

  return {
    significant: pValue < (1 - EXPERIMENT_CONFIG.SIGNIFICANCE_THRESHOLD),
    pValue,
    liftPercent,
  };
}

// ============================================================================
// EXPERIMENTS ROUTER
// ============================================================================

export const experimentsRouter = createTRPCRouter({
  /**
   * Create a new experiment
   */
  create: protectedProcedure
    .input(createExperimentSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate variant weights sum to 100
      const totalWeight = input.variants.reduce((sum, v) => sum + v.weight, 0);
      if (totalWeight !== 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Variant weights must sum to 100, got ${totalWeight}`,
        });
      }

      const experiment = await ctx.prisma.experiment.create({
        data: {
          name: input.name,
          description: input.description,
          hypothesis: input.hypothesis,
          variants: input.variants,
          metrics: input.metrics,
          targetAudience: input.targetAudience || {},
          trafficPercent: input.trafficPercent,
          startDate: input.startDate || new Date(),
          endDate: input.endDate,
          status: "RUNNING",
          createdBy: ctx.session.user.id,
        },
      });

      await logEvent(EventTypes.XP_EARNED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "experiment",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entityId: (experiment as any).id,
        metadata: {
          action: "created",
          name: input.name,
          variantCount: input.variants.length,
        },
      });

      return experiment;
    }),

  /**
   * Get user's variant for an experiment
   */
  getVariant: protectedProcedure
    .input(getVariantSchema)
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.session.user.id;

      // Get experiment
      const experiment = await ctx.prisma.experiment.findUnique({
        where: { id: input.experimentId },
      });

      if (!experiment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experiment not found",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expData = experiment as any;

      // Check if experiment is active
      if (expData.status !== "RUNNING") {
        return { inExperiment: false, reason: "Experiment not running" };
      }

      // Check date range
      const now = new Date();
      if (expData.startDate && now < new Date(expData.startDate)) {
        return { inExperiment: false, reason: "Experiment not started" };
      }
      if (expData.endDate && now > new Date(expData.endDate)) {
        return { inExperiment: false, reason: "Experiment ended" };
      }

      // Check if user is in traffic sample
      const trafficHash = Math.abs((userId + ":traffic:" + input.experimentId).split("")
        .reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 100);
      if (trafficHash >= expData.trafficPercent) {
        return { inExperiment: false, reason: "Not in traffic sample" };
      }

      // Check target audience
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { userType: true },
      });
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true, xpTotal: true },
      });

      if (!isInTargetAudience(user, profile, expData.targetAudience)) {
        return { inExperiment: false, reason: "Not in target audience" };
      }

      // Assign variant
      const variants = expData.variants as Variant[];
      const variant = hashUserToVariant(userId, input.experimentId, variants);

      // Record assignment if not already assigned
      const existingAssignment = await ctx.prisma.experimentAssignment.findFirst({
        where: {
          experimentId: input.experimentId,
          userId,
        },
      });

      if (!existingAssignment) {
        await ctx.prisma.experimentAssignment.create({
          data: {
            experimentId: input.experimentId,
            userId,
            variantId: variant.id,
          },
        });

        // Log assignment
        await logEvent(EventTypes.XP_EARNED, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "experiment_assignment",
          entityId: input.experimentId,
          metadata: {
            variantId: variant.id,
            variantName: variant.name,
          },
        });
      }

      return {
        inExperiment: true,
        variant: {
          id: variant.id,
          name: variant.name,
          config: variant.config,
        },
      };
    }),

  /**
   * Track an event for experiment metrics
   */
  trackEvent: protectedProcedure
    .input(trackEventSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's assignment
      const assignment = await ctx.prisma.experimentAssignment.findFirst({
        where: {
          experimentId: input.experimentId,
          userId,
        },
      });

      if (!assignment) {
        return { tracked: false, reason: "User not in experiment" };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assignmentData = assignment as any;

      // Record the event
      await ctx.prisma.experimentEvent.create({
        data: {
          experimentId: input.experimentId,
          userId,
          variantId: assignmentData.variantId,
          eventType: input.eventType,
          eventValue: input.eventValue,
          metadata: input.metadata || {},
        },
      });

      // Log
      await logEvent(EventTypes.XP_EARNED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "experiment_event",
        entityId: input.experimentId,
        metadata: {
          eventType: input.eventType,
          variantId: assignmentData.variantId,
          eventValue: input.eventValue,
        },
      });

      return { tracked: true, variantId: assignmentData.variantId };
    }),

  /**
   * Get experiment results
   */
  getResults: protectedProcedure
    .input(z.object({
      experimentId: z.string(),
      metricName: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Get experiment
      const experiment = await ctx.prisma.experiment.findUnique({
        where: { id: input.experimentId },
      });

      if (!experiment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experiment not found",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expData = experiment as any;
      const variants = expData.variants as Variant[];
      const metrics = expData.metrics as ExperimentMetric[];

      // Get assignments per variant
      const assignments = await ctx.prisma.experimentAssignment.groupBy({
        by: ["variantId"],
        where: { experimentId: input.experimentId },
        _count: true,
      });

      const participantsByVariant = new Map<string, number>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignments.map((a: any) => [a.variantId, a._count as number])
      );

      // Get events per variant
      const events = await ctx.prisma.experimentEvent.findMany({
        where: { experimentId: input.experimentId },
      });

      // Calculate stats for each variant
      const variantStats: VariantStats[] = variants.map(variant => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variantEvents = events.filter((e: any) => e.variantId === variant.id);
        const participants: number = participantsByVariant.get(variant.id) || 0;

        // For primary metric (or specified metric)
        const targetMetric = input.metricName
          ? metrics.find(m => m.name === input.metricName)
          : metrics[0];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conversions = variantEvents.filter((e: any) =>
          e.eventType === targetMetric?.eventType
        ).length;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalValue = variantEvents.reduce((sum: number, e: any) =>
          sum + (e.eventValue || 0), 0
        );

        return {
          variantId: variant.id,
          variantName: variant.name,
          participants,
          conversions,
          conversionRate: participants > 0 ? conversions / participants : 0,
          totalValue,
          avgValue: conversions > 0 ? totalValue / conversions : 0,
        };
      });

      // Calculate statistical significance (control vs each treatment)
      const control = variantStats[0];
      const significanceResults = variantStats.slice(1).map(treatment => ({
        variantId: treatment.variantId,
        variantName: treatment.variantName,
        ...calculateSignificance(control, treatment),
      }));

      // Determine winner
      let winner: { variantId: string; variantName: string } | null = null;
      const significantWinners = significanceResults.filter(r => r.significant && r.liftPercent > 0);
      if (significantWinners.length > 0) {
        // Pick the one with highest lift
        const bestWinner = significantWinners.sort((a, b) => b.liftPercent - a.liftPercent)[0];
        winner = { variantId: bestWinner.variantId, variantName: bestWinner.variantName };
      }

      return {
        experiment: {
          id: expData.id,
          name: expData.name,
          status: expData.status,
          startDate: expData.startDate,
          endDate: expData.endDate,
          trafficPercent: expData.trafficPercent,
        },
        metrics: metrics.map(m => m.name),
        analyzedMetric: input.metricName || metrics[0]?.name,
        variantStats,
        significanceResults,
        winner,
        totalParticipants: variantStats.reduce((sum, v) => sum + v.participants, 0),
        totalEvents: events.length,
        hasEnoughData: variantStats.every(v => v.participants >= EXPERIMENT_CONFIG.MIN_SAMPLE_SIZE),
      };
    }),

  /**
   * List all experiments
   */
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["RUNNING", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {};
      if (input?.status) {
        whereClause.status = input.status;
      }

      const experiments = await ctx.prisma.experiment.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: input?.limit || 20,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return experiments.map((exp: any) => ({
        id: exp.id,
        name: exp.name,
        description: exp.description,
        status: exp.status,
        variantCount: (exp.variants as Variant[]).length,
        trafficPercent: exp.trafficPercent,
        startDate: exp.startDate,
        endDate: exp.endDate,
        createdAt: exp.createdAt,
      }));
    }),

  /**
   * Update experiment status
   */
  updateStatus: protectedProcedure
    .input(z.object({
      experimentId: z.string(),
      status: z.enum(["RUNNING", "PAUSED", "COMPLETED", "ARCHIVED"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const experiment = await ctx.prisma.experiment.update({
        where: { id: input.experimentId },
        data: { status: input.status },
      });

      await logEvent(EventTypes.XP_EARNED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "experiment",
        entityId: input.experimentId,
        metadata: {
          action: "status_changed",
          newStatus: input.status,
        },
      });

      return experiment;
    }),

  /**
   * Get experiments a user is participating in
   */
  getUserExperiments: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const assignments = await ctx.prisma.experimentAssignment.findMany({
      where: { userId },
      include: {
        experiment: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return assignments.map((a: any) => ({
      experimentId: a.experiment.id,
      experimentName: a.experiment.name,
      experimentStatus: a.experiment.status,
      variantId: a.variantId,
      assignedAt: a.createdAt,
    }));
  }),

  /**
   * Feature flag check (simplified experiment with on/off)
   */
  checkFeatureFlag: protectedProcedure
    .input(z.object({
      flagName: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Look for experiment with this name
      const experiment = await ctx.prisma.experiment.findFirst({
        where: {
          name: input.flagName,
          status: "RUNNING",
        },
      });

      if (!experiment) {
        return { enabled: false, reason: "Flag not found or not running" };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expData = experiment as any;
      const variants = expData.variants as Variant[];

      // Check traffic
      const trafficHash = Math.abs((userId + ":traffic:" + expData.id).split("")
        .reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 100);
      if (trafficHash >= expData.trafficPercent) {
        return { enabled: false, reason: "Not in traffic sample" };
      }

      // Get variant
      const variant = hashUserToVariant(userId, expData.id, variants);

      // Convention: variant named "enabled" or "on" means flag is on
      const enabled = variant.name.toLowerCase() === "enabled" ||
                     variant.name.toLowerCase() === "on" ||
                     variant.name.toLowerCase() === "treatment";

      return {
        enabled,
        variantName: variant.name,
        config: variant.config,
      };
    }),
});
