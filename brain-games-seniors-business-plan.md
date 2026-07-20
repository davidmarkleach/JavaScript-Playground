# Business Plan — "Sharp" (working title)

### A brain-training iPhone app repositioned for the 55+ market, acquired through Meta Ads

**Prepared:** July 2026
**Stage:** Pre-launch / repositioning of an existing brain-games codebase
**One-line thesis:** The brain-games category is saturated for the under-40 crowd but *underserved and mispriced* for seniors — a demographic that over-indexes on Meta, converts on health-anxiety-driven messaging, and pays for subscriptions at higher rates and lower churn than younger users.

---

## 1. Executive Summary

Brain-training is a mature mobile category (Lumosity, Peak, Elevate, NeuroNation, Impulse) built and marketed almost entirely for a 25–45 "self-optimizer" audience. That audience is expensive to acquire (fierce CPM competition) and churns fast.

The opportunity is not a new game — it is a **repositioning**. Take a competent brain-games engine and rebuild the *packaging, messaging, onboarding, and pricing* around adults 55+ who are motivated by a concrete fear ("keep my memory sharp / reduce my risk of decline") rather than abstract self-improvement. This audience:

- Spends more time on Facebook/Instagram than any other channel — Meta is the single best place to reach them at scale.
- Responds to direct-response, benefit-led, "before it's too late" creative.
- Has higher disposable income and a stronger willingness to pay for health-adjacent subscriptions.
- Churns more slowly once habituated (routine-driven daily use).

**The plan:** launch a focused iOS app, drive installs primarily through Meta Ads, monetize via an annual-forward subscription, and win on **retention + LTV** rather than on being the "best" game. Target a blended CAC that supports a 3:1 LTV:CAC within 12 months.

> **Positioning note — do this honestly.** Cognitive-training claims are legally and ethically fraught (Lumosity paid a $2M FTC settlement in 2016 for unsupported claims). This plan is built on *engagement, habit, and enjoyment* language — "keep your mind active," "a fun daily workout" — **not** clinical claims of preventing dementia. Every dollar of the media strategy below assumes we stay on the right side of that line. See §9.

---

## 2. The Problem & The Insight

**Problem (user side):** Adults 55+ are anxious about cognitive aging — it is one of the most-searched health worries in the demographic. Existing brain apps feel like they were designed for their grandchildren: cluttered UIs, gamer aesthetics, tiny fonts, dark patterns, and gimmicky "brain age" scores.

**Problem (business side):** Every brain app fights for the same young, cheap-to-please but disloyal user. CAC is bid up; retention is poor.

**The insight:** The *product* barely needs to change — the *market* does. The same games (memory match, sequence recall, mental math, word finding, attention/reaction, pattern logic) become far more valuable when:
1. Wrapped in senior-friendly UX (large type, high contrast, no time pressure by default, plain language).
2. Sold on a **daily-routine + peace-of-mind** promise instead of an IQ/leaderboard promise.
3. Marketed where seniors actually are (Meta), with creative that speaks to *their* motivation.

This is an arbitrage on **audience–channel–message fit**, not on technology.

---

## 3. Target Customer

**Primary persona — "Concerned Carol," 62**
- Recently retired or semi-retired; time-rich.
- Noticed small memory slips ("why did I walk into this room?") and it worries her.
- Uses Facebook daily; comfortable on an iPhone; already pays for a few subscriptions (streaming, maybe a news app).
- Trusts recommendations and testimonials from people who look like her.
- Trigger events: a parent's dementia diagnosis, a milestone birthday, a friend's health scare.

**Secondary persona — "Caregiver Karen," 45–58**
- Buying *for* a parent (65–80). Higher intent, buys annual plans, wants something simple enough to gift and set up.

**Why iOS first:** iPhone skews higher-income in the US; App Store users have higher willingness to pay and lower payment friction than Android; simpler single-platform launch. Android is a Phase 2 expansion (§8).

**Geographic focus:** US, UK, Canada, Australia — English-first, high iOS penetration, high senior ad-monetization, mature Meta ad markets.

---

## 4. Product

### 4.1 MVP scope (repositioning the existing engine)
- 6–8 core games across 4 cognitive "areas": **Memory, Focus, Language, Problem-Solving** (framing, not clinical claims).
- **Daily Workout**: a curated 5–10 minute set. This is the retention backbone — one clear thing to do each day.
- **Streaks & gentle progress**: encouraging, never punishing. Celebrate consistency, not raw scores.
- **Senior-first UX**: min 18–20pt body type, WCAG-AA contrast, large tap targets, no mandatory timers, optional voice prompts, zero dark patterns.
- **Onboarding as a conversion funnel**: 4–5 warm questions ("What would you like to keep sharp?") → personalized plan → paywall. This mirrors the high-converting quiz-onboarding pattern used by health apps.

