# Algonaut RL Architecture

## Purpose

This document defines how the platform learns from every interaction.
The goal: Prediction accuracy improves automatically with scale.

---

## The Core Premise

```
TRADITIONAL PLATFORM:
Human writes rules → Platform executes → Outcomes happen → Humans analyze → Humans write new rules

Time to improve: Weeks to months
Scales with: Human effort

RL PLATFORM:
Platform takes action → Outcomes happen → Reward signal → Model updates → Better actions

Time to improve: Hours to days
Scales with: Data volume
```

**India's 10M freshers/year = 10x learning speed vs any other market.**

---

## The Four Learning Loops

### Loop 1: Student Engagement Optimization

**Question**: What notification/nudge, sent when, maximizes student engagement?

```
AGENT: Notification System

STATE (What we know about the student):
├── Profile
│   ├── Score, percentile, skills
│   ├── College tier
│   ├── Graduation year
│   └── Profile completeness
│
├── Behavior
│   ├── Days since last login
│   ├── Application count (7d, 30d)
│   ├── Application success rate
│   ├── Notification response history
│   ├── Active hours pattern
│   └── Device type
│
├── Context
│   ├── Time of day
│   ├── Day of week
│   ├── New opportunities matching profile
│   ├── Deadlines approaching
│   └── Peer activity (classmates applying)
│
└── History
    ├── Last notification sent
    ├── Time since last notification
    └── Cumulative notification response rate

ACTION SPACE (What we can do):
├── Notification Content
│   ├── New opportunity alert
│   ├── Deadline reminder
│   ├── Peer activity ("Rahul just applied")
│   ├── Comparison ("You're 2 points from Top 10%")
│   ├── Streak reminder
│   ├── Profile improvement suggestion
│   ├── "Company viewed your profile"
│   ├── Loss framing ("You missed 3 opportunities")
│   └── NO_ACTION (don't notify)
│
├── Timing
│   ├── Now
│   ├── Morning (8-10am)
│   ├── Lunch (12-2pm)
│   ├── Evening (6-8pm)
│   └── Night (9-11pm)
│
└── Channel
    ├── Push notification
    ├── Email
    ├── In-app
    └── SMS (high priority)

REWARD SIGNAL:
├── Immediate
│   ├── +1: Notification opened
│   ├── +3: Logged in within 1 hour
│   ├── +5: Completed suggested action
│   ├── -1: Notification dismissed
│   ├── -5: Notifications turned off
│   └── -10: App uninstalled
│
├── Short-term (24h)
│   ├── +10: Applied to opportunity
│   ├── +5: Updated profile
│   ├── +3: Spent 5+ minutes on platform
│   └── -3: No engagement after open
│
└── Long-term (attributed)
    ├── +30: Got interview
    ├── +50: Got shortlisted
    ├── +100: Got placed
    └── +20: Referred a friend
```

**What It Learns:**
```
"Tier 2 college students respond best to peer activity 
notifications ('Rahul from your college just applied') 
sent at 9pm on weekdays."

"High scorers (80+) respond to scarcity ('3 spots left') 
2x more than social proof."

"Students with broken streaks respond to loss framing 
('You lost your 7-day streak') 3x better than gain framing 
('Start a new streak')."

"Sending >2 notifications per day reduces overall 
response rate by 40%."
```

---

### Loop 2: Opportunity-Student Matching

**Question**: Which opportunities should we show to which students, and in what order?

