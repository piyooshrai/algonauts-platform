# Algonaut Game Theory

## Purpose

This document defines the psychological mechanics that drive engagement.
Every feature must answer: "What human behavior does this exploit?"

---

## The Indian Fresher Psychology

### Hierarchy of Needs (Indian Context)

```
LEVEL 1: FAMILY VALIDATION (Strongest)
├── "Beta got placed at [Company]"
├── WhatsApp-shareable achievement
├── Marriage market value (real factor)
├── Parents can tell relatives
└── Measured in: Package number, company brand

LEVEL 2: PEER COMPETITION
├── "I got placed before Sharma's son"
├── College bragging rights
├── Social media flex
├── Fear of being left behind
└── Measured in: Relative ranking, timing

LEVEL 3: SECURITY
├── Any job > no job
├── Known brand > startup
├── Salary certainty
└── Measured in: Offer in hand

LEVEL 4: CAREER FIT (Weakest for freshers)
├── Actual job satisfaction
├── Growth potential
└── Usually considered AFTER getting offer
```

### Key Psychological Triggers

| Trigger | Description | Application |
|---------|-------------|-------------|
| Loss Aversion | Fear of missing out > desire for gain | "Only 3 spots left" |
| Social Proof | Others doing it = I should too | "47 from your college applied" |
| Status | Relative position matters | Leaderboards, percentiles |
| Scarcity | Limited = valuable | Deadlines, spots remaining |
| Progress | Visible advancement = motivation | Badges, completion bars |
| Reciprocity | Given value = feel obligated | Free assessment, then ask for referral |
| Authority | Trust credible sources | Company logos, college endorsements |
| Commitment | Small yes → big yes | Profile completion → application |

---

## Mechanic 1: Scarcity + FOMO

### What We Show

```
OPPORTUNITY CARD:
┌─────────────────────────────────────────┐
│  Software Engineer Intern               │
│  @ TechCorp                             │
│                                         │
│  🔥 High demand                         │
│  ├── 47 applications today              │
│  ├── 8 from your college                │
│  └── Only 3 spots remaining             │
│                                         │
│  ⏰ Closes in 2 days                    │
│                                         │
│  [APPLY NOW]                            │
└─────────────────────────────────────────┘
```

### Implementation

```typescript
interface ScarcitySignals {
  spotsTotal: number;
  spotsRemaining: number;           // Decrements with applications
  applicationsToday: number;
  applicationsFromYourCollege: number;
  closingIn: string;                // "2 days", "5 hours"
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

function calculateDemandLevel(opportunity: Opportunity): DemandLevel {
  const velocity = opportunity.applicationsLast24h / opportunity.avgDailyApplications;
  if (velocity > 3) return 'VERY_HIGH';
  if (velocity > 2) return 'HIGH';
  if (velocity > 1) return 'MEDIUM';
  return 'LOW';
}
```

### Psychology

- **Loss aversion**: "Only 3 spots" triggers fear of missing out
- **Social proof**: "47 applications today" = must be good
- **Urgency**: "Closes in 2 days" = act now or regret

---

## Mechanic 2: Leaderboards + Status

### College Leaderboard

```
KARNATAKA ENGINEERING COLLEGES
┌─────────────────────────────────────────────────────┐
│ Rank │ College              │ Students │ Placed │ % │
├─────────────────────────────────────────────────────┤
│  1   │ RVCE                 │   1,234  │   567  │46%│
│  2   │ BMS                  │   1,100  │   489  │44%│
│  3   │ PESIT                │     987  │   401  │41%│
│  ... │                      │          │        │   │
│ 47   │ YOUR COLLEGE ⬆️+3    │     456  │   123  │27%│
└─────────────────────────────────────────────────────┘

"Your college moved up 3 spots this month! 
10 more placements to reach Top 40."
```

### Student Percentile

```
YOUR STANDING
┌─────────────────────────────────────────┐
│                                         │
│  LayersRank Score: 78                   │
│                                         │
│  📊 National: Top 15%                   │
│  🏫 Your College: Top 8%                │
│  💻 React Developers: Top 12%           │
│                                         │
│  👆 4 points to reach Top 10% nationally│
│                                         │
└─────────────────────────────────────────┘
```

### Implementation