### 4.2 Deliberately NOT in MVP
Multiplayer, social leaderboards, complex meta-progression, Android, iPad-optimized layouts (universal build is fine, dedicated later). Keep scope tight to reach a testable funnel fast.

### 4.3 Retention roadmap (Phase 2+)
- Weekly progress email/notification ("You trained 5 of 7 days — nice work").
- New game content cadence (1 new game / 6–8 weeks) to reduce content fatigue.
- Optional "family view" — a caregiver can see a parent has been active (privacy-gated). Strong for the caregiver persona and referral.
- Printable/large-type accessibility mode.

---

## 5. Business Model & Pricing

**Model:** Auto-renewing subscription with a hard paywall after onboarding (free trial, not free tier). A generous free tier trains users to never pay; a trial converts intent captured by the ad.

**Proposed price ladder (US):**
| Plan | Price | Notes |
|---|---|---|
| Annual (default, pre-selected) | **$59.99/yr** | 7-day free trial. Anchor the value here. |
| Monthly | **$9.99/mo** | Present as the "expensive" option to push annual. |
| Lifetime (occasional promo) | **$129.99** | Cash-flow lever; use sparingly. |

- **Annual-forward** because it front-loads cash (funds ad spend), and seniors churn less on annual than monthly.
- Trial length 3–7 days; test both. Shorter trials convert more on impulse-purchase intent.
- Expect **iOS commission**: 30% year 1, 15% after 12 months of continuous subscription (App Store Small Business Program can lower this to 15% under ~$1M/yr revenue — apply for it).

---

## 6. Go-to-Market: Meta Ads as the Primary Channel

Meta is the core of this business. The reach among 55+ is unmatched and the targeting + creative volume model fits this audience perfectly.

### 6.1 Why Meta
- Facebook's US audience skews *older every year*; the 55+ cohort is huge and highly active.
- Cheaper CPMs than the auction fights over 25–40 optimizers.
- Best-in-class app-install / purchase optimization (Advantage+ App Campaigns) and on-device (SKAdNetwork/AEM) measurement for iOS.
- Testimonial/story creative — which works on this audience — is native to the feed.

### 6.2 Campaign structure
- **Objective:** App installs optimized for **purchase/trial-start** (not raw installs). Feed the algorithm the money event.
- **Advantage+ App Campaigns (AAC)** as the workhorse — broad targeting, let Meta find the payers; layer minimal age-floor (55+) where allowed.
- **Creative-led testing:** win on creative volume, not manual targeting. 8–12 fresh concepts/month.
- **SKAdNetwork + Advanced Mobile Measurement** configured from day one; align the conversion schema to trial-start and D1 events.

### 6.3 Creative angles to test (all engagement/enjoyment-framed, not clinical)
1. **Testimonial**: "I'm 68 and I do my 10 minutes every morning with my coffee." (UGC-style, real-looking, captioned — sound-off autoplay).
2. **Relatable pain, light touch**: "Walked into the kitchen and forgot why? Keep your mind active with a fun daily workout."
3. **Routine/habit**: "The 7-minute morning habit thousands of people over 60 love."
4. **Caregiver angle**: "A simple, screen-friendly app to gift your mom or dad."
5. **Demo**: over-the-shoulder screen capture of a satisfying game + big legible UI.

> Creative discipline: **no** claims to prevent, treat, or reduce risk of dementia/Alzheimer's. Meta will reject health-claim ads and it invites regulatory risk. Sell the *feeling* and the *habit*.

### 6.4 Funnel & landing
Ad → App Store (or a lightweight pre-sell/quiz landing page for warmer intent, test both) → quiz onboarding → trial paywall → activation (complete first Daily Workout) → habit → renewal.

### 6.5 Secondary channels (later, once Meta CAC is proven)
- **YouTube** (in-feed, older skew) and **Google Search** ("brain games for seniors," "memory games app").
- **App Store Search Ads** (ASA) for high-intent bottom-funnel keywords.
- **Referral / gifting** for the caregiver loop.
Meta remains the volume engine; these diversify and de-risk.

---

## 7. Unit Economics (illustrative — validate with a pilot)

These are planning assumptions to be replaced by real pilot data. They show the *shape* of a viable model, not a promise.