```
AGENT: Recommendation/Ranking System

STATE:
├── Student Features
│   ├── LayersRank score + breakdown
│   ├── Skills
│   ├── Location preference
│   ├── Graduation year
│   ├── College
│   ├── Past applications (clicked, applied, ignored)
│   ├── Past outcomes (interviews, offers, rejections)
│   └── Implicit preferences (time on page, scroll depth)
│
├── Opportunity Features
│   ├── Required score
│   ├── Required skills
│   ├── Location
│   ├── Company tier
│   ├── Salary range
│   ├── Application velocity
│   ├── Historical conversion rate
│   └── Similar opportunities' performance
│
└── Context
    ├── Search query (if any)
    ├── Filters applied
    ├── Session history (what they've seen)
    └── Time/day

ACTION SPACE:
├── Which opportunities to show (from thousands)
├── In what order (ranking)
├── With what framing
│   ├── "High match" badge
│   ├── "Students like you applied"
│   ├── "Closing soon"
│   ├── "New"
│   ├── "Recommended for you"
│   └── No special framing
└── How many before pagination

REWARD SIGNAL:
├── +1: Viewed opportunity (clicked from list)
├── +2: Time on page > 30 seconds
├── +3: Scrolled to bottom
├── +5: Applied
├── +20: Got interview
├── +50: Got offer
├── +100: Got placed AND stayed 90 days
├── -1: Scrolled past without clicking
├── -2: Clicked but bounced (<5 sec)
└── -10: Applied but immediately rejected (bad match)
```

**What It Learns:**
```
"Students with high communication scores but medium 
technical scores convert 2x better at service companies 
(TCS, Infosys) than product companies."

"'Students from your college applied' badge increases 
applications by 34% for Tier 2 colleges but only 12% 
for Tier 1."

"Students who apply to 5-10 opportunities have 
highest placement rate. <5 = not trying. >15 = 
spray and pray (lower quality applications)."

"Showing salary range increases application rate 
by 23% but decreases quality by 15% (attracts 
salary-focused, not role-focused candidates)."
```

---

### Loop 3: Company Candidate Ranking

**Question**: Which candidates should we show to which companies, and in what order?

```
AGENT: Candidate Ranking System

STATE:
├── Company Features
│   ├── Industry
│   ├── Size
│   ├── Location
│   ├── Historical hiring patterns
│   ├── Candidates interviewed
│   ├── Candidates hired
│   ├── Candidates rejected
│   ├── Time spent on each profile
│   └── Search/filter patterns
│
├── Candidate Features
│   ├── Full profile
│   ├── LayersRank breakdown
│   ├── Application history
│   ├── Interview success rate
│   └── Similar to past hires?
│
└── Context
    ├── Opportunity requirements
    ├── Application volume
    └── Time pressure

ACTION SPACE:
├── Candidate ranking order
├── Which candidates to highlight
│   ├── "Strong match"
│   ├── "Similar to past hires"
│   ├── "Rising talent" (improving score)
│   ├── "Quick responder"
│   └── "College peer of current employee"
└── What information to emphasize

REWARD SIGNAL:
├── +1: Company viewed full profile
├── +3: Company downloaded resume
├── +5: Company sent invite
├── +15: Company interviewed
├── +30: Company made offer
├── +100: Candidate accepted AND stayed 90 days
├── +150: Company posted another opportunity (retention)
├── -5: Company complained about candidate quality
├── -20: Company churned (stopped using platform)
└── -50: Candidate failed within 30 days
```

**What It Learns:**
```
"TCS values consistent scores across categories 
over a high technical score with low communication."

"Startups prefer candidates who applied within 24h 
of posting - signals hustle."

"Service companies have 40% higher conversion from 
Tier 2 colleges than product companies - we should 
adjust ranking accordingly."

"Companies that spend >2 min on a profile have 
60% higher invite rate - we should show those 
candidates first."
```

---

### Loop 4: Assessment Optimization

**Question**: What questions should we ask, and how do we interpret results?

```
AGENT: Assessment Engine (LayersRank)

STATE:
├── Student State
│   ├── Current response pattern
│   ├── Time per question
│   ├── Confidence signals
│   ├── Historical performance (if retaking)
│   └── Peer cohort performance
│
└── Question State
    ├── Difficulty level
    ├── Topic/skill
    ├── Historical discrimination
    ├── Typical time required
    └── Correlation with job success

ACTION SPACE:
├── Next question selection (adaptive)
├── When to stop (confidence threshold)
├── Which skills to probe deeper
└── Score interpretation

REWARD SIGNAL:
├── +50: Score predicted interview success
├── +100: Score predicted job success (90-day retention)
├── -20: High scorer failed interviews (bad signal)
├── -30: Low scorer succeeded (missed talent)
├── +10: Student retook and improved
└── -5: Student abandoned assessment
```

