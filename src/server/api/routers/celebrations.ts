/**
 * Placement Celebrations Router
 *
 * Game theory: Celebrations create viral loops through social sharing
 *
 * Features:
 * - Beautiful placement card generation
 * - WhatsApp/Instagram/LinkedIn share links
 * - Share tracking for viral analytics
 * - Referral attribution from shares
 * - Templates for different milestones
 *
 * This is a KEY acquisition driver - every share is free marketing!
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
// CELEBRATION TEMPLATES
// ============================================================================

const CELEBRATION_TEMPLATES = {
  PLACEMENT: {
    id: "placement",
    title: "I got placed! 🎉",
    subtitle: "My journey with Algonauts paid off!",
    hashtags: ["#Placed", "#AlgonautsSuccess", "#DreamJob", "#CareerGoals"],
    xpReward: 25,
  },
  VERIFIED_30: {
    id: "verified_30",
    title: "30 Days & Going Strong! 💪",
    subtitle: "Still loving my new role!",
    hashtags: ["#30DaysIn", "#NewJob", "#CareerGrowth", "#AlgonautsVerified"],
    xpReward: 15,
  },
  VERIFIED_90: {
    id: "verified_90",
    title: "90 Days of Success! 🏆",
    subtitle: "Thriving in my dream company!",
    hashtags: ["#90DayMilestone", "#CareerWin", "#AlgonautsAlumni", "#SuccessStory"],
    xpReward: 30,
  },
  OFFER_RECEIVED: {
    id: "offer_received",
    title: "Offer Letter Received! 📨",
    subtitle: "Dreams do come true!",
    hashtags: ["#OfferLetter", "#JobOffer", "#Excited", "#NewBeginnings"],
    xpReward: 20,
  },
  FIRST_SALARY: {
    id: "first_salary",
    title: "First Salary! 💰",
    subtitle: "Hard work pays off!",
    hashtags: ["#FirstSalary", "#Milestone", "#Independence", "#ProudMoment"],
    xpReward: 20,
  },
} as const;

type CelebrationTemplateId = keyof typeof CELEBRATION_TEMPLATES;

// ============================================================================
// CARD STYLES
// ============================================================================

const CARD_STYLES = {
  modern: {
    id: "modern",
    name: "Modern Minimal",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    accentColor: "#ffd700",
  },
  professional: {
    id: "professional",
    name: "Professional Blue",
    gradient: "linear-gradient(135deg, #1a365d 0%, #2563eb 100%)",
    textColor: "#ffffff",
    accentColor: "#60a5fa",
  },
  celebration: {
    id: "celebration",
    name: "Celebration Gold",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    textColor: "#ffffff",
    accentColor: "#fef3c7",
  },
  nature: {
    id: "nature",
    name: "Fresh Green",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    textColor: "#ffffff",
    accentColor: "#6ee7b7",
  },
  bold: {
    id: "bold",
    name: "Bold Pink",
    gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    textColor: "#ffffff",
    accentColor: "#fbcfe8",
  },
};

// ============================================================================
// SCHEMAS
// ============================================================================

const generateCardSchema = z.object({
  placementId: z.string(),
  templateId: z.enum(["placement", "verified_30", "verified_90", "offer_received", "first_salary"]).default("placement"),
  style: z.enum(["modern", "professional", "celebration", "nature", "bold"]).default("modern"),
  includePhoto: z.boolean().default(true),
  includeStats: z.boolean().default(true),
  customMessage: z.string().max(100).optional(),
});

const shareSchema = z.object({
  placementId: z.string(),
  platform: z.enum(["whatsapp", "instagram", "linkedin", "twitter", "facebook", "copy"]),
  cardId: z.string().optional(),
  customMessage: z.string().optional(),
});

const trackShareClickSchema = z.object({
  shareId: z.string(),
  platform: z.string(),
  referrerId: z.string().optional(),
});

// ============================================================================
// CELEBRATIONS ROUTER
// ============================================================================

export const celebrationsRouter = createTRPCRouter({
  /**
   * Get celebration card templates
   */
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    await logEvent(EventTypes.CELEBRATION_TEMPLATES_VIEWED, {
      userId: ctx.session.user.id,
      userType: ctx.session.user.userType,
      entityType: "celebration",
    });

    return {
      templates: Object.entries(CELEBRATION_TEMPLATES).map(([key, template]) => ({
        key,
        ...template,
      })),
      styles: Object.entries(CARD_STYLES).map(([key, style]) => ({
        key,
        ...style,
      })),
    };
  }),

  /**
   * Generate a shareable placement celebration card
   */
  generateCard: studentProcedure
    .input(generateCardSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get placement
      const placement = await ctx.prisma.placement.findFirst({
        where: {
          id: input.placementId,
          userId,
        },
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
            },
          },
          user: {
            select: {
              name: true,
              profile: {
                select: {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const placementData = placement as any;
      const template = CELEBRATION_TEMPLATES[input.templateId.toUpperCase() as CelebrationTemplateId] || CELEBRATION_TEMPLATES.PLACEMENT;
      const style = CARD_STYLES[input.style];

      // Create card record
      const card = await ctx.prisma.celebrationCard.create({
        data: {
          userId,
          placementId: input.placementId,
          templateId: template.id,
          style: input.style,
          cardData: {
            userName: placementData.user?.name || "Student",
            companyName: placementData.company?.name || placementData.companyName,
            companyLogoUrl: placementData.company?.logoUrl,
            role: placementData.role,
            package: placementData.packageLPA,
            collegeName: placementData.user?.profile?.collegeName,
            avatarUrl: input.includePhoto ? placementData.user?.profile?.avatarUrl : null,
            title: template.title,
            subtitle: template.subtitle,
            hashtags: template.hashtags,
            customMessage: input.customMessage,
            styleConfig: style,
            includeStats: input.includeStats,
          },
        },
      });

      // Generate card URL (would actually generate image in production)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/cards/${(card as any).id}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/celebrate/${input.placementId}?card=${(card as any).id}&ref=${userId}`;

      // Log card generation
      await logEvent(EventTypes.CELEBRATION_CARD_GENERATED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "celebration_card",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entityId: (card as any).id,
        metadata: {
          templateId: template.id,
          style: input.style,
          companyName: placementData.company?.name || placementData.companyName,
        },
      });

      // Award XP for generating card
      await ctx.prisma.profile.update({
        where: { userId },
        data: { xpTotal: { increment: 10 } },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cardId: (card as any).id,
        cardUrl,
        shareUrl,
        previewData: {
          userName: placementData.user?.name,
          companyName: placementData.company?.name || placementData.companyName,
          companyLogo: placementData.company?.logoUrl,
          role: placementData.role,
          title: template.title,
          subtitle: template.subtitle,
          hashtags: template.hashtags,
          style,
        },
      };
    }),

  /**
   * Share a celebration
   */
  share: studentProcedure
    .input(shareSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get placement
      const placement = await ctx.prisma.placement.findFirst({
        where: {
          id: input.placementId,
          userId,
        },
        include: {
          company: { select: { name: true } },
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const placementData = placement as any;

      // Create share record for tracking
      const share = await ctx.prisma.share.create({
        data: {
          userId,
          entityType: "placement",
          entityId: input.placementId,
          platform: input.platform,
          cardId: input.cardId,
        },
      });

      // Generate platform-specific share content
      const template = CELEBRATION_TEMPLATES.PLACEMENT;
      const baseMessage = input.customMessage || template.title;
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/celebrate/${input.placementId}?ref=${userId}&share=${(share as unknown as { id: string }).id}`;

      // Compose share text with hashtags
      const companyName = placementData.company?.name || placementData.companyName;
      const shareText = `${baseMessage}\n\n🎉 I got placed at ${companyName}!\n\nCheck out @Algonauts to kickstart your career journey!\n\n${template.hashtags.join(" ")}`;

      // Platform-specific share links
      const shareLinks: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(baseMessage)}&url=${encodeURIComponent(shareUrl)}&hashtags=${template.hashtags.map(h => h.slice(1)).join(",")}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        instagram: shareUrl, // Instagram doesn't support direct sharing
        copy: shareUrl,
      };

      // Update placement share count
      await ctx.prisma.placement.update({
        where: { id: input.placementId },
        data: { shareCount: { increment: 1 } },
      });

      // LOG THE SHARE - CRITICAL FOR VIRAL TRACKING
      await logEvent(EventTypes.CELEBRATION_SHARED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "placement",
        entityId: input.placementId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: input.platform as any,
        metadata: {
          platform: input.platform,
          companyName,
          cardId: input.cardId,
          shareId: (share as unknown as { id: string }).id,
        },
      });

      // Award XP for sharing
      const template2 = CELEBRATION_TEMPLATES.PLACEMENT;
      await ctx.prisma.profile.update({
        where: { userId },
        data: { xpTotal: { increment: template2.xpReward } },
      });

      return {
        shareId: (share as unknown as { id: string }).id,
        shareUrl,
        shareLink: shareLinks[input.platform],
        shareText,
        xpAwarded: template2.xpReward,
      };
    }),

  /**
   * Track when someone clicks on a shared celebration link
   */
  trackShareClick: protectedProcedure
    .input(trackShareClickSchema)
    .mutation(async ({ ctx, input }) => {
      // Update share record with click
      await ctx.prisma.share.update({
        where: { id: input.shareId },
        data: {
          clickCount: { increment: 1 },
          lastClickedAt: new Date(),
        },
      });

      // Log the click - THIS IS GOLD FOR MEASURING VIRAL LOOPS
      await logEvent(EventTypes.CELEBRATION_SHARE_CLICKED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "share",
        entityId: input.shareId,
        metadata: {
          platform: input.platform,
          referrerId: input.referrerId,
        },
      });

      return { tracked: true };
    }),

  /**
   * Track referral conversion from share
   */
  trackReferralConversion: protectedProcedure
    .input(z.object({
      shareId: z.string(),
      referrerId: z.string(),
      conversionType: z.enum(["signup", "application", "placement"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update share with conversion
      await ctx.prisma.share.update({
        where: { id: input.shareId },
        data: {
          conversionCount: { increment: 1 },
          lastConversionAt: new Date(),
        },
      });

      // Credit referrer
      await ctx.prisma.profile.update({
        where: { userId: input.referrerId },
        data: {
          xpTotal: { increment: input.conversionType === "placement" ? 100 : 25 },
          referralCount: { increment: 1 },
        },
      });

      // Log - CRITICAL FOR VIRAL LOOP ATTRIBUTION
      await logEvent(EventTypes.REFERRAL_CONVERSION, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "referral",
        entityId: input.shareId,
        metadata: {
          referrerId: input.referrerId,
          conversionType: input.conversionType,
        },
      });

      return { tracked: true };
    }),

  /**
   * Get share analytics for a placement
   */
  getShareAnalytics: studentProcedure
    .input(z.object({
      placementId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const placement = await ctx.prisma.placement.findFirst({
        where: {
          id: input.placementId,
          userId,
        },
      });

      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }

      // Get share stats
      const shares = await ctx.prisma.share.findMany({
        where: {
          entityType: "placement",
          entityId: input.placementId,
        },
      });

      // Aggregate by platform
      const byPlatform: Record<string, { shares: number; clicks: number; conversions: number }> = {};
      let totalShares = 0;
      let totalClicks = 0;
      let totalConversions = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const share of shares as any[]) {
        if (!byPlatform[share.platform]) {
          byPlatform[share.platform] = { shares: 0, clicks: 0, conversions: 0 };
        }
        byPlatform[share.platform].shares += 1;
        byPlatform[share.platform].clicks += share.clickCount || 0;
        byPlatform[share.platform].conversions += share.conversionCount || 0;

        totalShares += 1;
        totalClicks += share.clickCount || 0;
        totalConversions += share.conversionCount || 0;
      }

      return {
        totalShares,
        totalClicks,
        totalConversions,
        clickRate: totalShares > 0 ? Math.round((totalClicks / totalShares) * 100) : 0,
        conversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 100) : 0,
        byPlatform,
        topPlatform: Object.entries(byPlatform).sort((a, b) => b[1].clicks - a[1].clicks)[0]?.[0] || null,
      };
    }),

  /**
   * Get celebration feed (recent celebrations from college)
   */
  getCollegeCelebrations: studentProcedure
    .input(z.object({
      limit: z.number().min(5).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit || 20;

      // Get user's college
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = profile as any;

      if (!profileData?.collegeId) {
        return { celebrations: [], message: "Join a college to see celebrations" };
      }

      // Get recent placements from college
      const placements = await ctx.prisma.placement.findMany({
        where: {
          user: {
            profile: {
              collegeId: profileData.collegeId,
            },
          },
          status: {
            in: ["PLACED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"],
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          company: {
            select: { name: true, logoUrl: true },
          },
          user: {
            select: {
              name: true,
              profile: {
                select: { avatarUrl: true },
              },
            },
          },
        },
      });

      // Log view
      await logEvent(EventTypes.COLLEGE_CELEBRATIONS_VIEWED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "celebration",
        metadata: {
          collegeId: profileData.collegeId,
          count: placements.length,
        },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        celebrations: placements.map((p: any) => ({
          id: p.id,
          userName: p.user?.name,
          userAvatar: p.user?.profile?.avatarUrl,
          companyName: p.company?.name || p.companyName,
          companyLogo: p.company?.logoUrl,
          role: p.role,
          package: p.packageLPA,
          status: p.status,
          is90DayVerified: p.status === "VERIFICATION_90_COMPLETE",
          createdAt: p.createdAt,
          shareCount: p.shareCount || 0,
        })),
      };
    }),

  /**
   * Get user's own celebration cards
   */
  getMyCards: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const cards = await ctx.prisma.celebrationCard.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        placement: {
          select: {
            companyName: true,
            role: true,
            status: true,
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cards.map((card: any) => ({
      id: card.id,
      templateId: card.templateId,
      style: card.style,
      companyName: card.placement?.companyName,
      role: card.placement?.role,
      createdAt: card.createdAt,
      cardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/cards/${card.id}`,
    }));
  }),

  /**
   * Delete a celebration card
   */
  deleteCard: studentProcedure
    .input(z.object({
      cardId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.celebrationCard.findFirst({
        where: {
          id: input.cardId,
          userId: ctx.session.user.id,
        },
      });

      if (!card) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Card not found",
        });
      }

      await ctx.prisma.celebrationCard.delete({
        where: { id: input.cardId },
      });

      return { deleted: true };
    }),

  /**
   * Get viral metrics (for platform analytics)
   */
  getViralMetrics: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(30),
    }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get share stats
      const shares = await ctx.prisma.share.findMany({
        where: {
          createdAt: { gte: startDate },
          entityType: "placement",
        },
        select: {
          platform: true,
          clickCount: true,
          conversionCount: true,
        },
      });

      // Calculate K-factor (viral coefficient)
      // K = invites sent * conversion rate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalShares = shares.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalClicks = shares.reduce((sum: number, s: any) => sum + (s.clickCount || 0), 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalConversions = shares.reduce((sum: number, s: any) => sum + (s.conversionCount || 0), 0);

      const clickThroughRate = totalShares > 0 ? totalClicks / totalShares : 0;
      const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
      const kFactor = clickThroughRate * conversionRate;

      // Group by platform
      const byPlatform: Record<string, { shares: number; clicks: number; conversions: number }> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shares.forEach((s: any) => {
        if (!byPlatform[s.platform]) {
          byPlatform[s.platform] = { shares: 0, clicks: 0, conversions: 0 };
        }
        byPlatform[s.platform].shares += 1;
        byPlatform[s.platform].clicks += s.clickCount || 0;
        byPlatform[s.platform].conversions += s.conversionCount || 0;
      });

      return {
        period: `Last ${days} days`,
        totalShares,
        totalClicks,
        totalConversions,
        clickThroughRate: Math.round(clickThroughRate * 100),
        conversionRate: Math.round(conversionRate * 100),
        kFactor: kFactor.toFixed(3),
        isViral: kFactor > 1, // K > 1 means viral growth
        byPlatform,
        topPlatform: Object.entries(byPlatform)
          .sort((a, b) => b[1].conversions - a[1].conversions)[0]?.[0] || null,
      };
    }),
});
