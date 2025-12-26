# Algonaut Event Schema

## Purpose

Every interaction is training data.
This document defines every event we collect.

---

## Event Structure

```typescript
interface Event {
  id: string;
  timestamp: Date;
  
  // Who
  userId: string;
  userType: 'STUDENT' | 'COMPANY' | 'COLLEGE' | 'ADMIN';
  sessionId: string;
  
  // What
  eventType: EventType;
  entityType?: string;
  entityId?: string;
  
  // Context
  source?: string;        // 'search' | 'recommendation' | 'notification' | 'direct'
  position?: number;      // Position in list if applicable
  
  // Experiment
  experimentId?: string;
  experimentGroup?: string;
  
  // Rich context
  metadata?: Record<string, any>;
  
  // Reward (filled later by attribution)
  rewardAttributed: boolean;
  rewardValue?: number;
}
```

---

## Event Categories

### Authentication Events

| Event Type | When | Metadata |
|------------|------|----------|
| USER_SIGNUP | User creates account | { role, source } |
| USER_LOGIN | User logs in | { method: 'email' \| 'google' \| 'linkedin' } |
| USER_LOGOUT | User logs out | {} |
| SESSION_START | New session begins | { deviceType, userAgent } |
| SESSION_END | Session ends | { duration, pagesViewed } |

---

### Profile Events

| Event Type | When | Metadata |
|------------|------|----------|
| PROFILE_CREATE | Profile created | { role, completeness } |
| PROFILE_UPDATE | Profile updated | { fieldsChanged: string[] } |
| PROFILE_COMPLETE | Profile reaches 100% | { role } |
| PROFILE_VIEW | Someone views a profile | { viewerId, viewerType } |
| RESUME_UPLOAD | Resume uploaded | { fileSize } |

---

### Opportunity Events

| Event Type | When | Metadata |
|------------|------|----------|
| OPPORTUNITY_CREATE | Company creates opportunity | { type, skills } |
| OPPORTUNITY_PUBLISH | Opportunity goes live | {} |
| OPPORTUNITY_CLOSE | Opportunity closed | { reason } |
| OPPORTUNITY_IMPRESSION | Opportunity shown in list | { position, source } |
| OPPORTUNITY_CLICK | Clicked from list | { position, source } |
| OPPORTUNITY_VIEW | Full opportunity viewed | { timeOnPage, scrollDepth } |
| OPPORTUNITY_SEARCH | Search executed | { query, filters, resultsCount } |
| OPPORTUNITY_FILTER | Filter applied | { filterType, filterValue } |

---

### Recommendation Events

| Event Type | When | Metadata |
|------------|------|----------|
| OPPORTUNITY_RECOMMENDED | Opportunity shown as recommendation | { position, score, reasons } |
| RECOMMENDATION_CLICKED | Recommendation clicked | { position, score } |
| RECOMMENDATION_APPLIED | Applied from recommendation | { position, score } |
| RECOMMENDATION_IGNORED | Recommendation not clicked | { position, score, timeVisible } |

---

### Application Events

| Event Type | When | Metadata |
|------------|------|----------|
| APPLICATION_START | Started application flow | { opportunityId } |
| APPLICATION_SUBMIT | Application submitted | { opportunityId, score, wasRecommended, recommendationRank, coverLetterLength } |
| APPLICATION_WITHDRAW | Student withdrew | { opportunityId, reason } |
| APPLICATION_VIEW | Company viewed application | { applicationId, timeSpent } |
| APPLICATION_STATUS_CHANGE | Status changed | { applicationId, oldStatus, newStatus, actorType } |

---

### Invite Events

| Event Type | When | Metadata |
|------------|------|----------|
| INVITE_SENT | Company sent invite | { studentId, opportunityId, hasMessage } |
| INVITE_VIEWED | Student viewed invite | { inviteId } |
| INVITE_ACCEPTED | Student accepted | { inviteId, responseTime } |
| INVITE_DECLINED | Student declined | { inviteId, responseTime } |
| INVITE_EXPIRED | Invite expired | { inviteId } |

---

### Placement Events (THE GOLD)