**What It Learns:**
```
"Question 47 (recursion) has 0.85 correlation with 
success at product companies but only 0.3 at service 
companies - weight differently."

"Students who spend >2 min on question 1 but <30 sec 
on questions 2-5 are likely getting help - flag for 
proctoring review."

"Communication score is 2x more predictive of 
placement at BPO companies than technical score."

"Adaptive difficulty increases assessment completion 
rate by 25% with no loss in predictive accuracy."
```

---

## The Data Pipeline

### Event Collection

```
EVERY INTERACTION → EVENT

┌─────────────────────────────────────────────────────────────┐
│                     EVENT SCHEMA                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  eventId: uuid                                              │
│  timestamp: datetime                                        │
│                                                             │
│  // Who                                                     │
│  userId: string                                             │
│  userType: STUDENT | COMPANY | COLLEGE                      │
│  sessionId: string                                          │
│                                                             │
│  // What                                                    │
│  eventType: string (from EventType enum)                    │
│  entityType: string (opportunity, profile, notification)    │
│  entityId: string                                           │
│                                                             │
│  // How they got there                                      │
│  source: search | recommendation | notification | direct    │
│  position: number (if from list)                            │
│  experimentGroup: string (for A/B tests)                    │
│                                                             │
│  // Rich context                                            │
│  metadata: {                                                │
│    timeOnPage: number                                       │
│    scrollDepth: number                                      │
│    deviceType: string                                       │
│    previousEvent: string                                    │
│    searchQuery: string                                      │
│    filtersApplied: object                                   │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Event Types

```typescript
enum EventType {
  // Page views
  PAGE_VIEW = 'PAGE_VIEW',
  
  // Student actions
  OPPORTUNITY_IMPRESSION = 'OPPORTUNITY_IMPRESSION',  // Appeared in list
  OPPORTUNITY_CLICK = 'OPPORTUNITY_CLICK',
  OPPORTUNITY_VIEW = 'OPPORTUNITY_VIEW',              // Detailed view
  APPLICATION_START = 'APPLICATION_START',
  APPLICATION_SUBMIT = 'APPLICATION_SUBMIT',
  APPLICATION_WITHDRAW = 'APPLICATION_WITHDRAW',
  
  PROFILE_VIEW = 'PROFILE_VIEW',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PROFILE_COMPLETE = 'PROFILE_COMPLETE',
  
  ASSESSMENT_START = 'ASSESSMENT_START',
  ASSESSMENT_QUESTION = 'ASSESSMENT_QUESTION',
  ASSESSMENT_COMPLETE = 'ASSESSMENT_COMPLETE',
  ASSESSMENT_ABANDON = 'ASSESSMENT_ABANDON',
  
  SEARCH_EXECUTE = 'SEARCH_EXECUTE',
  FILTER_APPLY = 'FILTER_APPLY',
  
  // Notification interactions
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  NOTIFICATION_DELIVERED = 'NOTIFICATION_DELIVERED',
  NOTIFICATION_OPENED = 'NOTIFICATION_OPENED',
  NOTIFICATION_CLICKED = 'NOTIFICATION_CLICKED',
  NOTIFICATION_DISMISSED = 'NOTIFICATION_DISMISSED',
  
  // Company actions
  CANDIDATE_IMPRESSION = 'CANDIDATE_IMPRESSION',
  CANDIDATE_CLICK = 'CANDIDATE_CLICK',
  CANDIDATE_VIEW = 'CANDIDATE_VIEW',
  CANDIDATE_INVITE = 'CANDIDATE_INVITE',
  CANDIDATE_SEARCH = 'CANDIDATE_SEARCH',
  
  APPLICATION_VIEW = 'APPLICATION_VIEW',
  APPLICATION_STATUS_CHANGE = 'APPLICATION_STATUS_CHANGE',
  
  // Outcomes (rewards)
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  OFFER_MADE = 'OFFER_MADE',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  PLACEMENT_CONFIRMED = 'PLACEMENT_CONFIRMED',
  PLACEMENT_30_DAY = 'PLACEMENT_30_DAY',
  PLACEMENT_90_DAY = 'PLACEMENT_90_DAY',
  PLACEMENT_FAILED = 'PLACEMENT_FAILED',
  
