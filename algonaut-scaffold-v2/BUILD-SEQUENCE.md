# Algonaut Build Sequence v2

## Principles

1. **Hours, not days** - Claude Code doesn't sleep
2. **Outcome data first** - Every feature asks: does this generate outcome data?
3. **Game theory built-in** - Not added later
4. **Event logging from start** - ML needs data from day 1

---

## Total Estimated Time: 40-50 hours

```
Phase 1: Foundation (8-10 hours)
Phase 2: Core Platform (10-12 hours)
Phase 3: Game Theory (8-10 hours)
Phase 4: RL Infrastructure (8-10 hours)
Phase 5: Polish & Launch (6-8 hours)
```

---

## Phase 1: Foundation (8-10 hours)

### 1.1 Project Setup (2 hours)

**Tasks:**
- Create Supabase project
- Configure environment variables
- Copy schema.prisma
- Run initial migration
- Set up tRPC scaffolding
- Create Prisma client singleton
- Verify database connection

**Files:**
```
/src/lib/db.ts
/src/lib/supabase-server.ts
/src/lib/supabase-browser.ts
/src/server/trpc.ts
/src/server/routers/_app.ts
/src/app/api/trpc/[trpc]/route.ts
```

**Acceptance:**
- `npx prisma studio` shows all tables
- `/api/trpc/health` returns 200

---

### 1.2 Event Logging System (2 hours)

**CRITICAL: Must be in place before anything else.**

**Tasks:**
- Create event logging utility
- Create event types enum
- Add event middleware
- Verify events capturing

**Files:**
```
/src/lib/events.ts
/src/lib/event-types.ts
```

**Code Pattern:**
```typescript
// /src/lib/events.ts
export async function logEvent(params: {
  userId: string;
  userType: 'STUDENT' | 'COMPANY' | 'COLLEGE';
  sessionId?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  source?: string;
  position?: number;
  metadata?: Record<string, any>;
}) {
  return db.event.create({ data: { ...params, timestamp: new Date() } });
}
```

**Acceptance:**
- Events table populating
- Event logging < 10ms overhead

---

### 1.3 Authentication (2 hours)

**Tasks:**
- Supabase Auth setup
- Sign up with role
- Sign in / Sign out
- Auth middleware
- Session management
- LOG AUTH EVENTS

**Events to Log:**
- USER_SIGNUP { role }
- USER_LOGIN { method }
- SESSION_START

---

### 1.4 Profile CRUD (2-3 hours)

**Tasks:**
- Student/Company/College profiles
- Profile completeness calculation
- Company auto-verification
- Connect to UI
- LOG PROFILE EVENTS

**Company Auto-Verification:**
```typescript
async function autoVerifyCompany(company: CompanyProfile) {
  const checks = await Promise.all([
    verifyDomainEmail(company.contactEmail),
    verifyWebsiteExists(company.website),
  ]);
  const passed = checks.filter(c => c.passed).length;
  return passed >= 2 ? 'AUTO_VERIFIED' : 'PENDING';
}
```

---

## Phase 2: Core Platform (10-12 hours)

### 2.1 Opportunities (3 hours)

**Tasks:**
- Full CRUD
- Publish/Close flow
- Search with filters
- Scarcity signals calculation
- LOG EVENTS

**Scarcity Signals:**
```typescript
interface ScarcitySignals {
  spotsRemaining: number | null;
  applicationsToday: number;
  applicationsFromYourCollege: number;
  closingIn: string | null;
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}
```

---

### 2.2 Applications (3 hours)

**Tasks:**
- Submit with validation
- Score requirement check
- Status updates
- Recommendation tracking
- LOG EVENTS

**Validation:**
```typescript
if (opportunity.minLayersRankScore && student.layersRankScore < opportunity.minLayersRankScore) {
  throw new Error(`Minimum score of ${opportunity.minLayersRankScore} required`);
}
```

---

### 2.3 Invites (1 hour)

**Tasks:**
- Send/Accept/Decline
- Creates application on accept
- LOG EVENTS

---

### 2.4 Placements & Verification (3 hours)

**THE MOST IMPORTANT FEATURE FOR ACQUISITION**

**Tasks:**
- Create placement on offer acceptance
- 30-day verification flow
- 90-day verification flow (THE GOLD)
- Shareable placement cards
- LOG ALL VERIFICATION EVENTS

**Verification Flow:**
```typescript
async function handle90DayVerification(placementId: string, stillEmployed: boolean) {
  await db.placement.update({
    where: { id: placementId },
    data: {
      verification90At: new Date(),
      stillEmployed90: stillEmployed,
      status: stillEmployed ? 'VERIFIED_90DAY' : 'FAILED',
    },
  });

  // THIS IS GOLD - triggers reward attribution
  await logEvent({
    eventType: 'VERIFICATION_90_COMPLETE',
    metadata: { stillEmployed },
  });
  
  await attributePlacementReward(placementId, stillEmployed ? 100 : -20);
}
```

---

### 2.5 College Features (2 hours)

