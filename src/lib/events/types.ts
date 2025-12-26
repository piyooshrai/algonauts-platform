/**
 * Event Types for Algonaut Platform
 * CRITICAL: Every user interaction MUST be logged as an event
 * No events = No ML = No acquisition value
 */

// ============================================================================
// EVENT CATEGORIES
// ============================================================================

export const EventCategory = {
  AUTH: "auth",
  PROFILE: "profile",
  OPPORTUNITY: "opportunity",
  RECOMMENDATION: "recommendation",
  APPLICATION: "application",
  INVITE: "invite",
  PLACEMENT: "placement",
  NOTIFICATION: "notification",
  GAMIFICATION: "gamification",
  FEED: "feed",
  CELEBRATION: "celebration",
  COMPANY: "company",
  COLLEGE: "college",
  ASSESSMENT: "assessment",
} as const;

export type EventCategory = (typeof EventCategory)[keyof typeof EventCategory];

// ============================================================================
// EVENT TYPES BY CATEGORY
// ============================================================================

// Authentication Events
export const AuthEvents = {
  USER_SIGNUP: "USER_SIGNUP",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  SESSION_START: "SESSION_START",
  SESSION_END: "SESSION_END",
  PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_COMPLETE: "PASSWORD_RESET_COMPLETE",
  EMAIL_VERIFICATION_SENT: "EMAIL_VERIFICATION_SENT",
  EMAIL_VERIFICATION_COMPLETE: "EMAIL_VERIFICATION_COMPLETE",
} as const;

// Profile Events
export const ProfileEvents = {
  PROFILE_CREATE: "PROFILE_CREATE",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PROFILE_COMPLETE: "PROFILE_COMPLETE",
  PROFILE_VIEW: "PROFILE_VIEW",
  RESUME_UPLOAD: "RESUME_UPLOAD",
  RESUME_DOWNLOAD: "RESUME_DOWNLOAD",
  SKILL_ADD: "SKILL_ADD",
  SKILL_REMOVE: "SKILL_REMOVE",
  EXPERIENCE_ADD: "EXPERIENCE_ADD",
  EXPERIENCE_UPDATE: "EXPERIENCE_UPDATE",
  EDUCATION_ADD: "EDUCATION_ADD",
  CERTIFICATION_ADD: "CERTIFICATION_ADD",
} as const;

// Opportunity Events
export const OpportunityEvents = {
  OPPORTUNITY_CREATE: "OPPORTUNITY_CREATE",
  OPPORTUNITY_UPDATE: "OPPORTUNITY_UPDATE",
  OPPORTUNITY_PUBLISH: "OPPORTUNITY_PUBLISH",
  OPPORTUNITY_CLOSE: "OPPORTUNITY_CLOSE",
  OPPORTUNITY_IMPRESSION: "OPPORTUNITY_IMPRESSION",
  OPPORTUNITY_CLICK: "OPPORTUNITY_CLICK",
  OPPORTUNITY_VIEW: "OPPORTUNITY_VIEW",
  OPPORTUNITY_SEARCH: "OPPORTUNITY_SEARCH",
  OPPORTUNITY_FILTER: "OPPORTUNITY_FILTER",
  OPPORTUNITY_SAVE: "OPPORTUNITY_SAVE",
  OPPORTUNITY_UNSAVE: "OPPORTUNITY_UNSAVE",
  OPPORTUNITY_SHARE: "OPPORTUNITY_SHARE",
} as const;

// Recommendation Events
export const RecommendationEvents = {
  OPPORTUNITY_RECOMMENDED: "OPPORTUNITY_RECOMMENDED",
  RECOMMENDATION_SHOWN: "RECOMMENDATION_SHOWN",
  RECOMMENDATION_CLICKED: "RECOMMENDATION_CLICKED",
  RECOMMENDATION_APPLIED: "RECOMMENDATION_APPLIED",
  RECOMMENDATION_IGNORED: "RECOMMENDATION_IGNORED",
  RECOMMENDATION_DISMISSED: "RECOMMENDATION_DISMISSED",
} as const;

// Application Events
export const ApplicationEvents = {
  APPLICATION_START: "APPLICATION_START",
  APPLICATION_DRAFT_SAVE: "APPLICATION_DRAFT_SAVE",
  APPLICATION_SUBMIT: "APPLICATION_SUBMIT",
  APPLICATION_WITHDRAW: "APPLICATION_WITHDRAW",
  APPLICATION_VIEW: "APPLICATION_VIEW",
  APPLICATION_STATUS_CHANGE: "APPLICATION_STATUS_CHANGE",
} as const;

// Invite Events
export const InviteEvents = {
  INVITE_SENT: "INVITE_SENT",
  INVITE_VIEWED: "INVITE_VIEWED",
  INVITE_ACCEPTED: "INVITE_ACCEPTED",
  INVITE_DECLINED: "INVITE_DECLINED",
  INVITE_EXPIRED: "INVITE_EXPIRED",
} as const;

