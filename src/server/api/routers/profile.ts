/**
 * Profile Router
 * Handles student profile CRUD with completion tracking
 * Profile completion drives engagement and data quality
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  studentProcedure,
  publicProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes, logGamificationEvent } from "@/lib/events";

// ============================================================================
// PROFILE COMPLETION CALCULATION
// ============================================================================

interface ProfileData {
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  collegeName: string | null;
  degree: string | null;
  graduationYear: number | null;
  resumeUrl: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
}

const PROFILE_WEIGHTS = {
  firstName: 10,
  lastName: 10,
  avatarUrl: 5,
  bio: 10,
  city: 5,
  collegeName: 10,
  degree: 10,
  graduationYear: 5,
  resumeUrl: 15,
  skills: 10, // At least 3 skills
  linkedinUrl: 5,
  githubUrl: 5,
};

function calculateProfileCompletion(profile: ProfileData): number {
  let score = 0;

  if (profile.firstName) score += PROFILE_WEIGHTS.firstName;
  if (profile.lastName) score += PROFILE_WEIGHTS.lastName;
  if (profile.avatarUrl) score += PROFILE_WEIGHTS.avatarUrl;
  if (profile.bio && profile.bio.length >= 50) score += PROFILE_WEIGHTS.bio;
  if (profile.city) score += PROFILE_WEIGHTS.city;
  if (profile.collegeName) score += PROFILE_WEIGHTS.collegeName;
  if (profile.degree) score += PROFILE_WEIGHTS.degree;
  if (profile.graduationYear) score += PROFILE_WEIGHTS.graduationYear;
  if (profile.resumeUrl) score += PROFILE_WEIGHTS.resumeUrl;
  if (profile.skills.length >= 3) score += PROFILE_WEIGHTS.skills;
  if (profile.linkedinUrl) score += PROFILE_WEIGHTS.linkedinUrl;
  if (profile.githubUrl) score += PROFILE_WEIGHTS.githubUrl;

  return Math.min(score, 100);
}

function getCompletionStatus(percentage: number): "INCOMPLETE" | "BASIC" | "COMPLETE" | "VERIFIED" {
  if (percentage < 30) return "INCOMPLETE";
  if (percentage < 70) return "BASIC";
  return "COMPLETE";
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  displayName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  dateOfBirth: z.coerce.date().optional(),

  // Location
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),

  // Education
  collegeName: z.string().max(200).optional(),
  degree: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  graduationYear: z.number().min(1990).max(2035).optional(),
  cgpa: z.number().min(0).max(10).optional(),

  // Links
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),

  // Skills & Preferences
  skills: z.array(z.string()).max(20).optional(),
  preferredRoles: z.array(z.string()).max(10).optional(),
  preferredLocations: z.array(z.string()).max(10).optional(),
  expectedSalaryMin: z.number().min(0).optional(),
  expectedSalaryMax: z.number().min(0).optional(),
  openToRemote: z.boolean().optional(),
  openToRelocation: z.boolean().optional(),

  // Visibility
  isPublic: z.boolean().optional(),
  isSearchable: z.boolean().optional(),
  showOnLeaderboard: z.boolean().optional(),
});

// ============================================================================
// ROUTER
// ============================================================================

export const profileRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  get: studentProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        experiences: {
          orderBy: { startDate: "desc" },
        },
        education: {
          orderBy: { startYear: "desc" },
        },
        certifications: {
          orderBy: { issueDate: "desc" },
        },
        college: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            overallRank: true,
          },
        },
      },
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found",
      });
    }

    return profile;
  }),

  /**
   * Get public profile by user ID
   */
  getPublic: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: {
          userId: input.userId,
          isPublic: true,
        },
        select: {
          firstName: true,
          lastName: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          city: true,
          state: true,
          collegeName: true,
          degree: true,
          graduationYear: true,
          skills: true,
          linkedinUrl: true,
          githubUrl: true,
          portfolioUrl: true,
          layersRankOverall: true,
          layersRankTechnical: true,
          layersRankBehavioral: true,
          layersRankContextual: true,
          currentLevel: true,
          user: {
            select: {
              badges: {
                where: { isDisplayed: true },
                include: {
                  badge: true,
                },
                take: 6,
              },
            },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found or is private",
        });
      }

      // Log profile view event
      if (ctx.session?.user?.id) {
        await logEvent(EventTypes.PROFILE_VIEW, {
          userId: ctx.session.user.id,
          userType: ctx.session.user.userType,
          entityType: "profile",
          entityId: input.userId,
        });
      }

      return profile;
    }),

  /**
   * Update profile
   */
  update: studentProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get current profile for comparison
      const currentProfile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: {
          profileCompletionPct: true,
          completionStatus: true,
        },
      }) as { profileCompletionPct: number; completionStatus: string } | null;

      if (!currentProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      // Update profile
      const updatedProfile = await ctx.prisma.profile.update({
        where: { userId },
        data: {
          ...input,
          lastActiveAt: new Date(),
        },
      }) as ProfileData & { id: string };

      // Calculate new completion percentage
      const newCompletion = calculateProfileCompletion({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        avatarUrl: updatedProfile.avatarUrl,
        bio: updatedProfile.bio,
        city: updatedProfile.city,
        collegeName: updatedProfile.collegeName,
        degree: updatedProfile.degree,
        graduationYear: updatedProfile.graduationYear,
        resumeUrl: updatedProfile.resumeUrl,
        skills: updatedProfile.skills,
        linkedinUrl: updatedProfile.linkedinUrl,
        githubUrl: updatedProfile.githubUrl,
      });

      const newStatus = getCompletionStatus(newCompletion);

      // Update completion stats
      await ctx.prisma.profile.update({
        where: { userId },
        data: {
          profileCompletionPct: newCompletion,
          completionStatus: newStatus,
        },
      });

      // Log profile update event
      await logEvent(EventTypes.PROFILE_UPDATE, {
        userId,
        userType: ctx.session.user.userType,
        metadata: {
          fieldsUpdated: Object.keys(input),
          previousCompletion: currentProfile.profileCompletionPct,
          newCompletion,
        },
      });

      // Check for profile completion milestone
      if (
        newCompletion >= 100 &&
        currentProfile.profileCompletionPct < 100
      ) {
        await logEvent(EventTypes.PROFILE_COMPLETE, {
          userId,
          userType: ctx.session.user.userType,
        });

        // Award XP for profile completion
        await ctx.prisma.profile.update({
          where: { userId },
          data: {
            totalXp: { increment: 50 },
          },
        });

        await logGamificationEvent(userId, "XP_EARNED", {
          xpAmount: 50,
        });
      }

      return {
        success: true,
        profile: updatedProfile,
        completion: newCompletion,
      };
    }),

  /**
   * Upload resume
   */
  uploadResume: studentProcedure
    .input(z.object({ resumeUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.prisma.profile.update({
        where: { userId },
        data: {
          resumeUrl: input.resumeUrl,
          resumeUpdatedAt: new Date(),
        },
      });

      // Log resume upload event
      await logEvent(EventTypes.RESUME_UPLOAD, {
        userId,
        userType: ctx.session.user.userType,
      });

      return { success: true };
    }),

  /**
   * Add skill
   */
  addSkill: studentProcedure
    .input(z.object({ skill: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { skills: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      if (profile.skills.length >= 20) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 20 skills allowed",
        });
      }

      if (profile.skills.includes(input.skill)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Skill already added",
        });
      }

      await ctx.prisma.profile.update({
        where: { userId },
        data: {
          skills: { push: input.skill },
        },
      });

      // Log skill add event
      await logEvent(EventTypes.SKILL_ADD, {
        userId,
        userType: ctx.session.user.userType,
        metadata: { skill: input.skill },
      });

      return { success: true };
    }),

  /**
   * Remove skill
   */
  removeSkill: studentProcedure
    .input(z.object({ skill: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { skills: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      await ctx.prisma.profile.update({
        where: { userId },
        data: {
          skills: profile.skills.filter((s: string) => s !== input.skill),
        },
      });

      // Log skill remove event
      await logEvent(EventTypes.SKILL_REMOVE, {
        userId,
        userType: ctx.session.user.userType,
        metadata: { skill: input.skill },
      });

      return { success: true };
    }),

  /**
   * Add experience
   */
  addExperience: studentProcedure
    .input(
      z.object({
        company: z.string().min(1).max(100),
        title: z.string().min(1).max(100),
        location: z.string().max(100).optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        isCurrent: z.boolean().default(false),
        description: z.string().max(2000).optional(),
        skills: z.array(z.string()).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      const experience = await ctx.prisma.experience.create({
        data: {
          profileId: profile.id,
          ...input,
          skills: input.skills ?? [],
        },
      });

      // Log experience add event
      await logEvent(EventTypes.EXPERIENCE_ADD, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "experience",
        entityId: experience.id,
      });

      return { success: true, experience };
    }),

  /**
   * Get profile stats (for dashboard)
   */
  getStats: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [profile, applications, badges, placements] = await Promise.all([
      ctx.prisma.profile.findUnique({
        where: { userId },
        select: {
          profileCompletionPct: true,
          currentLevel: true,
          totalXp: true,
          currentStreak: true,
          longestStreak: true,
          layersRankOverall: true,
          collegeName: true,
          graduationYear: true,
        },
      }),
      ctx.prisma.application.count({
        where: { userId },
      }),
      ctx.prisma.userBadge.count({
        where: { userId },
      }),
      ctx.prisma.placement.count({
        where: { userId },
      }),
    ]);

    return {
      profile,
      stats: {
        applications,
        badges,
        placements,
      },
    };
  }),

  /**
   * Get completion checklist
   */
  getCompletionChecklist: studentProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.session.user.id },
      select: {
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        city: true,
        collegeName: true,
        degree: true,
        graduationYear: true,
        resumeUrl: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
      },
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found",
      });
    }

    return {
      items: [
        {
          id: "name",
          label: "Add your name",
          completed: !!(profile.firstName && profile.lastName),
          points: 20,
        },
        {
          id: "avatar",
          label: "Upload a profile photo",
          completed: !!profile.avatarUrl,
          points: 5,
        },
        {
          id: "bio",
          label: "Write a bio (50+ characters)",
          completed: !!(profile.bio && profile.bio.length >= 50),
          points: 10,
        },
        {
          id: "location",
          label: "Add your location",
          completed: !!profile.city,
          points: 5,
        },
        {
          id: "education",
          label: "Add education details",
          completed: !!(profile.collegeName && profile.degree && profile.graduationYear),
          points: 25,
        },
        {
          id: "resume",
          label: "Upload your resume",
          completed: !!profile.resumeUrl,
          points: 15,
        },
        {
          id: "skills",
          label: "Add at least 3 skills",
          completed: profile.skills.length >= 3,
          points: 10,
        },
        {
          id: "linkedin",
          label: "Connect LinkedIn",
          completed: !!profile.linkedinUrl,
          points: 5,
        },
        {
          id: "github",
          label: "Connect GitHub",
          completed: !!profile.githubUrl,
          points: 5,
        },
      ],
      totalPoints: 100,
      earnedPoints: calculateProfileCompletion(profile),
    };
  }),
});
