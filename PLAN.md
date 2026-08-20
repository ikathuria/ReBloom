# ReBloom

> A private, opt-in mobile app that turns invisible physical healing into something you can see. You pick one or more **healing tracks** — Recovery Healing, Acne Care, Hair Regrowth, Redness & Sensitivity, Hydration, Dark Spots & Even Tone, Under-eye & Dark Circles — and each one grows its own encouraging "bloom" from periodic AI skin/hair scans. A garden of blooms, one per journey. Paired with gentle-fabric apparel suggestions for sensitive skin. B2C freemium, plus recovery-clinic pilots later. **Never** a detection, diagnosis, or staff-monitoring tool.

_Plan authored: 2026-08-12 · Full evidence in [RESEARCH.md](RESEARCH.md)_

**Positioning:** a **general "visible healing" tracker** (decided 2026-08-12). Drug/substance-recovery healing is one first-class track among peers — the track no competitor serves well — but ReBloom is marketed to anyone who wants to *see* their skin or hair heal. Privacy/local-first is a values choice and a trust feature, not the sole wedge.

---

## Viability Summary

| | |
|---|---|
| **Market** | **crowded — differentiate on integration, not novelty.** Skin-tracking (TroveSkin, AI-skin apps), acne apps, and hair-tracking apps are each mature and separate. The wedge = **many healing conditions in one private app with a unified encouraging "garden," plus a genuinely underserved recovery track.** Acne is the most saturated lane; recovery is the emptiest. |
| **Feasibility** | medium (medium-to-hard) — all tracks map to **one vendor, one integration** (Perfect Corp YouCam Skin Analysis + AI Hair Density). Spike is RN integration (no first-class RN SDK → REST via backend proxy) + App Store health/biometric review. A **config-driven track registry** keeps new tracks cheap. |
| **Free to build** | mostly — dev/prototype free on ~40 sandbox units + Supabase/Expo/RevenueCat free tiers; **YouCam has no recurring free tier** (~$150–235/mo for a 50-user weekly-scan pilot). One skin scan feeds all enrolled skin tracks, so cost scales with *scans*, not *tracks*. |
| **Monetization** | B2C freemium — **free = 1 track**, **pro = all tracks + full cadence/history + apparel** (usage-gated so scans stay below API cost) + clinic B2B licensing later. |

---

## Research Findings

### Competitors
| Name | Lane | Pricing | Strength | Gap it leaves |
|---|---|---|---|---|
| I Am Sober / Reframe / Sunnyside | recovery | $4.99–$20/mo freemium | Dominant sobriety trackers, streaks/community/coaching | Day-counters — **no physical/visible healing** |
| TroveSkin | skin tracking | freemium (opaque) | AI selfie skin metrics over time + product recs | Skincare-only, single blended focus, no recovery, cloud-first |
| Perfect365 / YouCam Makeup | beauty | ~$6–10/mo | Perfect Corp's own AI-beauty apps | Beauty/makeup framing, not healing/health |
| HairLine.ai / MyHairCounts / Hairgen.ai | hair | freemium | AI hair-density/zone tracking, Apple Health export | Hair-loss framing only; density often inferred from lighting; no recovery |
| (many) acne/skin apps | acne | freemium/sub | Routine tracking, some AI analysis | Single-condition; **acne lane is saturated** |

**Positioning:** **crowded, no single empty quadrant** now that ReBloom is general. The defensible wedge is the *combination*: (1) **multiple healing conditions tracked separately in one app** with a unified, warm "garden of blooms" metaphor; (2) **privacy/local-first** (a real trust differentiator after the Loosid/Sober Grid surveillance audits); (3) a **first-class recovery track** the skin/hair incumbents ignore and the recovery incumbents can't build (no imaging). Honest caveat: acne and general skin-tracking are busy — execution, brand warmth, and the recovery niche carry the differentiation, not novelty of the core mechanic.

