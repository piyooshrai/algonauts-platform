/**
 * Database Types
 * These mirror the Prisma schema enums
 * Will be replaced by @prisma/client when Prisma is properly configured
 */

export type UserType = "STUDENT" | "COMPANY" | "COLLEGE_ADMIN" | "PLATFORM_ADMIN";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type ProfileCompletionStatus = "INCOMPLETE" | "BASIC" | "COMPLETE" | "VERIFIED";

export type OpportunityStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "FILLED" | "EXPIRED";

export type OpportunityType = "FULL_TIME" | "INTERNSHIP" | "CONTRACT" | "PART_TIME";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFER_MADE"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "REJECTED"
  | "WITHDRAWN";

export type InviteStatus = "PENDING" | "VIEWED" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export type PlacementStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "VERIFICATION_30_PENDING"
  | "VERIFICATION_30_COMPLETE"
  | "VERIFICATION_90_PENDING"
  | "VERIFICATION_90_COMPLETE"
  | "FAILED"
  | "DISPUTED";

export type VerificationType =
  | "SELF_REPORTED"
  | "EMAIL_VERIFIED"
  | "EMPLOYER_CONFIRMED"
  | "COLLEGE_CONFIRMED"
  | "DOCUMENT_VERIFIED";

export type BadgeCategory = "ACHIEVEMENT" | "SKILL" | "MILESTONE" | "SPECIAL" | "STREAK";

export type BadgeRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type NotificationType =
  | "OPPORTUNITY"
  | "APPLICATION"
  | "INVITE"
  | "PLACEMENT"
  | "ACHIEVEMENT"
  | "STREAK"
  | "LEADERBOARD"
  | "SYSTEM";

export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH" | "SMS" | "WHATSAPP";

export type EventSourceType =
  | "SEARCH"
  | "RECOMMENDATION"
  | "NOTIFICATION"
  | "DIRECT"
  | "FEED"
  | "EMAIL"
  | "REFERRAL"
  | "EXTERNAL";