// Placement Events - THE MOST VALUABLE
export const PlacementEvents = {
  OFFER_MADE: "OFFER_MADE",
  OFFER_ACCEPTED: "OFFER_ACCEPTED",
  OFFER_REJECTED: "OFFER_REJECTED",
  PLACEMENT_CONFIRMED: "PLACEMENT_CONFIRMED",
  VERIFICATION_30_REQUESTED: "VERIFICATION_30_REQUESTED",
  VERIFICATION_30_COMPLETE: "VERIFICATION_30_COMPLETE",
  VERIFICATION_90_REQUESTED: "VERIFICATION_90_REQUESTED",
  VERIFICATION_90_COMPLETE: "VERIFICATION_90_COMPLETE",
  PLACEMENT_FAILED: "PLACEMENT_FAILED",
  PLACEMENT_DISPUTED: "PLACEMENT_DISPUTED",
} as const;

// Notification Events
export const NotificationEvents = {
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
  NOTIFICATION_SENT: "NOTIFICATION_SENT",
  NOTIFICATION_DELIVERED: "NOTIFICATION_DELIVERED",
  NOTIFICATION_OPENED: "NOTIFICATION_OPENED",
  NOTIFICATION_CLICKED: "NOTIFICATION_CLICKED",
  NOTIFICATION_DISMISSED: "NOTIFICATION_DISMISSED",
  NOTIFICATION_DISABLED: "NOTIFICATION_DISABLED",
} as const;

// Gamification Events
export const GamificationEvents = {
  BADGE_EARNED: "BADGE_EARNED",
  BADGE_SHARED: "BADGE_SHARED",
  STREAK_CONTINUE: "STREAK_CONTINUE",
  STREAK_BREAK: "STREAK_BREAK",
  LEVEL_UP: "LEVEL_UP",
  XP_EARNED: "XP_EARNED",
  LEADERBOARD_VIEW: "LEADERBOARD_VIEW",
  RANK_CHANGED: "RANK_CHANGED",
} as const;

// Feed Events
export const FeedEvents = {
  FEED_VIEW: "FEED_VIEW",
  FEED_ITEM_VIEW: "FEED_ITEM_VIEW",
  FEED_ITEM_CLICK: "FEED_ITEM_CLICK",
  FEED_REFRESH: "FEED_REFRESH",
} as const;

// Celebration Events (viral loops)
export const CelebrationEvents = {
  PLACEMENT_CARD_GENERATED: "PLACEMENT_CARD_GENERATED",
  PLACEMENT_CARD_VIEWED: "PLACEMENT_CARD_VIEWED",
  PLACEMENT_SHARED: "PLACEMENT_SHARED",
  PLACEMENT_SHARE_CLICKED: "PLACEMENT_SHARE_CLICKED",
} as const;

// Company Events
export const CompanyEvents = {
  CANDIDATE_SEARCH: "CANDIDATE_SEARCH",
  CANDIDATE_FILTER: "CANDIDATE_FILTER",
  CANDIDATE_VIEW: "CANDIDATE_VIEW",
  CANDIDATE_SHORTLIST: "CANDIDATE_SHORTLIST",
  CANDIDATE_DOWNLOAD_RESUME: "CANDIDATE_DOWNLOAD_RESUME",
  COMPANY_VERIFICATION: "COMPANY_VERIFICATION",
  SUBSCRIPTION_UPGRADE: "SUBSCRIPTION_UPGRADE",
  INVITE_PURCHASE: "INVITE_PURCHASE",
} as const;

// College Events
export const CollegeEvents = {
  BULK_IMPORT_STARTED: "BULK_IMPORT_STARTED",
  BULK_IMPORT_COMPLETE: "BULK_IMPORT_COMPLETE",
  BULK_IMPORT_FAILED: "BULK_IMPORT_FAILED",
  COLLEGE_ANALYTICS_VIEW: "COLLEGE_ANALYTICS_VIEW",
  COLLEGE_RANK_CHANGED: "COLLEGE_RANK_CHANGED",
  STUDENT_ADDED: "STUDENT_ADDED",
  COHORT_CREATED: "COHORT_CREATED",
} as const;

// Assessment Events
export const AssessmentEvents = {
  ASSESSMENT_START: "ASSESSMENT_START",
  ASSESSMENT_SUBMIT: "ASSESSMENT_SUBMIT",
  ASSESSMENT_ABANDON: "ASSESSMENT_ABANDON",
  QUESTION_ANSWERED: "QUESTION_ANSWERED",
  QUESTION_SKIPPED: "QUESTION_SKIPPED",
  ASSESSMENT_RESULT_VIEW: "ASSESSMENT_RESULT_VIEW",
} as const;

// ============================================================================
// COMBINED EVENT TYPES
// ============================================================================