### Feasibility
- **Hardest part (the spike):** React Native ↔ Perfect Corp integration — no first-class RN SDK. **Approach:** call the YouCam **REST API from a Supabase Edge Function proxy** (protects the key, avoids native bridging, meters per-scan cost).
- **All tracks confirmed on one vendor:** Skin Analysis V2 (HD supports ~14 concerns; 9–16 units/scan by concern count; claims HIPAA/GDPR) covers every skin track; **AI Hair Density Detection** (4-grade, from the Jun-2026 AI Hair & Beard suite) covers hair; **AI Clothes + Fabric Virtual Try-On** (2 units/call) covers apparel.
- **Key efficiency:** one skin capture is analyzed for the **union of concerns** across a user's enrolled skin tracks, updating all their skin blooms from a single call. Cost scales with scan frequency, not track count (until the union exceeds a pricing tier — meter it).
- **Cost flag:** Perfect Corp has **no recurring free path** — ~40 one-time sandbox units, then usage-priced. Everything else (Supabase, Expo/EAS, RevenueCat) has a real free tier.

### Monetization
Freemium with the **track count** as the primary gate: **free = 1 track** (pick your journey) at a capped cadence; **pro (~$5.99–8.99/mo or ~$49–69/yr)** = all tracks, full cadence (weekly skin / monthly hair), full history, and apparel try-on. Priced alongside I Am Sober ($4.99) and skin apps ($6–10). Delivered via **RevenueCat + StoreKit/Play Billing** (Apple/Google require IAP for digital goods). Clinic B2B licensing later covers the API floor and provides distribution. Meter units server-side; cap free cadence hard.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Going general = more crowded** — competing head-on with skin/acne/hair incumbents, wedge is thinner | high | med | Differentiate on multi-track + privacy + warm garden UX + the underserved recovery track; don't out-feature single-condition apps, out-*care* them |
| **Vendor concentration** — single-vendor Perfect Corp, which signed a going-private merger (Jul 2026) | med | high | All analysis behind one `AnalysisProvider` interface; documented fallback (Haut.ai/Revieve/on-device); no vendor types in domain code |
| **No free tier at scale** — per-scan cost can exceed free-tier revenue | high | high | Free = 1 track + capped cadence; one skin scan feeds all skin tracks; meter units in the Edge Function; margin alert per account |
| **App Store rejection** — health + recurring biometric selfies (Guideline 5.1.1) + SDK privacy manifest | med | high | Consent-first onboarding, data minimization, "not medical/not detection" disclaimers, privacy manifest; M9 before submit |
| **Privacy backlash** — recovery apps' documented surveillance history (Loosid/Sober Grid audit) | med | high | Local-first default; images sent only transiently for analysis, never stored server-side; sync opt-in; in-app export + delete |
| **Appearance-shaming harm** — appearance-based validation can hurt, esp. women; acne/hair are sensitive | med | med | Center *healing trend* not attractiveness; per-track supportive copy; no ranking/streak-shaming; user controls which tracks + framing |
| **Coarse/slow signals mislead** — hair = 4 grades over months; dark-spots slow; lighting can fake gains | med | med | Per-track cadence (weekly/bi-weekly/monthly); capture-consistency guidance; honest "coarse trend, not diagnosis" copy per track |
| **Metric-mapping wrong** — a track's YouCam concerns don't actually move with the condition | med | med | M0 confirms the real concern list + that scores respond; track configs are provisional until validated |
| **Spike harder than expected** (REST path insufficient) | low-med | med | **Milestone 0 proves the REST-only path on free units before any scaffold or spend** |

---

## Tech Stack

> Versions verified against current official docs/npm on 2026-08-12. **Re-check before coding.** Packages bundled with Expo SDK 57 follow the SDK's pinned versions.

