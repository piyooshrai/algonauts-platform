# Algonaut Acquisition Metrics

## Purpose

This document defines the metrics that determine acquisition value.
Every feature, every sprint, every decision optimizes for these numbers.

---

## The Acquirer's Checklist

When LinkedIn (or any strategic acquirer) evaluates us, they ask:

```
1. Do they have data we can't replicate?
2. Do they have models that work?
3. Do they have distribution we can't buy?
4. Do they have revenue that proves value?
5. Do they have a team that can execute?
```

Our metrics must answer YES to each question with proof.

---

## Tier 1: Data Moat Metrics (Most Important)

### 1.1 Assessments with Outcomes

**Definition**: LayersRank assessments that have linked placement outcomes.

```
FORMULA:
Assessments with Outcomes = 
  COUNT(assessments WHERE placement_outcome IS NOT NULL)
```

**Why It Matters**:
- This is the training data for placement prediction
- No one else has this at scale
- Every assessment without outcome = wasted data

**Targets**:
| Timeframe | Target | Notes |
|-----------|--------|-------|
| Month 6 | 10,000 | Minimum viable for initial model |
| Month 12 | 50,000 | Credible model accuracy |
| Month 24 | 250,000 | Strong competitive moat |
| Month 36 | 1,000,000 | Acquisition-ready |

---

### 1.2 90-Day Verified Placements

**Definition**: Placements where student is confirmed still employed at 90 days.

```
FORMULA:
90-Day Verified = COUNT(placements WHERE 
  verified_at IS NOT NULL AND
  DATEDIFF(verified_at, placed_at) >= 90 AND
  still_employed = true
)
```

**Why It Matters**:
- Ground truth for model training
- "Placed" is vanity; "retained" is value
- Differentiates us from everyone else

**Targets**:
| Timeframe | Target | Verification Rate |
|-----------|--------|-------------------|
| Month 6 | 2,000 | 60%+ of placements |
| Month 12 | 15,000 | 70%+ |
| Month 24 | 75,000 | 75%+ |
| Month 36 | 300,000 | 80%+ |

**Collection Method**:
1. Automated: LinkedIn profile check (employed at company?)
2. Email survey: "Are you still at [Company]?" (incentivized)
3. Company confirmation: Batch verification with hiring companies
4. Phone verification: For statistical sampling

---

### 1.3 Placement Prediction Accuracy

**Definition**: How accurately we predict placement success.

```
FORMULA:
Accuracy = (True Positives + True Negatives) / Total Predictions

Where:
- Positive = Predicted to place AND retained 90 days
- Negative = Predicted NOT to place OR not retained
```

**Why It Matters**:
- THIS IS THE ACQUISITION THESIS
- LinkedIn's accuracy on entry-level: ~40%
- Our target: 78%
- That delta is worth $200M+

**Targets**:
| Timeframe | Accuracy | Confidence Interval |
|-----------|----------|---------------------|
| Month 6 | 55% | ±5% |
| Month 12 | 62% | ±4% |
| Month 18 | 68% | ±3% |
| Month 24 | 73% | ±2% |
| Month 36 | 78% | ±2% |

---

### 1.4 Assessment-Outcome Correlation

**Definition**: Statistical correlation between LayersRank scores and job success.

```
FORMULA:
Correlation = PEARSON(layers_rank_score, job_success_score)

Where job_success_score = 
  0.3 * got_interview +
  0.3 * got_offer +
  0.4 * retained_90_days
```

**Targets**:
| Metric | Target | Notes |
|--------|--------|-------|
| Overall Score ↔ Placement | 0.55+ | Key correlation |
| Technical ↔ Product Company | 0.60+ | Segment-specific |
| Communication ↔ Service Company | 0.50+ | Segment-specific |

---

## Tier 2: Distribution Metrics

### 2.1 Active College Partnerships

**Definition**: Colleges actively using platform with >50 students.