  // Engagement
  SESSION_START = 'SESSION_START',
  SESSION_END = 'SESSION_END',
  STREAK_CONTINUE = 'STREAK_CONTINUE',
  STREAK_BREAK = 'STREAK_BREAK',
  BADGE_EARNED = 'BADGE_EARNED',
  REFERRAL_SENT = 'REFERRAL_SENT',
  REFERRAL_COMPLETE = 'REFERRAL_COMPLETE',
}
```

### Feature Store

```typescript
// Pre-computed features for real-time inference
// Updated every hour

interface StudentFeatures {
  studentId: string;
  updatedAt: Date;
  
  // Static
  collegeId: string;
  collegeTier: number;          // 1, 2, 3
  graduationYear: number;
  skills: string[];
  location: string;
  
  // Scores
  layersRankScore: number | null;
  layersRankPercentile: number | null;
  scoreBreakdown: {
    technical: number;
    aptitude: number;
    communication: number;
    cultural: number;
  } | null;
  
  // Behavioral (rolling windows)
  applicationCount7d: number;
  applicationCount30d: number;
  applicationSuccessRate: number;  // Interviews / Applications
  avgTimeToApply: number;          // Hours after posting
  
  preferredCompanySize: string[];  // Inferred from applications
  preferredIndustry: string[];     // Inferred from applications
  preferredLocation: string[];     // Inferred from applications
  
  activeHours: number[];           // [9, 10, 11, 20, 21]
  activeDays: number[];            // [1, 2, 3, 4, 5] (Mon-Fri)
  
  // Engagement
  loginStreak: number;
  daysActive30d: number;
  avgSessionDuration: number;
  notificationResponseRate: number;
  profileCompleteness: number;
  
  // Computed predictions
  churnRisk: number;               // 0-1
  placementProbability: number;    // 0-1
  expectedTimeToPlacement: number; // Days
  
  // Recommended actions
  recommendedOpportunities: string[];  // Top 10 opportunity IDs
  recommendedActions: string[];        // ["complete_profile", "apply_more"]
}

interface OpportunityFeatures {
  opportunityId: string;
  updatedAt: Date;
  
  // Static
  companyId: string;
  companyTier: number;
  industry: string;
  location: string;
  type: string;
  requiredSkills: string[];
  minScore: number | null;
  salaryRange: { min: number; max: number } | null;
  
  // Dynamic
  applicationCount: number;
  applicationVelocity: number;     // Applications per day
  viewCount: number;
  conversionRate: number;          // Applications / Views
  
  interviewRate: number;           // Interviews / Applications
  offerRate: number;               // Offers / Interviews
  acceptanceRate: number;          // Acceptances / Offers
  
  avgApplicantScore: number;
  scoreDistribution: number[];     // Histogram
  
  // Computed
  competitiveness: number;         // 0-1
  qualityScore: number;            // Based on outcomes
  daysRemaining: number | null;
  spotsRemaining: number | null;
}

interface CompanyFeatures {
  companyId: string;
  updatedAt: Date;
  
  // Static
  industry: string;
  size: string;
  location: string;
  
  // Behavioral
  searchPatterns: {
    skills: Record<string, number>;     // {"React": 15, "Python": 10}
    scoreRange: { min: number; max: number };
    colleges: string[];
  };
  
  responseRate: number;            // % of applications responded to
  avgResponseTime: number;         // Hours
  interviewRate: number;
  offerRate: number;
  
  // Hiring patterns
  avgHiredScore: number;
  hiredSkillDistribution: Record<string, number>;
  hiredCollegeDistribution: Record<string, number>;
  
  // Health
  churnRisk: number;
  satisfactionScore: number;
}
```

### Reward Attribution

```typescript
// The hard problem: connecting actions to outcomes

interface RewardEvent {
  eventId: string;
  timestamp: Date;
  
