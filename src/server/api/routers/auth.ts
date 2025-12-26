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
  userType: z.enum(["STUDENT", "COMPANY", "COLLEGE_ADMIN"]).default("STUDENT"),
  referralCode: z.string().optional(),
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

    // Create user
    const user = await ctx.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        userType: input.userType as UserType,
      },
      select: {
        id: true,
        email: true,
        userType: true,
      },
    }) as { id: string; email: string; userType: UserType };

    // Create empty profile for students
    if (input.userType === "STUDENT") {
      await ctx.prisma.profile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Create company profile for companies
    if (input.userType === "COMPANY") {
      await ctx.prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: "", // Will be filled in onboarding
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
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
      },
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
        userType: true,
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
});
