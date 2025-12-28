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
  companyProcedure,
  collegeAdminProcedure,
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

  return Math.min(score, 90);
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
      ],
      totalPoints: 90,
      earnedPoints: calculateProfileCompletion(profile),
    };
  }),

  // ============================================================================
  // COMPANY PROFILE OPERATIONS
  // ============================================================================

  /**
   * Update company profile (for company onboarding)
   */
  updateCompanyProfile: companyProcedure
    .input(
      z.object({
        companyName: z.string().min(1).max(200),
        industry: z.string().optional(),
        companySize: z.string().optional(),
        website: z.string().url().optional().nullable(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        description: z.string().optional(),
        headquarters: z.string().optional(),
        logoUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const companyProfile = await ctx.prisma.companyProfile.findUnique({
        where: { userId },
      });

      if (!companyProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company profile not found",
        });
      }

      const updatedProfile = await ctx.prisma.companyProfile.update({
        where: { userId },
        data: {
          companyName: input.companyName,
          industry: input.industry,
          companySize: input.companySize,
          website: input.website,
          contactName: input.contactName,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          description: input.description,
          headquarters: input.headquarters,
          logoUrl: input.logoUrl,
        },
      });

      // Log company profile update
      await logEvent(EventTypes.PROFILE_UPDATE, {
        userId,
        userType: ctx.session.user.userType,
        metadata: {
          entityType: "company",
          fieldsUpdated: Object.keys(input),
        },
      });

      return { success: true, profile: updatedProfile };
    }),

  /**
   * Get company profile
   */
  getCompanyProfile: companyProcedure.query(async ({ ctx }) => {
    const companyProfile = await ctx.prisma.companyProfile.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        opportunities: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!companyProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company profile not found",
      });
    }

    return { profile: companyProfile };
  }),

  // ============================================================================
  // COLLEGE ADMIN OPERATIONS
  // ============================================================================

  /**
   * Create or update college (for college onboarding)
   */
  setupCollege: collegeAdminProcedure
    .input(
      z.object({
        collegeName: z.string().min(1).max(200),
        shortName: z.string().max(50).optional(),
        type: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        website: z.string().url().optional().nullable(),
        establishedYear: z.number().min(1800).max(2030).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Generate URL-friendly slug from college name
      const generateSlug = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single
          .slice(0, 50); // Limit length
      };

      // Check if user already has a college admin record
      const collegeAdmin = await ctx.prisma.collegeAdmin.findUnique({
        where: { userId },
        include: { college: true },
      });

      let college;

      if (collegeAdmin?.college) {
        // Update existing college (preserve existing slug if present)
        const existingSlug = collegeAdmin.college.slug;
        college = await ctx.prisma.college.update({
          where: { id: collegeAdmin.collegeId },
          data: {
            name: input.collegeName,
            shortName: input.shortName,
            slug: existingSlug || generateSlug(input.collegeName),
            type: input.type,
            city: input.city,
            state: input.state,
            website: input.website,
            establishedYear: input.establishedYear,
          },
        });
      } else {
        // Generate unique slug
        const baseSlug = generateSlug(input.collegeName);
        let slug = baseSlug;
        let counter = 1;

        // Check for existing slugs and make unique if needed
        while (await ctx.prisma.college.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Create new college and link to admin
        college = await ctx.prisma.college.create({
          data: {
            name: input.collegeName,
            shortName: input.shortName,
            slug,
            type: input.type,
            city: input.city,
            state: input.state,
            website: input.website,
            establishedYear: input.establishedYear,
          },
        });

        // Create or update college admin record
        if (collegeAdmin) {
          await ctx.prisma.collegeAdmin.update({
            where: { userId },
            data: { collegeId: college.id },
          });
        } else {
          await ctx.prisma.collegeAdmin.create({
            data: {
              userId,
              collegeId: college.id,
              role: "admin",
            },
          });
        }
      }

      // Log college setup
      await logEvent(EventTypes.PROFILE_UPDATE, {
        userId,
        userType: ctx.session.user.userType,
        metadata: {
          entityType: "college",
          collegeId: college.id,
          fieldsUpdated: Object.keys(input),
        },
      });

      return { success: true, college };
    }),

  /**
   * Get college profile for admin
   */
  getCollegeProfile: collegeAdminProcedure.query(async ({ ctx }) => {
    const collegeAdmin = await ctx.prisma.collegeAdmin.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        college: {
          include: {
            profiles: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!collegeAdmin?.college) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "College not found. Please complete onboarding.",
      });
    }

    return { college: collegeAdmin.college, role: collegeAdmin.role };
  }),
});
