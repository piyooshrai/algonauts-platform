/**
 * Event Logger Service
 * CRITICAL: This is the core data acquisition layer
 * Every user interaction MUST be logged through this service
 */

import { prisma } from "@/server/db";
import {
  EventType,
  EventSource,
  RewardValues,
  getEventCategory,
} from "./types";
import type { UserType } from "@/lib/db/types";

// ============================================================================
// TYPES
// ============================================================================

export interface EventContext {
  userId?: string;
  userType?: UserType;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
}

export interface EventData {
  eventType: EventType;
  entityType?: string;
  entityId?: string;
  source?: EventSource;
  position?: number;
  experimentId?: string;
  experimentGroup?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggedEvent {
  id: string;
  eventType: string;
  timestamp: Date;
  rewardValue: number | null;
}

// ============================================================================
// EVENT LOGGER CLASS
// ============================================================================

class EventLogger {
  private static instance: EventLogger;
  private queue: Array<{ context: EventContext; data: EventData }> = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL_MS = 5000;

  private constructor() {
    // Start batch processing in production
    if (typeof window === "undefined") {
      this.startBatchProcessing();
    }
  }

  static getInstance(): EventLogger {
    if (!EventLogger.instance) {
      EventLogger.instance = new EventLogger();
    }
    return EventLogger.instance;
  }

  /**
   * Log a single event immediately
   * Use this for critical events (placements, applications, etc.)
   */
  async log(context: EventContext, data: EventData): Promise<LoggedEvent> {
    const rewardValue = RewardValues[data.eventType] ?? null;
    const eventCategory = getEventCategory(data.eventType);

    try {
      const event = await prisma.event.create({
        data: {
          userId: context.userId,
          userType: context.userType,
          sessionId: context.sessionId,
          eventType: data.eventType,
          eventCategory,
          entityType: data.entityType,
          entityId: data.entityId,
          source: data.source,
          position: data.position,
          experimentId: data.experimentId,
          experimentGroup: data.experimentGroup,
          rewardValue,
          rewardReason: rewardValue ? data.eventType : null,
          metadata: data.metadata ?? {},
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          deviceType: context.deviceType,
          timestamp: new Date(),
        },
        select: {
          id: true,
          eventType: true,
          timestamp: true,
          rewardValue: true,
        },
      }) as LoggedEvent;

      return event;
    } catch (error) {
      console.error("[EventLogger] Failed to log event:", error);
      // In production, you might want to send to a dead letter queue
      throw error;
    }
  }

  /**
   * Queue an event for batch processing
   * Use this for high-frequency, low-priority events (impressions, views)
   */
  queue_event(context: EventContext, data: EventData): void {
    this.queue.push({ context, data });

    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush queued events to database
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const eventsToProcess = [...this.queue];
    this.queue = [];

    try {
      const eventData = eventsToProcess.map(({ context, data }) => ({
        userId: context.userId,
        userType: context.userType,
        sessionId: context.sessionId,
        eventType: data.eventType,
        eventCategory: getEventCategory(data.eventType),
        entityType: data.entityType,
        entityId: data.entityId,
        source: data.source,
        position: data.position,
        experimentId: data.experimentId,
        experimentGroup: data.experimentGroup,
        rewardValue: RewardValues[data.eventType] ?? null,
        rewardReason: RewardValues[data.eventType] ? data.eventType : null,
        metadata: data.metadata ?? {},
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceType: context.deviceType,
        timestamp: new Date(),
      }));

      await prisma.event.createMany({
        data: eventData,
      });
    } catch (error) {
      console.error("[EventLogger] Failed to flush events:", error);
      // Re-queue failed events
      this.queue = [...eventsToProcess, ...this.queue];
    }
  }

