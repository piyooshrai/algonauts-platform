/**
 * tRPC Context
 * Creates the context for each tRPC request with auth and event logging
 */

import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";
import { authOptions } from "@/lib/auth";
import type { UserType } from "@/lib/db/types";

export interface Session {
  user: {
    id: string;
    email: string;
    userType: UserType;
    name?: string | null;
  };
  expires: string;
}

export interface CreateContextOptions {
  session: Session | null;
  headers: Headers;
}

/**
 * Inner context creator - can be used for testing
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    headers: opts.headers,
    prisma,
  };
};

/**
 * Context creator for App Router (fetch handler)
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Get session from NextAuth
  const session = (await getServerSession(authOptions)) as Session | null;

  return createInnerTRPCContext({
    session,
    headers: opts.headers,
  });
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
