/**
 * NextAuth Configuration
 * Handles authentication with credentials and OAuth providers
 */

import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { logEvent, EventTypes } from "@/lib/events";
import type { UserType } from "@/lib/db/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      userType: UserType;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    userType: UserType;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    userType: UserType;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
  },

  providers: [
    // Credentials provider for email/password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            userType: true,
            isActive: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        }) as {
          id: string;
          email: string;
          passwordHash: string | null;
          userType: UserType;
          isActive: boolean;
          profile: { firstName: string | null; lastName: string | null; avatarUrl: string | null } | null;
        } | null;

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Log login event
        await logEvent(EventTypes.USER_LOGIN, {
          userId: user.id,
          userType: user.userType,
          metadata: {
            method: "credentials",
          },
        });

        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          name: user.profile
            ? `${user.profile.firstName ?? ""} ${user.profile.lastName ?? ""}`.trim()
            : null,
          image: user.profile?.avatarUrl ?? null,
        };
      },
    }),

    // Google OAuth (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    // LinkedIn OAuth (optional)
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
      ? [
          LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            authorization: {
              params: { scope: "openid profile email" },
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, ensure user exists in our system
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        }) as { id: string; userType: UserType } | null;

        if (existingUser) {
          // Update last login
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLoginAt: new Date() },
          });

          // Log login event
          await logEvent(EventTypes.USER_LOGIN, {
            userId: existingUser.id,
            userType: existingUser.userType,
            metadata: {
              method: account?.provider,
            },
          });
        } else {
          // Log signup event for new OAuth users
          // The adapter will create the user
          // We'll log after JWT callback where we have the user ID
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.userType = user.userType ?? "STUDENT";
      }

      // For new OAuth users, log signup event
      if (account && account.provider !== "credentials" && user) {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { createdAt: true },
        }) as { createdAt: Date } | null;

        // If user was just created (within last 10 seconds), log signup
        if (existingUser) {
          const timeSinceCreation =
            Date.now() - existingUser.createdAt.getTime();
          if (timeSinceCreation < 10000) {
            await logEvent(EventTypes.USER_SIGNUP, {
              userId: user.id,
              userType: token.userType,
              metadata: {
                method: account.provider,
              },
            });
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.userType = token.userType;
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (token?.id) {
        await logEvent(EventTypes.USER_LOGOUT, {
          userId: token.id as string,
          userType: token.userType as UserType,
        });
      }
    },
  },
};
