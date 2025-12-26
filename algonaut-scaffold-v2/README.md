# Algonaut Scaffold v2

## For Claude Code

This is a data acquisition machine disguised as a job platform.
Every decision optimizes for: **Placement Prediction Accuracy + 90-Day Verified Outcomes**

---

## The Mission

Build the data moat that makes us worth $200M+ to LinkedIn.

**The Key Metric:** 78% accuracy predicting which students will be placed AND stay 90 days.

---

## Files In This Scaffold

| File | What It Is | Read When |
|------|-----------|-----------|
| VISION.md | Why we exist, acquisition thesis | First |
| ARCHITECTURE.md | System design (create this) | Before building |
| GAME-THEORY.md | Psychology mechanics | Building engagement features |
| RL-ARCHITECTURE.md | ML/Learning loops | Building data features |
| ACQUISITION-METRICS.md | What we're optimizing for | Always |
| REVENUE-MODEL.md | How we make money | Business context |
| schema.prisma | Database schema | Setup |
| BUILD-SEQUENCE.md | Hour-by-hour build plan | During build |

---

## Critical Principles

### 1. Events First

**Every interaction must be logged.**

Before building any feature, ensure:
- Event type is defined
- Logging call is in place
- Event captures context (source, position, metadata)

No events = No learning = No moat.

### 2. Verification is Gold

The placement verification system is the most important feature.

- 30-day verification: Good
- 90-day verification: GOLD
- Every verified outcome = training data
- Training data = prediction accuracy
- Prediction accuracy = acquisition value

### 3. Game Theory is Built-In

Not added later. Every screen asks:
- What behavior does this drive?
- Does it generate more data?
- Does it increase engagement?

### 4. No LinkedIn URL

We ARE their professional identity for freshers.
No cross-pollination. They live here until they graduate to mid-career.

---

## Build Order

```
1. EVENT LOGGING SYSTEM (before anything else)
2. Auth + Profiles
3. Opportunities + Applications
4. PLACEMENTS + VERIFICATION (the gold)
5. Game Theory (badges, streaks, leaderboards)
6. RL Infrastructure (features, recommendations, attribution)
7. Polish + Launch
```

---

## Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Database | PostgreSQL (Supabase) | Reliable, scales, RLS |
| API | tRPC | Type safety, speed |
| Auth | Supabase Auth | Integrated |
| Hosting | Vercel | Native Next.js |
| Events | PostgreSQL + Redis | Query + Real-time |
| ML | Python services (later) | Separate concern |

---

## What Success Looks Like

### Month 1
- Platform live
- Events flowing
- First placements
- First verifications requested

### Month 6
- 50K students
- 10K assessments with outcomes
- 2K 90-day verified placements
- 60% prediction accuracy
- First revenue

### Month 12
- 200K students
- 50K assessments with outcomes
- 15K 90-day verified placements
- 68% prediction accuracy
- $500K ARR

### Month 36 (Exit)
- 2M students
- 1M assessments with outcomes
- 300K 90-day verified placements
- 78% prediction accuracy
- $15M ARR
- LinkedIn acquisition: $200M+

---

## Questions Claude Code Should Ask

Before building any feature:

1. **Does this generate outcome data?**
   - If yes: High priority
   - If no: Why are we building it?

2. **Are events being logged?**
   - If no: Stop. Add logging first.

3. **Does this increase engagement?**
   - More engagement = more data
   - More data = better models

4. **Does this support verification?**
   - Verification = ground truth
   - Ground truth = training data

---

## Validation Checklist

Before marking any task complete:

```
[ ] Implementation matches spec
[ ] All relevant events logged
[ ] Events include context (source, position, metadata)
[ ] Error handling complete
[ ] Mobile responsive
[ ] Tests passing
```

---

## The Acquisition Equation

```
Prediction Accuracy × Verified Outcomes × ARR = Acquisition Value

78% × 300K × $15M × multiple = $200M+
```

Every line of code serves this equation.

---

## Start Here

1. Read VISION.md (5 min)
2. Read ACQUISITION-METRICS.md (10 min)
3. Read BUILD-SEQUENCE.md (15 min)
4. Copy schema.prisma
5. Start Phase 1

Go build the moat.