  // The outcome
  outcomeType: 'INTERVIEW' | 'OFFER' | 'PLACEMENT' | 'RETENTION_30' | 'RETENTION_90';
  outcomeValue: number;  // Reward value
  
  // Who
  studentId: string;
  companyId: string;
  opportunityId: string;
  
  // Attribution
  touchpoints: Touchpoint[];
  attributionModel: 'LAST_TOUCH' | 'FIRST_TOUCH' | 'LINEAR' | 'TIME_DECAY';
}

interface Touchpoint {
  eventId: string;
  eventType: EventType;
  timestamp: Date;
  
  // What drove this touchpoint
  source: 'RECOMMENDATION' | 'NOTIFICATION' | 'SEARCH' | 'DIRECT';
  modelVersion: string;  // Which model version was responsible
  
  // Attribution
  attributedReward: number;  // Portion of total reward
}

// Time-decay attribution
function attributeReward(
  outcome: RewardEvent,
  touchpoints: Touchpoint[]
): Map<string, number> {
  const halfLife = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  const outcomeTime = outcome.timestamp.getTime();
  
  // Calculate decay weights
  const weights = touchpoints.map(t => {
    const timeDiff = outcomeTime - t.timestamp.getTime();
    const decay = Math.exp(-timeDiff / halfLife);
    const importance = getImportanceMultiplier(t.eventType);
    return { touchpoint: t, weight: decay * importance };
  });
  
  // Normalize
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  
  const attribution = new Map<string, number>();
  weights.forEach(w => {
    attribution.set(
      w.touchpoint.eventId, 
      (w.weight / totalWeight) * outcome.outcomeValue
    );
  });
  
  return attribution;
}

function getImportanceMultiplier(eventType: EventType): number {
  switch (eventType) {
    case EventType.APPLICATION_SUBMIT: return 3.0;
    case EventType.NOTIFICATION_CLICKED: return 2.0;
    case EventType.OPPORTUNITY_CLICK: return 1.5;
    default: return 1.0;
  }
}
```

---

## Model Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ALGONAUT ML PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DATA LAYER                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Event Stream   │───▶│  Feature Store  │                │
│  │  (Kafka/Redis)  │    │  (Redis)        │                │
│  └─────────────────┘    └────────┬────────┘                │
│                                  │                          │
│  TRAINING LAYER                  ▼                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MODEL TRAINING PIPELINE                 │   │
│  │                                                      │   │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │   │ Engagement │  │  Matching  │  │  Ranking   │   │   │
│  │   │   Model    │  │   Model    │  │   Model    │   │   │
│  │   │   (DQN)    │  │  (Neural   │  │ (LambdaMART│   │   │
│  │   │            │  │    CF)     │  │   + RL)    │   │   │
│  │   └────────────┘  └────────────┘  └────────────┘   │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  SERVING LAYER            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MODEL SERVING (FastAPI)                 │   │
│  │                                                      │   │
│  │   POST /predict/engagement                           │   │
│  │   POST /predict/opportunities                        │   │
│  │   POST /predict/candidates                           │   │
│  │   POST /predict/churn                                │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  EXPERIMENTATION LAYER                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              A/B TEST FRAMEWORK                      │   │
│  │                                                      │   │
│  │   - Experiment assignment                            │   │
│  │   - Metric tracking                                  │   │
│  │   - Statistical significance                         │   │
│  │   - Auto-promotion of winners                        │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Model Specifications

```python
# Engagement Model (Contextual Bandit / DQN)

class EngagementModel:
    """
    Decides what notification to send, when, via which channel.
    Uses Deep Q-Network for action selection.
    """
    
    state_dim = 64       # Student + context features
    action_dim = 40      # 10 notification types × 4 times
    hidden_dim = 128
    
    architecture = """
    Input(64) 
    → Dense(128, ReLU) 
    → Dense(128, ReLU) 
    → Dense(40, Linear)  # Q-values for each action
    """
    
    training = """
    - Experience replay buffer: 100K transitions
    - Batch size: 256
    - Learning rate: 1e-4
    - Target network update: every 1000 steps
    - Epsilon-greedy exploration: 0.1 → 0.01
    """


# Matching Model (Neural Collaborative Filtering)

