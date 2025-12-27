/**
 * Notifications Router
 *
 * Game theory: Loss-framing drives engagement through fear of missing out
 *
 * Features:
 * - Push/email/in-app notifications
 * - Loss-framing templates that create urgency
 * - Full tracking of notification performance
 * - Preference management
 *
 * Loss-Framing Templates:
 * - "You missed X opportunities" (scarcity)
 * - "Don't break your X-day streak!" (loss aversion)
 * - "X classmates applied to Y" (social proof + FOMO)
 * - "You're about to lose your Top 10% ranking" (status anxiety)
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
// NOTIFICATION TEMPLATES - LOSS-FRAMING IS KEY
// ============================================================================

export const NOTIFICATION_TEMPLATES = {
  // ========== STREAK NOTIFICATIONS (Loss Aversion) ==========
  STREAK_AT_RISK: {
    id: "streak_at_risk",
    channel: ["push", "email"],
    title: "🔥 Don't break your {streak}-day streak!",
    body: "You haven't been active today. Just one quick action keeps your streak alive!",
    ctaText: "Keep Streak Alive",
    ctaUrl: "/dashboard",
    priority: "high",
    category: "streak",
  },
  STREAK_BROKEN: {
    id: "streak_broken",
    channel: ["push", "email"],
    title: "💔 Your {streak}-day streak ended",
    body: "Don't worry - start a new streak today! Your record was {longestStreak} days.",
    ctaText: "Start New Streak",
    ctaUrl: "/dashboard",
    priority: "high",
    category: "streak",
  },
  STREAK_MILESTONE: {
    id: "streak_milestone",
    channel: ["push", "inApp"],
    title: "🎉 {streak}-day streak achieved!",
    body: "Amazing consistency! You earned {xp} XP. Keep going!",
    ctaText: "View Progress",
    ctaUrl: "/profile/streaks",
    priority: "medium",
    category: "streak",
  },

  // ========== OPPORTUNITY NOTIFICATIONS (Scarcity + FOMO) ==========
  OPPORTUNITIES_MISSED: {
    id: "opportunities_missed",
    channel: ["push", "email"],
    title: "⚠️ You missed {count} opportunities this week",
    body: "{closedOpportunities} opportunities closed while you were away. Don't let more slip by!",
    ctaText: "View Open Opportunities",
    ctaUrl: "/opportunities",
    priority: "high",
    category: "opportunity",
  },
  HOT_OPPORTUNITY: {
    id: "hot_opportunity",
    channel: ["push", "inApp"],
    title: "🔥 Only {spots} spots left at {company}!",
    body: "{applicationsToday} people applied today. This could close soon!",
    ctaText: "Apply Now",
    ctaUrl: "/opportunities/{opportunityId}",
    priority: "high",
    category: "opportunity",
  },
  CLASSMATES_APPLIED: {
    id: "classmates_applied",
    channel: ["push", "inApp"],
    title: "👥 {count} classmates applied to {company}",
    body: "Your peers are making moves. Don't fall behind!",
    ctaText: "View Opportunity",
    ctaUrl: "/opportunities/{opportunityId}",
    priority: "high",
    category: "opportunity",
  },
  OPPORTUNITY_CLOSING: {
    id: "opportunity_closing",
    channel: ["push", "email"],
    title: "⏰ {company} closes in {hours} hours!",
    body: "Last chance to apply! {applicants} people have already applied.",
    ctaText: "Apply Before It's Too Late",
    ctaUrl: "/opportunities/{opportunityId}",
    priority: "urgent",
    category: "opportunity",
  },
  NEW_MATCH: {
    id: "new_match",
    channel: ["push", "inApp"],
    title: "✨ New opportunity matches your skills!",
    body: "{company} is looking for someone with your profile. {spotsRemaining} spots left.",
    ctaText: "Check It Out",
    ctaUrl: "/opportunities/{opportunityId}",
    priority: "medium",
    category: "opportunity",
  },

  // ========== LEADERBOARD NOTIFICATIONS (Status Anxiety) ==========
  RANKING_DROP: {
    id: "ranking_drop",
    channel: ["push", "email"],
    title: "📉 You dropped from #{previousRank} to #{currentRank}",
    body: "Others are catching up! {pointsToRecover} XP to reclaim your spot.",
    ctaText: "Earn More XP",
    ctaUrl: "/leaderboard",
    priority: "high",
    category: "leaderboard",
  },
  ABOUT_TO_LOSE_TOP10: {
    id: "about_to_lose_top10",
    channel: ["push", "email"],
    title: "⚠️ You're about to lose your Top 10% ranking!",
    body: "Someone is just {points} points behind you. Stay active to maintain your status!",
    ctaText: "Protect Your Ranking",
    ctaUrl: "/leaderboard",
    priority: "urgent",
    category: "leaderboard",
  },
  OVERTAKEN_BY_CLASSMATE: {
    id: "overtaken_by_classmate",
    channel: ["push"],
    title: "🏃 {classmateName} just passed you!",
    body: "They're now #{rank}. You can catch up with just {points} more XP!",
    ctaText: "Reclaim Your Spot",
    ctaUrl: "/leaderboard",
    priority: "high",
    category: "leaderboard",
  },
  CLOSE_TO_TOP10: {
    id: "close_to_top10",
    channel: ["push", "inApp"],
    title: "🎯 Only {points} XP to Top 10%!",
    body: "You're so close! Complete a few more activities to break in.",
    ctaText: "Push to Top 10%",
    ctaUrl: "/leaderboard",
    priority: "medium",
    category: "leaderboard",
  },

  // ========== VERIFICATION NOTIFICATIONS (THE GOLD) ==========
  VERIFICATION_30_DUE: {
    id: "verification_30_due",
    channel: ["push", "email"],
    title: "📋 30-day verification due for {company}!",
    body: "Complete your verification to earn 75 XP and prove your placement!",
    ctaText: "Verify Now",
    ctaUrl: "/placements/{placementId}/verify",
    priority: "high",
    category: "verification",
  },
  VERIFICATION_90_DUE: {
    id: "verification_90_due",
    channel: ["push", "email"],
    title: "🏆 90-day verification due - THE BIG ONE!",
    body: "This is the most valuable action. Earn 100 XP and badge!",
    ctaText: "Complete Verification",
    ctaUrl: "/placements/{placementId}/verify",
    priority: "urgent",
    category: "verification",
  },
  VERIFICATION_REMINDER: {
    id: "verification_reminder",
    channel: ["email"],
    title: "⏰ Don't forget to verify your placement at {company}",
    body: "Verification helps you and helps others find great opportunities!",
    ctaText: "Verify Placement",
    ctaUrl: "/placements/{placementId}/verify",
    priority: "medium",
    category: "verification",
  },

  // ========== SOCIAL NOTIFICATIONS ==========
  PLACEMENT_CELEBRATION: {
    id: "placement_celebration",
    channel: ["push", "inApp"],
    title: "🎉 Congratulations on your placement at {company}!",
    body: "Share your success with your network and inspire others!",
    ctaText: "Share Achievement",
    ctaUrl: "/placements/{placementId}/share",
    priority: "medium",
    category: "social",
  },
  CLASSMATE_PLACED: {
    id: "classmate_placed",
    channel: ["inApp"],
    title: "🎊 {classmateName} just got placed!",
    body: "Congratulate them on their placement at {company}!",
    ctaText: "Send Congrats",
    ctaUrl: "/feed",
    priority: "low",
    category: "social",
  },
  BADGE_EARNED: {
    id: "badge_earned",
    channel: ["push", "inApp"],
    title: "{badgeIcon} You earned the \"{badgeName}\" badge!",
    body: "{description} +{xp} XP",
    ctaText: "View Badge",
    ctaUrl: "/profile/badges",
    priority: "medium",
    category: "badge",
  },

  // ========== APPLICATION NOTIFICATIONS ==========
  APPLICATION_STATUS_UPDATE: {
    id: "application_status_update",
    channel: ["push", "email"],
    title: "📩 Update on your {company} application",
    body: "Your application status changed to: {status}",
    ctaText: "View Application",
    ctaUrl: "/applications/{applicationId}",
    priority: "high",
    category: "application",
  },
  INTERVIEW_SCHEDULED: {
    id: "interview_scheduled",
    channel: ["push", "email"],
    title: "📅 Interview scheduled with {company}!",
    body: "Prepare for your interview on {date} at {time}",
    ctaText: "View Details",
    ctaUrl: "/applications/{applicationId}",
    priority: "urgent",
    category: "application",
  },
} as const;

export type NotificationTemplateId = keyof typeof NOTIFICATION_TEMPLATES;

// ============================================================================
// SCHEMAS
// ============================================================================

const sendNotificationSchema = z.object({
  templateId: z.string(),
  variables: z.record(z.string(), z.string()),
  targetUserId: z.string().optional(),
  channels: z.array(z.enum(["push", "email", "inApp"])).optional(),
  scheduledFor: z.date().optional(),
});

const updatePreferencesSchema = z.object({
  push: z.object({
    enabled: z.boolean(),
    categories: z.record(z.string(), z.boolean()).optional(),
    quietHoursStart: z.number().min(0).max(23).optional(),
    quietHoursEnd: z.number().min(0).max(23).optional(),
  }).optional(),
  email: z.object({
    enabled: z.boolean(),
    categories: z.record(z.string(), z.boolean()).optional(),
    frequency: z.enum(["instant", "daily", "weekly"]).optional(),
  }).optional(),
  inApp: z.object({
    enabled: z.boolean(),
  }).optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] || `{${key}}`);
}

// ============================================================================
// NOTIFICATIONS ROUTER
// ============================================================================

export const notificationsRouter = createTRPCRouter({
  /**
   * Get user's notifications
   */
  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(10).max(100).default(50),
      unreadOnly: z.boolean().default(false),
      category: z.string().optional(),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = { userId };
      if (input?.unreadOnly) {
        whereClause.readAt = null;
      }
      if (input?.category) {
        whereClause.category = input.category;
      }
      if (input?.cursor) {
        whereClause.id = { lt: input.cursor };
      }

      const notifications = await ctx.prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: (input?.limit || 50) + 1,
      });

      // Pagination
      let nextCursor: string | undefined;
      if (notifications.length > (input?.limit || 50)) {
        const nextItem = notifications.pop();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nextCursor = (nextItem as any)?.id;
      }

      // Get unread count
      const unreadCount = await ctx.prisma.notification.count({
        where: { userId, readAt: null },
      });

      // Log view
      await logEvent(EventTypes.NOTIFICATIONS_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "notifications",
        metadata: {
          count: notifications.length,
          unreadCount,
        },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notifications: notifications.map((n: any) => ({
          id: n.id,
          templateId: n.templateId,
          title: n.title,
          body: n.body,
          ctaText: n.ctaText,
          ctaUrl: n.ctaUrl,
          category: n.category,
          priority: n.priority,
          createdAt: n.createdAt,
          readAt: n.readAt,
          clickedAt: n.clickedAt,
        })),
        unreadCount,
        nextCursor,
        hasMore: !!nextCursor,
      };
    }),

  /**
   * Get unread count (for badge)
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.notification.count({
      where: { userId: ctx.session.user.id, readAt: null },
    });
    return { count };
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: {
          id: input.notificationId,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await ctx.prisma.notification.update({
        where: { id: input.notificationId },
        data: { readAt: new Date() },
      });

      // Log
      await logEvent(EventTypes.NOTIFICATION_READ, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "notification",
        entityId: input.notificationId,
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          templateId: (notification as any).templateId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          category: (notification as any).category,
        },
      });

      return { success: true };
    }),

  /**
   * Mark all as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.prisma.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    await logEvent(EventTypes.NOTIFICATIONS_CLEARED, {
      userId: ctx.session.user.id,
      userType: ctx.session.user.userType,
      entityType: "notifications",
      metadata: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        count: (result as any).count,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { markedAsRead: (result as any).count };
  }),

  /**
   * Track notification click
   */
  trackClick: protectedProcedure
    .input(z.object({
      notificationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: {
          id: input.notificationId,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        return { success: false };
      }

      await ctx.prisma.notification.update({
        where: { id: input.notificationId },
        data: {
          clickedAt: new Date(),
          readAt: new Date(), // Also mark as read
        },
      });

      // LOG THE CLICK - CRITICAL FOR MEASURING NOTIFICATION EFFECTIVENESS
      await logEvent(EventTypes.NOTIFICATION_CLICKED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "notification",
        entityId: input.notificationId,
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          templateId: (notification as any).templateId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          category: (notification as any).category,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ctaUrl: (notification as any).ctaUrl,
        },
      });

      return { success: true };
    }),

  /**
   * Send a notification (internal use or admin)
   */
  send: protectedProcedure
    .input(sendNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      const targetUserId = input.targetUserId || ctx.session.user.id;

      // Get template
      const templateKey = Object.keys(NOTIFICATION_TEMPLATES).find(
        key => NOTIFICATION_TEMPLATES[key as NotificationTemplateId].id === input.templateId
      ) as NotificationTemplateId | undefined;

      if (!templateKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      const template = NOTIFICATION_TEMPLATES[templateKey];

      // Interpolate variables
      const title = interpolateTemplate(template.title, input.variables);
      const body = interpolateTemplate(template.body, input.variables);
      const ctaUrl = interpolateTemplate(template.ctaUrl, input.variables);

      // Check user preferences
      const preferences = await ctx.prisma.notificationPreference.findUnique({
        where: { userId: targetUserId },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prefsData = preferences as any;

      // Determine which channels to use
      const channels = input.channels || template.channel;
      const activeChannels: string[] = [];

      for (const channel of channels) {
        if (channel === "push" && prefsData?.pushEnabled !== false) {
          activeChannels.push("push");
        }
        if (channel === "email" && prefsData?.emailEnabled !== false) {
          activeChannels.push("email");
        }
        if (channel === "inApp" && prefsData?.inAppEnabled !== false) {
          activeChannels.push("inApp");
        }
      }

      // Create in-app notification
      if (activeChannels.includes("inApp") || activeChannels.includes("push")) {
        await ctx.prisma.notification.create({
          data: {
            userId: targetUserId,
            templateId: template.id,
            title,
            body,
            ctaText: template.ctaText,
            ctaUrl,
            category: template.category,
            priority: template.priority,
            channels: activeChannels,
            variables: input.variables,
          },
        });
      }

      // Queue push notification (would integrate with FCM/APNS)
      if (activeChannels.includes("push")) {
        // TODO: Send via push service
        await logEvent(EventTypes.PUSH_NOTIFICATION_QUEUED, {
          userId: targetUserId,
          userType: ctx.session.user.userType,
          entityType: "notification",
          metadata: {
            templateId: template.id,
            title,
          },
        });
      }

      // Queue email
      if (activeChannels.includes("email")) {
        // TODO: Send via email service
        await logEvent(EventTypes.EMAIL_NOTIFICATION_QUEUED, {
          userId: targetUserId,
          userType: ctx.session.user.userType,
          entityType: "notification",
          metadata: {
            templateId: template.id,
            title,
          },
        });
      }

      // Log notification sent
      await logEvent(EventTypes.NOTIFICATION_SENT, {
        userId: targetUserId,
        userType: ctx.session.user.userType,
        entityType: "notification",
        metadata: {
          templateId: template.id,
          channels: activeChannels,
          category: template.category,
          priority: template.priority,
        },
      });

      return {
        sent: true,
        channels: activeChannels,
        templateId: template.id,
      };
    }),

  /**
   * Send loss-framing notifications for at-risk users (cron job endpoint)
   */
  sendAtRiskNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    // This would typically be called by a cron job
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find users with streaks at risk (active yesterday, not today)
    const atRiskStreaks = await ctx.prisma.streak.findMany({
      where: {
        currentStreak: { gt: 3 }, // Only notify for meaningful streaks
        lastActivityDate: {
          gte: yesterday,
          lt: today,
        },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      take: 100, // Batch limit
    });

    let sentCount = 0;

    for (const streak of atRiskStreaks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streakData = streak as any;

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: streakData.user?.id,
          templateId: "streak_at_risk",
          title: `🔥 Don't break your ${streakData.currentStreak}-day streak!`,
          body: "You haven't been active today. Just one quick action keeps your streak alive!",
          ctaText: "Keep Streak Alive",
          ctaUrl: "/dashboard",
          category: "streak",
          priority: "high",
          channels: ["push", "inApp"],
        },
      });

      await logEvent(EventTypes.LOSS_FRAME_NOTIFICATION_SENT, {
        userId: streakData.user?.id,
        userType: "STUDENT",
        entityType: "streak",
        metadata: {
          type: "streak_at_risk",
          currentStreak: streakData.currentStreak,
        },
      });

      sentCount++;
    }

    return { sentCount, type: "streak_at_risk" };
  }),

  /**
   * Get notification preferences
   */
  getPreferences: studentProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.prisma.notificationPreference.findUnique({
      where: { userId: ctx.session.user.id },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefsData = prefs as any;

    // Return defaults if no preferences set
    return {
      push: {
        enabled: prefsData?.pushEnabled ?? true,
        categories: prefsData?.pushCategories || {},
        quietHoursStart: prefsData?.quietHoursStart,
        quietHoursEnd: prefsData?.quietHoursEnd,
      },
      email: {
        enabled: prefsData?.emailEnabled ?? true,
        categories: prefsData?.emailCategories || {},
        frequency: prefsData?.emailFrequency || "instant",
      },
      inApp: {
        enabled: prefsData?.inAppEnabled ?? true,
      },
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: studentProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          pushEnabled: input.push?.enabled ?? true,
          pushCategories: input.push?.categories || {},
          quietHoursStart: input.push?.quietHoursStart,
          quietHoursEnd: input.push?.quietHoursEnd,
          emailEnabled: input.email?.enabled ?? true,
          emailCategories: input.email?.categories || {},
          emailFrequency: input.email?.frequency || "instant",
          inAppEnabled: input.inApp?.enabled ?? true,
        },
        update: {
          pushEnabled: input.push?.enabled,
          pushCategories: input.push?.categories,
          quietHoursStart: input.push?.quietHoursStart,
          quietHoursEnd: input.push?.quietHoursEnd,
          emailEnabled: input.email?.enabled,
          emailCategories: input.email?.categories,
          emailFrequency: input.email?.frequency,
          inAppEnabled: input.inApp?.enabled,
        },
      });

      await logEvent(EventTypes.NOTIFICATION_PREFERENCES_UPDATED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "preferences",
        metadata: {
          push: input.push,
          email: input.email,
          inApp: input.inApp,
        },
      });

      return { success: true };
    }),

  /**
   * Get notification performance metrics (for analytics)
   */
  getMetrics: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(7),
      templateId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        createdAt: { gte: startDate },
      };

      if (input?.templateId) {
        whereClause.templateId = input.templateId;
      }

      // Get counts
      const [total, read, clicked] = await Promise.all([
        ctx.prisma.notification.count({ where: whereClause }),
        ctx.prisma.notification.count({ where: { ...whereClause, readAt: { not: null } } }),
        ctx.prisma.notification.count({ where: { ...whereClause, clickedAt: { not: null } } }),
      ]);

      // Get by category
      const byCategory = await ctx.prisma.notification.groupBy({
        by: ["category"],
        where: whereClause,
        _count: true,
      });

      // Get by template
      const byTemplate = await ctx.prisma.notification.groupBy({
        by: ["templateId"],
        where: whereClause,
        _count: true,
      });

      return {
        period: `Last ${days} days`,
        total,
        read,
        clicked,
        readRate: total > 0 ? Math.round((read / total) * 100) : 0,
        clickRate: total > 0 ? Math.round((clicked / total) * 100) : 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        byCategory: byCategory.map((c: any) => ({
          category: c.category,
          count: c._count,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        byTemplate: byTemplate.map((t: any) => ({
          templateId: t.templateId,
          count: t._count,
        })),
      };
    }),

  /**
   * Delete a notification
   */
  delete: protectedProcedure
    .input(z.object({
      notificationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: {
          id: input.notificationId,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await ctx.prisma.notification.delete({
        where: { id: input.notificationId },
      });

      return { success: true };
    }),
});
