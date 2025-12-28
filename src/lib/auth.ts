/**
 * NextAuth Configuration
 * Handles authentication with credentials (email/password only)
 */

import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { logEvent, EventTypes } from "@/lib/events";
import type { UserType, VerificationStatus } from "@/lib/db/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      userType: UserType;
      verificationStatus: VerificationStatus;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    userType: UserType;
    verificationStatus: VerificationStatus;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    userType: UserType;
    verificationStatus: VerificationStatus;
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
            verificationStatus: true,
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
          verificationStatus: VerificationStatus;
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
          verificationStatus: user.verificationStatus,
          name: user.profile
            ? `${user.profile.firstName ?? ""} ${user.profile.lastName ?? ""}`.trim()
            : null,
          image: user.profile?.avatarUrl ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn() {
      // Credentials-only authentication, always allow
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.userType = user.userType ?? "STUDENT";
        token.verificationStatus = user.verificationStatus ?? "APPROVED";
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.userType = token.userType;
        session.user.verificationStatus = token.verificationStatus;
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