class MatchingModel:
    """
    Predicts probability that student S will apply to opportunity O.
    Used for recommendation ranking.
    """
    
    architecture = """
    Student embedding: Dense(student_features) → 64-dim
    Opportunity embedding: Dense(opp_features) → 64-dim
    
    Interaction: Concatenate + Dense(128) + Dense(64) + Dense(1, Sigmoid)
    
    Output: P(apply | student, opportunity)
    """
    
    training = """
    - Positive: Applied
    - Negative: Viewed but didn't apply
    - Loss: Binary cross-entropy
    - Hard negative mining: Opportunities similar to applied ones
    """


# Ranking Model (LambdaMART + RL fine-tuning)

class RankingModel:
    """
    Ranks opportunities for a student, optimizing for long-term outcomes.
    Two-stage: LambdaMART for base ranking, RL for fine-tuning.
    """
    
    stage_1 = """
    LambdaMART (gradient boosted trees)
    Features: Student × Opportunity cross-features
    Label: Applied (0/1)
    Metric: NDCG
    """
    
    stage_2 = """
    Policy gradient fine-tuning
    Reward: Weighted combination of apply, interview, offer, placement
    """


# Churn Prediction Model

class ChurnModel:
    """
    Predicts probability student will churn in next 7 days.
    Used for proactive engagement.
    """
    
    architecture = """
    Input: 30-day behavioral features
    → LSTM(64) for sequence patterns
    → Dense(32)
    → Dense(1, Sigmoid)
    
    Output: P(churn in 7 days)
    """
    
    threshold = 0.7  # High-risk if P > 0.7


# Placement Prediction Model (THE KEY MODEL)

class PlacementModel:
    """
    Predicts probability student will be placed AND retained 90 days.
    This is the core IP - what makes us acquirable.
    """
    
    inputs = """
    - LayersRank score breakdown
    - Behavioral features
    - Application patterns
    - Historical similar students' outcomes
    """
    
    architecture = """
    Input(128)
    → Dense(256, ReLU)
    → BatchNorm
    → Dropout(0.3)
    → Dense(128, ReLU)
    → Dense(64, ReLU)
    → Dense(1, Sigmoid)
    
    Output: P(placed AND retained 90 days | features)
    """
    
    training = """
    - Positive: Placed AND verified at 90 days
    - Negative: Not placed OR left before 90 days
    - Class imbalance: SMOTE + class weights
    - Validation: Time-based split (train on past, test on recent)
    """
    
    target_accuracy = 0.78  # Year 3 goal
```

### Exploration vs Exploitation

```python
class ExplorationPolicy:
    """
    Balances trying new things (exploration) vs using what works (exploitation).
    """
    
    def __init__(self):
        self.base_explore_rate = 0.2  # 20% exploration by default
    
    def get_explore_rate(self, context: dict) -> float:
        """Adjust exploration based on context."""
        
        rate = self.base_explore_rate
        
        # More exploration for new users (we don't know them yet)
        if context['user_age_days'] < 7:
            rate = 0.4
        
        # Less exploration for churning users (play it safe)
        if context['churn_risk'] > 0.7:
            rate = 0.05
        
        # More exploration in experiments
        if context['in_experiment']:
            rate = 0.5
        
        return rate
    
    def should_explore(self, context: dict) -> bool:
        return random.random() < self.get_explore_rate(context)
    
    def select_action(self, model, state, context):
        if self.should_explore(context):
            # Exploration: try something new
            if random.random() < 0.3:
                # Pure random
                return random.choice(action_space)
            else:
                # UCB: try uncertain actions
                return select_high_uncertainty_action(model, state)
        else:
            # Exploitation: use best known action
            return model.predict_best_action(state)
