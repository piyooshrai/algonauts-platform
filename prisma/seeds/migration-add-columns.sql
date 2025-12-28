-- ============================================================================
-- MIGRATION: Add missing columns for launch features
-- Run this BEFORE the demo-data.sql seed
-- ============================================================================

-- Add slug column to College table
ALTER TABLE "College" ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE;

-- Create index on slug
CREATE INDEX IF NOT EXISTS "College_slug_idx" ON "College"("slug");

-- Add template-based notification fields
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "templateId" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "ctaText" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "ctaUrl" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'medium';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "variables" JSONB;

-- Create indexes for notification queries
CREATE INDEX IF NOT EXISTS "Notification_category_idx" ON "Notification"("category");
CREATE INDEX IF NOT EXISTS "Notification_templateId_idx" ON "Notification"("templateId");

-- Create CollegeInviteStats table
CREATE TABLE IF NOT EXISTS "CollegeInviteStats" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL UNIQUE,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "signups" INTEGER NOT NULL DEFAULT 0,
    "dailyStats" JSONB,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "directCopies" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollegeInviteStats_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for CollegeInviteStats
ALTER TABLE "CollegeInviteStats"
ADD CONSTRAINT "CollegeInviteStats_collegeId_fkey"
FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add collegeId to Profile for invite link signups (if not exists)
-- This column likely already exists, so we use IF NOT EXISTS pattern
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'Profile' AND column_name = 'collegeId') THEN
        ALTER TABLE "Profile" ADD COLUMN "collegeId" TEXT;
        ALTER TABLE "Profile" ADD CONSTRAINT "Profile_collegeId_fkey"
        FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- DONE! Now you can run demo-data.sql
-- ============================================================================