```typescript
interface StudentRanking {
  score: number;
  percentileNational: number;
  percentileCollege: number;
  percentileSkill: Record<string, number>;
  
  // What's next
  pointsToNextTier: number;
  nextTierLabel: string;  // "Top 10%"
  
  // Movement
  rankChangeWeek: number;  // +5 or -3
  rankChangeTrigger: string;  // "You passed 23 students this week"
}

interface CollegeRanking {
  rank: number;
  previousRank: number;
  movement: number;
  
  // Competition
  collegeAhead: string;
  gapToNext: number;      // "10 more placements to pass BMS"
  collegeBehind: string;
  leadOverPrevious: number;
}
```

### Psychology

- **Status**: Percentile = social standing
- **Competition**: College pride is intense in India
- **Progress**: "4 points to next tier" = achievable goal
- **Comparison**: Relative position > absolute score

---

## Mechanic 3: Achievement Unlocks + Badges

### Badge System

```
BADGES EARNED (7/24)

🌟 First Steps
├── ✅ Profile Pioneer     - Created profile
├── ✅ Assessment Ready    - Completed LayersRank
├── ✅ First Application   - Applied to first opportunity
└── ⬜ Quick Starter       - Applied within 24h of posting

🚀 Engagement
├── ✅ Streak Starter      - 3-day login streak
├── ⬜ Streak Master       - 7-day login streak
├── ⬜ Streak Legend       - 30-day login streak
└── ✅ Profile Pro         - 100% profile complete

💼 Achievement
├── ⬜ In Demand           - Received 5 company invites
├── ⬜ Interview Ready     - Scored 80+ on LayersRank
├── ⬜ Shortlist Star      - Shortlisted 3 times
└── ⬜ Placement Pioneer   - Got placed through Algonaut

👑 Elite
├── ⬜ Top 10%             - Reached top 10% nationally
├── ⬜ College Champion    - Highest score in your college
├── ⬜ Trailblazer         - First from college to join
└── ⬜ Founding Member     - Among first 1000 students
```

### Streak System

```
🔥 CURRENT STREAK: 7 days

[■ ■ ■ ■ ■ ■ ■ □ □ □]

"Don't break your streak! 3 more days to earn Streak Legend badge"

STREAK REWARDS:
├── 3 days: Streak Starter badge
├── 7 days: Streak Master badge + Priority in recommendations
├── 14 days: Profile boost (2x visibility for 24h)
├── 30 days: Streak Legend badge + Featured profile
└── 60 days: Algonaut Elite status
```

### Implementation

```typescript
interface Badge {
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  
  // Criteria
  criteria: BadgeCriteria;
  
  // Visibility
  isShareable: boolean;
  shareTemplate: string;  // For WhatsApp/Instagram
}

interface StudentBadges {
  earned: Badge[];
  inProgress: Array<{
    badge: Badge;
    progress: number;      // 0-100
    remaining: string;     // "2 more applications"
  }>;
  locked: Badge[];        // Not started
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  
  // Rewards
  nextMilestone: number;
  nextReward: string;
  daysToMilestone: number;
}
```

### Psychology

- **Collection**: Humans want to complete sets
- **Progress**: Visible advancement motivates
- **Sunk cost**: "I have 7 badges, can't stop now"
- **Status**: Badges are displayable status symbols

---

## Mechanic 4: Social Proof Feed

### Activity Feed

```
HAPPENING NOW

🎉 Priya S. from your college just got placed at Infosys!
   2 minutes ago

📝 23 students applied to "Data Analyst at Amazon" in the last hour
   15 minutes ago

🏆 Your college moved up to #45 in Karnataka rankings
   1 hour ago

👀 A company viewed your profile
   3 hours ago

🆕 5 new opportunities match your skills
   Today

💪 Rahul M. improved his score by 12 points
   Today
```

### Real-Time Notifications

```
NOTIFICATION TYPES:

Peer Activity (FOMO triggers):
├── "[Name] from your college just applied to [Company]"
├── "[Name] from your batch just got placed!"
├── "5 students with similar profiles applied to [Opportunity]"
└── "[Name] just passed you in college rankings"

Opportunity (Urgency triggers):
├── "New: [Company] is hiring - matches your skills"
├── "Closing soon: Only 2 days left for [Opportunity]"
├── "Last 3 spots for [Opportunity]"
└── "[Company] you viewed is now hiring"

Validation (Status triggers):
├── "A company viewed your profile"
├── "Your application was shortlisted!"
├── "You're in the top 15% this week"
└── "Your college rank improved!"

Loss (Loss aversion triggers):
├── "You missed 3 opportunities this week"
├── "Your streak is about to break!"
├── "Students with lower scores got placed - they applied more"
└── "Your profile views dropped 30%"
```

