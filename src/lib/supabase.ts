/**
 * Supabase Client
 * Used for file storage (resumes, profile photos, etc.)
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";

// Create Supabase client for server-side operations
export function getSupabaseAdmin() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  RESUMES: "resumes",
  AVATARS: "avatars",
  COMPANY_LOGOS: "company-logos",
} as const;

// Allowed file types for resume upload
export const RESUME_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Max file size: 5MB
export const RESUME_MAX_SIZE = 5 * 1024 * 1024;
