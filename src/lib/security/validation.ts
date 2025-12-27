/**
 * Input Validation Utilities
 * Phase 5: API Security
 *
 * Common validation schemas and sanitization functions
 */

import { z } from "zod";

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Safe string - prevents XSS by limiting characters
 */
export const safeString = (maxLength: number = 255) =>
  z
    .string()
    .max(maxLength)
    .transform((val) => val.trim())
    // Remove potentially dangerous characters
    .refine((val) => !/[<>]/.test(val), {
      message: "String contains invalid characters",
    });

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255)
  .toLowerCase()
  .transform((val) => val.trim());

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Strong password (includes special chars)
 */
export const strongPasswordSchema = passwordSchema.regex(
  /[!@#$%^&*(),.?":{}|<>]/,
  "Password must contain at least one special character"
);

/**
 * Phone number (Indian format)
 */
export const phoneSchema = z
  .string()
  .regex(/^[+]?[0-9]{10,13}$/, "Invalid phone number")
  .transform((val) => val.replace(/\D/g, "").slice(-10));

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url("Invalid URL")
  .max(2048)
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "URL must use HTTP or HTTPS protocol" }
  );

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid("Invalid ID format");

/**
 * Pagination params
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Sort params
 */
export const sortSchema = z.object({
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Date range
 */
export const dateRangeSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: "Start date must be before end date" }
);

// ============================================================================
// DOMAIN-SPECIFIC SCHEMAS
// ============================================================================

/**
 * User name
 */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters")
  .transform((val) => val.trim());

/**
 * College/Company name
 */
export const organizationNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(200)
  .transform((val) => val.trim());

/**
 * Skill
 */
export const skillSchema = z
  .string()
  .min(1, "Skill cannot be empty")
  .max(50, "Skill name too long")
  .transform((val) => val.trim().toLowerCase());

/**
 * Skills array
 */
export const skillsArraySchema = z
  .array(skillSchema)
  .max(50, "Too many skills")
  .transform((skills) => Array.from(new Set(skills))); // Remove duplicates

/**
 * Salary (in LPA)
 */
export const salarySchema = z
  .number()
  .min(0, "Salary cannot be negative")
  .max(1000, "Salary value too high");

/**
 * Experience years
 */
export const experienceSchema = z
  .number()
  .int()
  .min(0, "Experience cannot be negative")
  .max(50, "Experience value too high");

/**
 * Percentage/Score (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, "Score cannot be negative")
  .max(100, "Score cannot exceed 100");

/**
 * GPA (0-10)
 */
export const gpaSchema = z
  .number()
  .min(0, "GPA cannot be negative")
  .max(10, "GPA cannot exceed 10");

/**
 * Job description (rich text)
 */
export const jobDescriptionSchema = z
  .string()
  .min(50, "Description too short")
  .max(10000, "Description too long")
  .transform((val) => sanitizeHtml(val));

/**
 * Bio/About text
 */
export const bioSchema = z
  .string()
  .max(2000, "Bio too long")
  .transform((val) => sanitizeHtml(val.trim()));

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Basic HTML sanitization
 * Removes script tags and dangerous attributes
 */
export function sanitizeHtml(html: string): string {
  return html
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
    // Remove javascript: URLs
    .replace(/javascript:/gi, "")
    // Remove data: URLs (potential XSS)
    .replace(/data:/gi, "")
    // Remove expression()
    .replace(/expression\s*\(/gi, "");
}

/**
 * Sanitize object keys (prevent prototype pollution)
 */
export function sanitizeObjectKeys<T extends Record<string, unknown>>(
  obj: T
): T {
  const dangerous = ["__proto__", "constructor", "prototype"];
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!dangerous.includes(key)) {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Escape SQL-like patterns
 */
export function escapeSqlPattern(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[^\w\s-]/g, "") // Allow only alphanumeric, spaces, hyphens
    .replace(/\s+/g, " "); // Normalize whitespace
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that user owns the resource
 */
export function validateOwnership(
  resourceUserId: string,
  requestUserId: string,
  isAdmin: boolean = false
): boolean {
  return isAdmin || resourceUserId === requestUserId;
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSizeMB: number;
  allowedTypes: string[];
}

export function validateFileUpload(
  file: { size: number; type: string },
  options: FileValidationOptions
): { valid: boolean; error?: string } {
  const maxBytes = options.maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${options.maxSizeMB}MB limit`,
    };
  }

  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Resume file validation
 */
export const resumeValidation: FileValidationOptions = {
  maxSizeMB: 5,
  allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

/**
 * Image file validation
 */
export const imageValidation: FileValidationOptions = {
  maxSizeMB: 2,
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const schemas = {
  safeString,
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  phoneSchema,
  urlSchema,
  uuidSchema,
  paginationSchema,
  sortSchema,
  dateRangeSchema,
  nameSchema,
  organizationNameSchema,
  skillSchema,
  skillsArraySchema,
  salarySchema,
  experienceSchema,
  percentageSchema,
  gpaSchema,
  jobDescriptionSchema,
  bioSchema,
};