| Layer | Choice | Version | Reason |
|---|---|---|---|
| Mobile framework | **Expo (React Native)** | expo **~57.0.15** (RN **0.86.2**, React 19.2.3) | Managed RN with EAS free builds; custom native via config plugins + dev builds. *(actual scaffold pins, verified 2026-08-12)* |
| Language | **TypeScript** | **~6.0.3** (per SDK 57 template) | Type safety across client + Edge Functions |
| Navigation | **Expo Router** | bundled w/ SDK 57 | File-based routing, deep links |
| Camera / photo input | **expo-camera** + **expo-image-picker** | bundled w/ SDK 57 | Live selfie/scalp capture **or** pick an existing photo — the photo path makes iOS **Simulator demos** work (no camera in Simulator) |
| iOS device builds | **EAS dev build** (`eas build --profile development`) | current | Required once native modules land (op-sqlite in M2); run on a physical iPhone with a free Apple ID |
| Charts | **victory-native** | **41.26.0** | Skia/Reanimated charts for per-track bloom trends |
| Server data/cache | **@tanstack/react-query** | **5.101.4** | Scan calls + opt-in sync |
| Local storage (encrypted) | **op-sqlite + SQLCipher** (key in **expo-secure-store**) | latest via docs | At-rest DB encryption; forces EAS dev builds (not Expo Go). *MVP fallback: expo-sqlite + field encryption* |
| Backend | **Supabase Edge Functions** (Deno) | current | Stateless proxies to YouCam (hold key, meter units); auth + opt-in sync |
| Database | **Supabase Postgres** | current | Opt-in encrypted sync + clinic data; RLS |
| Client SDK | **@supabase/supabase-js** | **2.112.3** | Auth + DB + function invocation |
| Auth | **Supabase Auth** | current | Email + Sign in with Apple; only for opt-in sync/paid/clinic — app works logged-out |
| AI — skin | **Perfect Corp YouCam Skin Analysis API** (V2, HD) | REST V2 | ~14 concerns cover all skin tracks; behind `AnalysisProvider` |
| AI — hair | **Perfect Corp YouCam AI Hair Density Detection** (Hair & Beard suite, Jun 2026) | REST | 4-grade density for the hair track; unit cost confirmed in M0 |
| AI — apparel | **Perfect Corp AI Clothes + Fabric Virtual Try-On** | REST V3 | Gentle-fabric try-on; 2 units/call |
| Payments | **RevenueCat** (`react-native-purchases`) | **10.6.0** | StoreKit/Play Billing wrapper; free under ~$2.5k/mo revenue |
| Testing | **jest-expo** + **@testing-library/react-native** | per SDK 57 | Standard Expo unit/component testing |
| CI/CD | **GitHub Actions** + **EAS Build** | current | Free CI; EAS for device builds & submit |
| Error monitoring | **Sentry** (`@sentry/react-native`) | latest via docs | Added at Deploy (M10) |
| Analytics | **Deferred / opt-in only** | — | Privacy-first; no third-party analytics in MVP |

**Delegate to installed skills:** a **`supabase` skill is installed** — use it for schema, RLS, and Edge Function design (M3/M7).

**Layers deliberately skipped (for now):** third-party analytics (privacy), transactional email (Supabase handles auth mail), background job host, Stripe (IAP via RevenueCat), a `packages/` shared lib (one app until a clinic console exists).

---

## The track model (core concept)

A **track** is a healing journey the user opts into. It is defined by **config**, not bespoke code:

```ts
type TrackKind = 'skin' | 'hair';
interface TrackDefinition {
  id: string;                 // 'recovery' | 'acne' | 'hair-regrowth' | 'redness' | 'hydration' | 'dark-spots' | 'under-eye'
  kind: TrackKind;
  concerns: string[];         // YouCam concern keys this track reads (verify exact keys in M0)
  cadence: 'weekly' | 'biweekly' | 'monthly';
  scoring: BloomScoring;      // weights + direction per concern → 0–100 bloom
  copy: TrackCopy;            // warm name, description, supportive per-state messages
  sensitive?: boolean;        // recovery track → extra privacy/consent framing
}
```

**Launch catalog (7 tracks; concern mappings provisional until M0 confirms real keys):**

| Track | Kind | Reads (YouCam concerns) | Cadence | Notes |
|---|---|---|---|---|
| **Recovery Healing** | skin | hydration, redness, evenness, texture, radiance | weekly | `sensitive: true` — the underserved hero track; extra privacy framing; never "detection" |
| **Acne Care** | skin | acne/blemishes, oiliness, pores, redness, texture | weekly | most crowded lane; lean on warmth + multi-track |
| **Redness & Sensitivity Calm** | skin | redness, sensitivity | weekly | rosacea-adjacent; resonant for early-recovery hypersensitive skin |
| **Hydration & Dryness** | skin | moisture | weekly | fast, visible early win |
| **Dark Spots & Even Tone** | skin | spots, dark-spots/hyperpigmentation, evenness | biweekly | slow signal → longer cadence |
| **Under-eye & Dark Circles** | skin | dark-circle, eye-bag/puffiness | weekly | "I look rested again" — tied to sleep/recovery |
| **Hair Regrowth** | hair | hair-density (grade) | monthly | coarse 4-grade, months-long; own scalp capture; "not follicle count, not diagnosis" |