**Assumptions (base case):**
- Meta cost per install (55+, iOS, English markets): **$3.50**
- Install → trial-start rate: **25%** → cost per trial ≈ **$14.00**
- Trial → paid conversion: **35%**
- **CAC per paying subscriber ≈ $14.00 / 0.35 ≈ $40**
- Annual price $59.99; net of 30% Apple commission ≈ **$42 net** in year 1.
- Annual renewal (retention to year 2) — assume **40%** (conservative for a habit product with an older, loyal base).

**LTV (simplified, net of commission):**
- Year 1 net: ~$42
- Year 2 expected: 40% × $51 (net at 15% commission) ≈ **$20**
- **~2-year net LTV ≈ $62 per subscriber**

**LTV:CAC ≈ $62 / $40 ≈ 1.55:1 at launch assumptions.**

**Read this honestly:** at *base-case* assumptions the model is thin, not obviously great. The business is won or lost on four levers, in priority order:
1. **Trial→paid conversion** (paywall, onboarding, price) — biggest swing.
2. **Retention/renewal** (Daily Workout habit) — turns 1.5:1 into 3:1+.
3. **CPI/CAC** (creative efficiency on Meta).
4. **Price / annual mix**.

A realistic *target* case (CPI $3.00, install→trial 30%, trial→paid 40%, renewal 50%) pushes CAC to ~$25 and 2-yr LTV to ~$75 → **~3:1**. The pilot exists to find out which case is true.

---

## 8. Roadmap & Milestones

**Phase 0 — Reposition & instrument (Weeks 0–6)**
- Rebuild UX for 55+; build quiz onboarding + paywall; wire analytics (installs, trial-start, paid, D1/D7/D30, renewal); set up SKAN/AEM.
- Ship to App Store; apply to App Store Small Business Program.

**Phase 1 — Meta pilot (Weeks 6–14)**
- Spend **$8–15k** across 8–12 creatives. Goal: find ≥2 creatives with cost-per-trial at or below target and measure real trial→paid.
- Kill/scale weekly. Decision gate: is there a path to <$40 CAC with ≥40% renewal signal?

**Phase 2 — Scale what works (Months 4–9)**
- Scale winning creative; refresh cadence; add ASA + a second channel. Introduce referral/gifting. Grow content library.

**Phase 3 — Expand (Months 9–18)**
- Android build (doubles addressable Meta audience, lower iOS-tax on economics). Localize (UK/AU spelling already fine; consider adding a European market). iPad-optimized layout.

---

## 9. Risks & Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Regulatory / claims risk** | FTC action against Lumosity ($2M). Health claims can sink the company. | Strict "engagement not treatment" copy policy; legal review of all creative; no clinical claims anywhere. |
| **Thin unit economics at base case** | 1.5:1 LTV:CAC isn't fundable at scale. | Pilot-first; don't scale spend until conversion + renewal clear the bar; obsess over paywall and habit. |
| **Meta measurement/attribution (iOS)** | SKAN limits signal; over/under-attribution. | Configure AEM/CAPI properly; use holdout & MMM sanity checks; watch blended CAC, not just in-platform. |
| **Channel concentration** | Over-reliant on one platform's auction/policy. | Prove Meta first, then diversify (ASA, YouTube, Search) in Phase 2. |
| **Retention/content fatigue** | Seniors churn if it gets stale or too hard/easy. | Daily Workout habit loop; adaptive difficulty; steady new-content cadence. |
| **Category credibility** | "Brain training" is seen skeptically. | Lean on enjoyment, routine, community/testimonials — under-promise, over-deliver on delight. |
| **Apple commission drag** | 30% erodes year-1 LTV. | Small Business Program (15%); annual-forward pricing; test web-based purchase where policy permits. |

---

## 10. What Success Looks Like (12-month targets)

- A repeatable Meta creative engine producing paying subscribers at **CAC ≤ $35–40**.
- **Trial→paid ≥ 40%**, **D30 retention ≥ 20%**, early **renewal signal ≥ 45%**.
- **Blended LTV:CAC ≥ 3:1** on the winning cohort.
- Clear read on Phase-3 Android expansion economics.

---

## 11. Immediate Next Steps

1. Lock the **claims/copy policy** with legal before writing a single ad (§9).
2. Reposition UX + build **quiz-onboarding → trial paywall**; instrument the full funnel.
3. Produce **8–12 senior-targeted creatives** (testimonial-led) for the Meta pilot.
4. Run the **$8–15k pilot**; measure cost-per-trial and trial→paid against the §7 gates.
5. Decide scale vs. iterate based on real numbers — not the illustrative ones above.

---

*This is a planning document. All CPI/CAC/conversion figures are illustrative assumptions to be validated by the pilot in §8. No cognitive-health outcome is claimed or implied.*