**Targets**:
| Timeframe | Partnerships | Students Represented |
|-----------|--------------|---------------------|
| Month 6 | 50 | 50K |
| Month 12 | 150 | 200K |
| Month 24 | 350 | 750K |
| Month 36 | 500 | 1.5M |

**Partnership Quality Tiers**:
- Tier 1 (Basic): Verified, students self-register (40%)
- Tier 2 (Integrated): Bulk import, placement cell dashboard (35%)
- Tier 3 (Exclusive): Primary platform, multi-year agreement (25%)

---

### 2.2 Student Engagement (DAU/MAU)

**Definition**: Daily active users as percentage of monthly active users.

**Targets**:
| Segment | Target | Industry Benchmark |
|---------|--------|-------------------|
| Active job seekers | 40%+ | 15% (LinkedIn) |
| Assessed students | 35%+ | - |
| All students | 25%+ | 8% (LinkedIn India) |

---

### 2.3 Viral Coefficient

**Definition**: New users generated per existing user.

```
FORMULA:
K = (Invites per user) × (Conversion rate of invites)
```

**Targets**:
| Timeframe | K Factor |
|-----------|----------|
| Month 6 | 0.5 |
| Month 12 | 0.8 |
| Month 24 | 1.2+ |

---

## Tier 3: Revenue Metrics

### 3.1 Annual Recurring Revenue (ARR)

**Targets**:
| Timeframe | ARR | MoM Growth |
|-----------|-----|------------|
| Month 6 | $100K | - |
| Month 12 | $500K | 15%+ |
| Month 18 | $1.5M | 15%+ |
| Month 24 | $5M | 12%+ |
| Month 36 | $15M | 10%+ |

---

### 3.2 Revenue by Segment

**Target Mix at Month 36**:
| Segment | % of ARR | ARR |
|---------|----------|-----|
| Enterprise Companies | 50% | $7.5M |
| SMB Companies | 25% | $3.75M |
| College Partnerships | 15% | $2.25M |
| Advertising | 10% | $1.5M |

---

### 3.3 Unit Economics

| Metric | Target |
|--------|--------|
| Company CAC | <$500 |
| Company LTV | >$5,000 |
| LTV:CAC | >10:1 |
| Payback Period | <3 months |
| Net Revenue Retention | 115%+ |
| Company Churn (Annual) | <20% |

---

## Tier 4: Model Quality Metrics

### 4.1 Recommendation Performance

| Metric | Target |
|--------|--------|
| Recommendation CTR (Top 10) | 15%+ |
| Applied from Recommendation | 40%+ of applications |
| Recommendation Diversity | >20 companies in top 50 |

---

### 4.2 Matching Quality

| Metric | Target | Industry Average |
|--------|--------|-----------------|
| Application → Interview | 20%+ | 8-10% |
| Interview → Offer | 30%+ | 20% |
| Offer → Accept | 75%+ | 65% |
| End-to-end Placement Rate | 5%+ | 1-2% |

---

### 4.3 Engagement Model Performance

| Metric | Target |
|--------|--------|
| Notification Open Rate | 25%+ |
| Notification → Action | 15%+ |
| Re-engagement from Notification | 30%+ |
| Churn Prediction AUC | 0.80+ |

---

## Tier 5: Second Market Metrics (SEA Expansion)

### 5.1 Model Transfer Accuracy

**Definition**: Accuracy of India-trained model on new market.

| Market | Initial Accuracy | After 6 Months |
|--------|-----------------|----------------|
| Indonesia | 55%+ | 65%+ |
| Philippines | 55%+ | 65%+ |
| Vietnam | 55%+ | 65%+ |

---

### 5.2 SEA Traction

| Metric | Month 6 Target | Month 12 Target |
|--------|---------------|-----------------|
| Students (Indonesia) | 25K | 100K |
| Colleges (Indonesia) | 20 | 75 |
| Placements (Indonesia) | 2K | 15K |

---

## Acquisition Readiness Score

### Calculation