export const EventTypes = {
  ...AuthEvents,
  ...ProfileEvents,
  ...OpportunityEvents,
  ...RecommendationEvents,
  ...ApplicationEvents,
  ...InviteEvents,
  ...PlacementEvents,
  ...NotificationEvents,
  ...GamificationEvents,
  ...FeedEvents,
  ...CelebrationEvents,
  ...CompanyEvents,
  ...CollegeEvents,
  ...AssessmentEvents,
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

// ============================================================================
// EVENT SOURCES
// ============================================================================

export const EventSource = {
  SEARCH: "search",
  RECOMMENDATION: "recommendation",
  NOTIFICATION: "notification",
  DIRECT: "direct",
  FEED: "feed",
  EMAIL: "email",
  REFERRAL: "referral",
  EXTERNAL: "external",
  WHATSAPP: "whatsapp",
  LINKEDIN: "linkedin",
} as const;

export type EventSource = (typeof EventSource)[keyof typeof EventSource];

// ============================================================================
// REWARD VALUES (for RL training)
// ============================================================================

export const RewardValues: Record<string, number> = {
  // Immediate rewards (1-2 points)
  OPPORTUNITY_CLICK: 1,
  OPPORTUNITY_VIEW: 1,
  FEED_ITEM_CLICK: 1,
  NOTIFICATION_CLICKED: 1,
  PROFILE_VIEW: 1,

  // Short-term rewards (5-10 points)
  APPLICATION_SUBMIT: 10,
  INVITE_ACCEPTED: 10,
  ASSESSMENT_SUBMIT: 5,
  PROFILE_COMPLETE: 10,
  RECOMMENDATION_APPLIED: 8,

  // Long-term rewards (30-100 points) - THE MOST VALUABLE
  OFFER_MADE: 30,
  OFFER_ACCEPTED: 50,
  PLACEMENT_CONFIRMED: 50,
  VERIFICATION_30_COMPLETE: 75,
  VERIFICATION_90_COMPLETE: 100, // THE MOST VALUABLE EVENT

  // Negative rewards
  APPLICATION_WITHDRAW: -5,
  NOTIFICATION_DISMISSED: -1,
  RECOMMENDATION_IGNORED: -2,
  PLACEMENT_FAILED: -20,
  STREAK_BREAK: -5,

  // Viral/Engagement
  PLACEMENT_SHARED: 15,
  BADGE_SHARED: 5,
  REFERRAL_SIGNUP: 20,
};

// ============================================================================
// EVENT CATEGORY MAPPING
// ============================================================================

export function getEventCategory(eventType: EventType): EventCategory {
  if (Object.values(AuthEvents).includes(eventType as typeof AuthEvents[keyof typeof AuthEvents])) {
    return EventCategory.AUTH;
  }
  if (Object.values(ProfileEvents).includes(eventType as typeof ProfileEvents[keyof typeof ProfileEvents])) {
    return EventCategory.PROFILE;
  }
  if (Object.values(OpportunityEvents).includes(eventType as typeof OpportunityEvents[keyof typeof OpportunityEvents])) {
    return EventCategory.OPPORTUNITY;
  }
  if (Object.values(RecommendationEvents).includes(eventType as typeof RecommendationEvents[keyof typeof RecommendationEvents])) {
    return EventCategory.RECOMMENDATION;
  }
  if (Object.values(ApplicationEvents).includes(eventType as typeof ApplicationEvents[keyof typeof ApplicationEvents])) {
    return EventCategory.APPLICATION;
  }
  if (Object.values(InviteEvents).includes(eventType as typeof InviteEvents[keyof typeof InviteEvents])) {
    return EventCategory.INVITE;
  }
  if (Object.values(PlacementEvents).includes(eventType as typeof PlacementEvents[keyof typeof PlacementEvents])) {
    return EventCategory.PLACEMENT;
  }
  if (Object.values(NotificationEvents).includes(eventType as typeof NotificationEvents[keyof typeof NotificationEvents])) {
    return EventCategory.NOTIFICATION;
  }
  if (Object.values(GamificationEvents).includes(eventType as typeof GamificationEvents[keyof typeof GamificationEvents])) {
    return EventCategory.GAMIFICATION;
  }
  if (Object.values(FeedEvents).includes(eventType as typeof FeedEvents[keyof typeof FeedEvents])) {
    return EventCategory.FEED;
  }
  if (Object.values(CelebrationEvents).includes(eventType as typeof CelebrationEvents[keyof typeof CelebrationEvents])) {
    return EventCategory.CELEBRATION;
  }
  if (Object.values(CompanyEvents).includes(eventType as typeof CompanyEvents[keyof typeof CompanyEvents])) {
    return EventCategory.COMPANY;
  }
  if (Object.values(CollegeEvents).includes(eventType as typeof CollegeEvents[keyof typeof CollegeEvents])) {
    return EventCategory.COLLEGE;
  }
  if (Object.values(AssessmentEvents).includes(eventType as typeof AssessmentEvents[keyof typeof AssessmentEvents])) {
    return EventCategory.ASSESSMENT;
  }
  return EventCategory.AUTH; // fallback
}
