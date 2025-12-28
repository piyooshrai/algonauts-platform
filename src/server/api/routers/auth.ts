/**
 * Auth Router
 * Handles user registration, password management, and verification
 */

import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";
import { sendWelcomeEmail } from "@/lib/email";
import type { UserType } from "@/lib/db/types";

const SALT_ROUNDS = 12;

// Validation schemas
const signupSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
  phone: z.string().min(10, "Valid phone number required"),
  userType: z.enum(["STUDENT", "COMPANY", "COLLEGE_ADMIN"]).default("STUDENT"),
  referralCode: z.string().optional(),
  collegeId: z.string().optional(), // Pre-fill college for invite link signups
  companyName: z.string().optional(), // For company signup
  collegeName: z.string().optional(), // For college admin signup
  role: z.string().optional(), // For college admin - their role (placement officer, faculty, etc.)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
});

export const authRouter = createTRPCRouter({
  /**
   * Register a new user
   */
  signup: publicProcedure.input(signupSchema).mutation(async ({ ctx, input }) => {
    // Check if user already exists
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Handle referral if provided
    let referrerId: string | null = null;
    if (input.referralCode) {
      const referral = await ctx.prisma.referral.findUnique({
        where: { code: input.referralCode },
        select: { referrerId: true },
      }) as { referrerId: string } | null;
      if (referral) {
        referrerId = referral.referrerId;
      }
    }

    // Determine verification status based on user type
    // STUDENT: APPROVED (instant access)
    // COMPANY/COLLEGE_ADMIN: PENDING (requires admin approval)
    const verificationStatus = input.userType === "STUDENT" ? "APPROVED" : "PENDING";

    // Create user
    const user = await ctx.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        phone: input.phone,
        userType: input.userType as UserType,
        verificationStatus: verificationStatus as "PENDING" | "APPROVED" | "REJECTED",
      },
      select: {
        id: true,
        email: true,
        userType: true,
        verificationStatus: true,
      },
    }) as { id: string; email: string; userType: UserType; verificationStatus: string };

    // Create profile for students (with college if from invite link)
    if (input.userType === "STUDENT") {
      let collegeName: string | null = null;

      // If collegeId provided (from invite link), fetch college name
      if (input.collegeId) {
        const college = await ctx.prisma.college.findUnique({
          where: { id: input.collegeId },
          select: { name: true },
        });
        collegeName = college?.name || null;

        // Update invite stats for signup tracking
        await ctx.prisma.collegeInviteStats.upsert({
          where: { collegeId: input.collegeId },
          create: { collegeId: input.collegeId, signups: 1 },
          update: { signups: { increment: 1 } },
        });
      }

      await ctx.prisma.profile.create({
        data: {
          userId: user.id,
          collegeId: input.collegeId,
          collegeName,
        },
      });
    }

    // Create company profile for companies
    if (input.userType === "COMPANY") {
      if (!input.companyName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Company name is required for company signup",
        });
      }
      await ctx.prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: input.companyName,
        },
      });
    }

    // Create college admin record for college admins
    // Note: College will be created or linked after admin approval
    if (input.userType === "COLLEGE_ADMIN") {
      if (!input.collegeName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "College name is required for college admin signup",
        });
      }
      // Store college name in a pending colleges table or create the college
      // For now, create the college with a pending status
      const college = await ctx.prisma.college.create({
        data: {
          name: input.collegeName,
          slug: input.collegeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          isPartner: false, // Will be set to true after verification
        },
      });

      await ctx.prisma.collegeAdmin.create({
        data: {
          userId: user.id,
          collegeId: college.id,
          role: input.role || "admin",
        },
      });
    }

    // Handle referral tracking
    if (referrerId) {
      await ctx.prisma.referral.create({
        data: {
          referrerId,
          referredUserId: user.id,
          code: input.referralCode!,
          status: "pending",
        },
      });
    }

    // Log signup event (CRITICAL for acquisition metrics)
    await logEvent(EventTypes.USER_SIGNUP, {
      userId: user.id,
      userType: user.userType,
      metadata: {
        method: "credentials",
        hasReferral: !!referrerId,
        referrerId,
        collegeId: input.collegeId, // Track college invite link signups
        fromInviteLink: !!input.collegeId,
      },
    });

    // Send welcome email (async, don't block on failure)
    sendWelcomeEmail(user.email, user.email.split("@")[0])
      .then((result) => {
        if (result.success) {
          console.log(`[Email] Welcome email sent to ${user.email}`);
        } else {
          console.error(`[Email] Failed to send welcome email to ${user.email}:`, result.error);
        }
      })
      .catch((error) => {
        console.error(`[Email] Error sending welcome email to ${user.email}:`, error);
      });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        verificationStatus: user.verificationStatus,
      },
      // Inform UI if account is pending approval
      isPendingApproval: user.verificationStatus === "PENDING",
    };
  }),

  /**
   * Get current session info
   */
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  /**
   * Get current user with profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        userType: true,
        verificationStatus: true,
        emailVerified: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
            profileCompletionPct: true,
            currentLevel: true,
            totalXp: true,
            currentStreak: true,
          },
        },
        companyProfile: {
          select: {
            companyName: true,
            logoUrl: true,
            isVerified: true,
            subscriptionTier: true,
            invitesRemaining: true,
          },
        },
        collegeAdmin: {
          select: {
            role: true,
            college: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return user;
  }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { passwordHash: true },
      }) as { passwordHash: string | null } | null;

      if (!user?.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change password for OAuth accounts",
        });
      }

      const isValid = await bcrypt.compare(
        input.currentPassword,
        user.passwordHash
      );

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { passwordHash: newPasswordHash },
      });

      return { success: true };
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email().toLowerCase() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true, userType: true },
      }) as { id: string; userType: UserType } | null;

      // Always return success to prevent email enumeration
      if (user) {
        // Generate reset token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await ctx.prisma.verificationToken.create({
          data: {
            identifier: input.email,
            token,
            expires,
          },
        });

        // Log event
        await logEvent(EventTypes.PASSWORD_RESET_REQUEST, {
          userId: user.id,
          userType: user.userType,
        });

        // TODO: Send email with reset link
        console.log(`[DEV] Password reset token for ${input.email}: ${token}`);
      }

      return {
        success: true,
        message: "If an account exists, a reset link has been sent",
      };
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z
          .string()
          .min(8)
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const verificationToken = await ctx.prisma.verificationToken.findUnique({
        where: { token: input.token },
      }) as { identifier: string; expires: Date } | null;

      if (!verificationToken || verificationToken.expires < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { email: verificationToken.identifier },
        select: { id: true, userType: true },
      }) as { id: string; userType: UserType } | null;

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

      // Update password
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      // Delete the used token
      await ctx.prisma.verificationToken.delete({
        where: { token: input.token },
      });

      // Log event
      await logEvent(EventTypes.PASSWORD_RESET_COMPLETE, {
        userId: user.id,
        userType: user.userType,
      });

      return { success: true };
    }),

  /**
   * Deactivate account
   */
  deactivateAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: { isActive: false },
    });

    return { success: true };
  }),

  /**
   * Get college by email domain (for Path 2 student signup)
   * Used to verify if student's college email belongs to a registered college
   */
  getCollegeByEmailDomain: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      // Extract domain from email (e.g., "student@iitd.ac.in" -> "iitd.ac.in")
      const domain = input.email.split("@")[1]?.toLowerCase();

      if (!domain) {
        return { found: false, college: null };
      }

      const domainMapping = await ctx.prisma.collegeEmailDomain.findUnique({
        where: { domain },
        select: {
          college: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              isPartner: true,
            },
          },
        },
      });

      if (!domainMapping) {
        return { found: false, college: null };
      }

      return {
        found: true,
        college: domainMapping.college,
      };
    }),

  /**
   * Verify email domain is from a known college
   * Quick check without fetching full college details
   */
  verifyCollegeEmailDomain: publicProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ ctx, input }) => {
      const domainLower = input.domain.toLowerCase();

      const exists = await ctx.prisma.collegeEmailDomain.findUnique({
        where: { domain: domainLower },
        select: { collegeId: true },
      });

      return { isValid: !!exists };
    }),
});