```

---

## Online Learning

### Continuous Model Updates

```python
class OnlineLearner:
    """
    Updates models continuously as new data arrives.
    Not waiting for nightly batch jobs.
    """
    
    def __init__(self):
        self.event_buffer = []
        self.batch_size = 1000
        self.update_interval = 3600  # 1 hour
    
    async def process_event(self, event: Event):
        """Process each event as it arrives."""
        
        # 1. Log event
        await self.log_event(event)
        
        # 2. Update real-time features
        await self.update_features(event)
        
        # 3. Buffer for batch training
        self.event_buffer.append(event)
        
        # 4. Trigger training if buffer full
        if len(self.event_buffer) >= self.batch_size:
            await self.trigger_training()
    
    async def trigger_training(self):
        """Incremental model update."""
        
        # Convert events to training examples
        examples = self.create_training_examples(self.event_buffer)
        
        # Incremental update (not full retrain)
        for model_name, model_examples in examples.items():
            await self.models[model_name].partial_fit(model_examples)
        
        # Clear buffer
        self.event_buffer = []
        
        # Log metrics
        await self.log_model_metrics()
    
    async def attribute_rewards(self):
        """
        Run periodically to attribute outcomes to actions.
        This is how models learn what worked.
        """
        
        # Get recent outcomes (placements, offers, etc.)
        outcomes = await self.get_recent_outcomes(hours=24)
        
        for outcome in outcomes:
            # Get touchpoints that led to this outcome
            touchpoints = await self.get_touchpoints(outcome.student_id)
            
            # Attribute reward
            attribution = attribute_reward(outcome, touchpoints)
            
            # Update training data
            for touchpoint_id, reward in attribution.items():
                await self.update_training_label(touchpoint_id, reward)
```

### Model Versioning

```python
class ModelRegistry:
    """
    Tracks model versions and their performance.
    Enables safe rollback if new model underperforms.
    """
    
    async def deploy_model(self, model_name: str, model: Model):
        """Deploy new model version with canary rollout."""
        
        version = generate_version_id()
        
        # 1. Save model
        await self.save_model(model_name, version, model)
        
        # 2. Start canary (5% traffic)
        await self.set_traffic_split(model_name, {
            'current': 0.95,
            'canary': 0.05,
            'canary_version': version,
        })
        
        # 3. Monitor for 24 hours
        await self.schedule_evaluation(model_name, version, hours=24)
    
    async def evaluate_canary(self, model_name: str, version: str):
        """Evaluate canary performance."""
        
        metrics = await self.get_metrics(model_name, version)
        baseline = await self.get_metrics(model_name, 'current')
        
        if metrics.engagement_rate > baseline.engagement_rate * 0.95:
            # Canary is at least 95% as good - promote
            await self.promote_canary(model_name, version)
        else:
            # Canary underperforming - rollback
            await self.rollback_canary(model_name)
```

---

## Experimentation Framework

### A/B Test Structure

```typescript
interface Experiment {
  id: string;
  name: string;
  description: string;
  
  // Targeting
  targetAudience: {
    userTypes: UserType[];
    colleges?: string[];
    scoreRange?: { min: number; max: number };
    customFilter?: string;  // SQL-like filter
  };
  
  // Variants
  variants: {
    control: { weight: number; config: object };
    treatment: { weight: number; config: object };
  };
  
  // Metrics
  primaryMetric: string;     // "application_rate"
  secondaryMetrics: string[];
  
  // Duration
  startDate: Date;
  minDuration: number;       // Days
  maxDuration: number;
  
  // Status
  status: 'DRAFT' | 'RUNNING' | 'STOPPED' | 'COMPLETED';
  
  // Results
  results?: {
    sampleSize: Record<string, number>;
    metrics: Record<string, Record<string, number>>;
    pValue: number;
    winner: string | null;
  };
}
```

### Experiment Examples

```yaml
# Example experiments to run

- name: "Loss vs Gain Notification Framing"
  hypothesis: "Loss-framed notifications increase re-engagement more than gain-framed"
  variants:
    control:
      message: "5 new opportunities match your profile"
    treatment:
      message: "You missed 3 opportunities this week"
  primary_metric: "re_engagement_rate"
  target: "inactive_users_7d"
  duration: 14_days

- name: "Scarcity Badge on Opportunities"
  hypothesis: "Showing spots remaining increases application rate"
  variants:
    control:
      show_spots_remaining: false
    treatment:
      show_spots_remaining: true
  primary_metric: "application_rate"
  target: "all_students"
  duration: 7_days