**Scan → tracks fan-out:** a user's enrolled **skin** tracks are satisfied by **one** face scan requesting the *union* of their concerns; each track computes its own bloom from its slice. **Hair** has its own scalp capture. This keeps API cost tied to scans, not tracks.

---

## Project Structure

```
ReBloom/
├─ apps/
│  └─ mobile/                    # Expo app — own package.json
│     ├─ app/                    # Expo Router routes (onboarding, garden, track/[id], scan, apparel, settings)
│     └─ src/
│        ├─ features/            # feature-sliced; each colocates types.ts, validation.ts, *.test.ts
│        │  ├─ onboarding/       # consent-first + "choose your journeys" (track selection)
│        │  ├─ tracks/           # track enrollment, per-track dashboard, bloom visual
│        │  ├─ garden/           # multi-track home (a bloom per enrolled track)
│        │  ├─ scan/             # capture → analyze (union of concerns) → fan-out to tracks
│        │  ├─ hair/             # scalp capture guidance + hair scan
│        │  ├─ apparel/          # VTO gentle-fabric suggestions
│        │  ├─ privacy/          # consent state, data export/delete
│        │  └─ paywall/          # RevenueCat gating (track count + cadence)
│        └─ lib/                 # cross-cutting infra
│           ├─ tracks/           # TrackDefinition registry (the 7 configs) + bloom scoring engine
│           ├─ db/               # op-sqlite client, migrations, encryption
│           ├─ analysis/         # AnalysisProvider interface (skin + hair) + PerfectCorp impl
│           ├─ supabase/         # client, auth, sync
│           └─ purchases/        # RevenueCat wrapper
├─ supabase/
│  ├─ functions/
│  │  ├─ analyze-skin/           # stateless proxy → YouCam Skin API (union of concerns; holds key, meters units, no image persistence)
│  │  ├─ analyze-hair/           # stateless proxy → YouCam Hair Density API
│  │  └─ tryon-apparel/          # stateless proxy → YouCam VTO
│  └─ migrations/                # opt-in sync tables + RLS
├─ docs/                         # 01-product-requirements.md, 02-privacy-and-consent.md, 03-tracks-and-bloom.md, 04-api-integration.md
├─ PROJECT.md   PLAN.md   RESEARCH.md
├─ package.json                  # root: delegating scripts (npm --prefix apps/mobile run …)
├─ .env.example   CLAUDE.md   README.md
```

**Conventions**
- `apps/mobile` layout even with one app — room for a future clinic web console.
- Root `package.json` **delegates**; **no workspaces** until a 2nd package exists.
- New feature → `apps/mobile/src/features/<name>/` with colocated `types.ts`, `validation.ts` (zod), `*.test.ts`.
- **New track = a new `TrackDefinition` config in `lib/tracks/`, not new feature code.** If adding a track needs code changes, the abstraction leaked — fix the engine, not the config.
- Skin + hair analysis **always** via `lib/analysis/AnalysisProvider` — never call Perfect Corp from a feature.
- **YouCam API key lives only in Supabase Edge Function secrets — never in the client bundle.**
- `docs/` filenames: zero-padded kebab-case.
- **Before coding against any library, fetch its latest official docs.** Never code framework APIs from memory.
- Keep `PROJECT.md` in sync whenever stack, structure, tracks, or status change.

---

## Environment Variables

```
# ---- Client (apps/mobile/.env — EXPO_PUBLIC_* are bundled; NEVER put secrets here) ----
EXPO_PUBLIC_SUPABASE_URL=            # Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=       # Supabase anon key (safe for client; RLS enforces access)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=      # RevenueCat public SDK key (iOS)
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=  # RevenueCat public SDK key (Android)

# ---- Server secrets (Supabase Edge Function secrets — `supabase secrets set`, NOT in the app) ----
PERFECTCORP_API_KEY=                 # YouCam API key — server-only
PERFECTCORP_API_SECRET=              # YouCam API secret (if required) — server-only
PERFECTCORP_API_BASE=                # YouCam REST base URL (verify current V2 endpoint in docs)

# ---- Optional (added at Deploy, M10) ----
SENTRY_DSN=                          # error monitoring
```