### Implementation

```typescript
interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  timestamp: Date;
  
  // Targeting
  visibility: 'PUBLIC' | 'COLLEGE' | 'PERSONAL';
  targetCollegeId?: string;
  targetUserId?: string;
  
  // Content
  message: string;
  icon: string;
  
  // Action
  actionUrl?: string;
  actionLabel?: string;
}

enum ActivityType {
  STUDENT_PLACED,
  STUDENT_SHORTLISTED,
  PEER_APPLIED,
  COLLEGE_RANK_CHANGED,
  PROFILE_VIEWED,
  NEW_OPPORTUNITY,
  DEADLINE_APPROACHING,
  SCORE_IMPROVED,
  STREAK_MILESTONE,
}
```

### Psychology

- **Social proof**: Others succeeding = I can too
- **FOMO**: Peers acting = I should act
- **Validation**: Being viewed = I matter
- **Competition**: Peers passing me = I must catch up

---

## Mechanic 5: Placement Celebration

### The Shareable Moment

```
🎉 CONGRATULATIONS! 🎉

┌─────────────────────────────────────────┐
│                                         │
│         [Student Photo]                 │
│                                         │
│         PRIYA SHARMA                    │
│         Software Engineer               │
│         @ INFOSYS                       │
│                                         │
│         LayersRank: 82 | Top 12%        │
│         XYZ Engineering College         │
│                                         │
│         ─────────────────               │
│         #AlgonautPlaced                 │
│         [Algonaut Logo]                 │
│                                         │
└─────────────────────────────────────────┘

[Share on WhatsApp] [Share on Instagram] [Download Card]
```

### Celebration Flow

```
WHEN STUDENT GETS PLACED:

1. Confetti animation (dopamine hit)

2. Achievement popup
   ├── "You did it! Placement Pioneer badge earned"
   └── "You're the 47th student from your college to get placed"

3. Shareable card generated
   ├── Personalized with photo, company, score
   ├── Optimized for WhatsApp (most used in India)
   ├── Instagram story format
   └── LinkedIn format

4. College notification
   ├── College leaderboard updated
   └── College admin notified

5. Activity feed
   └── "Priya S. from [College] just got placed at Infosys!"

6. Follow-up scheduled
   ├── 30-day check-in
   └── 90-day verification
```

### Implementation

```typescript
interface PlacementCelebration {
  studentId: string;
  companyName: string;
  role: string;
  
  // Card data
  cardImageUrl: string;
  cardData: {
    studentName: string;
    photoUrl: string;
    score: number;
    percentile: number;
    collegeName: string;
  };
  
  // Sharing
  whatsappShareUrl: string;
  instagramStoryUrl: string;
  linkedinShareUrl: string;
  downloadUrl: string;
  
  // Tracking
  shareCount: Record<string, number>;  // { whatsapp: 5, instagram: 2 }
}

async function celebratePlacement(placement: Placement) {
  // 1. Generate shareable card
  const card = await generatePlacementCard(placement);
  
  // 2. Award badge
  await awardBadge(placement.studentId, 'PLACEMENT_PIONEER');
  
  // 3. Update leaderboards
  await updateCollegeLeaderboard(placement.collegeId);
  
  // 4. Create activity feed item
  await createActivityFeedItem({
    type: 'STUDENT_PLACED',
    visibility: 'COLLEGE',
    targetCollegeId: placement.collegeId,
    message: `${placement.studentName} just got placed at ${placement.companyName}!`,
  });
  
  // 5. Schedule follow-ups
  await scheduleFollowUp(placement.studentId, 30);  // 30 days
  await scheduleFollowUp(placement.studentId, 90);  // 90 days
  
  // 6. Track for viral coefficient
  await trackCelebration(placement);
}
```

### Psychology

- **Validation**: The whole point of the journey
- **Viral loop**: Friends see card → friends join
- **Reciprocity**: Platform helped → share/refer
- **Status**: Publicly displayed achievement

