/**
 * tRPC Server Configuration
 * Includes middleware for authentication and event logging
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { type Context } from "./context";
import { logEvent, type EventType } from "@/lib/events";

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Middleware: Timing logger for performance monitoring
 */
const timingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  if (duration > 1000) {
    console.warn(`[SLOW] ${type} ${path} took ${duration}ms`);
  }

  return result;
});

/**
 * Middleware: Event logging for every procedure call
 * This ensures all API interactions are captured
 */
const eventLoggingMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
  const result = await next();

  // Log the procedure call as an event (non-blocking)
  if (ctx.session?.user?.id) {
    // Don't await - fire and forget for performance
    logEvent(`PROCEDURE_CALL` as EventType, {
      userId: ctx.session.user.id,
      userType: ctx.session.user.userType,
      metadata: {
        path,
        type,
        success: result.ok,
      },
    }).catch((err) => {
      console.error("[EventLogging] Failed to log procedure:", err);
    });
  }

  return result;
});

/**
 * Public procedure - no authentication required
 * Still logs events for anonymous users
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure - requires authentication
 * Automatically logs events with user context
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(eventLoggingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action",
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: {
          ...ctx.session,
          user: ctx.session.user,
        },
      },
    });
  });

/**
 * Admin procedure - requires platform admin role
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.userType !== "PLATFORM_ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

/**
 * Company procedure - requires company user type
 */
export const companyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.userType !== "COMPANY") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Company access required",
    });
  }

  return next({ ctx });
});

/**
 * College admin procedure - requires college admin user type
 */
export const collegeAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.userType !== "COLLEGE_ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "College admin access required",
    });
  }

  return next({ ctx });
});

/**
 * Student procedure - requires student user type
 */
export const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.userType !== "STUDENT") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Student access required",
    });
  }

  return next({ ctx });
});

/**
 * Merge routers helper
 */
export const mergeRouters = t.mergeRouters;