- name: "Peer Activity Notifications"
  hypothesis: "Showing peer activity increases applications for Tier 2 colleges"
  variants:
    control:
      show_peer_activity: false
    treatment:
      show_peer_activity: true
  primary_metric: "applications_per_user"
  target: "tier_2_college_students"
  duration: 14_days

- name: "Recommendation Algorithm v2"
  hypothesis: "New matching model increases application-to-interview rate"
  variants:
    control:
      model_version: "v1.3"
    treatment:
      model_version: "v2.0"
  primary_metric: "interview_rate"
  secondary_metrics: ["application_rate", "time_to_placement"]
  target: "all_students"
  duration: 30_days
```

---

## Metrics Dashboard

### Key ML Metrics to Track

```yaml
MODEL PERFORMANCE:
  - Engagement Model:
      - Notification open rate (by variant)
      - Re-engagement rate from notifications
      - Notification fatigue rate
  
  - Matching Model:
      - Recommendation click-through rate
      - Application rate from recommendations
      - Diversity of recommendations
  
  - Ranking Model:
      - NDCG@10 for opportunity ranking
      - Interview rate from top-10 applications
      - Position bias metrics
  
  - Placement Prediction:
      - AUC-ROC
      - Precision @ 80% recall
      - Calibration (predicted prob vs actual)

DATA FLYWHEEL:
  - Events per day
  - Features freshness (avg age of features)
  - Training examples per day
  - Model update frequency
  
  - Outcomes tracked:
      - Placements this week
      - 30-day verifications this week
      - 90-day verifications this week

ACQUISITION METRICS:
  - Placement prediction accuracy (rolling 90-day)
  - Data moat size:
      - Total assessments with outcomes
      - Unique students with 90-day outcome
      - Companies with hiring data
```

---

## Build Sequence for ML

### Phase 1: Event Collection (Hours 1-8)

```
Tasks:
├── Implement Event schema in database
├── Create event logging middleware
├── Add event tracking to all user interactions
├── Set up event streaming (Redis Streams for start)
├── Build basic event dashboard
└── Validate events are capturing correctly

Acceptance:
├── Every page view creates event
├── Every click creates event
├── Every application creates event
├── Events queryable in real-time
└── Dashboard shows event volume
```

### Phase 2: Feature Engineering (Hours 9-16)

```
Tasks:
├── Define StudentFeatures interface
├── Build feature computation jobs
├── Set up feature store (Redis)
├── Create hourly feature update job
├── Build CompanyFeatures
├── Build OpportunityFeatures
└── Validate feature freshness

Acceptance:
├── Features updated hourly
├── All features computable
├── Feature retrieval < 10ms
└── Feature store has all active users
```

### Phase 3: Baseline Models (Hours 17-32)

```
Tasks:
├── Implement rule-based recommendations
├── Implement rule-based notifications
├── Implement basic ranking (by score match)
├── Set up model serving endpoint
├── Implement A/B test framework
├── Run first A/B test
└── Collect baseline metrics

Acceptance:
├── Recommendations API working
├── A/B test framework working
├── Baseline metrics established
└── Ready for ML model deployment
```

### Phase 4: ML Models (Hours 33-60)

```
Tasks:
├── Train initial matching model
├── Train initial engagement model
├── Implement online learning loop
├── Deploy models with canary
├── Implement reward attribution
├── Train placement prediction model
└── Establish model monitoring

Acceptance:
├── Models serving in production
├── Online learning working
├── Metrics improving over baseline
└── Placement prediction > 60% accuracy
```

---

## Summary

The RL architecture is not a feature. It's the business model.

```
WITHOUT RL:
├── Static rules
├── Human-tuned
├── Doesn't scale
└── No defensible moat

WITH RL:
├── Learns from every interaction
├── Improves automatically
├── Scales with data
└── Creates defensible moat

INDIA ADVANTAGE:
├── 10M freshers/year
├── 10x more data
├── 10x faster learning
├── 10x stronger moat
```

The company that learns fastest wins.
India lets us learn fastest.
That's the acquisition thesis.