**Tasks:**
- Bulk CSV import
- Student roster
- Basic analytics
- LOG EVENTS

---

## Phase 3: Game Theory (8-10 hours)

### 3.1 Gamification Core (3 hours)

**Tasks:**
- Badge system (15+ badges defined)
- Badge earning logic
- Streak tracking
- Level/XP system
- LOG EVENTS

**Badge Categories:**
- First Steps: Profile Pioneer, Assessment Ready, First Application
- Engagement: Streak Starter/Master/Legend, Profile Pro
- Achievement: In Demand, Interview Ready, Placement Pioneer
- Elite: Top 10%, College Champion, Founding Member

---

### 3.2 Leaderboards (2 hours)

**Tasks:**
- Student college leaderboard
- Student national leaderboard
- College rankings
- Hourly update job
- Rank change notifications

---

### 3.3 Activity Feed (1.5 hours)

**Tasks:**
- Feed item creation on events
- Public/College/Personal feeds
- Real-time updates

**Triggers:**
- Student placed → College feed
- Peer applied → Personal feed
- College rank changed → College feed

---

### 3.4 Notifications (2 hours)

**Tasks:**
- Push/Email/In-app
- Loss-framing templates
- Full tracking (sent → delivered → opened → clicked)
- LOG ALL FOR ML

**Templates:**
- "You missed X opportunities this week"
- "Only X spots left"
- "X classmates applied today"
- "Don't break your streak!"

---

### 3.5 Placement Celebration (1.5 hours)

**Tasks:**
- Shareable card generation
- WhatsApp/Instagram formats
- Share tracking
- Viral loop trigger

---

## Phase 4: RL Infrastructure (8-10 hours)

### 4.1 Feature Store (2 hours)

**Tasks:**
- StudentFeatures computation
- OpportunityFeatures computation
- Redis storage
- Hourly updates
- Feature snapshots

**Key Features:**
```typescript
interface StudentFeatures {
  layersRankScore: number;
  applicationCount7d: number;
  applicationSuccessRate: number;
  preferredIndustry: string[];
  activeHours: number[];
  churnRisk: number;
  placementProbability: number;
}
```

---

### 4.2 Recommendation Engine (3 hours)

**Tasks:**
- Opportunity ranking for students
- Candidate ranking for companies
- Position tracking
- A/B test framework
- LOG RECOMMENDATIONS

**V1 Algorithm (Heuristics):**
```typescript
function calculateMatchScore(student, opportunity): number {
  let score = 0;
  score += skillMatchScore * 30;
  score += scoreFitScore * 20;
  score += preferenceMatchScore * 15;
  score += recencyBonus * 15;
  return score;
}
```

---

### 4.3 Reward Attribution (2 hours)

**Tasks:**
- Define reward values
- Time-decay attribution
- Connect outcomes to touchpoints
- Update training data

**Reward Values:**
```typescript
const REWARDS = {
  NOTIFICATION_OPENED: 1,
  APPLICATION_SUBMITTED: 5,
  INTERVIEW_SCHEDULED: 20,
  OFFER_ACCEPTED: 50,
  PLACEMENT_VERIFIED_90: 100,  // THE GOLD
};
```

---

### 4.4 Experimentation Framework (2 hours)

**Tasks:**
- Experiment creation
- Consistent user assignment
- Metric tracking by variant
- Significance calculation

---

## Phase 5: Polish & Launch (6-8 hours)

### 5.1 Admin Panel (2 hours)

- User management
- Manual verification
- LayersRank score entry (MVP)
- Acquisition metrics dashboard

### 5.2 Email Integration (1.5 hours)

- Resend setup
- All transactional emails
- Verification request emails

### 5.3 Testing (2 hours)

- E2E critical flows
- Event logging verification
- Placement verification flow

### 5.4 Security (1 hour)

- Rate limiting
- Input validation
- Security headers

### 5.5 Deploy (1.5 hours)

- Production setup
- Migration
- Monitoring
- Smoke tests

---

## Launch Checklist

```
[ ] All tests passing
[ ] Events logging verified
[ ] Notifications sending
[ ] Verification flows working
[ ] Admin can set scores
[ ] Monitoring active
[ ] First users ready
```

---

## Post-Launch Loop

**Week 1-2:** Data collection, baseline metrics
**Week 3-4:** Train initial models, deploy with canary
**Month 2+:** Weekly model updates, continuous experiments

---

## Definition of Done

Each feature complete when:
- Implementation matches spec
- **ALL events logged** (CRITICAL)
- Error handling complete
- Mobile responsive
- Tests passing

**If events aren't logging, the feature is NOT done.**

---

## Summary

| Phase | Hours | Focus |
|-------|-------|-------|
| Foundation | 8-10 | Setup + EVENT LOGGING |
| Core | 10-12 | Placements + VERIFICATION |
| Game Theory | 8-10 | Engagement = DATA |
| RL | 8-10 | Learning Loop |
| Polish | 6-8 | Launch Ready |
| **Total** | **40-50** | |

Claude Code executes. Events flow. Models learn. Moat deepens.
