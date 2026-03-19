# Diabetic Community Research: Features, Pain Points & Actionable Insights

> **Research date**: 2026-03-20
> **Scope**: T1D + T2D perspectives, 8+ competitor apps, community forums, clinical guidelines, accessibility standards
> **Purpose**: Feature prioritization for GlucoBro

---

## Table of Contents

1. [Daily Needs by Diabetes Type](#1-daily-needs-by-diabetes-type)
2. [Competitor Feature Matrix](#2-competitor-feature-matrix)
3. [What's Missing — Community Pain Points](#3-whats-missing--community-pain-points)
4. [CGM-Specific UX Patterns (Libre 3 Focus)](#4-cgm-specific-ux-patterns-libre-3-focus)
5. [Gamification & Motivation](#5-gamification--motivation)
6. [Doctor/Report Features](#6-doctorreport-features)
7. [Insulin Dose Tracking](#7-insulin-dose-tracking)
8. [Carb Counting & Food Integration](#8-carb-counting--food-integration)
9. [Time in Range (TIR)](#9-time-in-range-tir)
10. [HbA1c Estimation (GMI)](#10-hba1c-estimation-gmi)
11. [Alerts & Notifications](#11-alerts--notifications)
12. [Dark Patterns to Avoid](#12-dark-patterns-to-avoid)
13. [Accessibility](#13-accessibility)
14. [Ranked Feature Ideas](#14-ranked-feature-ideas-by-impact)

---

## 1. Daily Needs by Diabetes Type

### Type 1 Diabetes (T1D) — Insulin-Dependent

| Need | Frequency | Details |
|------|-----------|---------|
| Blood glucose check | 6-12x/day (or continuous via CGM) | Before meals, 2h post-meal, before bed, before driving |
| Bolus insulin dose calculation | 3-6x/day | Based on carb intake + correction factor + insulin on board (IOB) |
| Basal insulin tracking | 1-2x/day (MDI) or continuous (pump) | Long-acting insulin timing is critical |
| Carb counting | Every meal/snack | Must estimate grams accurately for dosing |
| Hypo treatment logging | 0-3x/day | 15g fast carbs, recheck in 15 min (Rule of 15) |
| Exercise impact tracking | As needed | Exercise can drop BG 2-4 hours later |
| CGM trend monitoring | Continuous | Arrows matter: rising fast, falling fast, stable |
| Insulin on Board (IOB) tracking | Continuous | Prevents insulin stacking — typical duration 3-5 hours |

### Type 2 Diabetes (T2D) — Medication-Managed

| Need | Frequency | Details |
|------|-----------|---------|
| Blood glucose check | 1-4x/day (often fasting + post-meal) | Many use fingerstick, CGM adoption growing |
| Oral medication reminder | 1-3x/day | Metformin (most common, 91% of T2D users), Jardiance, Januvia |
| Meal logging | 3x/day + snacks | Focus on carb quality, portion control, glycemic index |
| Weight tracking | Weekly | Key metric for T2D management |
| Blood pressure tracking | 1-2x/day | Comorbidity with hypertension is very common |
| A1C lab tracking | Every 3 months | The gold standard outcome metric |
| Activity/steps tracking | Daily | 150 min/week moderate exercise recommended |
| Fasting glucose trend | Daily morning | Key indicator for medication effectiveness |

### Key Difference for App Design

T1D users need **speed and precision** — they calculate insulin doses multiple times daily under time pressure. Every interaction must be fast (< 3 taps to log).

T2D users need **patterns and motivation** — they benefit from trend visualization, habit tracking, and gentle nudges. Fewer daily interactions, but consistency matters more.

**Critical insight**: Most apps are designed for T1D and feel overwhelming for T2D. The T2D user base is 10x larger (90-95% of all diabetics). An app that serves T2D well while supporting T1D has the largest addressable market.

---

## 2. Competitor Feature Matrix

| Feature | mySugr | Glucose Buddy | Dario | Glooko | Sugarmate | xDrip+ | Nightscout | Contour |
|---------|--------|---------------|-------|--------|-----------|--------|------------|---------|
| **BG Manual Log** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **CGM Integration** | Accu-Chek | Dexcom, Fitbit | Dario meter | Multi-brand | Dexcom, Libre | Multi-CGM | Multi-CGM | Contour |
| **Bolus Calculator** | Yes (CE-marked) | No | Yes | No | No | Yes | No | No |
| **Carb Logging** | Yes | Meal IQ (AI) | Yes | Yes | Yes | Yes | Yes | Basic |
| **Photo Food Log** | No | No | No | No | No | No | No | No |
| **Insulin Tracking** | Bolus + Basal | Basic | Yes | Yes | Yes | Yes (IOB) | Yes (IOB) | No |
| **Oral Meds** | Basic | Basic | No | Yes | No | No | No | No |
| **A1C Estimation** | Yes (PRO) | No | No | Yes | No | No | No | No |
| **AGP Report** | Yes (PRO) | No | No | Yes | No | Yes | Yes | No |
| **PDF Export** | Yes (PRO) | Yes | Yes | Yes | No | Yes | No | No |
| **Doctor Sharing** | Yes | Yes | Yes | Yes (clinic) | No | Via Nightscout | Yes (web) | No |
| **Apple Watch** | No | No | No | No | Yes (loved) | No (Android) | Yes (web) | No |
| **Widgets** | No | No | No | No | Yes | Yes | No | No |
| **Gamification** | Monster + challenges | Badges | No | No | No | No | No | No |
| **Dark Mode** | Yes | Yes | No | No | Yes | Yes | Yes | No |
| **Offline** | Yes | Yes | Yes | Yes | Partial | Yes | No (cloud) | Yes |
| **Free Tier** | Limited | Limited | With meter | Clinic only | **Free** | **Free** | **Free** | Free |
| **Subscription** | ~$3-10/mo | ~$5/mo | Bundled | Clinic | Free | Free | Hosting | Free |

### What Each App Does Best

| App | Killer Feature | Why Users Love It |
|-----|---------------|-------------------|
| **mySugr** | Gamification monster + bolus calculator | Makes logging feel like a game, CE-marked medical device |
| **Glucose Buddy** | Meal IQ AI learning | Learns how specific foods affect YOUR glucose over time |
| **Sugarmate** | Apple Watch + predictive alerts | Alerts BEFORE Dexcom does; phone call for urgent lows; completely free |
| **xDrip+** | Infinite customization | Community-built, every CGM supported, predictive algorithms |
| **Nightscout** | Remote monitoring (parents/caregivers) | Web-based, real-time follower mode, #WeAreNotWaiting |
| **Dario** | All-in-one hardware + app | Meter plugs into phone, ultra-portable |
| **Glooko** | Clinical integration | Endocrinologists use it, multi-device population reports |
| **SNAQ** | Photo-based carb counting | Snap a meal photo, get instant carb/protein/fat breakdown |

---

## 3. What's Missing -- Community Pain Points

### From Reddit, TuDiabetes Forum, Diabetes UK Forum, and App Reviews

#### Tier 1: Deal-Breakers (Users Abandon Apps Over These)

| Pain Point | Frequency | Source |
|------------|-----------|--------|
| **Data loss after updates** | Very common | App store reviews, Reddit |
| **Subscription paywall for basic features** | #1 complaint | Reddit, TuDiabetes, app reviews |
| **Ad overload in free tier** | Common (T2D apps) | Google Play reviews |
| **Forced account creation** | Common | Reddit — "I just want to log, not create an account" |
| **No offline mode** | Common | Users in areas with poor connectivity |
| **Slow startup time** | Common | "By the time the app loads, I've forgotten my reading" |
| **Lost features after app updates** | Very common | Custom labels removed, sharing limited to 2 weeks |

#### Tier 2: Frustrations (Cause Low Engagement)

| Pain Point | Details |
|------------|---------|
| **Too many taps to log a reading** | Should be 1-2 taps, most apps require 4-6 |
| **No quick-log widget** | Users want homescreen widget to log BG without opening app |
| **Poor CGM data visualization** | "Spaghetti graphs" that are hard to interpret |
| **No pattern recognition** | "Why is my BG always high at 3pm?" — apps don't tell you |
| **Can't compare days/weeks** | Overlay multiple days on one graph |
| **Medication max dosage limits** | One app capped oral meds at 99.9mg — Metformin is 500-2000mg |
| **No distinction between T1D and T2D modes** | T2D users overwhelmed by insulin calculators they don't need |
| **Poor food database for non-US foods** | German, Turkish, Arabic foods missing from databases |
| **No "why was I high/low" annotation** | Users want to tag context: stress, illness, period, alcohol |
| **Alarm fatigue** | 32% of CGM users disable high alerts due to frequency |

#### Tier 3: Wish List (Would Delight Users)

| Feature Request | Community Quote |
|----------------|----------------|
| **AI pattern detection** | "Tell me WHY I spike, not just that I spiked" |
| **Predictive glucose** | "Show me where my BG will be in 30/60 min" |
| **Period/hormone tracking** | "My insulin needs change 30% during my cycle" |
| **Stress/sleep correlation** | "Bad sleep = bad BG day, but no app tracks this" |
| **Shareable daily summary** | "One screenshot I can send my endo/partner" |
| **Voice logging** | "Hey GlucoBro, I just ate 45 carbs" |
| **Apple Watch standalone** | "Don't make me pull out my phone" |
| **Multi-language food DB** | "I eat Turkish food, none of it is in any app" |
| **Injection site rotation tracker** | "I always forget where I last injected" |
| **Sensor reminder** | "Tell me 1 day before my Libre sensor expires" |

---

## 4. CGM-Specific UX Patterns (Libre 3 Focus)

### Libre 3 Technical Specs Relevant to UX

| Parameter | Value |
|-----------|-------|
| Reading frequency | Every 1 minute (5x faster than competitors) |
| Sensor duration | 14 days |
| Warm-up time | 60 minutes |
| Range | 40-500 mg/dL (2.2-27.8 mmol/L) |
| Urgent low alarm | 55 mg/dL (cannot be disabled) |
| Connectivity | Bluetooth to phone |
| Data lag | ~2 min vs blood (interstitial fluid) |

### UX Patterns That Work for CGM Users

**1. The Glance Dashboard**
- Large, central glucose number with trend arrow
- Color-coded background (not just the number) — the entire card/screen tints
- "Time since last reading" indicator (critical for Libre signal loss)

**2. Trend Arrows (Must-Have)**
| Arrow | Meaning | Rate |
|-------|---------|------|
| ↑↑ | Rising quickly | >3 mg/dL/min |
| ↑ | Rising | 2-3 mg/dL/min |
| ↗ | Rising slowly | 1-2 mg/dL/min |
| → | Stable | <1 mg/dL/min |
| ↘ | Falling slowly | 1-2 mg/dL/min |
| ↓ | Falling | 2-3 mg/dL/min |
| ↓↓ | Falling quickly | >3 mg/dL/min |

**3. The 3-Hour Window**
- Most useful default view: last 3 hours with meal/insulin markers
- Expandable to 6h, 12h, 24h
- Overlay target range (70-180) as a shaded band

**4. Predictive Trace**
- Show dotted line projecting where glucose will be in 15/30/60 min
- Based on current rate of change + IOB
- xDrip+ does this and users love it

**5. Signal Loss Handling**
- Libre 3 can lose Bluetooth connection
- Show last known value with timestamp + "Signal lost" badge
- Gap in graph (don't interpolate — that's misleading)
- Alert after 20 min of signal loss

### Libre 3-Specific Complaints to Address

| Issue | Solution |
|-------|----------|
| Night alarms wake partners | Offer "vibrate only" mode with escalation |
| Alarm can't be snoozed intelligently | Smart snooze: don't re-alarm if trend reversed |
| Warm-up period anxiety | Countdown timer with "your sensor will be ready at HH:MM" |
| Sensor expiry surprise | Countdown badge: "3 days left", "1 day left", "expires today at HH:MM" |
| Data gaps when phone is far from sensor | Bluetooth range indicator or "move closer" alert |

---

## 5. Gamification & Motivation

### What Research Shows Works

| Technique | Effectiveness | Implementation |
|-----------|--------------|----------------|
| **Streaks** | High engagement (7-day, 30-day) | "You've logged 14 days straight!" — powerful for T2D |
| **Progress bars** | Moderate-high | Daily TIR progress bar filling up in real-time |
| **Character/avatar** | High for younger users | mySugr's monster grows/shrinks based on logging |
| **Badges/achievements** | Moderate | "First Week", "Night Warrior" (no lows overnight), "Carb Counter" |
| **Challenges** | High short-term | "7-day TIR challenge: stay above 70% this week" |
| **Points system** | Low-moderate (can feel trivial) | Only if tied to meaningful outcomes |
| **Social/community** | High for motivation | Anonymous comparisons, not individual competition |
| **Celebrate wins** | High | "Your TIR improved 5% this month!" with confetti |
| **Gentle recovery** | Critical | After a bad day: "Everyone has tough days. You're back." |

### What Doesn't Work (Avoid)

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Punishing missed logs | Diabetes is already punishing enough |
| Leaderboards with real names | Induces shame, not motivation |
| Gamification on critical health alerts | Don't gamify hypo treatment |
| Complex reward systems | Users have decision fatigue already |
| Forced daily engagement | Some days you just can't — guilt makes users quit |
| "Perfect day" framing | Unrealistic for T1D — reframe as "good enough" |

### Recommended Gamification Framework for GlucoBro

```
DAILY:    Streak counter (logging consistency, NOT perfect BG)
WEEKLY:   TIR challenge (personal best, not absolute)
MONTHLY:  Progress report with trend celebration
MILESTONES: First log, 7-day streak, 30-day streak, 100-day streak,
            First TIR >70%, Best week ever, Shared first report
TONE:     Supportive bro, not drill sergeant
          "Nice one! 73% TIR today." not "WARNING: You only achieved 73%"
```

---

## 6. Doctor/Report Features

### What Endocrinologists Want to See

Based on the AGP (Ambulatory Glucose Profile) international standard:

#### Required Metrics (One-Page Report)

| Metric | Target | Display |
|--------|--------|---------|
| **Time in Range (TIR)** 70-180 mg/dL | >70% (~17h/day) | Stacked color bar |
| **Time Below Range (TBR)** <70 mg/dL | <4% (~58 min/day) | Red segment |
| **Time Very Low** <54 mg/dL | <1% (~15 min/day) | Dark red segment |
| **Time Above Range (TAR)** >180 mg/dL | <25% (~6h/day) | Yellow segment |
| **Time Very High** >250 mg/dL | <5% (~1h 12min/day) | Orange segment |
| **Mean Glucose** | ~154 mg/dL (for 7% A1C) | Number |
| **GMI (Glucose Management Indicator)** | Correlates to lab A1C | Percentage |
| **Coefficient of Variation (CV)** | <=36% (stable) | Percentage |
| **Standard Deviation** | Depends on mean | mg/dL |
| **Sensor wear time** | >=70% (ideally >90%) | Percentage |

#### AGP Graph Requirements
- **Modal day graph**: 24-hour overlay of 14 days
- **Median line** (50th percentile)
- **Interquartile range** (25th-75th percentile) — shaded band
- **5th-95th percentile** — lighter shaded band
- **Target range** 70-180 mg/dL shown as horizontal band
- **Time blocks**: midnight-6am, 6am-noon, noon-6pm, 6pm-midnight

#### Report Export Formats
| Format | Use Case |
|--------|----------|
| **PDF** (mandatory) | Print for appointment, email to doctor |
| **CSV** | Import into clinic systems (Glooko, Tidepool) |
| **AGP-standard PDF** | Internationally recognized one-page format |
| **Shareable link** | Read-only web view for healthcare provider |

#### Data Period Requirements
- **Minimum**: 14 days of data with >=70% sensor wear
- **Standard periods**: 14 days, 30 days, 90 days
- **Date range selector**: Custom periods for specific analysis

---

## 7. Insulin Dose Tracking

### How the Best Apps Handle Bolus/Basal

#### Bolus (Meal + Correction) Tracking

**Required inputs:**
| Input | Source | Notes |
|-------|--------|-------|
| Current BG | Manual or CGM | Auto-populate from CGM if available |
| Carbs (grams) | Manual or food DB | The hardest part for users |
| Insulin:Carb ratio (ICR) | User setting | e.g., 1 unit per 10g carbs — varies by time of day |
| Correction factor (ISF) | User setting | e.g., 1 unit drops BG by 50 mg/dL |
| Target BG | User setting | Usually 100-120 mg/dL |
| Insulin on Board (IOB) | Calculated | Remaining active insulin from previous doses (3-5h duration) |

**Bolus calculation formula:**
```
Meal dose = Carbs / ICR
Correction dose = (Current BG - Target BG) / ISF
Total suggested = Meal dose + Correction dose - IOB
```

**Safety features (non-negotiable):**
- IOB tracking to prevent insulin stacking
- Hypo prevention: if BG <80, reduce or zero correction
- Maximum dose cap (user-configurable, e.g., 15 units)
- Confirmation step before logging
- Time-of-day ratio profiles (breakfast often needs different ICR than dinner)

#### Basal (Background) Tracking

| Type | Logging UX |
|------|-----------|
| Long-acting injection (Lantus, Tresiba) | Time + units, 1-2x/day, reminder if missed |
| Pump basal rate | Auto-sync from pump or manual rate entry |

#### Best Practices from Top Apps

| Practice | App Example |
|----------|------------|
| Auto-populate BG from CGM | xDrip+, Sugarmate |
| Quick-log without calculator | mySugr (just log units + carbs) |
| IOB visualization curve | xDrip+ shows remaining IOB over time |
| Split bolus support | Diabetes:M (for high-fat meals) |
| Dose history with BG outcome | Show "you took 5u at 12:30, BG 2h later was 145" |
| Pre-sets for common meals | "Breakfast usual" = 45g carbs |

#### Important: Regulatory Considerations
- Bolus calculators are **Class IIb medical devices** in EU (CE marking required)
- Consider offering **logging only** (no dose suggestion) to avoid medical device classification
- If suggesting doses: must include disclaimer, user confirmation, and safety guards

---

## 8. Carb Counting & Food Integration

### The Carb Counting Problem

Carb counting is the #1 daily burden for insulin-dependent diabetics. Average error rate: 20-50% for experienced users, higher for new diabetics.

### Best Practices

#### Food Input Methods (Ranked by Speed)

| Method | Speed | Accuracy | User Preference |
|--------|-------|----------|----------------|
| **Quick number entry** | <3 sec | User-dependent | Power users, T1D |
| **Photo AI recognition** | 5-10 sec | ~80% for known foods | Growing fast (SNAQ, Libre Assist) |
| **Barcode scan** | 3-5 sec | High (packaged foods) | Common, expected feature |
| **Favorites/recent meals** | 2-3 sec | High (personalized) | Most loved by daily users |
| **Food database search** | 10-30 sec | High | Necessary but slow |
| **Voice input** | 5 sec | Moderate | Accessibility, hands-busy |
| **Custom meal presets** | 1 tap | High | "My usual breakfast" |

#### Food Database Requirements

| Requirement | Details |
|-------------|---------|
| **Size** | 300,000+ items minimum |
| **Regional foods** | German, Turkish, Arabic, Indian foods critical for EU market |
| **Restaurant meals** | Chain restaurant data (McDonald's, etc.) |
| **Homemade recipes** | Save custom recipes with calculated carbs |
| **Units flexibility** | Grams, cups, pieces, portions, "handfuls" |
| **Macro breakdown** | Carbs, protein, fat, fiber (fiber subtracts from carbs in some methods) |
| **Glycemic index** | Optional but valued by T2D users |
| **Portion photos** | Visual portion estimation (Carbs & Cals approach: 6 portion sizes with photos) |

#### Innovative Food Features

| Feature | App Example | Impact |
|---------|------------|--------|
| **Meal IQ** (AI learning) | Glucose Buddy | Learns how YOUR body reacts to specific foods |
| **Libre Assist** (predictive) | Abbott/Libre | Photo > AI predicts glucose impact BEFORE eating |
| **Post-meal glucose tagging** | SNAQ | Links meal to glucose response 2h later |
| **Food scoring** | DiabTrend | Green/yellow/red based on predicted BG impact |
| **Recipe calculator** | Diabetes:M | Enter ingredients, auto-calculate per-serving carbs |

---

## 9. Time in Range (TIR)

### The Gold Standard Metric

TIR is increasingly preferred over HbA1c because it captures **variability** and **quality of control**, not just average glucose.

### International Consensus Targets (ATTD 2019, reaffirmed 2024-2025)

| Range | mg/dL | mmol/L | Color | Target | Time/Day |
|-------|-------|--------|-------|--------|----------|
| Very High | >250 | >13.9 | Orange | <5% | <1h 12min |
| High | 181-250 | 10.1-13.9 | Yellow | <25% total above | <6h total above |
| **In Range** | **70-180** | **3.9-10.0** | **Green** | **>70%** | **>16h 48min** |
| Low | 54-69 | 3.0-3.8 | Red | <4% | <58 min |
| Very Low | <54 | <3.0 | Dark Red | <1% | <15 min |

#### Special Populations

| Population | Target Range | TIR Goal |
|------------|-------------|----------|
| Pregnancy (T1D) | 63-140 mg/dL | >70% |
| Older/high-risk | 70-180 mg/dL | >50% |
| Children/adolescents | 70-180 mg/dL | >70% |

### How to Display TIR

#### Visualization Options (Best to Worst)

**1. Stacked Bar (AGP Standard) -- Recommended**
```
|███████████████████████████████████░░░░░░░░░░░|
 ██ Very Low (0.5%)  ██ Low (3%)  ██ In Range (72%)  ██ High (20%)  ██ Very High (4.5%)
```
- Horizontal or vertical
- Always show ALL five ranges
- Use percentage labels AND hours/minutes

**2. Ring/Donut Chart**
- Visually appealing for dashboard
- Green fills clockwise as TIR improves
- Center shows TIR percentage as large number

**3. Daily Heatmap Calendar**
- 30-day grid, each cell colored by that day's TIR
- Quick visual: "which days were good/bad?"
- Enables pattern spotting (weekends worse?)

**4. Trend Line (TIR over weeks/months)**
- Shows improvement trajectory
- Most motivating visualization for long-term users
- "Your TIR went from 55% to 72% in 3 months"

### TIR Display Rules

| Rule | Rationale |
|------|-----------|
| Always show TBR prominently | Lows are more dangerous than highs |
| Don't hide bad days | Honest data builds trust |
| Show TIR as hours too, not just % | "17 hours in range" is more intuitive than "71%" |
| Compare to previous period | "This week vs last week" is motivating |
| Minimum 14 days for reliable TIR | Show "X more days needed" if insufficient data |

---

## 10. HbA1c Estimation (GMI)

### The Formula

```
GMI (%) = 3.31 + 0.02392 x mean_glucose_mg_dL
```

### Accuracy Assessment

| Metric | Value |
|--------|-------|
| Agreement with lab A1C (within 0.3%) | ~20% of users |
| Discrepancy >0.5% from lab | 28-36% of users |
| Machine learning models (better than GMI) | Up to 91% accuracy |
| Minimum data required | 14 days CGM data |

### Why GMI =/= Lab A1C

| Factor | Effect |
|--------|--------|
| Red blood cell lifespan variation | Some people glycate hemoglobin faster |
| Anemia, hemoglobin variants | Falsely low/high A1C |
| Interstitial vs blood glucose | CGM reads interstitial fluid, not blood |
| Sensor accuracy variation | Different CGM brands vary |

### Recommendations for GlucoBro

| Decision | Recommendation |
|----------|---------------|
| Show GMI? | Yes, but label it "**estimated** A1C (GMI)" |
| Show alongside lab A1C? | Yes — let users log their real lab A1C for comparison |
| Disclaimer? | Required: "GMI is an estimate. Your lab A1C may differ by 0.5% or more." |
| Minimum data? | Require 14 days with >70% data coverage before showing |
| Update frequency? | Recalculate daily based on rolling 14-day average |

### GMI to Mean Glucose Reference Table

| GMI (%) | Mean Glucose (mg/dL) | Mean Glucose (mmol/L) |
|---------|---------------------|----------------------|
| 5.7 | 100 | 5.5 |
| 6.0 | 112 | 6.2 |
| 6.5 | 133 | 7.4 |
| 7.0 | 154 | 8.6 |
| 7.5 | 175 | 9.7 |
| 8.0 | 196 | 10.9 |
| 8.5 | 217 | 12.1 |
| 9.0 | 238 | 13.2 |

---

## 11. Alerts & Notifications

### Clinical Thresholds

| Alert Type | Threshold | Priority | Behavior |
|------------|-----------|----------|----------|
| **Urgent Low** | <54 mg/dL (<3.0 mmol/L) | CRITICAL | Cannot be disabled, loud alarm, vibrate, repeat every 5 min |
| **Low** | <70 mg/dL (<3.9 mmol/L) | High | Sound + vibrate, snooze 15 min, smart repeat |
| **Falling Fast** | >2 mg/dL/min downward | High | Predictive: "BG dropping fast, currently 95" |
| **High** | >180 mg/dL (>10.0 mmol/L) | Medium | Configurable, default 30 min snooze |
| **Rising Fast** | >2 mg/dL/min upward | Medium | "BG rising fast, currently 210" |
| **Very High** | >250 mg/dL (>13.9 mmol/L) | High | Escalating: vibrate > sound > repeat |
| **Signal Loss** | >20 min no data | Medium | "CGM signal lost — check sensor" |
| **Sensor Expiry** | 24h / 6h / 1h before | Low | "Sensor expires tomorrow at 14:30" |
| **Missed Logging** | Configurable | Low | Gentle nudge, not guilt-trip |
| **Medication Reminder** | User-set time | Medium | "Time for your Metformin" |

### Alert Fatigue Solutions

| Problem | Solution |
|---------|----------|
| Too many high alerts after meals | **Post-meal silence window**: Auto-suppress high alerts for 90 min after logged meal |
| Repeated alerts for same event | **Smart snooze**: Don't re-alert if trend has reversed |
| Night alerts waking partner | **Night mode**: Vibrate only from 22:00-07:00 (configurable) |
| Alert during meetings | **Focus mode**: Suppress non-urgent for 1-4 hours |
| Users disabling all alerts | **Graduated system**: Start with urgent-only, user opts in to more |
| Rate-of-change noise | **Sustained threshold**: Only alert after 15 min above/below threshold, not instant |

### Alert Delivery Channels

| Channel | Use Case |
|---------|----------|
| Push notification | Primary — all alerts |
| In-app banner | When app is open |
| Apple Watch / Wear OS | Wrist tap for discreet alerts |
| Phone call (like Sugarmate) | Urgent low — calls your phone to wake you |
| Follower alert | Send to caregiver/partner/parent |
| Widget update | Live activity / homescreen widget color change |

---

## 12. Dark Patterns to Avoid

### Patterns That Make Diabetics Abandon Apps

| Dark Pattern | Example | Why It's Harmful |
|-------------|---------|-----------------|
| **Paywall on basic logging** | "Log more than 5 readings/day? Subscribe!" | Insulin-dependent people MUST log frequently — this is hostile |
| **Paywall on data export** | "Want to share with your doctor? $9.99/mo" | Trapping health data behind a paywall is unethical |
| **Ads between logging actions** | Interstitial ad after saving a reading | Delays a time-sensitive medical action |
| **Forced account creation** | "Sign up to start logging" | Users want to try before committing |
| **Hiding the free tier** | Defaulting to subscription page | Users feel tricked |
| **Auto-renewal without warning** | No reminder before charge | 81% of subscription apps do this (FTC data) |
| **Difficult cancellation** | Buried cancel button, multi-step process | 70% of apps don't show how to cancel |
| **Data hostage** | No export, no way to leave with your data | Users are locked into an app they hate |
| **Guilt messaging** | "You haven't logged in 3 days!" | Diabetes burnout is real — guilt worsens it |
| **Mandatory permissions** | Require contacts/location to use basic features | Erodes trust |
| **Removing features** | Pulling working features in updates | Breaks user workflow, causes data confusion |
| **Fake urgency** | "Limited time offer: 50% off premium!" | Exploiting health anxiety |

### GlucoBro Anti-Dark-Pattern Commitments

1. **Core logging is always free** — no limit on readings
2. **Data export is always free** — CSV and PDF, your data is yours
3. **No ads ever** — this is a medical tool
4. **Works offline** — no internet required for logging
5. **No forced account** — local-first, optional sync
6. **Clear pricing** — if premium exists, show what's free vs paid upfront
7. **Easy cancellation** — one tap, no guilt, keep your data
8. **No guilt on missed days** — "Welcome back!" not "Where were you?"
9. **Changelog for updates** — tell users what changed before they update

---

## 13. Accessibility

### Color Blindness: The Critical Problem

**8% of men and 0.5% of women have color vision deficiency.** The most common types:

| Type | Prevalence | Problem for Glucose Apps |
|------|-----------|------------------------|
| **Deuteranopia** (red-green, green-weak) | 6% of men | Cannot distinguish green (in-range) from red (low) |
| **Protanopia** (red-green, red-weak) | 2% of men | Red appears dark/brownish, green and yellow merge |
| **Tritanopia** (blue-yellow) | 0.01% | Blue and green merge |

### The Standard Glucose Color Problem

The standard AGP colors are:
- Green = In Range (70-180)
- Yellow = High (181-250)
- Red = Low (<70)
- Dark Red = Very Low (<54)
- Orange = Very High (>250)

**Red and green are the WORST color pair for the most common color blindness type.** This is a known, published problem in diabetes data visualization.

### Accessible Color Solutions

#### Option 1: Tidepool Approach (Shape + Color)
Use shape, size, and opacity IN ADDITION to color:
- In range: Filled circle (green/teal)
- Low: Triangle pointing down (blue/dark)
- High: Square (amber/orange)
- Very low: Large triangle (dark blue with pattern)
- Very high: Large square (dark orange with pattern)

#### Option 2: Blue-Orange Palette (Color-Blind Safe)

| Range | Standard | Color-Blind Safe Alternative |
|-------|----------|------------------------------|
| Very Low | Dark Red | Deep Purple (#7B2D8E) |
| Low | Red | Blue (#2563EB) |
| In Range | Green | Teal/Cyan (#06B6D4) |
| High | Yellow | Amber (#F59E0B) |
| Very High | Orange | Deep Orange (#EA580C) |

#### Option 3: Pattern + Color Combination
- Add hatching/stripes to danger zones
- Add icons (warning triangle for low, up-arrow for high)
- Use text labels always visible, not just on hover

### Additional Accessibility Requirements

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| **Minimum contrast** | WCAG AA 4.5:1 (text), 3:1 (large text) | Test all color combinations |
| **Font size** | Minimum 16px body, 14px secondary | Large touch targets (48x48px minimum) |
| **Screen reader** | Full VoiceOver/TalkBack support | "Blood glucose 142 mg/dL, in range, rising slowly" |
| **Dynamic type** | Support system font scaling | Test at 200% size |
| **Reduce motion** | Respect prefers-reduced-motion | No animated graphs for users who disabled animations |
| **One-handed use** | Key actions reachable with thumb | Bottom nav, large buttons, swipe gestures |
| **Haptic feedback** | Confirm logging with vibration | Especially important for vision-impaired users |
| **Unit switching** | mg/dL and mmol/L always available | Setting, not just at setup |
| **High contrast mode** | Optional | White/black with colored indicators |

---

## 14. Ranked Feature Ideas by Impact

### Tier 1: Must-Have (Launch Blockers)

| # | Feature | Impact | Effort | Why |
|---|---------|--------|--------|-----|
| 1 | **Quick BG logging (<2 taps)** | 10/10 | Low | #1 daily action, must be frictionless |
| 2 | **CGM auto-import (Libre 3 via Health)** | 10/10 | Medium | Libre 3 is the most popular CGM in EU |
| 3 | **TIR dashboard with stacked bar** | 9/10 | Medium | The metric that matters most |
| 4 | **Offline-first, local storage** | 9/10 | Medium | Trust and reliability foundation |
| 5 | **Trend arrows + 3h graph** | 9/10 | Medium | CGM users' primary interaction |
| 6 | **Meal/carb quick-log** | 9/10 | Low | Pairs with every BG reading for T1D |
| 7 | **Insulin dose logging (bolus + basal)** | 9/10 | Low | Basic logging, not calculator |
| 8 | **PDF report export (free)** | 8/10 | Medium | Doctor appointments, trust builder |
| 9 | **Color-blind safe palette** | 8/10 | Low | 8% of male users affected |
| 10 | **Dark mode** | 8/10 | Low | Night checking, OLED battery, user expectation |

### Tier 2: High Impact (Month 1-2)

| # | Feature | Impact | Effort | Why |
|---|---------|--------|--------|-----|
| 11 | **Apple Watch widget/complication** | 8/10 | Medium | Sugarmate's killer feature |
| 12 | **Homescreen widget (iOS + Android)** | 8/10 | Medium | Glance without opening app |
| 13 | **T1D/T2D mode switch** | 8/10 | Low | Different UX needs |
| 14 | **Streaks + achievements** | 7/10 | Low | Engagement without pressure |
| 15 | **Oral medication reminders** | 7/10 | Low | T2D killer feature, most apps ignore |
| 16 | **Pattern notes (tags: stress, exercise, illness, period)** | 7/10 | Low | Context for BG spikes |
| 17 | **AGP report generation** | 7/10 | High | International standard, doctors love it |
| 18 | **Multi-day overlay graph** | 7/10 | Medium | Compare days, spot patterns |
| 19 | **GMI (estimated A1C)** | 7/10 | Low | Users want this, low effort if CGM data exists |
| 20 | **Smart alerts (post-meal suppression, night mode)** | 7/10 | Medium | Solves alarm fatigue |

### Tier 3: Differentiators (Month 3+)

| # | Feature | Impact | Effort | Why |
|---|---------|--------|--------|-----|
| 21 | **Photo food recognition + carb estimation** | 8/10 | High | AI-powered, SNAQ/Libre Assist territory |
| 22 | **Predictive glucose (30/60 min)** | 8/10 | High | xDrip+ users love this |
| 23 | **AI pattern detection** ("why was I high?") | 8/10 | High | Holy grail — no app does this well |
| 24 | **Follower/caregiver mode** | 7/10 | High | Parents, partners — Nightscout's strength |
| 25 | **Bolus calculator** | 7/10 | Very High | Regulatory burden (CE Class IIb) |
| 26 | **Food database (multi-language, regional)** | 7/10 | High | German, Turkish, Arabic foods |
| 27 | **IOB tracking with curve** | 7/10 | Medium | Prevents insulin stacking |
| 28 | **Voice logging** | 6/10 | Medium | "Hey GlucoBro, 45 carbs" |
| 29 | **Injection site rotation map** | 6/10 | Medium | Niche but loved by T1D |
| 30 | **Sensor expiry countdown** | 6/10 | Low | Simple but reduces anxiety |

### Tier 4: Delight Features (Month 6+)

| # | Feature | Impact | Effort | Why |
|---|---------|--------|--------|-----|
| 31 | **Period/hormone cycle integration** | 6/10 | Medium | 30% insulin need variation |
| 32 | **Sleep quality correlation** | 6/10 | Medium | Apple Health / Health Connect integration |
| 33 | **Shareable daily summary card** | 5/10 | Low | One image for endo or partner |
| 34 | **Multi-language UI** (DE, EN, TR, AR) | 5/10 | Medium | EU market reach |
| 35 | **Recipe carb calculator** | 5/10 | Medium | Enter ingredients, get per-serving carbs |
| 36 | **Apple Health / Health Connect sync** | 8/10 | Medium | Platform ecosystem integration |
| 37 | **Tidepool / Glooko export** | 5/10 | Medium | Clinic system compatibility |
| 38 | **Weight + BP tracking** | 5/10 | Low | T2D comorbidity management |
| 39 | **Community challenges** | 4/10 | High | Anonymous weekly TIR challenges |
| 40 | **Closed-loop integration** | 4/10 | Very High | OpenAPS/Loop data import |

---

## Key Takeaways for GlucoBro

### The Opportunity

1. **No app nails both T1D and T2D** — most are T1D-first. Serve both with a mode switch.
2. **Free + no ads + data freedom** wins trust immediately in a market full of paywalls.
3. **Speed is king** — the app that lets you log in 2 taps wins. Most apps take 4-6 taps.
4. **The "bro" personality** is a differentiator — supportive, casual, non-clinical. Diabetes apps are either too clinical (Glooko) or too childish (mySugr monster). A "good friend" tone fills a gap.
5. **Libre 3 is the CGM to target** — it's the most common in Europe, and Abbott's own app (LibreLink) has significant UX complaints.
6. **Offline-first is a trust signal** — too many apps have lost user data. Local-first with optional sync is the gold standard.
7. **Accessible by default** — don't add color-blind mode as an afterthought. Design with the blue-orange palette from day one.

### The Non-Negotiable Principles

1. **Core features free, forever** — logging, export, basic reports
2. **Sub-3-second cold start** — users log during meals, at traffic lights, at 3am
3. **Your data, your choice** — export everything, delete everything, no lock-in
4. **Accessible first** — color-blind safe, screen reader compatible, large targets
5. **No guilt, no shame** — supportive tone, celebrate effort not perfection
6. **Clinically accurate** — follow international consensus standards for metrics and thresholds
7. **Privacy by design** — local-first, no tracking, no selling health data

---

## Sources

- [12 Best Diabetes Apps of 2025 - Type1Strong](https://www.type1strong.org/blog-post/12-best-diabetes-apps-of-2025-tools-for-better-management-and-monitoring)
- [Top 10 Diabetes Apps 2026 - Hiranandani Hospital](https://www.hiranandanihospital.org/blog-details/top-10-apps-for-managing-diabetes-effectively)
- [Abbott Libre Assist Feature (Jan 2026)](https://abbott.mediaroom.com/2026-01-05-Abbotts-new-Libre-Assist-app-feature-tackles-a-top-need-for-people-living-with-diabetes-in-the-moment-food-decisions)
- [MySugr Alternatives 2026 - Glukee](https://glukee.com/blog/mysugr-alternatives)
- [mySugr vs Glucose Buddy Comparison - Gluroo](https://gluroo.com/blog/diabetes-101/mysugr-vs-glucose-buddy-full-comparison/)
- [People with Diabetes Talk Apps They Actually Use - Healthline](https://www.healthline.com/diabetesmine/people-diabetes-talk-apps-they-actually-use)
- [TuDiabetes Forum: App Recommendations](https://forum.tudiabetes.org/t/what-are-your-diabetes-log-app-recommendations-not-mysugr-please/80476)
- [CGM App Design - UX Studio](https://www.uxstudioteam.com/ux-blog/cgm-app-design)
- [Designing the CGM Experience - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10899853/)
- [Gamification for Diabetes T1D Management - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7236238/)
- [Gamification and Behavior Change in Diabetes Apps - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6955442/)
- [AGP Report in Daily Care - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8991298/)
- [International Consensus on Time in Range - Diabetes Care](https://diabetesjournals.org/care/article/42/8/1593/36184/Clinical-Targets-for-Continuous-Glucose-Monitoring)
- [Core Glycemic Metrics Explained - ADCES](https://www.adces.org/education/danatech/glucose-monitoring/continuous-glucose-monitors-(cgm)/glycemic-metrics--an-overview)
- [Bolus Calculator Guidelines - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3045234/)
- [Insulin Dose Calculator Apps Review - DietSensor](https://www.dietsensor.com/top-insulin-dose-calculator-apps-review/)
- [Smartphone Apps for Insulin Dose Calculation - BMC Medicine](https://link.springer.com/article/10.1186/s12916-015-0314-7)
- [SNAQ Diabetes Food Tracker](https://www.snaq.ai/)
- [Carbs & Cals App](https://play.google.com/store/apps/details?id=com.chello.carbsandcals)
- [GMI Accuracy - diaTribe](https://diatribe.org/diabetes-technology/using-gmi-estimate-your-a1c-how-accurate-it)
- [GMI: Time to Change Course? - Diabetes Care](https://diabetesjournals.org/care/article/47/6/906/154177/The-Glucose-Management-Indicator-Time-to-Change)
- [Alarm Fatigue in Diabetes Devices - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3869147/)
- [Smart Glucose Alerts Guide 2026](https://www.gheware.com/blog/posts/2025/11/smart-glucose-alerts-guide.html)
- [Colors, Shapes, and Blood Sugars - Tidepool](https://www.tidepool.org/blog/colors-shapes-and-blood-sugars-a-look-into-our-process)
- [Color Standardization in CGM - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8875060/)
- [xDrip+ CGM App](https://navid200.github.io/xDrip/)
- [Nightscout Documentation](http://nightscout.github.io/)
- [Sugarmate Features](https://www.sugarmate.io/features)
- [Medication Management in Diabetes Apps - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6636047/)
- [User Retention in Diabetes Apps - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7317626/)
- [Diabetes Device Burden - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10503226/)
- [Tidepool Loop FDA Clearance](https://www.medtechpulse.com/article/insight/artificial-pancreas-app-scores-fda-clearance/)
- [OpenAPS](https://openaps.org/)
- [ADA Standards of Care 2025 - Glycemic Goals](https://diabetesjournals.org/care/article/48/Supplement_1/S128/157561/6-Glycemic-Goals-and-Hypoglycemia-Standards-of)
- [FTC Study on Dark Patterns in Subscription Apps](https://techcrunch.com/2024/07/10/ftc-study-finds-dark-patterns-used-by-a-majority-of-subscription-apps-and-websites/)
- [TIR Hub - Clinical Guidance and Targets](https://tirhub.com/clinical-guidance-and-targets/)