---

## Milestones

> **Classified medium-to-hard → starts with Milestone 0: Spike.** Prove the riskiest piece before scaffolding or spending.

### Milestone 0: Spike — prove the scan path + track fan-out (on free units)
**Goal:** One end-to-end loop works on the ~40 free sandbox units, proving the REST path AND that one skin scan yields enough concerns to drive multiple tracks.

Tasks:
- [x] Register for the YouCam API free sandbox; confirm the V2 Skin Analysis REST auth scheme — **Done (live 2026-08-12):** Bearer key on `yce-api-01.makeupar.com`, file→task→poll flow returned valid JSON for a test selfie in ~6s. Spike: `spike/analyze-skin.mjs`.
- [x] **Enumerate the real YouCam skin concern keys** and confirm coverage for all 6 skin tracks — Done: `docs/04-api-integration.md` lists the real HD/SD keys and maps every skin track; flagged that YouCam has **no dedicated "sensitivity" or "complexion evenness" concern** (approximated via redness+moisture and age_spot+radiance+texture)
- [x] Prove the analyze call (parse scores, no image persistence) — **Done via the direct spike script** `spike/analyze-skin.mjs` (uploads → tasks → polls → parses `output[].ui_score`, image not persisted). The productionized Supabase **Edge Function** version is M3.
- [~] Confirm the **AI Hair Density Detection** endpoint + unit cost — **Deferred to M5 (does not block M1).** Endpoint not in the public reference; confirm in the sandbox console before building the hair track.
- [x] Fan-out: one scan → provisional bloom per track (≥2 distinct blooms) — **Done (live):** one `recovery,acne` scan → Recovery 81, Acne 77. *On-device Expo camera capture (vs. a file) is low-risk and rolls into M1 scaffold.*
- [x] Decision gate: REST-only path sufficient, one scan feeds multiple tracks — **✅ GO** (evidence in `docs/04-api-integration.md`). Per-scan cost confirmed live: **16 units / 8-concern HD scan** (~$0.75).
- [x] Gate: lint + typecheck pass — Done: `node --check` clean on both spike files; union + bloom math validated offline.

### Milestone 1: Scaffold
**Goal:** Repo runs locally, structure in place, context tracker created, CI green.

Tasks:
- [x] Initialize `apps/mobile` with Expo SDK 57 + TypeScript + Expo Router (`create-expo-app --template default@sdk-57`) — **Done:** scaffolded; `expo-doctor` 21/21 healthy.
- [x] Create folder structure per Project Structure (features/, lib/tracks, lib/analysis, supabase/, docs/) — **Done:** all `features/*` + `lib/*` placeholders + `supabase/{functions,migrations}` created; `lib/tracks` has a real skeleton (the 7 track ids).
- [x] Root delegating `package.json` (`dev`/`lint`/`typecheck`/`test` → `npm --prefix apps/mobile run …`) — **Done.**
- [x] ESLint + Prettier + tsconfig strict; jest-expo + @testing-library/react-native with one smoke test — **Done:** `npm test` passes (3 tests, `lib/tracks/tracks.test.ts`); flat ESLint config + `.prettierrc.json`; `strict: true`.
- [x] GitHub Actions: install, lint, typecheck, test on push/PR — **Done:** `.github/workflows/ci.yml` (runs on first push).
- [x] `.env.example`, `CLAUDE.md` (→ PROJECT.md), initial `PROJECT.md` — **Done** (all present; `.env` gitignored).
- [x] Gate: lint, typecheck, test pass — **Done:** all green locally (CI verifies on first push).

### Milestone 2: Consent-first onboarding + track selection + encrypted local store
**Goal:** A first-run user understands what's tracked and what leaves the device, consents explicitly, and picks their journey(s). Local encrypted storage is initialized.

