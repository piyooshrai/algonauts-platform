/**
 * Badges Router
 *
 * Game theory: Badges create collection psychology and social proof
 *
 * 15+ Badges:
 * - Profile badges: Complete Profile, Verified Email, Photo Added
 * - Activity badges: First Application, 10 Applications, 50 Applications
 * - Streak badges: 7-Day Streak, 30-Day Streak, 100-Day Streak
 * - Placement badges: First Placement, Verified 30-Day, Verified 90-Day
 * - Social badges: First Referral, 5 Referrals, Community Helper
 * - Skill badges: Assessment Master, Top 10% in Skill
 * - Elite badges: Top 1% National, College Champion
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
// BADGE DEFINITIONS - THE COLLECTION
// ============================================================================

export const BADGES = {
  // Profile Completion Badges
  COMPLETE_PROFILE: {
    id: "complete_profile",
    name: "Profile Pro",
    description: "Completed your profile 100%",
    icon: "👤",
    xpReward: 50,
    category: "profile",
    rarity: "common",
  },
  VERIFIED_EMAIL: {
    id: "verified_email",
    name: "Verified",
    description: "Verified your email address",
    icon: "✅",
    xpReward: 25,
    category: "profile",
    rarity: "common",
  },
  PHOTO_ADDED: {
    id: "photo_added",
    name: "Picture Perfect",
    description: "Added a profile photo",
    icon: "📸",
    xpReward: 15,
    category: "profile",
    rarity: "common",
  },
  RESUME_UPLOADED: {
    id: "resume_uploaded",
    name: "Resume Ready",
    description: "Uploaded your resume",
    icon: "📄",
    xpReward: 30,
    category: "profile",
    rarity: "common",
  },

  // Activity Badges
  FIRST_APPLICATION: {
    id: "first_application",
    name: "First Step",
    description: "Submitted your first application",
    icon: "🚀",
    xpReward: 50,
    category: "activity",
    rarity: "common",
  },
  TEN_APPLICATIONS: {
    id: "ten_applications",
    name: "Go-Getter",
    description: "Submitted 10 applications",
    icon: "🎯",
    xpReward: 100,
    category: "activity",
    rarity: "uncommon",
  },
  FIFTY_APPLICATIONS: {
    id: "fifty_applications",
    name: "Unstoppable",
    description: "Submitted 50 applications",
    icon: "💪",
    xpReward: 250,
    category: "activity",
    rarity: "rare",
  },
  HUNDRED_APPLICATIONS: {
    id: "hundred_applications",
    name: "Application Legend",
    description: "Submitted 100 applications",
    icon: "🏆",
    xpReward: 500,
    category: "activity",
    rarity: "epic",
  },

  // Streak Badges
  STREAK_7: {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintained a 7-day activity streak",
    icon: "🔥",
    xpReward: 75,
    category: "streak",
    rarity: "uncommon",
  },
  STREAK_30: {
    id: "streak_30",
    name: "Monthly Master",
    description: "Maintained a 30-day activity streak",
    icon: "⚡",
    xpReward: 200,
    category: "streak",
    rarity: "rare",
  },
  STREAK_100: {
    id: "streak_100",
    name: "Century Champion",
    description: "Maintained a 100-day activity streak",
    icon: "👑",
    xpReward: 500,
    category: "streak",
    rarity: "legendary",
  },

  // Placement Badges - THE MOST VALUABLE
  FIRST_PLACEMENT: {
    id: "first_placement",
    name: "Placed!",
    description: "Got your first placement",
    icon: "🎉",
    xpReward: 200,
    category: "placement",
    rarity: "rare",
  },
  VERIFIED_30_DAY: {
    id: "verified_30_day",
    name: "30-Day Verified",
    description: "Completed 30-day placement verification",
    icon: "✨",
    xpReward: 150,
    category: "placement",
    rarity: "rare",
  },
  VERIFIED_90_DAY: {
    id: "verified_90_day",
    name: "90-Day Champion",
    description: "Completed 90-day placement verification - THE GOLD",
    icon: "🏅",
    xpReward: 300,
    category: "placement",
    rarity: "epic",
  },

  // Social/Referral Badges
  FIRST_REFERRAL: {
    id: "first_referral",
    name: "Connector",
    description: "Referred your first friend",
    icon: "🤝",
    xpReward: 100,
    category: "social",
    rarity: "uncommon",
  },
  FIVE_REFERRALS: {
    id: "five_referrals",
    name: "Network Builder",
    description: "Referred 5 friends",
    icon: "🌐",
    xpReward: 300,
    category: "social",
    rarity: "rare",
  },
  COMMUNITY_HELPER: {
    id: "community_helper",
    name: "Community Hero",
    description: "Helped 10 peers with advice",
    icon: "💡",
    xpReward: 200,
    category: "social",
    rarity: "rare",
  },

  // Skill/Assessment Badges
  FIRST_ASSESSMENT: {
    id: "first_assessment",
    name: "Skill Seeker",
    description: "Completed your first assessment",
    icon: "📝",
    xpReward: 50,
    category: "skill",
    rarity: "common",
  },
  ASSESSMENT_MASTER: {
    id: "assessment_master",
    name: "Assessment Master",
    description: "Completed all available assessments",
    icon: "🎓",
    xpReward: 250,
    category: "skill",
    rarity: "rare",
  },
  TOP_10_PERCENT_SKILL: {
    id: "top_10_percent_skill",
    name: "Top 10%",
    description: "Ranked in top 10% for a skill",
    icon: "⭐",
    xpReward: 150,
    category: "skill",
    rarity: "rare",
  },

  // Elite Badges
  TOP_1_PERCENT_NATIONAL: {
    id: "top_1_percent_national",
    name: "National Elite",
    description: "Ranked in top 1% nationally",
    icon: "🇮🇳",
    xpReward: 500,
    category: "elite",
    rarity: "legendary",
  },
  COLLEGE_CHAMPION: {
    id: "college_champion",
    name: "College Champion",
    description: "#1 in your college leaderboard",
    icon: "🏆",
    xpReward: 300,
    category: "elite",
    rarity: "epic",
  },
  EARLY_ADOPTER: {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined during beta period",
    icon: "🌟",
    xpReward: 100,
    category: "special",
    rarity: "rare",
  },
} as const;

export type BadgeId = keyof typeof BADGES;

// ============================================================================
// SCHEMAS
// ============================================================================

const checkAndAwardBadgeSchema = z.object({
  badgeId: z.string(),
  userId: z.string().optional(), // For system-triggered awards
});

const getBadgesSchema = z.object({
  userId: z.string().optional(),
  category: z.enum(["profile", "activity", "streak", "placement", "social", "skill", "elite", "special"]).optional(),
});

// ============================================================================
// BADGE ROUTER
// ============================================================================

export const badgesRouter = createTRPCRouter({
  /**
   * Get all available badges with earned status
   */
  getAll: protectedProcedure
    .input(getBadgesSchema.optional())
    .query(async ({ ctx, input }) => {
      const userId = input?.userId || ctx.session.user.id;

      // Get user's earned badges
      const earnedBadges = await ctx.prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true, earnedAt: true },
      });

      const earnedMap = new Map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        earnedBadges.map((b: any) => [b.badgeId, b.earnedAt])
      );

      // Log badge gallery view
      await logEvent(EventTypes.BADGE_GALLERY_VIEWED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "badges",
        metadata: {
          totalBadges: Object.keys(BADGES).length,
          earnedCount: earnedBadges.length,
          category: input?.category,
        },
      });

      // Return all badges with earned status
      let badges = Object.entries(BADGES).map(([key, badge]) => ({
        ...badge,
        key,
        earned: earnedMap.has(badge.id),
        earnedAt: earnedMap.get(badge.id) || null,
      }));

      // Filter by category if specified
      if (input?.category) {
        badges = badges.filter(b => b.category === input.category);
      }

      // Sort: earned first, then by rarity
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
      badges.sort((a, b) => {
        if (a.earned && !b.earned) return -1;
        if (!a.earned && b.earned) return 1;
        return rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder];
      });

      return {
        badges,
        stats: {
          total: Object.keys(BADGES).length,
          earned: earnedBadges.length,
          completion: Math.round((earnedBadges.length / Object.keys(BADGES).length) * 100),
        },
      };
    }),

  /**
   * Get user's earned badges
   */
  getEarned: studentProcedure.query(async ({ ctx }) => {
    const badges = await ctx.prisma.userBadge.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { earnedAt: "desc" },
    });

    // Log view
    await logEvent(EventTypes.BADGES_VIEWED, {
      userId: ctx.session.user.id,
      userType: ctx.session.user.userType,
      entityType: "badges",
      metadata: {
        count: badges.length,
      },
    });

    // Enrich with badge details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return badges.map((b: any) => {
      const badgeKey = Object.keys(BADGES).find(
        key => BADGES[key as BadgeId].id === b.badgeId
      ) as BadgeId | undefined;

      const badgeInfo = badgeKey ? BADGES[badgeKey] : null;

      return {
        ...b,
        details: badgeInfo,
      };
    });
  }),

  /**
   * Check if user qualifies for a badge and award if so
   * This is called by other routers when events happen
   */
  checkAndAward: protectedProcedure
    .input(checkAndAwardBadgeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = input.userId || ctx.session.user.id;
      const badgeKey = Object.keys(BADGES).find(
        key => BADGES[key as BadgeId].id === input.badgeId
      ) as BadgeId | undefined;

      if (!badgeKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Badge not found",
        });
      }

      const badge = BADGES[badgeKey];

      // Check if already earned
      const existing = await ctx.prisma.userBadge.findFirst({
        where: {
          userId,
          badgeId: badge.id,
        },
      });

      if (existing) {
        return { awarded: false, reason: "Already earned" };
      }

      // Award the badge
      await ctx.prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });

      // Update user's XP
      await ctx.prisma.profile.update({
        where: { userId },
        data: {
          xpTotal: { increment: badge.xpReward },
        },
      });

      // LOG THE EVENT - CRITICAL
      await logEvent(EventTypes.BADGE_EARNED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "badge",
        entityId: badge.id,
        metadata: {
          badgeName: badge.name,
          category: badge.category,
          rarity: badge.rarity,
          xpAwarded: badge.xpReward,
        },
      });

      return {
        awarded: true,
        badge: {
          ...badge,
          earnedAt: new Date(),
        },
      };
    }),

  /**
   * Check all badges for a user based on their current state
   * Call this periodically or after significant events
   */
  checkAllBadges: studentProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const awardedBadges: string[] = [];

    // Get user's current state
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId },
    });

    const applicationCount = await ctx.prisma.application.count({
      where: { userId, status: "SUBMITTED" },
    });

    const placementCount = await ctx.prisma.placement.count({
      where: { userId },
    });

    const verified30Count = await ctx.prisma.placement.count({
      where: { userId, verification30CompletedAt: { not: null } },
    });

    const verified90Count = await ctx.prisma.placement.count({
      where: { userId, verification90CompletedAt: { not: null } },
    });

    const referralCount = await ctx.prisma.invite.count({
      where: {
        referredByUserId: userId,
        status: "ACCEPTED",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streak = (profile as any)?.currentStreak || 0;

    // Get already earned badges
    const earnedBadges = await ctx.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const earnedSet = new Set(earnedBadges.map((b: any) => b.badgeId));

    // Helper to award badge if not already earned
    const maybeAward = async (badgeKey: BadgeId) => {
      const badge = BADGES[badgeKey];
      if (earnedSet.has(badge.id)) return;

      await ctx.prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });

      await ctx.prisma.profile.update({
        where: { userId },
        data: { xpTotal: { increment: badge.xpReward } },
      });

      await logEvent(EventTypes.BADGE_EARNED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "badge",
        entityId: badge.id,
        metadata: {
          badgeName: badge.name,
          category: badge.category,
          rarity: badge.rarity,
          xpAwarded: badge.xpReward,
          source: "batch_check",
        },
      });

      awardedBadges.push(badge.id);
      earnedSet.add(badge.id);
    };

    // Check profile badges
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((profile as any)?.profileCompletionPercent >= 100) {
      await maybeAward("COMPLETE_PROFILE");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((profile as any)?.emailVerified) {
      await maybeAward("VERIFIED_EMAIL");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((profile as any)?.avatarUrl) {
      await maybeAward("PHOTO_ADDED");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((profile as any)?.resumeUrl) {
      await maybeAward("RESUME_UPLOADED");
    }

    // Check application badges
    if (applicationCount >= 1) await maybeAward("FIRST_APPLICATION");
    if (applicationCount >= 10) await maybeAward("TEN_APPLICATIONS");
    if (applicationCount >= 50) await maybeAward("FIFTY_APPLICATIONS");
    if (applicationCount >= 100) await maybeAward("HUNDRED_APPLICATIONS");

    // Check streak badges
    if (streak >= 7) await maybeAward("STREAK_7");
    if (streak >= 30) await maybeAward("STREAK_30");
    if (streak >= 100) await maybeAward("STREAK_100");

    // Check placement badges - THE MOST VALUABLE
    if (placementCount >= 1) await maybeAward("FIRST_PLACEMENT");
    if (verified30Count >= 1) await maybeAward("VERIFIED_30_DAY");
    if (verified90Count >= 1) await maybeAward("VERIFIED_90_DAY");

    // Check referral badges
    if (referralCount >= 1) await maybeAward("FIRST_REFERRAL");
    if (referralCount >= 5) await maybeAward("FIVE_REFERRALS");

    return {
      checked: Object.keys(BADGES).length,
      awarded: awardedBadges.length,
      newBadges: awardedBadges,
    };
  }),

  /**
   * Get badge progress for unlocked badges
   */
  getProgress: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user's current stats
    const applicationCount = await ctx.prisma.application.count({
      where: { userId, status: "SUBMITTED" },
    });

    const profile = await ctx.prisma.profile.findUnique({
      where: { userId },
    });

    const referralCount = await ctx.prisma.invite.count({
      where: {
        referredByUserId: userId,
        status: "ACCEPTED",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streak = (profile as any)?.currentStreak || 0;

    // Calculate progress for each milestone badge
    const progress = [
      {
        badge: BADGES.TEN_APPLICATIONS,
        current: applicationCount,
        target: 10,
        percent: Math.min(100, (applicationCount / 10) * 100),
      },
      {
        badge: BADGES.FIFTY_APPLICATIONS,
        current: applicationCount,
        target: 50,
        percent: Math.min(100, (applicationCount / 50) * 100),
      },
      {
        badge: BADGES.STREAK_7,
        current: streak,
        target: 7,
        percent: Math.min(100, (streak / 7) * 100),
      },
      {
        badge: BADGES.STREAK_30,
        current: streak,
        target: 30,
        percent: Math.min(100, (streak / 30) * 100),
      },
      {
        badge: BADGES.FIVE_REFERRALS,
        current: referralCount,
        target: 5,
        percent: Math.min(100, (referralCount / 5) * 100),
      },
    ];

    // Filter out completed ones and sort by closest to completion
    const inProgress = progress
      .filter(p => p.percent < 100)
      .sort((a, b) => b.percent - a.percent);

    return inProgress;
  }),

  /**
   * Share a badge - VIRAL LOOPS
   */
  share: studentProcedure
    .input(z.object({
      badgeId: z.string(),
      platform: z.enum(["whatsapp", "instagram", "linkedin", "twitter", "copy"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify badge is earned
      const userBadge = await ctx.prisma.userBadge.findFirst({
        where: {
          userId: ctx.session.user.id,
          badgeId: input.badgeId,
        },
      });

      if (!userBadge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Badge not found or not earned",
        });
      }

      // Get badge details
      const badgeKey = Object.keys(BADGES).find(
        key => BADGES[key as BadgeId].id === input.badgeId
      ) as BadgeId | undefined;

      const badgeInfo = badgeKey ? BADGES[badgeKey] : null;

      // LOG THE SHARE - VIRAL TRACKING
      await logEvent(EventTypes.BADGE_SHARED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "badge",
        entityId: input.badgeId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: input.platform as any,
        metadata: {
          badgeName: badgeInfo?.name,
          platform: input.platform,
          rarity: badgeInfo?.rarity,
        },
      });

      // Award XP for sharing
      await ctx.prisma.profile.update({
        where: { userId: ctx.session.user.id },
        data: { xpTotal: { increment: 5 } },
      });

      // Generate share URL
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/badges/${input.badgeId}?ref=${ctx.session.user.id}`;

      // Generate platform-specific share links
      const shareText = `🏆 I just earned the "${badgeInfo?.name}" badge on Algonauts! ${badgeInfo?.icon}`;

      const shareLinks = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        instagram: shareUrl, // Instagram doesn't have direct share links
        copy: shareUrl,
      };

      return {
        shareUrl,
        shareLink: shareLinks[input.platform],
        shareText,
      };
    }),

  /**
   * Get recent badge earners (social proof)
   */
  getRecentEarners: protectedProcedure
    .input(z.object({
      badgeId: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const badges = await ctx.prisma.userBadge.findMany({
        where: input?.badgeId ? { badgeId: input.badgeId } : undefined,
        orderBy: { earnedAt: "desc" },
        take: input?.limit || 10,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // Log view
      await logEvent(EventTypes.BADGE_EARNERS_VIEWED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "badges",
        metadata: {
          badgeId: input?.badgeId,
          limit: input?.limit,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return badges.map((b: any) => ({
        badgeId: b.badgeId,
        badgeName: b.badgeName,
        badgeIcon: b.badgeIcon,
        earnedAt: b.earnedAt,
        user: {
          id: b.user?.id,
          name: b.user?.name,
          avatarUrl: b.user?.profile?.avatarUrl,
          collegeName: b.user?.profile?.collegeName,
        },
      }));
    }),
});