| Event Type | When | Reward Value | Metadata |
|------------|------|--------------|----------|
| OFFER_MADE | Company made offer | +30 | { studentId, opportunityId, salary } |
| OFFER_ACCEPTED | Student accepted | +50 | { placementId, salary } |
| OFFER_REJECTED | Student rejected offer | 0 | { reason } |
| PLACEMENT_CONFIRMED | Placement confirmed | +50 | { placementId } |
| VERIFICATION_30_REQUESTED | 30-day check sent | 0 | { placementId } |
| VERIFICATION_30_COMPLETE | 30-day verified | +75 (if employed) | { placementId, stillEmployed } |
| VERIFICATION_90_REQUESTED | 90-day check sent | 0 | { placementId } |
| VERIFICATION_90_COMPLETE | 90-day verified | +100 (if employed) | { placementId, stillEmployed } |
| PLACEMENT_FAILED | Left before 90 days | -20 | { placementId, leftAt, reason } |

---

### Notification Events

| Event Type | When | Metadata |
|------------|------|----------|
| NOTIFICATION_CREATED | Notification created | { type, channel, modelVersion } |
| NOTIFICATION_SENT | Notification sent | { notificationId, channel } |
| NOTIFICATION_DELIVERED | Delivery confirmed | { notificationId } |
| NOTIFICATION_OPENED | Notification opened | { notificationId, timeToOpen } |
| NOTIFICATION_CLICKED | CTA clicked | { notificationId, timeToClick } |
| NOTIFICATION_DISMISSED | Dismissed without action | { notificationId } |
| NOTIFICATION_DISABLED | User disabled notifications | { channel } |

---

### Gamification Events

| Event Type | When | Metadata |
|------------|------|----------|
| BADGE_EARNED | Badge earned | { badgeCode, badgeTier } |
| BADGE_SHARED | Badge shared | { badgeCode, channel } |
| STREAK_CONTINUE | Streak continued | { days } |
| STREAK_BREAK | Streak broken | { previousDays } |
| LEVEL_UP | Level increased | { newLevel, previousLevel } |
| XP_EARNED | XP earned | { amount, reason } |
| LEADERBOARD_VIEW | Viewed leaderboard | { type } |
| RANK_CHANGED | Rank changed | { leaderboardType, oldRank, newRank } |

---

### Feed Events

| Event Type | When | Metadata |
|------------|------|----------|
| FEED_VIEW | Viewed activity feed | { feedType } |
| FEED_ITEM_VIEW | Feed item seen | { itemId, position } |
| FEED_ITEM_CLICK | Feed item clicked | { itemId, position } |

---

### Celebration Events

| Event Type | When | Metadata |
|------------|------|----------|
| PLACEMENT_CARD_GENERATED | Card created | { placementId } |
| PLACEMENT_CARD_VIEWED | Card viewed | { placementId } |
| PLACEMENT_SHARED | Placement shared | { placementId, channel } |

---

### Company Events

| Event Type | When | Metadata |
|------------|------|----------|
| CANDIDATE_SEARCH | Company searched students | { filters, resultsCount } |
| CANDIDATE_VIEW | Company viewed student profile | { studentId, timeSpent } |
| CANDIDATE_DOWNLOAD_RESUME | Downloaded resume | { studentId } |
| COMPANY_VERIFICATION | Verification completed | { method, result } |

---

### College Events

| Event Type | When | Metadata |
|------------|------|----------|
| BULK_IMPORT_STARTED | Import started | { rowCount } |
| BULK_IMPORT_COMPLETE | Import finished | { successCount, failureCount } |
| COLLEGE_ANALYTICS_VIEW | Viewed analytics | { section } |
| COLLEGE_RANK_CHANGED | College rank changed | { oldRank, newRank, leaderboardType } |

---

## Reward Values

For RL training, events have reward values:

| Category | Event | Reward |
|----------|-------|--------|
| **Immediate** | NOTIFICATION_OPENED | +1 |
| | RECOMMENDATION_CLICKED | +2 |
| | OPPORTUNITY_VIEW | +1 |
| **Short-term** | APPLICATION_SUBMIT | +5 |
| | APPLICATION_STATUS_CHANGE (SHORTLISTED) | +10 |
| | INVITE_ACCEPTED | +5 |
| **Long-term** | OFFER_MADE | +30 |
| | OFFER_ACCEPTED | +50 |
| | VERIFICATION_30_COMPLETE (employed) | +75 |
| | VERIFICATION_90_COMPLETE (employed) | +100 |
| **Negative** | NOTIFICATION_DISMISSED | -1 |
| | NOTIFICATION_DISABLED | -10 |
| | PLACEMENT_FAILED | -20 |

