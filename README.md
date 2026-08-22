# 🌱 ReBloom

**A private, opt-in mobile app that turns invisible physical healing into something you can see.**

You pick one or more **healing journeys** — Recovery Healing, Acne Care, Hair Regrowth, Redness &
Sensitivity, Hydration, Dark Spots & Even Tone, Under-eye & Dark Circles — and each one grows its own
encouraging **bloom** from periodic AI skin/hair scans. Your home screen is a **garden**: one bloom
per journey, growing as your trend improves. Paired with gentle-fabric apparel suggestions for
sensitive skin.

**Never** a detection, diagnosis, or monitoring tool — just an encouraging trend, kept private.

> Positioning: a general *"visible healing"* tracker. Drug/substance-recovery healing is a first-class
> journey among peers — the one no competitor serves well — but ReBloom is for anyone who wants to
> *see* their skin or hair heal. B2C freemium, with recovery-clinic pilots later.

---

## Why it's different

- **Many healing journeys in one app**, each with its own warm bloom — not a single-condition tracker.
- **Local-first & private by default.** Every scan and score lives **encrypted on your device**. The
  app is fully usable with **no account**. (A deliberate answer to audited recovery apps like
  Loosid / Sober Grid that harvested ad IDs and device identifiers.)
- **Your photo is never stored.** It's sent once, transiently, to score a scan, then it's gone — we
  keep the *numbers*, never the picture.
- **Encouragement, not surveillance.** Framing centers the *healing trend*, never attractiveness,
  never detection or diagnosis.

## How it works

1. You capture a face (skin) or scalp (hair) photo on-device.
2. The image + the concerns your enrolled journeys need go to a stateless **Supabase Edge Function**,
   which holds the Perfect Corp **YouCam** API key server-side, scores the scan, and **never persists
   the image**.
3. The app computes a **bloom (0–100) per journey** and stores one encrypted point per journey. One
   skin scan **fans out** to every enrolled skin journey.
4. Optional, off-by-default **cloud sync** backs up *scores* (never photos) to your private account
   under owner-only row-level security.

## Tech stack

| Layer | Choice |
|---|---|
| App | Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict) · Expo Router |
| Local store | op-sqlite + **SQLCipher** (encrypted), key in the iOS Keychain via expo-secure-store |
| Backend | Supabase Edge Functions (Deno) as stateless YouCam proxies · Postgres + RLS for opt-in sync |
| AI | Perfect Corp **YouCam** Skin Analysis + AI Hair Density (behind one `AnalysisProvider` seam) |
| Payments | RevenueCat (freemium: free = 1 journey, Pro = all + full cadence + apparel try-on) |
| Testing | jest-expo + React Native Testing Library |

## Project structure

```
ReBloom/
├─ apps/mobile/          # the Expo app
│  └─ src/
│     ├─ app/            # Expo Router routes (garden, scan, track/[id], account, paywall…)
│     ├─ features/       # onboarding, tracks, garden, scan, hair, apparel, privacy, paywall, account
│     └─ lib/            # tracks (registry + bloom scoring), db, analysis, supabase, purchases, telemetry
├─ supabase/
│  ├─ functions/         # analyze-skin, analyze-hair, tryon-apparel + _shared (cadence, report)
│  └─ migrations/        # opt-in sync tables + RLS
├─ docs/                 # 02 privacy · 04 API integration · 05 deploy
├─ PLAN.md  PROJECT.md  RESEARCH.md   # the living plan, tracker, and research
```

## Run it locally

Requires Node 22, the Supabase CLI + Docker (for the backend), and Xcode (for the iOS build).

```bash
# 1. install
npm --prefix apps/mobile ci

# 2. start the local backend (holds the YouCam key; see supabase/functions/.env)
supabase start
supabase functions serve

# 3. run the app on iOS
npm run ios
```

Without a configured backend the app runs against a built-in **mock** analysis provider, so the full
flow is demoable offline. Copy [`.env.example`](.env.example) to `apps/mobile/.env` to point at a
backend; the YouCam key stays server-side only.

```bash
npm test         # jest (68 tests)
npm run typecheck
npm run lint
```

## Privacy

The full data-handling contract — what's collected, what leaves the device, the consent model, and
the pre-submit audit — lives in [`docs/02-privacy-and-consent.md`](docs/02-privacy-and-consent.md).
In short: local-first, encrypted at rest, photos never stored, sync opt-in, and in-app **export** +
**delete everything**.

## Status

Feature-complete. Milestones **M0–M9 + M11** are done (M0–M7 verified live on iOS; M8/M9/M11
build-verified); **M10 (deploy)** is prepped repo-side with the credentialed steps scripted in
[`docs/05-deploy.md`](docs/05-deploy.md). See [`PROJECT.md`](PROJECT.md) for the full tracker.

> ⚠️ Before deploying: rotate the `PERFECTCORP_API_KEY` used in local dev (treat it as compromised),
> and follow the release runbook.

## Disclaimer

ReBloom is not a medical device. It does not diagnose conditions, detect substance use, or monitor
anyone. It shows an encouraging trend to support your own healing.