---

## Mechanic 6: Progressive Unlocks

### Level System

```
LEVEL 1: NEWCOMER
├── Can browse opportunities
├── Can see company names
├── CANNOT apply
├── CANNOT see full details
└── Prompt: "Complete your profile to unlock applications"

LEVEL 2: MEMBER (Profile Complete)
├── Can apply to opportunities
├── Can see basic salary ranges
├── CANNOT see analytics
├── CANNOT see detailed rankings
└── Prompt: "Take LayersRank assessment to see how you compare"

LEVEL 3: ASSESSED (LayersRank Done)
├── Full platform access
├── Detailed analytics
├── Percentile rankings
├── Company invite eligibility
└── Prompt: "Score 80+ to unlock Premium Opportunities"

LEVEL 4: HIGH PERFORMER (Score 80+)
├── Premium opportunities visible
├── Priority in company searches
├── Featured candidate status
├── Direct company outreach
└── "Elite" badge

LEVEL 5: PLACED (Successfully placed)
├── Alumni status
├── Can mentor juniors (future)
├── Early access to new features
├── Referral bonuses
└── "Success Story" eligibility
```

### Implementation

```typescript
interface UserLevel {
  current: 1 | 2 | 3 | 4 | 5;
  label: string;
  
  // Permissions
  canApply: boolean;
  canSeeAnalytics: boolean;
  canSeePremium: boolean;
  isPrioritized: boolean;
  
  // Next level
  nextLevel: number;
  nextLevelRequirement: string;
  progressToNext: number;  // 0-100
}

function calculateLevel(student: StudentProfile): UserLevel {
  if (student.placementStatus === 'PLACED_VERIFIED') return level5();
  if (student.layersRankScore >= 80) return level4();
  if (student.layersRankScore !== null) return level3();
  if (student.completenessScore >= 80) return level2();
  return level1();
}
```

### Psychology

- **Curiosity gap**: "What am I missing?"
- **Investment**: Each level = more invested
- **Sunk cost**: "Can't quit now"
- **Exclusivity**: Higher levels = status

---

## Mechanic 7: Loss Aversion Notifications

### What We Send

```
HIGH IMPACT (Loss-framed):
├── "You missed 3 opportunities that matched your profile this week"
├── "5 students with lower scores than you got placed - they applied more"
├── "Your profile views dropped 40% - update your skills?"
├── "Your streak is about to break! Log in to keep it"
├── "This opportunity closes in 4 hours - 12 spots left"
├── "You were considered for [Company] but didn't meet score cutoff"

MEDIUM IMPACT (Comparison-framed):
├── "Rahul from your college just passed you in rankings"
├── "Students like you apply to 5+ opportunities per week"
├── "Your response rate is lower than 70% of active students"

LOW IMPACT (Gain-framed) - Use sparingly:
├── "New opportunity matches your skills"
├── "3 new companies joined Algonaut this week"
```

### Notification Strategy

```typescript
interface NotificationStrategy {
  // When to use loss framing
  lossFraming: {
    churningUser: true,      // About to leave
    inactiveUser: true,      // Hasn't logged in
    lowEngagement: true,     // Not applying
    streakAtRisk: true,      // About to break streak
  };
  
  // When to use gain framing
  gainFraming: {
    newUser: true,           // Don't scare them away
    highEngagement: true,    // Already motivated
    recentSuccess: true,     // Just got shortlisted
  };
  
  // When NOT to notify
  blackout: {
    tooManyRecent: true,     // >3 notifications in 24h
    userOptedOut: true,
    placedUser: true,        // Don't spam placed users
  };
}
```

### Psychology

- **Loss > Gain**: Losing something hurts 2x more than gaining
- **Regret minimization**: "What if I miss out?"
- **Comparison**: Others succeeding = I'm falling behind
- **Urgency**: Limited time = must act now

---

## Mechanic 8: College as Viral Unit

### College Competition

```
INTER-COLLEGE LEADERBOARD

🏆 PLACEMENT CHAMPIONS - KARNATAKA ENGINEERING

Monthly Rankings:
├── #1 RVCE - 234 placements (↑2)
├── #2 BMS - 198 placements (↓1)
├── #3 PESIT - 167 placements (—)
└── ...

Your College: #47 (↑5 this month)
Need: 12 more placements to reach #42

[Share Your College Rank] [Invite Classmates]
```

