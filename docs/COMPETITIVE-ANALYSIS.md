# GlucoBro — Competitive Analysis & Feature Roadmap

**Date**: 2026-03-20
**Market**: Diabetes Management Apps (USD ~11.5B in 2025, CAGR 15.5%)
**GlucoBro Position**: PWA-first, FreeStyle Libre 3 CGM, privacy-first, zero subscription

---

## 1. GlucoBro — Current Feature Inventory

Before comparing, here is exactly what GlucoBro ships today (single HTML + 3 serverless functions):

| Category | Feature | Status |
|----------|---------|--------|
| **Core Tracking** | Manual BG entry (mg/dl) | Done |
| | Meal, meds, sport, mood, weight logging | Done |
| | Edit/delete entries | Done |
| | CSV export (semicolon, BOM for Excel DE) | Done |
| **CGM Integration** | FreeStyle Libre 3 via LibreLinkUp API | Done |
| | Real-time polling (5 min interval) | Done |
| | Trend arrows (single/double up/down, flat) | Done |
| | CGM Live badge on gauge | Done |
| | Auto-save CGM graph data as entries | Done |
| **Visualization** | Canvas ring gauge (animated, color-coded) | Done |
| | Chart.js line chart (last 30 entries) | Done |
| | 140 mg/dl target line overlay | Done |
| | Color system (green <140, yellow 140-180, red >180) | Done |
| | Animated particle background | Done |
| **Statistics** | 7-day / 14-day / all-time averages | Done |
| | In-range percentage (<140) | Done |
| | Measurement streak counter | Done |
| **Cloud Sync** | Supabase real-time sync | Done |
| | Device pairing via 8-char sync code | Done |
| | Bidirectional push/pull sync | Done |
| **Notifications** | Configurable reminder times | Done |
| | Service Worker push notifications | Done |
| | Web Push for CGM high/low alerts (via cron) | Done |
| | VAPID key setup, subscription management | Done |
| **PWA** | Service Worker (cache-first app shell) | Done |
| | Offline support | Done |
| | Add to Home Screen (manifest.json) | Done |
| | iOS standalone mode (status bar, safe areas) | Done |
| | Keyboard shortcuts (Escape) | Done |
| | Swipe-to-dismiss sheets | Done |
| | URL hash shortcuts (#add) | Done |
| **Backend** | `/api/libre` — LibreLinkUp proxy (login, connections, graph) | Done |
| | `/api/push` — Web Push subscription CRUD | Done |
| | `/api/cron` — Scheduled CGM check + alert push | Done |
| **Motivation** | Daily facts (study-backed, personalized) | Done |
| | Context-aware motivation messages based on 7d avg | Done |
| **Deployment** | Vercel (serverless) + GitHub Pages | Done |
| | GitHub Actions CI/CD | Done |

---

## 2. Competitive Matrix

### 2.1 Feature-by-Feature Comparison

| Feature | GlucoBro | mySugr (Roche) | Sugarmate (Dexcom) | xDrip+ | Nightscout | Glucose Buddy | Dario | Glooko | LibreView |
|---------|----------|----------------|-------------------|--------|------------|---------------|-------|--------|-----------|
| **Platform** | PWA (any browser) | iOS/Android | iOS/Android | Android only | Web + apps | iOS/Android | iOS/Android | iOS/Android/Web | Web + iOS/Android |
| **Price** | Free, no sub | Free + Pro ($2.99/mo) | Free | Free (OSS) | Free (OSS) + hosting | Free + Premium ($3.33/mo) | Free + meter hardware | Free (clinic-funded) | Free |
| **CGM: Libre** | Yes (Libre 3 via LLU) | Yes (via SmartGuide) | No (Dexcom only) | Yes (NFC + BT) | Yes (via uploader) | No | No | Yes (via sync) | Yes (native) |
| **CGM: Dexcom** | No | No | Yes (native) | Yes (native) | Yes (via uploader) | Yes (Premium) | No | Yes (via sync) | No |
| **CGM: Multiple** | Libre only | Accu-Chek + Libre | Dexcom only | 10+ devices | Most CGMs | Dexcom only | None (meter only) | 200+ devices | Libre only |
| **Real-time gauge** | Yes (Canvas) | No | Yes | Yes (widget) | Yes (web) | No | No | No | Yes (web) |
| **Trend arrows** | Yes | Yes | Yes | Yes | Yes | No | No | No | Yes |
| **Manual logging** | BG + meal + meds + sport + mood + weight | BG + meal + insulin + activity + notes | BG + meal + exercise + insulin + notes | BG + insulin + carbs + notes | BG + insulin + carbs + notes | BG + meal + meds + exercise + BP | BG + carbs + insulin + meds + BP | BG + insulin + meals + exercise | BG only (auto) |
| **Time in Range** | Basic (<140 only) | Yes (standard) | Yes (70-180) | Yes (customizable) | Yes (standard) | No | No | Yes (standard) | Yes (standard) |
| **AGP Report** | No | Yes | No | Yes | Yes | No | No | Yes | Yes (native) |
| **A1c Estimation** | No | Yes (Pro) | Yes | Yes | Yes | Yes (Premium) | No | Yes | Yes |
| **Pattern Detection** | No | Yes (Pro) | Yes (30+ tiles) | Yes (predictions) | Yes (plugins) | Yes (Meal IQ / AI) | Yes (pattern alerts) | Yes (risk strat.) | Basic |
| **IOB Calculator** | No | Yes (Bolus Calc, Pro) | No | Yes | Yes (treatments) | No | No | No | No |
| **PDF Reports** | No | Yes (Pro) | No | No | Yes | Yes (Premium) | Yes | Yes | Yes |
| **Food Database** | No | No | Yes (FatSecret) | No | No | Yes (Meal IQ / AI) | No | No | No |
| **Family Sharing** | Sync code only | No | Yes (SMS/call alerts) | Yes (follower mode) | Yes (core feature) | No | Yes (4 emergency contacts) | Yes (care team) | Yes (care team) |
| **Watch Support** | No | No | Yes (Apple Watch) | Yes (Wear OS, Garmin) | Yes (multiple) | No | No | No | No |
| **Widget** | No | No | Yes | Yes (home screen) | No | No | No | No | No |
| **Offline** | Yes (SW cache) | Yes (local DB) | Partial | Yes (full) | No (cloud-dependent) | Yes (local DB) | Yes (local DB) | Partial | No (cloud) |
| **Open Source** | Potential | No | No | Yes (GPL) | Yes (AGPL) | No | No | No | No |
| **Data Ownership** | Yes (your Supabase) | No (Roche servers) | No (Dexcom servers) | Yes (local) | Yes (your server) | No (their servers) | No (their servers) | No (their servers) | No (Abbott servers) |
| **Export** | CSV | CSV + PDF | No | CSV + JSON | CSV + JSON + API | CSV + PDF | CSV + PDF | CSV + PDF + API | CSV + PDF |

### 2.2 Competitor Deep Dives

#### mySugr (Roche) — Market Leader
- **USP**: Polished UX, gamification ("monster" mascot), bolus calculator, integration with Accu-Chek ecosystem. CE-marked medical device.
- **UI/UX**: 9/10 — Best-in-class onboarding, playful design, satisfying animations. The standard others are measured against.
- **CGM Depth**: Now integrating Accu-Chek SmartGuide CGM with predictive glucose insights. Expanding to 30+ countries.
- **Reporting**: AGP, estimated A1c, PDF reports for HCPs. Pro subscription unlocks bolus calculator and smart search.
- **Social**: Limited. No family follower mode. Relies on HCP portal sharing.
- **POORLY**: Locked into Roche ecosystem. Pro features behind paywall ($36/yr). No Dexcom support. No follower mode for parents/caregivers. Slow to add Libre integration. No widget or watch complication.

#### Sugarmate (Dexcom/Tandem) — Loved by CGM Users
- **USP**: Best companion app for Dexcom users. Predictive low alerts beat Dexcom's own app. Below-normal phone call feature is life-saving. 30+ customizable stat tiles.
- **UI/UX**: 8/10 — Clean, data-dense, highly customizable dashboard. Overwhelming for new users.
- **CGM Depth**: Deep Dexcom-only integration. Predictive alerts, Apple Watch complication, FatSecret food DB integration.
- **Reporting**: 30+ statistical tiles, any date range comparison. Strong data viz but no AGP or PDF reports.
- **Social**: Excellent. Urgent Low SMS with GPS location. Can auto-call on low BG. Family dashboard.
- **POORLY**: Dexcom only — no Libre, no Medtronic. No PDF reports for doctors. Acquired by Tandem, uncertain future direction. No Android widget equivalent. Food DB is rudimentary.

#### xDrip+ — Open Source Powerhouse
- **USP**: Supports the most CGM devices of any app. Fully open source. Extremely customizable with hundreds of settings. Predictive algorithms, raw data access.
- **UI/UX**: 5/10 — Functional but intimidating. Steep learning curve. Not designed for casual users.
- **CGM Depth**: Unmatched. Direct Bluetooth to G6, G7, Libre, Medtrum, Eversense. Reads raw sensor data. Calibration algorithms.
- **Reporting**: HbA1c estimation, predictive low/high, statistics. Limited formal reporting.
- **Social**: Nightscout integration, follower mode, watch faces for Wear OS, Garmin, Fitbit, Pebble.
- **POORLY**: Android only. No iOS version (xDrip4iOS is separate project). UI is a maze of settings. No formal PDF reports. No clinic integration. Intimidating for non-technical users. Documentation scattered.

#### Nightscout — DIY CGM in the Cloud
- **USP**: First "CGM in the cloud" solution. Real-time remote monitoring. Born from parent hacking community. Pebble watch was the OG.
- **UI/UX**: 6/10 — Functional web dashboard. Looks dated. Plugins improve it but setup is complex.
- **CGM Depth**: Supports virtually all CGMs via uploaders. Plugin ecosystem. Treatments, profiles, insulin on board.
- **Reporting**: AGP, statistics, daily views. Plugin-extensible reporting.
- **Social**: Core strength. Built for parents monitoring children. Multiple follower views. REST API for custom integrations.
- **POORLY**: Requires self-hosting (Heroku, Railway, Azure, etc.). Setup is technical. Performance depends on hosting quality. MongoDB dependency. UI feels like 2015. Mobile apps are wrappers around web. Heroku free tier removal hurt adoption.

#### Glucose Buddy — Simple Tracker
- **USP**: Oldest and simplest diabetes app (10+ years). Meal IQ uses AI to grade meals based on BG impact. Photo-based meal logging.
- **UI/UX**: 7/10 — Clean, simple, beginner-friendly. Nothing fancy but gets the job done.
- **CGM Depth**: Basic Dexcom integration in premium only. No Libre. No real-time visualization.
- **Reporting**: A1c calculator, trend graphs, PDF/CSV export in premium. 12-week education plan.
- **Social**: None meaningful.
- **POORLY**: Best features behind $40/yr paywall. Limited CGM support. No real-time anything. Feels abandoned compared to competitors. Community is small. No follower mode. No watch support.

#### Dario — Smart Meter Integration
- **USP**: All-in-one hardware: meter + lancet + strips in pocket-sized form factor. Plugs into phone headphone jack. Hypo alert with GPS location and emergency contacts.
- **UI/UX**: 7/10 — Modern design, good onboarding. Hardware integration is seamless.
- **CGM Depth**: None. Dario is a BGM (blood glucose meter) system, not CGM. No continuous monitoring.
- **Reporting**: Pattern recognition, PDF reports, CDE coaching (paid).
- **Social**: Emergency contact system with GPS on hypo detection. Up to 4 contacts get auto SMS.
- **POORLY**: Locked to Dario hardware. Strips are expensive ($0.50-0.75 each). No CGM support at all. Coaching is expensive add-on. Hardware requires headphone jack (dying on modern phones). Not relevant for CGM users.

#### Glooko — Clinic Integration
- **USP**: The platform doctors and clinics use. 200+ device integrations. EHR integration (Epic, Oracle Health, etc.). Population health dashboards.
- **UI/UX**: 6/10 — Designed for HCPs first, patients second. Clinical and sterile.
- **CGM Depth**: Broad device support through manufacturer partnerships. Data aggregation from multiple sources.
- **Reporting**: Best-in-class clinical reporting. AGP, TIR, population risk stratification, clinic dashboards.
- **Social**: Full care team collaboration. Doctor-patient data sharing. Clinic workflow integration.
- **POORLY**: Patient-facing app is mediocre. Not designed for self-motivated individuals. Requires clinic enrollment in many cases. No real-time CGM visualization. No notifications or alerts. No motivational features. Boring.

#### LibreView — Abbott's Own Platform
- **USP**: Native Abbott platform. Automatic data upload from Libre sensors. Standardized AGP reports. Doctor sharing built-in. Free.
- **UI/UX**: 6/10 — Clean but basic web interface. New Libre app (2025) improved navigation. Limited customization.
- **CGM Depth**: Deep but Libre-only. Native sensor communication. Automatic background upload.
- **Reporting**: Industry-standard AGP reports. TIR visualization. Glucose pattern insights.
- **Social**: HCP sharing portal. Patient-provider connection system.
- **POORLY**: Libre ecosystem lock-in. Requires internet for data upload (no true offline). No Apple Health integration. Read-only — cannot add manual entries, insulin, meals, or notes. No alerts or reminders. Passive data viewer, not an active management tool. Slow to innovate. No API access for users. Web UI feels like a medical portal, not a personal tool.

---

## 3. GlucoBro Differentiators — What We Do That Others Cannot/Do Not

### 3.1 Pure PWA — No App Store, No Gatekeepers
- **Zero friction installation**: Open URL, add to home screen. Done. No 200MB download. No Apple/Google review delays.
- **Instant updates**: Deploy to Vercel, every user gets the update on next open. No "please update your app" screens.
- **Cross-platform by default**: Works on any device with a browser — Windows, Mac, Linux, ChromeOS, iOS, Android.
- **No app store tax**: No 15-30% cut on any potential subscription revenue.
- **Competitors**: Every single competitor is native iOS/Android. Nightscout has web but it is a full server deployment, not a PWA.

### 3.2 Privacy-First Architecture
- **Your data, your database**: Users configure their own Supabase instance. We do not see, store, or access user health data.
- **Local-first**: Everything works offline. Supabase sync is optional. Data lives in localStorage until user opts into cloud.
- **No account required**: Open and use immediately. No email, no registration, no consent forms.
- **CGM credentials**: Stored in user's own Supabase, not on our servers.
- **Competitors**: Every competitor stores health data on their corporate servers. mySugr (Roche), Sugarmate (Dexcom/Tandem), LibreView (Abbott), Glooko (clinic-controlled). Only xDrip+ and Nightscout come close on privacy, but both require more technical setup.

### 3.3 Developer-First Customizability
- **Single HTML file**: The entire app is one file. Fork it, modify it, self-host it.
- **No build step**: No webpack, no bundler, no npm for the client. Raw HTML/CSS/JS.
- **Hackable**: Want to change the target range? Edit one number. Want different colors? Change CSS variables.
- **Serverless backend**: Three small JS files handle all API needs.
- **Competitors**: xDrip+ is open source but is a complex Android Java project. Nightscout is open source but requires MongoDB + Node.js server. Nobody else is open source.

### 3.4 Zero Subscription Model
- **Completely free**: No Pro tier, no premium features, no "unlock for $3.99/mo".
- **No hardware lock-in**: Works with any Libre 3 sensor. No proprietary meter required.
- **Competitors**: mySugr Pro ($36/yr), Glucose Buddy Premium ($40/yr), Dario (hardware + strips). Even "free" apps upsell aggressively.

### 3.5 Design Language
- **Sci-fi aesthetic**: Dark theme with neon accents. Orbitron font. Particle background. Feels like a cockpit, not a clinical tool.
- **Competitors**: Medical/clinical (LibreView, Glooko), playful/childish (mySugr monster), utilitarian (xDrip+, Nightscout). Nobody targets the "tech-savvy adult who wants their health app to look cool."

---

## 4. SWOT Analysis

### Strengths
- PWA = instant access, zero friction
- Privacy-first with user-owned data
- FreeStyle Libre 3 live CGM integration
- Beautiful dark sci-fi design
- No subscription, no account required
- Single-file simplicity

### Weaknesses
- Libre-only CGM support (no Dexcom, Medtronic, etc.)
- No AGP report (the medical standard)
- No A1c estimation
- No insulin/IOB tracking
- No food database
- No pattern detection
- No watch/widget support
- No PDF report for doctors
- Statistics are basic (averages only)
- Single-language (German only)

### Opportunities
- PWA diabetes app is a completely unoccupied niche
- Open source community could drive rapid feature development
- Non-insulin Type 2 (largest diabetes segment) is underserved by CGM apps
- AI-powered pattern detection is the next frontier
- WebBluetooth API could enable direct sensor reading (bypassing LibreLinkUp)
- FreeStyle Libre 3+ API likely compatible with current integration

### Threats
- Abbott could restrict LibreLinkUp API access at any time
- Roche/Dexcom investing heavily in native app ecosystems
- Apple Health and Google Health Connect becoming aggregation layers
- Regulatory risk: medical device classification for apps with treatment suggestions
- CGM market consolidation could limit integration opportunities

---

## 5. Feature Roadmap

### P0 — Must Have Now (Critical Gaps)

These are features that users of any competitor would expect on day one.

| # | Feature | Description | Effort | Impact |
|---|---------|-------------|--------|--------|
| P0.1 | **Standard Time in Range (TIR)** | Change from <140 to international standard 70-180 mg/dl. Show TIR, TAR (time above 180), TBR (time below 70) as stacked colored bar. Display on dashboard and stats. | S | Critical |
| P0.2 | **A1c Estimation** | Calculate estimated A1c from average glucose using ADAG formula: `eA1c = (avg_glucose + 46.7) / 28.7`. Show on stats sheet. Update with each new entry. Minimum 14 days data required. | S | High |
| P0.3 | **Glucose Variability Metrics** | Add standard deviation, coefficient of variation (CV), and glucose management indicator (GMI) to stats. CV <36% is the clinical target. | S | High |
| P0.4 | **Improved Chart** | 7d / 14d / 30d / 90d time range selector. Pinch-to-zoom. Overlay bands for target range (70-180). Show high/low events as markers. | M | High |
| P0.5 | **Insulin Logging** | Add insulin field to entry form (units, type: rapid/long-acting). Store with entries. Show in logbook. Essential for Type 1 and insulin-dependent Type 2. | S | High |
| P0.6 | **Unit Toggle (mg/dl vs mmol/L)** | Settings toggle. All displays and inputs converted. `mmol = mg / 18.0182`. International users expect this. | S | Medium |
| P0.7 | **English Language Support** | Add i18n layer. Toggle DE/EN in settings. All UI strings externalized. GlucoBro is currently German-only which limits global adoption. | M | High |

**Estimated time**: 1 week focused sprint.

---

### P1 — Next 2 Weeks (High-Impact Differentiators)

| # | Feature | Description | Effort | Impact |
|---|---------|-------------|--------|--------|
| P1.1 | **Ambulatory Glucose Profile (AGP)** | Standard AGP report: 14-day glucose profile overlay with percentile bands (5th, 25th, 50th, 75th, 95th). Canvas-rendered. This is what doctors expect. The medical standard for CGM reporting. | L | Critical |
| P1.2 | **PDF Report for Doctors** | Generate a clean 1-2 page PDF with AGP, TIR bar, A1c estimation, averages, and daily log. Use jsPDF or html2pdf. Add "Arztbericht erstellen" button to stats. Export or share directly. | L | High |
| P1.3 | **Pattern Detection — Post-Meal Spikes** | Analyze BG readings 1-3h after logged meals. Flag meals that consistently cause spikes >180. Show as alert cards in stats: "Pizza caused +80 mg/dl on average." | M | High |
| P1.4 | **Pattern Detection — Dawn Phenomenon** | Detect consistent BG rise between 3:00-8:00 AM. Show trend card: "Your BG rises ~30 mg/dl between 4-7 AM (Dawn Phenomenon detected)." | M | High |
| P1.5 | **Carb Logging** | Add carbohydrate grams field to entry form. Show carb-to-BG correlation in stats. Foundation for future carb ratio calculator. | S | Medium |
| P1.6 | **Daily/Weekly Summary View** | Add a daily timeline view to logbook showing all entries on a 24h axis. Weekly summary with heatmap (day x hour). Replaces the flat list with something visual. | M | High |
| P1.7 | **Improved Notification System** | High BG / low BG threshold alerts (configurable). Predictive alert: "BG trending to 200+ in 30 min" based on CGM trend arrows and velocity. | M | High |
| P1.8 | **Share with Family** | Generate a read-only share URL (Supabase row-level security). Family member opens link, sees live gauge and recent readings. No app install needed (it is a PWA!). | M | High |

**Estimated time**: 2 weeks.

---

### P2 — Next Month (Platform Expansion)

| # | Feature | Description | Effort | Impact |
|---|---------|-------------|--------|--------|
| P2.1 | **Apple Watch Web Clip / Complications** | Shortcut to open GlucoBro PWA. Show last BG on watch face via WidgetKit (requires Shortcuts hack) or WatchOS app companion. Push notification shows BG on watch. | L | High |
| P2.2 | **Home Screen Widget** | iOS: Scriptable-based widget showing current BG + trend. Android: Hermit or Tasker widget pulling from localStorage/Supabase. Alternatively: web-based widget via PWA Widgets API (Chrome). | L | Medium |
| P2.3 | **Insulin on Board (IOB) Calculator** | Configure DIA (duration of insulin action, 3-5h) and ISF (insulin sensitivity factor). Calculate active insulin from recent injections. Show IOB counter on dashboard. Warn before stacking doses. | L | High |
| P2.4 | **Carb Ratio Calculator** | After 2+ weeks of paired carb + BG + insulin data: calculate I:C ratio (insulin-to-carb ratio). Show suggested ratio with confidence interval. | M | Medium |
| P2.5 | **Food Database Integration** | Integrate FatSecret or Open Food Facts API. Search foods, auto-populate carb grams. Barcode scanner via camera. Saves time on manual carb entry. | L | Medium |
| P2.6 | **Exercise Impact Tracking** | Log exercise type (walk, run, gym, bike) and duration. Correlate with BG drop 1-4h post-exercise. Show impact cards: "30 min walk = -25 mg/dl avg." | M | Medium |
| P2.7 | **Medication Reminders** | Configure recurring medication schedules (Metformin 2x/day, etc.). Push reminders via Service Worker. Track adherence percentage. | M | Medium |
| P2.8 | **Dexcom CGM Support** | Add Dexcom Share API integration (similar to Libre proxy approach). Support G6/G7. Doubles the addressable CGM user base. | L | High |
| P2.9 | **Data Import** | Import from CSV, mySugr export, LibreView CSV, Nightscout JSON. Migration path for users switching from other apps. | M | Medium |

**Estimated time**: 4 weeks.

---

### P3 — Nice to Have (Vision Features)

| # | Feature | Description | Effort | Impact |
|---|---------|-------------|--------|--------|
| P3.1 | **AI Insights Engine** | Local LLM (WebLLM/ONNX) or cloud API to analyze patterns and generate natural language insights: "Your BG control improved 12% this week. The morning walks are working." | XL | High |
| P3.2 | **WebBluetooth Direct Sensor** | Read Libre sensor directly via WebBluetooth API, bypassing LibreLinkUp entirely. True offline CGM. Experimental but revolutionary. | XL | High |
| P3.3 | **Gamification & Achievements** | Streak badges, in-range records, weekly challenges. "You stayed in range for 72 hours straight!" Inspired by mySugr but darker, cooler. | M | Medium |
| P3.4 | **Blood Pressure & SpO2 Tracking** | Expand beyond glucose. Track BP, heart rate, SpO2. Correlate with BG patterns. Full metabolic dashboard. | M | Low |
| P3.5 | **Multi-Language (6+)** | Add TR, AR, ES, FR, PL, TA. RTL support for Arabic. Cover major diabetes populations globally. | L | Medium |
| P3.6 | **Nightscout Compatibility** | Act as a Nightscout uploader or consumer. Interop with the existing DIY diabetes ecosystem. | L | Medium |
| P3.7 | **FHIR Export** | Export data in HL7 FHIR format for clinical interoperability. Upload to patient portals. | L | Low |
| P3.8 | **Offline AI Pattern Matching** | Run TensorFlow.js model locally for BG prediction and anomaly detection. Zero cloud dependency. Train on user's own data only. | XL | Medium |
| P3.9 | **Multi-Sensor Comparison** | When user has overlapping sensor sessions, show comparison overlay. Useful for sensor accuracy validation. | M | Low |
| P3.10 | **Community / Leaderboard** | Opt-in anonymous leaderboard. "Your 7d TIR is top 15% of GlucoBro users." Social motivation without compromising privacy. | L | Medium |

---

## 6. Prioritization Rationale

### Why P0 first?
These are table-stakes features. Any user switching from mySugr or LibreView will immediately notice the missing A1c estimate, non-standard TIR, and lack of insulin tracking. These are also the cheapest to implement (mostly math + UI).

### Why AGP in P1?
The Ambulatory Glucose Profile is the single most important report in diabetes management. It is the international standard (ADA-endorsed). Without it, no endocrinologist will take GlucoBro data seriously. This feature alone could make GlucoBro a viable clinical tool.

### Why Pattern Detection in P1?
This is where GlucoBro can differentiate. mySugr and LibreView are passive data viewers. xDrip+ has predictions but terrible UX. GlucoBro can be the first app to surface actionable patterns with beautiful sci-fi visualizations: "Your Dawn Phenomenon starts at 4:12 AM and adds +34 mg/dl by 7 AM. Here is the last 14 days overlaid."

### Why Share in P1?
The PWA advantage is massive here. Family sharing with no app install = send a link, see live data. No competitor can do this. Nightscout requires server setup. Dexcom requires the follower app install. GlucoBro: one URL.

### Why Watch/Widget in P2?
Important but technically constrained for PWAs. Apple limits PWA watch access. Needs creative workarounds (Shortcuts, Scriptable). Worth solving but not the first priority.

---

## 7. Competitive Positioning Statement

> **GlucoBro is the first privacy-first, PWA-based glucose tracker with live CGM integration. No app store. No subscription. No corporate server holding your health data. Your data, your rules, your database. Built for people who want to manage their diabetes with the same tools they'd use to monitor a production system: real-time dashboards, trend analysis, and actionable alerts — all in a design that does not look like it was built by a hospital IT department.**

### Target Users
1. **Tech-savvy Type 2 diabetics** who use Libre CGM and want more control than LibreView offers
2. **Privacy-conscious patients** who do not trust corporate health data platforms
3. **Developers and tinkerers** who want to customize their diabetes management tool
4. **Parents of diabetic children** who want a free, easy family-sharing solution
5. **International users** frustrated by region-locked native apps

### What We Are NOT
- Not a medical device (no treatment recommendations, no CE marking)
- Not a replacement for clinical tools (doctors should still use LibreView/Glooko)
- Not trying to compete with xDrip+ on device breadth
- Not a social platform

---

## 8. 90-Day Execution Plan

```
Week 1-2:   P0 complete (TIR, A1c, CV, insulin, units, chart, i18n)
Week 3-4:   P1.1-P1.3 (AGP report, PDF export, post-meal pattern detection)
Week 5-6:   P1.4-P1.6 (dawn phenomenon, carbs, daily timeline view)
Week 7-8:   P1.7-P1.8 (predictive alerts, family sharing)
Week 9-10:  P2.1-P2.3 (watch, widget, IOB calculator)
Week 11-12: P2.4-P2.6 (carb ratio, food DB, exercise tracking)
Week 13:    P2.7-P2.9 (med reminders, Dexcom, data import)
```

### Success Metrics
- **Week 4**: GlucoBro can generate an AGP-compliant PDF report
- **Week 8**: Family member can monitor live BG via shared link
- **Week 13**: Dexcom G7 users can use GlucoBro
- **Ongoing**: GitHub stars as proxy for developer adoption

---

*Analysis prepared 2026-03-20. Competitive data based on published feature lists and app store descriptions as of March 2026.*
