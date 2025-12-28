/**
 * Environment Variable Validation
 * Phase 5: Production Readiness
 *
 * Validates all required environment variables at startup
 */

import { z } from "zod";

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

const envSchema = z.object({
  // ========== Database ==========
  DATABASE_URL: z.string().url().describe("PostgreSQL connection string"),

  // ========== NextAuth ==========
  NEXTAUTH_URL: z.string().url().describe("NextAuth callback URL"),
  NEXTAUTH_SECRET: z.string().min(32).describe("NextAuth secret (min 32 chars)"),

  // ========== Optional Services ==========
  // Email (Amazon SES)
  AWS_ACCESS_KEY_ID: z.string().optional().describe("AWS Access Key ID for SES"),
  AWS_SECRET_ACCESS_KEY: z.string().optional().describe("AWS Secret Access Key for SES"),
  AWS_SES_REGION: z.string().optional().default("ap-south-1").describe("AWS SES region"),
  EMAIL_FROM: z.string().optional().default("Algonauts <noreply@algonauts.in>"),
  EMAIL_REPLY_TO: z.string().email().optional().default("support@algonauts.in"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().describe("Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().describe("Supabase anon key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().describe("Supabase service role key"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional().describe("Google OAuth client ID"),
  GOOGLE_CLIENT_SECRET: z.string().optional().describe("Google OAuth client secret"),

  // ========== App Config ==========
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // ========== Jobs/Cron ==========
  CRON_SECRET: z.string().min(16).optional().describe("Secret for cron job authentication"),

  // ========== Feature Flags ==========
  ENABLE_EMAIL: z.string().optional().default("false").transform((v) => v === "true"),
  ENABLE_ANALYTICS: z.string().optional().default("false").transform((v) => v === "true"),
});

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface EnvValidationResult {
  valid: boolean;
  env: z.infer<typeof envSchema> | null;
  errors: {
    variable: string;
    message: string;
  }[];
  warnings: {
    variable: string;
    message: string;
  }[];
}

// ============================================================================
// VALIDATION FUNCTION
// ============================================================================

/**
 * Validate environment variables
 */
export function validateEnv(): EnvValidationResult {
  const result: EnvValidationResult = {
    valid: true,
    env: null,
    errors: [],
    warnings: [],
  };

  try {
    result.env = envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.valid = false;
      result.errors = error.issues.map((e) => ({
        variable: e.path.join("."),
        message: e.message,
      }));
    }
  }

  // Add warnings for optional but recommended variables
  const warnings = [
    {
      variable: "AWS_ACCESS_KEY_ID",
      condition: !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY,
      message: "Email functionality will be disabled (AWS SES credentials not configured)",
    },
    {
      variable: "CRON_SECRET",
      condition: !process.env.CRON_SECRET && process.env.NODE_ENV === "production",
      message: "Cron jobs will not be secure in production",
    },
    {
      variable: "GOOGLE_CLIENT_ID",
      condition: !process.env.GOOGLE_CLIENT_ID,
      message: "Google OAuth will be disabled",
    },
  ];

  for (const w of warnings) {
    if (w.condition) {
      result.warnings.push({
        variable: w.variable,
        message: w.message,
      });
    }
  }

  return result;
}

/**
 * Get validated environment (throws if invalid)
 */
export function getEnv(): z.infer<typeof envSchema> {
  const result = validateEnv();

  if (!result.valid) {
    console.error("\n=== ENVIRONMENT VALIDATION FAILED ===");
    console.error("Missing or invalid environment variables:\n");

    for (const error of result.errors) {
      console.error(`  ${error.variable}: ${error.message}`);
    }

    console.error("\nPlease check your .env file and try again.\n");
    throw new Error("Environment validation failed");
  }

  if (result.warnings.length > 0) {
    console.warn("\n=== ENVIRONMENT WARNINGS ===");
    for (const warning of result.warnings) {
      console.warn(`  ${warning.variable}: ${warning.message}`);
    }
    console.warn("");
  }

  return result.env!;
}

// ============================================================================
// SAFE GETTERS
// ============================================================================

/**
 * Check if in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get app URL
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Check if email is enabled
 */
export function isEmailEnabled(): boolean {
  return !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;
}

/**
 * Get database URL
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

// ============================================================================
// STARTUP CHECK
// ============================================================================

/**
 * Run startup environment check
 * Call this in your main entry point
 */
export function runStartupCheck(): void {
  console.log("🔍 Validating environment...");

  const result = validateEnv();

  if (!result.valid) {
    console.error("❌ Environment validation failed!");
    process.exit(1);
  }

  console.log("✅ Environment validated successfully");

  if (result.warnings.length > 0) {
    console.log(`⚠️  ${result.warnings.length} warning(s) - check logs above`);
  }
}