```python
def calculate_acquisition_readiness():
    """
    Composite score: 0-100
    100 = Ready for $200M+ exit
    """
    
    weights = {
        # Data Moat: 40%
        'assessments_with_outcomes': 10,
        'verified_placements_90d': 15,
        'prediction_accuracy': 15,
        
        # Distribution: 25%
        'college_partnerships': 10,
        'student_dau_mau': 10,
        'viral_coefficient': 5,
        
        # Revenue: 25%
        'arr': 15,
        'nrr': 5,
        'company_retention': 5,
        
        # Model Quality: 10%
        'recommendation_ctr': 5,
        'application_to_interview': 5,
    }
    
    actuals = get_all_metrics()
    targets = get_all_targets()
    
    score = 0
    for metric, weight in weights.items():
        ratio = min(actuals[metric] / targets[metric], 1.0)
        score += ratio * weight
    
    return score
```

### Score Interpretation

| Score | Stage | Valuation Range |
|-------|-------|-----------------|
| 0-25 | Building | Pre-revenue |
| 26-50 | Traction | $10-30M |
| 51-70 | Growth | $30-80M |
| 71-85 | Scale | $80-150M |
| 86-100 | Acquisition-Ready | $150-300M |

---

## Executive Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│           ALGONAUT ACQUISITION READINESS                    │
│                                                             │
│           ████████████████████░░░░░  78/100                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DATA MOAT (40%)                    ████████████░░ 32/40   │
│  ├── Assessments w/ Outcomes        ████████░░░░░░ 180K    │
│  ├── 90-Day Verified                ████████████░░ 62K     │
│  └── Prediction Accuracy            █████████████░ 71%     │
│                                                             │
│  DISTRIBUTION (25%)                 ██████████████░ 22/25   │
│  ├── College Partnerships           █████████████░░ 310     │
│  ├── Student DAU/MAU                ████████████░░░ 23%     │
│  └── Viral Coefficient              ██████████████░ 1.1     │
│                                                             │
│  REVENUE (25%)                      ███████████░░░░ 18/25   │
│  ├── ARR                            ████████████░░░ $4.2M   │
│  ├── NRR                            █████████████░░ 112%    │
│  └── Company Retention              ████████████░░░ 78%     │
│                                                             │
│  MODEL QUALITY (10%)                ██████████░░░░░ 6/10    │
│  ├── Recommendation CTR             ████████░░░░░░░ 8%      │
│  └── Application→Interview          █████████████░░ 18%     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  TREND: ↑ +3 points this month                             │
│  PROJECTED: 85/100 in 4 months                             │
│  RISK: Model accuracy plateau - need more 90-day data      │
└─────────────────────────────────────────────────────────────┘
```

---

## Weekly Metrics Review Cadence

### Daily (Automated Alerts)

```
Alert if:
├── Assessment completions < 80% of 7-day avg
├── Prediction accuracy drops > 2%
├── DAU drops > 15%
└── Any critical errors in ML pipeline
```

### Weekly (Team Review)

```
Review:
├── Assessments with outcomes (cumulative + weekly)
├── 90-day verifications completed
├── Model performance metrics
├── Revenue (new, expansion, churn)
├── Viral coefficient
├── A/B test results
└── Partnership pipeline
```

### Monthly (Leadership Review)

```
Review:
├── Acquisition Readiness Score trend
├── Prediction accuracy trend (the key metric)
├── Score-outcome correlation analysis
├── Competitive intelligence
├── Strategic initiatives progress
└── Board update preparation
```

---

## The Single Most Important Metric

**Placement Prediction Accuracy with 90-Day Verification**

Everything else is supporting this number.

```
If we hit 78% accuracy on predicting:
"This student will be placed AND stay 90+ days"

...with 300K+ verified data points as proof...

That's a $200M+ acquisition.

Because no one else has it.
Because it can't be replicated quickly.
Because it solves LinkedIn's #1 problem with entry-level.
```

Every feature, every sprint, every decision:
**Does this improve prediction accuracy or increase verified outcome data?**

If no, deprioritize.
If yes, prioritize.

That's the entire strategy.