### College Incentives

```
COLLEGE ACHIEVEMENTS:

🥉 Bronze College (10+ placements)
├── College name displayed
└── Basic analytics

🥈 Silver College (50+ placements)
├── College badge on student profiles
├── Priority in company filters
└── Featured in regional listings

🥇 Gold College (100+ placements)
├── Premium badge
├── Featured placement partner
├── Company introductions
└── Annual recognition

💎 Platinum College (500+ placements)
├── All Gold benefits
├── Co-branded campaigns
├── Exclusive opportunities
└── Student success stories featured
```

### Viral Mechanics

```
REFERRAL SYSTEM:

"Help your college climb the rankings!"

When you invite a classmate:
├── +1 point to college score
├── If they get assessed: +5 points
├── If they get placed: +50 points
├── You get: "College Champion" badge progress

COLLEGE ADMIN TOOLS:
├── Bulk invite students
├── Track engagement
├── See placement analytics
├── Download reports
└── Share wins on social media
```

### Implementation

```typescript
interface CollegeGamification {
  collegeId: string;
  
  // Leaderboard
  nationalRank: number;
  stateRank: number;
  categoryRank: number;
  rankChange: number;         // This month
  
  // Tier
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  tierProgress: number;       // Progress to next tier
  
  // Competition
  collegeAhead: {
    name: string;
    gap: number;              // Placements needed to pass
  };
  collegeBehind: {
    name: string;
    lead: number;             // Placements ahead
  };
  
  // Achievements
  monthlyPlacements: number;
  totalPlacements: number;
  avgStudentScore: number;
}
```

### Psychology

- **Group identity**: College pride is intense
- **Competition**: Inter-college rivalry
- **Status**: College ranking = personal status
- **Viral loop**: Students recruit classmates for college rank

---

## Measurement

### Key Metrics by Mechanic

| Mechanic | Primary Metric | Target |
|----------|---------------|--------|
| Scarcity | Application rate on "limited" opps | 2x normal |
| Leaderboards | Time on leaderboard page | >30s avg |
| Badges | Badges earned per user | 5+ in first month |
| Social Proof | Click-through on feed items | >15% |
| Celebration | Share rate on placement | >50% |
| Progressive Unlocks | Level 3+ users | >70% in 30 days |
| Loss Aversion | Re-engagement from loss notifications | >30% |
| College Viral | Referrals per student | >0.5 |

### A/B Tests to Run

```
TEST 1: Scarcity framing
├── Control: "Apply now"
├── Treatment: "Only 3 spots left - Apply now"
└── Metric: Application rate

TEST 2: Loss vs Gain notifications
├── Control: "5 new opportunities for you"
├── Treatment: "You missed 3 opportunities this week"
└── Metric: Re-engagement rate

TEST 3: Leaderboard visibility
├── Control: Leaderboard in menu
├── Treatment: Leaderboard on dashboard
└── Metric: Applications per user

TEST 4: Streak rewards
├── Control: No streak system
├── Treatment: Streak with badges
└── Metric: DAU/MAU ratio
```

---

## Anti-Gaming Measures

### Prevent Exploitation

```
RULES:

1. Application limits
   └── Max 20 applications per week
   └── Prevents spray-and-pray

2. Streak authenticity
   └── Must have meaningful action (not just login)
   └── Application, profile update, or assessment progress

3. Referral quality
   └── Referred student must complete assessment
   └── Prevents fake referrals for points

4. Leaderboard integrity
   └── Only verified placements count
   └── 90-day retention required for full credit
```

---

## Summary

Every feature asks: **"What behavior does this drive?"**

| Feature | Behavior Driven | Business Value |
|---------|----------------|----------------|
| Scarcity signals | Faster applications | More data, faster |
| Leaderboards | Competition, engagement | Higher DAU/MAU |
| Badges | Continued engagement | Retention |
| Social proof | FOMO, applications | More data |
| Celebration | Sharing, referrals | Viral growth |
| Progressive unlocks | Profile completion, assessment | Data quality |
| Loss notifications | Re-engagement | Reduce churn |
| College competition | Viral referrals | Distribution |

**The game theory is not a feature. It IS the product.**

Without it, we're just another job board.
With it, we're a data flywheel that gets stronger every day.
