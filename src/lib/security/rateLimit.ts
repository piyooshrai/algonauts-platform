/**
 * Rate Limiting Middleware
 * Phase 5: API Security
 *
 * In-memory rate limiter for MVP.
 * For production, use Redis-based rate limiting.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Error message
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  // General API (100 requests per minute)
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: "Too many requests, please try again later",
  },

  // Authentication (10 attempts per 15 minutes)
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: "Too many authentication attempts, please try again later",
  },

  // Password reset (5 requests per hour)
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: "Too many password reset requests, please try again later",
  },

  // Application submission (20 per hour)
  applicationSubmit: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    message: "Application rate limit exceeded, please try again later",
  },

  // Invite sending (50 per day)
  inviteSend: {
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 50,
    message: "Daily invite limit reached",
  },

  // Search (200 per minute)
  search: {
    windowMs: 60 * 1000,
    maxRequests: 200,
    message: "Search rate limit exceeded",
  },

  // Event tracking (1000 per minute - high frequency)
  events: {
    windowMs: 60 * 1000,
    maxRequests: 1000,
    message: "Event tracking rate limit exceeded",
  },

  // Admin actions (100 per minute)
  admin: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: "Admin action rate limit exceeded",
  },

  // Strict limit for sensitive operations (3 per minute)
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 3,
    message: "Rate limit exceeded for sensitive operation",
  },
};

// ============================================================================
// IN-MEMORY STORE
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store: key -> entry
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60 * 1000); // Clean every minute

// ============================================================================
// RATE LIMITER
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  message?: string;
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  configName: string = "default"
): RateLimitResult {
  const config = defaultConfigs[configName] || defaultConfigs.default;
  const now = Date.now();

  // Get or create entry
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new window
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(entry.resetAt),
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);

  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      message: config.message,
    };
  }

  return {
    allowed: true,
    remaining,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Create rate limit key from identifier and action
 */
export function createRateLimitKey(
  identifier: string, // user ID, IP, etc.
  action: string
): string {
  return `${action}:${identifier}`;
}

/**
 * Rate limit by user ID
 */
export function rateLimitByUser(
  userId: string,
  action: string,
  configName: string = "default"
): RateLimitResult {
  const key = createRateLimitKey(userId, action);
  return checkRateLimit(key, configName);
}

/**
 * Rate limit by IP
 */
export function rateLimitByIP(
  ip: string,
  action: string,
  configName: string = "default"
): RateLimitResult {
  const key = createRateLimitKey(ip, action);
  return checkRateLimit(key, configName);
}

// ============================================================================
// TRPC MIDDLEWARE HELPER
// ============================================================================

import { TRPCError } from "@trpc/server";

/**
 * TRPC rate limit middleware factory
 */
export function createRateLimitMiddleware(
  action: string,
  configName: string = "default"
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async ({ ctx, next }: { ctx: any; next: () => Promise<any> }) => {
    // Get identifier (user ID or IP)
    const identifier =
      ctx.session?.user?.id ||
      ctx.req?.headers?.["x-forwarded-for"] ||
      ctx.req?.socket?.remoteAddress ||
      "unknown";

    const result = checkRateLimit(
      createRateLimitKey(identifier, action),
      configName
    );

    if (!result.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: result.message || "Rate limit exceeded",
      });
    }

    return next();
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  defaultConfigs as rateLimitConfigs,
};