  private startBatchProcessing(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Shutdown gracefully
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const eventLogger = EventLogger.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Log an event with minimal boilerplate
 */
export async function logEvent(
  eventType: EventType,
  options: {
    userId?: string;
    userType?: UserType;
    sessionId?: string;
    entityType?: string;
    entityId?: string;
    source?: EventSource;
    position?: number;
    metadata?: Record<string, unknown>;
    experimentId?: string;
    experimentGroup?: string;
  } = {}
): Promise<LoggedEvent> {
  return eventLogger.log(
    {
      userId: options.userId,
      userType: options.userType,
      sessionId: options.sessionId,
    },
    {
      eventType,
      entityType: options.entityType,
      entityId: options.entityId,
      source: options.source,
      position: options.position,
      metadata: options.metadata,
      experimentId: options.experimentId,
      experimentGroup: options.experimentGroup,
    }
  );
}

/**
 * Queue a low-priority event
 */
export function queueEvent(
  eventType: EventType,
  options: {
    userId?: string;
    userType?: UserType;
    sessionId?: string;
    entityType?: string;
    entityId?: string;
    source?: EventSource;
    position?: number;
    metadata?: Record<string, unknown>;
  } = {}
): void {
  eventLogger.queue_event(
    {
      userId: options.userId,
      userType: options.userType,
      sessionId: options.sessionId,
    },
    {
      eventType,
      entityType: options.entityType,
      entityId: options.entityId,
      source: options.source,
      position: options.position,
      metadata: options.metadata,
    }
  );
}

// ============================================================================
// SPECIALIZED LOGGING FUNCTIONS
// ============================================================================

/**
 * Log placement verification event - HIGHEST PRIORITY
 */
export async function logPlacementVerification(
  userId: string,
  placementId: string,
  verificationType: "30_day" | "90_day",
  isRetained: boolean
): Promise<LoggedEvent> {
  const eventType =
    verificationType === "30_day"
      ? "VERIFICATION_30_COMPLETE"
      : "VERIFICATION_90_COMPLETE";

  return logEvent(eventType as EventType, {
    userId,
    entityType: "placement",
    entityId: placementId,
    metadata: {
      verificationType,
      isRetained,
      verifiedAt: new Date().toISOString(),
    },
  });
}

/**
 * Log opportunity impression with position tracking
 */
export function logOpportunityImpression(
  userId: string,
  opportunityId: string,
  position: number,
  source: EventSource
): void {
  queueEvent("OPPORTUNITY_IMPRESSION" as EventType, {
    userId,
    entityType: "opportunity",
    entityId: opportunityId,
    position,
    source,
  });
}

/**
 * Log recommendation event with model metadata
 */
export async function logRecommendation(
  userId: string,
  opportunityId: string,
  action: "shown" | "clicked" | "applied" | "ignored",
  modelVersion: string,
  score: number
): Promise<LoggedEvent> {
  const eventTypeMap = {
    shown: "RECOMMENDATION_SHOWN",
    clicked: "RECOMMENDATION_CLICKED",
    applied: "RECOMMENDATION_APPLIED",
    ignored: "RECOMMENDATION_IGNORED",
  };

  return logEvent(eventTypeMap[action] as EventType, {
    userId,
    entityType: "recommendation",
    entityId: opportunityId,
    source: "recommendation" as EventSource,
    metadata: {
      modelVersion,
      score,
    },
  });
}

/**
 * Log application status change
 */
export async function logApplicationStatusChange(
  userId: string,
  applicationId: string,
  fromStatus: string,
  toStatus: string
): Promise<LoggedEvent> {
  return logEvent("APPLICATION_STATUS_CHANGE" as EventType, {
    userId,
    entityType: "application",
    entityId: applicationId,
    metadata: {
      fromStatus,
      toStatus,
      changedAt: new Date().toISOString(),
    },
  });
}

/**
 * Log gamification event
 */
export async function logGamificationEvent(
  userId: string,
  eventType: "BADGE_EARNED" | "LEVEL_UP" | "STREAK_CONTINUE" | "STREAK_BREAK" | "XP_EARNED",
  details: {
    badgeId?: string;
    badgeName?: string;
    fromLevel?: number;
    toLevel?: number;
    streakCount?: number;
    xpAmount?: number;
  }
): Promise<LoggedEvent> {
  return logEvent(eventType as EventType, {
    userId,
    entityType: "gamification",
    metadata: details,
  });
}
