/**
 * Events Router
 * Handles client-side event tracking
 * CRITICAL: This is the data acquisition layer
 */

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../trpc/trpc";
import { logEvent, queueEvent, EventSource } from "@/lib/events";
import type { EventType } from "@/lib/events";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const trackEventSchema = z.object({
  eventType: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  source: z
    .enum([
      "search",
      "recommendation",
      "notification",
      "direct",
      "feed",
      "email",
      "referral",
      "external",
      "whatsapp",
      "linkedin",
    ])
    .optional(),
  position: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  experimentId: z.string().optional(),
  experimentGroup: z.string().optional(),
});

const trackBatchSchema = z.object({
  events: z.array(trackEventSchema).max(100),
});

// ============================================================================
// ROUTER
// ============================================================================

export const eventsRouter = createTRPCRouter({
  /**
   * Track a single event (authenticated users)
   */
  track: protectedProcedure
    .input(trackEventSchema)
    .mutation(async ({ ctx, input }) => {
      const event = await logEvent(input.eventType as EventType, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: input.entityType,
        entityId: input.entityId,
        source: input.source as EventSource,
        position: input.position,
        metadata: input.metadata,
        experimentId: input.experimentId,
        experimentGroup: input.experimentGroup,
      });

      return { success: true, eventId: event.id };
    }),

  /**
   * Track a single event (anonymous users)
   * Still valuable for understanding visitor behavior
   */
  trackAnonymous: publicProcedure
    .input(
      trackEventSchema.extend({
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const event = await logEvent(input.eventType as EventType, {
        sessionId: input.sessionId,
        entityType: input.entityType,
        entityId: input.entityId,
        source: input.source as EventSource,
        position: input.position,
        metadata: input.metadata,
      });

      return { success: true, eventId: event.id };
    }),

  /**
   * Track batch of events (for buffered client-side tracking)
   */
  trackBatch: protectedProcedure
    .input(trackBatchSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userType = ctx.session.user.userType;

      // Queue all events for batch processing
      for (const event of input.events) {
        queueEvent(event.eventType as EventType, {
          userId,
          userType,
          entityType: event.entityType,
          entityId: event.entityId,
          source: event.source as EventSource,
          position: event.position,
          metadata: event.metadata,
        });
      }

      return { success: true, count: input.events.length };
    }),

  /**
   * Track opportunity impression (high-frequency, optimized)
   */
  trackImpression: protectedProcedure
    .input(
      z.object({
        opportunityIds: z.array(z.string()).max(50),
        source: z.enum(["search", "recommendation", "feed", "direct"]),
        startPosition: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      input.opportunityIds.forEach((opportunityId, index) => {
        queueEvent("OPPORTUNITY_IMPRESSION" as EventType, {
          userId,
          entityType: "opportunity",
          entityId: opportunityId,
          source: input.source as EventSource,
          position: input.startPosition + index,
        });
      });

      return { success: true };
    }),

  /**
   * Track opportunity click with context
   */
  trackOpportunityClick: protectedProcedure
    .input(
      z.object({
        opportunityId: z.string(),
        source: z.enum(["search", "recommendation", "feed", "notification", "direct"]),
        position: z.number().optional(),
        recommendationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const event = await logEvent("OPPORTUNITY_CLICK" as EventType, {
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

      // If from recommendation, also update recommendation tracking
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

      return { success: true, eventId: event.id };
    }),

  /**
   * Track session start
   */
  startSession: publicProcedure
    .input(
      z.object({
        referrer: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        deviceType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sessionId = crypto.randomUUID();

      await logEvent("SESSION_START" as EventType, {
        userId: ctx.session?.user?.id,
        userType: ctx.session?.user?.userType,
        sessionId,
        metadata: {
          referrer: input.referrer,
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          deviceType: input.deviceType,
        },
      });

      return { sessionId };
    }),

  /**
   * Track session end
   */
  endSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        duration: z.number(), // in seconds
        pageViews: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await logEvent("SESSION_END" as EventType, {
        userId: ctx.session?.user?.id,
        userType: ctx.session?.user?.userType,
        sessionId: input.sessionId,
        metadata: {
          duration: input.duration,
          pageViews: input.pageViews,
        },
      });

      return { success: true };
    }),

  /**
   * Track notification interaction
   */
  trackNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
        action: z.enum(["opened", "clicked", "dismissed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventTypeMap = {
        opened: "NOTIFICATION_OPENED",
        clicked: "NOTIFICATION_CLICKED",
        dismissed: "NOTIFICATION_DISMISSED",
      };

      await logEvent(eventTypeMap[input.action] as EventType, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "notification",
        entityId: input.notificationId,
      });

      // Update notification record
      const updateData =
        input.action === "opened"
          ? { isRead: true, readAt: new Date() }
          : input.action === "clicked"
            ? { isClicked: true, clickedAt: new Date() }
            : { isDismissed: true, dismissedAt: new Date() };

      await ctx.prisma.notification.update({
        where: { id: input.notificationId },
        data: updateData,
      });

      return { success: true };
    }),

  /**
   * Get recent events for debugging (admin only)
   */
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        eventType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Only allow admins or users viewing their own events
      const events = await ctx.prisma.event.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.eventType ? { eventType: input.eventType } : {}),
        },
        orderBy: { timestamp: "desc" },
        take: input.limit,
        select: {
          id: true,
          eventType: true,
          eventCategory: true,
          entityType: true,
          entityId: true,
          source: true,
          rewardValue: true,
          timestamp: true,
        },
      });

      return events;
    }),
});