Tasks:
- [x] `docs/02-privacy-and-consent.md` — **Done:** collection table, transient-not-stored guarantee, granular consent, "not medical/not detection/not monitoring", and the M9 audit checklist.
- [ ] Onboarding (warm, garden tone): healing framing + per-item consent toggles (camera **and/or** photo library, transient analysis) + **"choose your journeys"** track picker — Done when: click path onboarding→consent→choose tracks→garden works; declining analysis blocks scanning with a clear explanation *(UI still to build)*
- [~] `features/privacy` consent state + `features/tracks` enrollment — **Logic + tests done** (`consent.ts`, `enrollment.ts`; reducers, `canScan`/`scanBlockReason`, skin/hair fan-out split). Relaunch persistence rides the real op-sqlite DB (below).
- [~] `lib/db`: op-sqlite + SQLCipher — **Interface + in-memory impl + migrations + CRUD round-trip tests done** (`types.ts`, `memory.ts`, `migrations.ts`; `createDb()` returns in-memory for now). **Remaining:** the encrypted op-sqlite/SQLCipher driver (`opsqlite.ts`) + wire into `createDb()` — lands with the dev build.
- [ ] **iOS dev build on device (early demo checkpoint):** add EAS config + the op-sqlite/expo-secure-store config plugins, `eas build --profile development` (iOS), install on the iOS Simulator and/or a physical iPhone — Done when: onboarding→choose-tracks→garden runs on an iOS build (Expo Go no longer applies once op-sqlite lands) *(needs Expo/EAS login)*
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally *(currently green: 19 tests)*

### Milestone 3: Core — track registry + skin scan → fan-out to tracks
**Goal:** The heart: the 6 skin tracks exist as config, and one skin scan updates every enrolled skin track's bloom. *(Use the `supabase` skill for the Edge Function.)*

Tasks:
- [ ] `lib/tracks` registry: the 6 skin `TrackDefinition`s (concerns per M0, cadence, copy) + `BloomScoring` engine mapping a track's concern scores → 0–100 bloom — Done when: named unit tests compute expected blooms for each track from sample concern inputs (improving/flat/declining)
- [ ] Productionize `analyze-skin` Edge Function: accepts the union of enrolled concerns, input validation, unit metering + logging, error handling, **no image persistence**, rate limiting — Done when: a fetch returns scored shape, 400 on malformed body; a test asserts no image write
- [ ] `lib/analysis/AnalysisProvider` + `PerfectCorpProvider.analyzeSkin(concerns)` — Done when: a unit test maps API fields → domain `SkinScores` (no vendor types leak upward)
- [ ] `features/scan` flow: **capture via live camera (expo-camera) or pick an existing photo (expo-image-picker)** → compute union of enrolled skin-track concerns → provider → **fan out** to write one `track_point` per enrolled skin track — Done when: on device, one scan (camera or library) with 2+ enrolled skin tracks persists a point for each; a component test drives capture→fan-out with mocks. *(The photo-library path keeps the flow demoable in the iOS Simulator.)*
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally

### Milestone 4: Garden home + per-track bloom dashboards
**Goal:** The user sees a **garden** — one bloom per enrolled track — and can open any track for its own warm trend.

Tasks:
- [ ] `features/garden` home: a bloom/plant per enrolled track showing current stage; add-a-journey entry point — Done when: with 2 enrolled tracks + scans, the garden renders both blooms at their stages on device
- [ ] `features/tracks` per-track dashboard: victory-native trend of that track's bloom over time + growing-bloom visual + per-concern detail with plain-language, non-alarming copy — Done when: opening a track shows its trend, bloom stage, and concern breakdown
- [ ] Empty/first-scan states per track (encouraging, no "not enough data" coldness) — Done when: a new track shows a warm "your bloom is starting" state
- [ ] E2E happy path: onboarding → consent → choose 2 tracks → one skin scan → garden shows both blooms advanced — Done when: the scripted flow passes on a simulator (mocked analysis)
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally

### Milestone 5: Hair Regrowth track (hair capture)
**Goal:** The hair track joins the garden with its own scalp capture and slower, honest signal. *(Deferrable to a fast-follow — it reuses the M3 engine.)*

Tasks:
- [ ] `analyze-hair` Edge Function → YouCam AI Hair Density Detection (stateless, holds key, meters units, no image persistence) — Done when: a fetch with a scalp photo returns `{ densityGrade, unitsUsed }`, 400 on malformed
- [ ] `PerfectCorpProvider.analyzeHair()` + the `hair-regrowth` `TrackDefinition` (monthly cadence, coarse-grade bloom tuned to ignore single-grade noise) — Done when: unit tests map response → `HairScores` and assert stable month-over-month bloom
- [ ] `features/hair` scalp capture-guidance overlay (consistent part/angle/lighting) + monthly cadence prompt + "coarse trend, not follicle count, not diagnosis" disclaimer — Done when: the hair capture screen shows the guide + disclaimer; a test covers the cadence gate; the hair bloom appears in the garden
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally

### Milestone 6: Apparel suggestion module (YouCam VTO)
**Goal:** Based on current skin sensitivity (across enrolled skin tracks), suggest gentle/breathable fabrics and let the user try them on.

Tasks:
- [ ] `tryon-apparel` Edge Function proxy → YouCam Clothes/Fabric VTO (stateless, holds key, meters units) — Done when: a fetch returns a try-on result for a sample garment/fabric
- [ ] Sensitivity→fabric mapping (high redness/low hydration → soft, breathable, non-irritating) documented + unit-tested — Done when: named tests map representative score profiles → fabric recommendations
- [ ] `features/apparel` UI: recommended gentle fabrics + optional try-on, gated by paywall entitlement (see M8) — Done when: on device, a recommendation renders and try-on works for an entitled user
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally

### Milestone 7: Auth + opt-in encrypted cloud sync
**Goal:** Users can *optionally* create an account to back up/sync their private data — off by default, encrypted, patient-private. *(Use the `supabase` skill for schema + RLS.)*

Tasks:
- [ ] Supabase Auth: email + Sign in with Apple; app remains fully functional logged-out — Done when: sign-up/login works and skipping auth still allows local scanning
- [ ] Migrations + RLS so a row is readable/writable **only** by its owner — Done when: an RLS test proves user B cannot read user A's rows
- [ ] Opt-in sync in `lib/supabase`: encrypted upload of enrollments + track points (not raw images) with explicit toggle + disclosure — Done when: enabling sync uploads existing local data; disabling stops it; a test covers the opt-in gate
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally

### Milestone 8: Monetization (RevenueCat freemium, track- and usage-gated)
**Goal:** Free = 1 track at capped cadence; pro = all tracks + full cadence + apparel — in StoreKit/Play test mode.

Tasks:
- [ ] RevenueCat configured (`react-native-purchases` 10.6.0) with entitlements (`free`, `pro`) + test products — Done when: the paywall shows products in a sandbox purchase
- [ ] Enrollment gating: free accounts can enroll in exactly 1 track; pro unlocks all — Done when: a free user is blocked from a 2nd track with an upgrade prompt; pro can enroll in many (test with mocked entitlement)
- [ ] Server-side cadence gating in `analyze-skin`/`analyze-hair`: enforce free cadence caps vs. pro (weekly skin / monthly hair); reject over-cap with an upgrade signal — Done when: a free account is blocked past the cap and pro passes
- [ ] Paywall UI + entitlement checks on 2nd-track / full-cadence / apparel — Done when: gated actions prompt upgrade for free and unlock for pro in sandbox
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally

### Milestone 9: Privacy & compliance hardening (pre-submit)
**Goal:** Defensibly private and ready for App Store health/biometric review.

Tasks:
- [ ] Data export + delete in `features/privacy` (export all track data; delete all local + synced data) — Done when: export produces a file and delete wipes local DB + remote rows (test covers both)
- [ ] iOS privacy manifest + third-party SDK declarations (Perfect Corp network use, RevenueCat); Info.plist camera usage string; Android data-safety notes — Done when: `eas build` produces a build with the manifest present
- [ ] In-app privacy promise + "not medical, not detection, not monitoring" disclaimers on every scan surface (skin, hair), each track's results, and apparel — Done when: disclaimers visible on each surface; copy reviewed against Risks
- [ ] Audit: no image persisted server-side, no advertising IDs / extraneous permissions (contrast Loosid/Sober Grid) — Done when: `docs/02-privacy-and-consent.md` audit checklist all ticked
- [ ] Gate: lint, typecheck, test pass — Done when: all green locally

### Milestone 10: Deploy (TestFlight / internal track)
**Goal:** Real builds in testers' hands, error monitoring live.