---

## Context Fields

### Source Values

| Value | Meaning |
|-------|---------|
| search | From search results |
| recommendation | From ML recommendations |
| notification | From notification click |
| direct | Direct navigation |
| feed | From activity feed |
| email | From email link |
| referral | From referral link |

### Position

For list-based events, position (0-indexed) indicates where in the list the item appeared.

### Metadata Best Practices

1. **Always include score** for student-related events
2. **Always include source** for opportunity interactions
3. **Always include position** for list interactions
4. **Always include modelVersion** for ML-driven actions
5. **Never include PII** in metadata

---

## Implementation

### Event Logging Utility

```typescript
// /src/lib/events.ts

import { db } from './db';

export async function logEvent(params: {
  userId: string;
  userType: 'STUDENT' | 'COMPANY' | 'COLLEGE' | 'ADMIN';
  sessionId?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  source?: string;
  position?: number;
  experimentId?: string;
  experimentGroup?: string;
  metadata?: Record<string, any>;
}) {
  // Fire and forget - don't block on event logging
  db.event.create({
    data: {
      ...params,
      timestamp: new Date(),
    },
  }).catch(console.error);
}

// Convenience functions
export const Events = {
  opportunityView: (userId: string, opportunityId: string, source: string, position?: number) =>
    logEvent({ userId, userType: 'STUDENT', eventType: 'OPPORTUNITY_VIEW', entityType: 'opportunity', entityId: opportunityId, source, position }),

  applicationSubmit: (userId: string, opportunityId: string, score: number, wasRecommended: boolean, position?: number) =>
    logEvent({ userId, userType: 'STUDENT', eventType: 'APPLICATION_SUBMIT', entityType: 'opportunity', entityId: opportunityId, metadata: { score, wasRecommended, recommendationRank: position } }),

  verification90Complete: (userId: string, placementId: string, stillEmployed: boolean) =>
    logEvent({ userId, userType: 'STUDENT', eventType: 'VERIFICATION_90_COMPLETE', entityType: 'placement', entityId: placementId, metadata: { stillEmployed } }),

  // ... more convenience functions
};
```

### Middleware Pattern

```typescript
// Add to all tRPC procedures
const loggedProcedure = publicProcedure.use(async ({ ctx, next, path }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  
  // Log API call
  if (ctx.user) {
    logEvent({
      userId: ctx.user.id,
      userType: ctx.user.role,
      sessionId: ctx.sessionId,
      eventType: 'API_CALL',
      metadata: { path, duration, success: result.ok },
    });
  }
  
  return result;
});
```

---

## Querying Events

### For Analytics

```sql
-- Daily active users
SELECT DATE(timestamp), COUNT(DISTINCT user_id)
FROM events
WHERE event_type = 'SESSION_START'
GROUP BY DATE(timestamp);

-- Application funnel
SELECT 
  COUNT(*) FILTER (WHERE event_type = 'OPPORTUNITY_VIEW') as views,
  COUNT(*) FILTER (WHERE event_type = 'APPLICATION_START') as starts,
  COUNT(*) FILTER (WHERE event_type = 'APPLICATION_SUBMIT') as submits
FROM events
WHERE timestamp > NOW() - INTERVAL '7 days';

-- Recommendation performance
SELECT 
  position,
  COUNT(*) as impressions,
  COUNT(*) FILTER (WHERE event_type = 'RECOMMENDATION_CLICKED') as clicks,
  COUNT(*) FILTER (WHERE event_type = 'RECOMMENDATION_APPLIED') as applications
FROM events
WHERE event_type LIKE 'RECOMMENDATION%'
GROUP BY position;
```

### For ML Training

```sql
-- Get training examples with outcomes
SELECT 
  e.*,
  COALESCE(e.reward_value, 0) as reward
FROM events e
WHERE e.reward_attributed = true
ORDER BY e.timestamp;

-- Feature-outcome pairs
SELECT 
  s.features,
  CASE WHEN p.still_employed_90 THEN 1 ELSE 0 END as outcome
FROM student_feature_snapshots s
JOIN placements p ON s.student_id = p.student_id
WHERE p.verification_90_at IS NOT NULL;
```

---

## Summary

Events are the fuel.
No events = No learning.
Every feature must log events.
This is non-negotiable.