Tasks:
- [ ] EAS Build profiles (dev, preview, production) + EAS Submit — Done when: a production build uploads to TestFlight and Play internal testing
- [ ] Sentry wired (client + Edge Functions), scrubbing PII/images — Done when: a forced test error appears in Sentry with no image/PII payload
- [ ] Smoke test on a physical device from the internal track — Done when: onboarding→choose track→scan→garden works end-to-end on a real device via TestFlight
- [ ] Gate: lint, typecheck, test pass + CI green — Done when: all green

### Milestone 11: Polish
**Goal:** No obvious rough edges; warm, calm, resilient.

Tasks:
- [ ] Loading/empty/error states across scan (skin + hair), garden, per-track dashboards, apparel (network fail, over-cap, analysis error) with supportive copy — Done when: each failure path shows a non-alarming, actionable message
- [ ] Accessibility pass (dynamic type, contrast, VoiceOver labels on bloom visuals) — Done when: core flows pass a manual VoiceOver + large-text check
- [ ] Performance: scan round-trip feedback, garden + chart render on low-end devices — Done when: no dropped-frame jank on a mid-range device
- [ ] Gate: lint, typecheck, test pass — Done when: all green

---

## Claude Code Commands

> In every session, fetch the latest official docs for any library before coding against it, and keep `PROJECT.md` in sync with what you build.

**Start with the spike (Milestone 0):**
```
claude "Read PLAN.md and PROJECT.md. Complete Milestone 0 (the spike), fetching the latest official docs for Expo, Supabase Edge Functions, and the Perfect Corp YouCam API before using them. Enumerate the real YouCam skin concern keys and map every launch track to them in docs/04-api-integration.md. Update PROJECT.md. Mark tasks done as you go. Stop after Milestone 0 and commit."
```

**Resume from any point:**
```
claude "Read PLAN.md and PROJECT.md. Find the first incomplete task and continue, fetching the latest official docs for any library before using it. Keep PROJECT.md in sync. Mark tasks done as you go. Commit when a milestone is complete."
```

**Test the current state:**
```
claude "Read PLAN.md and PROJECT.md. Without building anything new, test everything marked done. Report what works and what's broken."
```

---

## Notes & Decisions

- **2026-08-12** — Platform = React Native (Expo SDK 57); monetization = B2C freemium + clinic pilot; first audience = individuals + clinic pilot with data kept patient-private. *(intake)*
- **2026-08-12** — Call YouCam via a **Supabase Edge Function proxy**, not the client — protects the key, avoids native SDK bridging (no first-class RN SDK), meters per-scan cost. *(feasibility)*
- **2026-08-12** — **Local-first by default; auth + cloud sync opt-in.** The selfie leaves the device only transiently for analysis and is never persisted server-side. *(privacy + surveillance-audit prior art)*
- **2026-08-12** — Skin + hair analysis behind one `AnalysisProvider` interface — sole vendor Perfect Corp is going private (Jul 2026); reduce lock-in. *(news/trends)*
- **2026-08-12** — Free tier caps usage below per-scan cost; payments via **RevenueCat** (Apple/Google require IAP). *(monetization + feasibility)*
- **2026-08-12** — Framing centers **health/healing trend**, never attractiveness, never detection/diagnosis. *(community counter-signal + ethics)*
- **2026-08-12** — **Track them separately.** Reworked into a **multi-track model**: 7 launch tracks (Recovery Healing, Acne Care, Hair Regrowth, Redness & Sensitivity, Hydration, Dark Spots & Even Tone, Under-eye & Dark Circles), each its own bloom. Tracks are **config (`TrackDefinition`)**, so new ones are data, not code. **One skin scan feeds all enrolled skin tracks** (union of concerns) → cost scales with scans, not tracks. *(user request)*
- **2026-08-12** — **Demoability on iOS:** scan supports **photo-library pick (expo-image-picker)** in addition to live camera, so the flow is demoable in the iOS Simulator (which has no camera); added an **early EAS iOS dev-build checkpoint in M2** (op-sqlite is native → Expo Go no longer applies) so ReBloom is installable on a real iPhone well before M10. *(user request)*
- **2026-08-12** — **Positioning = general "visible healing" tracker** (not recovery-only); drug recovery is a first-class track among peers — bigger market, but now competing with crowded skin/acne/hair apps, so the wedge is multi-track + privacy + the underserved recovery track, not novelty. *(user decision)*
