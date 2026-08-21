# ReBloom — Project Tracker

> Living context map. Any LLM or human should be able to read this file alone and understand
> what the project is, how it's built, and where things are. **Keep it in sync** — update it
> whenever the stack, structure, tracks, conventions, or status changes.

_Last updated: 2026-08-21 (M0–M9 complete; M10 deploy next)_

---

## What it is

ReBloom is a private, opt-in mobile app that makes invisible physical healing **visible and encouraging**. The user enrolls in one or more **healing tracks** — Recovery Healing, Acne Care, Hair Regrowth, Redness & Sensitivity Calm, Hydration & Dryness, Dark Spots & Even Tone, Under-eye & Dark Circles — and each track grows its own "bloom" from periodic AI skin/hair scans (Perfect Corp YouCam Skin Analysis + AI Hair Density). The home screen is a **garden**: one bloom per journey, growing as trends improve. Everything is framed as healing and encouragement, **never** detection or diagnosis. A paired apparel layer (YouCam Virtual Try-On) suggests soft, breathable, non-irritating fabrics for sensitive skin.

**Positioning:** a **general "visible healing" tracker** — drug/substance-recovery healing is one first-class track among peers (the track no competitor serves well), but ReBloom is for anyone who wants to *see* their skin or hair heal. It's B2C freemium, with recovery-clinic pilots later. Not a monitoring tool for staff, employers, or any third party. Core principle: fully private, self-initiated, local-first; nothing leaves the device without explicit user action.

---

## Stack

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Mobile framework | Expo (React Native) | expo ~57.0.15 (RN 0.86.2, React 19.2.3) | EAS free builds; custom native via config plugins + dev builds. *(actual scaffold pins)* |
| Language | TypeScript | ~6.0.3 | strict mode on (`strict: true`) |
| Navigation | Expo Router | bundled w/ SDK 57 | file-based |
| Camera | expo-camera | bundled w/ SDK 57 | selfie + scalp capture |
| Charts | victory-native | 41.26.0 | per-track bloom trends; peer deps reanimated + gesture-handler + @shopify/react-native-skia |
| Server data/cache | @tanstack/react-query | 5.101.4 | scan calls + opt-in sync |
| Local storage (encrypted) | @op-engineering/op-sqlite + SQLCipher; key via expo-crypto → expo-secure-store | op-sqlite 18.1.1 | at-rest DB encryption; requires a dev build (not Expo Go). `"op-sqlite":{"sqlcipher":true}` in package.json; falls back to in-memory in jest/web/Expo Go |
| Backend | Supabase Edge Functions (Deno) | current | stateless proxies to YouCam (hold key, meter units) |
| Database | Supabase Postgres | current | opt-in encrypted sync + clinic data; RLS |
| Client SDK | @supabase/supabase-js | 2.112.3 | auth + DB + function invocation |
| Auth | Supabase Auth | current | email + Sign in with Apple; only for opt-in sync/paid/clinic |
| AI — skin | Perfect Corp YouCam Skin Analysis API (V2, HD ~14 concerns) | REST V2 | covers all 6 skin tracks; behind AnalysisProvider |
| AI — hair | Perfect Corp YouCam AI Hair Density Detection (Jun 2026 suite) | REST | 4-grade density; unit cost confirmed in M0 |
| AI — apparel | Perfect Corp AI Clothes + Fabric Virtual Try-On | REST V3 | 2 units/call |
| Payments | RevenueCat (react-native-purchases) | 10.6.0 | IAP wrapper; free under ~$2.5k/mo revenue |
| Testing | jest-expo + @testing-library/react-native | per SDK 57 | Expo uses Jest, not Vitest |
| CI/CD | GitHub Actions + EAS Build | current | lint/typecheck/test; EAS for device builds |
| Error monitoring | Sentry (@sentry/react-native) | latest via docs | added at Deploy (M10) |
| Analytics | none in MVP (opt-in only later) | — | privacy-first |

> Versions verified against official docs/npm on 2026-08-12. Re-verify before coding against a library.
> **A `supabase` skill is installed — use it for schema, RLS, and Edge Function design.**

---

## The track model (central concept)

A **track** is a healing journey defined by **config, not bespoke code** — a `TrackDefinition` in `lib/tracks/`:

```ts
type TrackKind = 'skin' | 'hair';
interface TrackDefinition {
  id: string;            // 'recovery' | 'acne' | 'hair-regrowth' | 'redness' | 'hydration' | 'dark-spots' | 'under-eye'
  kind: TrackKind;
  concerns: string[];    // YouCam concern keys this track reads (exact keys confirmed in M0)
  cadence: 'weekly' | 'biweekly' | 'monthly';
  scoring: BloomScoring; // weights + direction per concern → 0–100 bloom
  copy: TrackCopy;       // warm name, description, supportive per-state messages
  sensitive?: boolean;   // recovery → extra privacy/consent framing
}
```

**Launch catalog (7 tracks; concern mappings provisional until M0 confirms real keys):**

| Track | Kind | Reads | Cadence | Notes |
|---|---|---|---|---|
| Recovery Healing | skin | hydration, redness, evenness, texture, radiance | weekly | `sensitive: true`; the underserved hero track |
| Acne Care | skin | acne/blemishes, oiliness, pores, redness, texture | weekly | most crowded lane |
| Redness & Sensitivity Calm | skin | redness, sensitivity | weekly | rosacea-adjacent |
| Hydration & Dryness | skin | moisture | weekly | fast early win |
| Dark Spots & Even Tone | skin | spots, dark-spots, evenness | biweekly | slow signal |
| Under-eye & Dark Circles | skin | dark-circle, eye-bag | weekly | "I look rested again" |
| Hair Regrowth | hair | hair-density (grade) | monthly | coarse 4-grade; own scalp capture |

**Scan fan-out:** one **skin** capture is analyzed for the **union** of the user's enrolled skin-track concerns in a single API call; each track computes its own bloom from its slice. **Hair** has its own scalp capture. So API cost scales with *scans*, not *tracks*.

---

## Architecture

**Local-first, with stateless server proxies for AI calls. Cloud sync and auth are opt-in.**

1. User captures on-device (expo-camera): a **skin** face shot, or a **hair** scalp shot. Nothing uploaded yet.
2. Client sends the image + the needed concern set to the matching **Supabase Edge Function** (`analyze-skin` / `analyze-hair`), which holds the YouCam key, calls Perfect Corp **REST** once, meters units, returns parsed scores, and **does not persist the image**.
3. Client computes a **bloom (0–100) per enrolled track** via the `lib/tracks` scoring engine and writes one encrypted local `track_point` per track (op-sqlite + SQLCipher). The garden + dashboards read only local data.
4. **Opt-in only:** with an account + sync enabled, encrypted enrollments + track points (never raw images) upload to Supabase Postgres under strict per-user RLS. Off by default; app fully functional logged-out.
5. Apparel try-on uses a stateless `tryon-apparel` function, gated by RevenueCat entitlement.

All analysis (skin + hair) goes through one `lib/analysis/AnalysisProvider` so the sole vendor (Perfect Corp) can be swapped without touching features.

**Non-negotiables:** YouCam key server-only; no server-side image persistence; no third-party analytics/advertising IDs; explicit consent before any capture or transient upload; framing is healing/encouragement, never detection/diagnosis/monitoring.

---

## Project structure

```
ReBloom/
├─ apps/
│  └─ mobile/                    # Expo SDK 57 app (own package.json, own .gitignore)
│     ├─ src/
│     │  ├─ app/                 # Expo Router routes — template starter (index, explore, _layout); ReBloom routes land per-milestone
│     │  ├─ components/          # template themed components (themed-text/view, app-tabs, ui/…)
│     │  ├─ constants/  hooks/   # template theme + color-scheme hooks
│     │  ├─ features/            # ✅ placeholders: onboarding, tracks, garden, scan, hair, apparel, privacy, paywall
│     │  └─ lib/                 # tracks/ (✅ real skeleton: 7 track ids), db/, analysis/, supabase/, purchases/ (placeholders)
│     ├─ eslint.config.js  jest.d.ts  globals.d.ts  tsconfig.json  app.json
│     └─ AGENTS.md / CLAUDE.md   # template reminder: read versioned Expo v57 docs before coding
├─ supabase/
│  ├─ functions/                 # analyze-skin/, analyze-hair/, tryon-apparel/ (M3/M5/M6) — README placeholder
│  └─ migrations/                # opt-in sync tables + RLS (M7) — README placeholder
├─ spike/                        # M0 throwaway: analyze-skin.mjs, tracks.mjs (kept as reference)
├─ docs/                         # 04-api-integration.md ✅ (01/02/03 land in later milestones)
├─ .github/workflows/ci.yml      # lint + typecheck + test
├─ PROJECT.md  PLAN.md  RESEARCH.md
├─ package.json                  # root: delegating scripts (npm --prefix apps/mobile run …)
├─ .prettierrc.json  .env.example  .env(gitignored)  CLAUDE.md  README.md
```

The SDK 57 default template uses a `src/`-rooted layout (not `app/` at repo root) and ships a starter tab app (`index`/`explore`) plus themed components — those stay until later milestones replace them with ReBloom's real screens.

---

## Conventions

- **New feature** → `apps/mobile/src/features/<name>/` with colocated `types.ts`, `validation.ts` (zod), `*.test.ts`.
- **New track = a new `TrackDefinition` config in `lib/tracks/`, not new feature code.** If adding a track needs code changes, the abstraction leaked — fix the engine, not the config.
- **Skin + hair analysis** always via `lib/analysis/AnalysisProvider` — never call Perfect Corp directly from a feature.
- **Secrets:** YouCam key lives only in Supabase Edge Function secrets. Only `EXPO_PUBLIC_*` (non-secret) vars in the client.
- **Naming:** files kebab-case; React components PascalCase; branches `mN-short-slug`.
- **Testing:** jest-expo; tests colocate with features; logic tasks ship their own tests; every milestone ends lint+typecheck+test green.
- **Docs:** `docs/` filenames zero-padded kebab-case.
- **Before coding any library:** fetch its latest official docs — never code APIs from memory.
- **Privacy is a feature:** local-first default, opt-in sync, no image persistence, explicit consent, honest "not medical/not detection" framing on every surface.

---

## Current status

| Milestone | Status | Notes |
|---|---|---|
| 0. Spike (scan path + track fan-out on free units) | ✅ **GO** (2026-08-12) | Live: REST flow works, no native SDK; one scan → Recovery 81 / Acne 77; **16 units/8-concern HD scan**. Hair endpoint deferred to M5 |
| 1. Scaffold | ✅ **done** (2026-08-12) | Expo SDK 57 app; structure + placeholders; jest-expo (3 tests) + ESLint + Prettier + strict TS; CI workflow (green on push `22479ae`); `expo-doctor` 21/21 |
| 2. Consent + track picker + encrypted store | ✅ **done** (verified on iOS) | Full-screen onboarding→consent→journeys→garden + SQLCipher persistence across a cold relaunch, driven on iPhone 17 Pro (iOS 26.5). 22 tests, expo-doctor 21/21 |
| 3. Core: track registry + skin scan → fan-out to tracks | ✅ **done** (verified real on iOS) | concern registry + bloom engine; scan UI (camera/photo-library) → `analyze-skin` Edge Function → **real YouCam** → fan-out → encrypted track_points. Drove a real selfie scan on iPhone 17 Pro: Recovery 80 / Acne 78, key server-side |
| 4. Garden home + per-track dashboards | ✅ **done** (verified on iOS) | Garden shows per-track blooms (stage emoji + score + progress); per-track detail = hero bloom + trend sparkline + real concern breakdown (friendly labels); warm empty state; add-a-journey. Trend is Views-based (Skia line chart = later polish) |
| 5. Hair Regrowth track (scalp capture) | ✅ **done** (verified on iOS) | Scalp scan → density grade → hair bloom (`hairBloom` 1–4→45/62/78/92); modality-aware routing (hair track → /scan-hair); 🌺 92 shows in the garden. Real `analyze-hair` written but **endpoint unverified** → hair uses mock until confirmed (`HAIR_ANALYSIS_REAL=false`) |
| 6. Apparel suggestion module (VTO) | ✅ **done** (verified on iOS) | "Comfort" tab (was Explore): sensitivity→gentle-fabric recs tuned to the latest skin scan (calm→cotton/linen/bamboo), empty state, Pro try-on teaser. VTO try-on = stub (501), real is Pro/M8 + endpoint unverified |
| 7. Auth + opt-in encrypted cloud sync | ✅ **done** (verified on iOS) | Email auth (session in Keychain), Account screen, opt-in sync → cloud `enrollments`+`track_points` with owner-only RLS (verified: owner 5 / other 0). App fully works logged-out. Apple sign-in + cloud deploy deferred to pre-submit |
| 8. Monetization (free = 1 track, pro = all) | ✅ **done** (build-verified) | Freemium via a `PurchasesProvider` seam (mock default, demoable: purchase flips a flag → Pro). Free = 1 journey (onboarding + Add-a-journey gate to `/paywall`); Pro = all journeys + full cadence + apparel try-on. `scanGate` caps rescans (Free monthly / Pro natural); server-side 429 cadence guardrail in both functions. Real RevenueCat adapter written (DI), native SDK + store products deferred to pre-submit (`PURCHASES_REAL=false`) |
| 9. Privacy & compliance hardening | ✅ **done** (build-verified) | Data **export** (shareable JSON, scores never photos) + **delete everything** (local + synced, cloud-first, then sign-out) in the Account screen; one shared **"not medical/not detection/not monitoring"** disclaimer on consent + both scan screens + results + apparel; iOS **privacy manifest** + camera/photo usage strings in `app.json` (emission verified at the M10 build); `docs/02` audit checklist worked through |
| 10. Deploy (TestFlight / internal) | ☐ todo | + flip `PURCHASES_REAL`, verify privacy manifest emission |
| 11. Polish | ☐ todo | |

**In progress now:** Milestones 0–9 **complete** (0–7 verified live on iOS; M8 + M9 build-verified — see note below). M9 delivered the **privacy hardening**: **data export** (`features/privacy/exportData` → consent + enrollments + every scan point as shareable JSON, **never a photo**, via RN core `Share` so no native rebuild) and **delete everything** (`deleteAllData` → cloud rows first via `deleteCloudData`, then local `clearAll`, then sign-out), both wired into the **Account screen** and unit-tested. One shared **"not medical / not detection / not monitoring"** constant (`features/privacy/disclaimer`) now renders on consent, both scan screens (idle + result), each track's results, and the Comfort tab. The **iOS privacy manifest** + camera/photo usage strings live in `app.json` (`NSPrivacyTracking:false`; required-reason APIs `CA92.1`+`C617.1`), and the `docs/02` audit checklist is worked through. M8 added the **freemium model**: a `PurchasesProvider` seam (`lib/purchases`) hides the payment vendor exactly like `lib/analysis` hides YouCam. The app runs the **demoable mock** (a "purchase" flips a persisted flag → Pro and survives reload); the real **RevenueCat adapter is written** (dependency-injected) but its native SDK + App Store products are deferred to pre-submit (`PURCHASES_REAL=false`). Free = **one journey** (onboarding single-select + Add-a-journey routes a 2nd to `/paywall`); Pro = all journeys, full scan cadence (Free is capped monthly via `scanGate`), and the apparel try-on. A server-side **429 cadence guardrail** (`_shared/cadence.ts`) hardens the two Edge Functions.

⚠️ **M8/M9 verification note:** both verified by typecheck + lint + **60 unit tests** + a clean full **iOS Metro bundle build** (every import resolves) + `app.json` validation. Live **screenshots were not captured** — the Simulator control panel is stuck in a crash-loop it can't self-recover from (needs the user to re-open it). No visual walkthrough was recorded for M8 or M9.

_Earlier context:_ M7 = email auth (Keychain session) + opt-in cloud sync under owner-only RLS (verified owner 5 / other 0), app fully usable logged-out. M6 = Comfort tab (fabric suggestions). M5 = Hair Regrowth. M4 = the garden. M0–M3 = spike, scaffold, consent+encrypted store, real skin scan (real end-to-end on iPhone 17 Pro: Recovery 80 / Acne 78, key server-side). The app auto-selects the real analysis provider when `EXPO_PUBLIC_SUPABASE_URL` is set, else the mock. Local backend runs via `supabase start` + `supabase functions serve` (key in gitignored `supabase/functions/.env`).
**Next up:** Milestone 10 — Deploy: a deployed **cloud Supabase project** (`supabase link` + `secrets set` + `functions deploy` + `db push`), **EAS Build/Submit** to TestFlight, **Sign in with Apple**, Sentry, and the pre-ship flips — **`PURCHASES_REAL=true` + install `react-native-purchases` + RC dashboard products**, verify the **privacy manifest** emits to `PrivacyInfo.xcprivacy` and reconcile with the SDKs' own manifests, set `ITSAppUsesNonExemptEncryption` for SQLCipher. Then M11 polish. Pending vendor confirmations: YouCam **hair-density** + **apparel-VTO** endpoints (flip `HAIR_ANALYSIS_REAL` / wire `tryon-apparel` once confirmed). Local dev reminder: `supabase start` + `supabase functions serve` must be running for real scans; `PERFECTCORP_API_KEY` lives in `supabase/functions/.env`. Trend charts: currently Views-based sparklines; a Skia/victory-native line chart is a deferred polish (needs a native rebuild).
**Convention note:** env var for the YouCam key is `PERFECTCORP_API_KEY` (per `.env.example`); the local `.env` currently uses `PERFECT_CORP_API` — align these before wiring the Edge Function in M3.

---

## Decision log

Append-only. One line per decision that changed direction, with the why.

- 2026-08-12 — Platform = React Native / Expo SDK 57; monetization = B2C freemium + later clinic pilot; first audience = individuals + clinic pilot, data patient-private — intake.
- 2026-08-12 — Call YouCam via a Supabase Edge Function proxy (not the client) — no first-class RN SDK, protects the key, meters per-scan cost — feasibility research.
- 2026-08-12 — Local-first by default; auth + cloud sync opt-in; selfie leaves device only transiently, never persisted server-side — privacy principle + prior-art surveillance audit (Loosid/Sober Grid).
- 2026-08-12 — Skin + hair analysis behind one `AnalysisProvider` interface — sole vendor Perfect Corp signed a going-private merger (Jul 2026); reduce lock-in — news/trends research.
- 2026-08-12 — Free tier caps usage below per-scan cost; payments via RevenueCat (Apple/Google require IAP) — monetization + feasibility.
- 2026-08-12 — **Track concerns separately** → multi-track model with 7 launch tracks, each its own bloom; tracks are config (`TrackDefinition`), so new ones are data not code; one skin scan feeds all enrolled skin tracks (union of concerns) — user request.
- 2026-08-12 — **Positioning = general "visible healing" tracker** (not recovery-only); drug recovery is one first-class track among peers — bigger market, but competing with crowded skin/acne/hair apps, so the wedge is multi-track + privacy + the underserved recovery track — user decision.
- 2026-08-21 — Auth session is stored in the **device Keychain** (chunked expo-secure-store adapter) rather than AsyncStorage — more secure, on-brand for a privacy app, and avoids a native rebuild. Auth is email-only for now (Sign in with Apple needs entitlements + a dev build; pre-submit). Cloud sync is **one-way push, opt-in, gated on toggle + session**; tables are owner-only via RLS. Native `<Switch>` toggles need a *swipe* (not a point-tap) under the sim-automation tool.
- 2026-08-21 — Hair analysis ships **mock-first**: the YouCam Hair Density endpoint isn't in the public API reference, so `analyze-hair` is written with best-guess task path/fields (flagged) and the client stays on the mock via `HAIR_ANALYSIS_REAL=false` until it's confirmed live. Hair bloom = coarse 4-grade → 45/62/78/92 (stable, never near-zero). Hair is its own scalp capture (not part of the skin fan-out); track detail routes hair tracks to `/scan-hair`.
- 2026-08-21 — **Privacy hardening (M9): export via RN core `Share`, not a file module.** `expo-file-system` is only a transitive dep (its native side isn't in the current dev build), so data export serializes to JSON and hands it to React Native's built-in `Share` sheet (save to Files / AirDrop / copy) — full data out, **no photo ever**, and no native rebuild. Delete is **cloud-first then local** (`deleteCloudData` → `db.clearAll()` → `signOut`) so a mid-way failure can't strand a synced copy after the local one is gone; account-record deletion (auth.users) is a heavier server action left for later. The **"not medical/not detection/not monitoring"** line is now a single shared constant used on every surface (no per-screen drift). The iOS **privacy manifest** is declared in `app.json` (`ios.privacyManifests`), but emission to `PrivacyInfo.xcprivacy` + reconciliation with the SDKs' own bundled manifests is a **build-time** step verified at M10 (can't be confirmed from JS).
- 2026-08-21 — **Monetization (M8) ships mock-first behind a `PurchasesProvider` seam**, mirroring the `AnalysisProvider` pattern. The app runs an in-memory/local **mock** where a "purchase" flips a persisted db flag → Pro (fully demoable on the Simulator without StoreKit); the real **RevenueCat adapter** is written as a **dependency-injected** factory (no hard `react-native-purchases` import, so the bundle builds without the native package) and stays off via `PURCHASES_REAL=false`. Going live = install the SDK + rebuild + RC dashboard products, deferred to pre-submit (M10) — same class of deferral as Sign in with Apple. **Gating rules live in one pure module** (`lib/purchases/entitlement.ts`): Free = 1 journey + monthly cadence cap; Pro = all journeys + each journey's natural cadence + apparel try-on. **Cadence is enforced client-side (authoritative, pre-call)**; the Edge Functions add a **server-side 429 guardrail** (`_shared/cadence.ts`) to protect paid API units, which becomes a true trust boundary once scanning requires auth (M10). Cadence caps intentionally do **not** speed up hair (monthly by nature for everyone).
- 2026-08-12 — Backend runs **locally first** (`supabase start` + `supabase functions serve`, Docker) — no cloud account yet; moves to a deployed cloud Supabase project around M7. Client picks real-vs-mock provider via `isSupabaseConfigured` (`EXPO_PUBLIC_SUPABASE_URL`). Scan sends the image as **base64** in the function body (picker `base64:true`) to avoid a native file-system module + rebuild.
- 2026-08-12 — Dev environment has **Command-Line-Tools only, no Xcode/CocoaPods/simulator** → cannot build/boot iOS here. User is installing full Xcode; iOS builds via local `expo run:ios`. op-sqlite (native) breaks Expo Go, so `createDb()` falls back to in-memory in Expo Go/jest/web to stay runnable everywhere until the dev build.

---

## Glossary

- **Track** — a healing journey the user opts into (e.g., Acne Care, Hair Regrowth), defined by a `TrackDefinition` config. Each has its own metrics, cadence, bloom, and copy.
- **Garden** — the home screen: one bloom/plant per enrolled track, growing as that track's trend improves.
- **Bloom score** — a deterministic 0–100 encouragement score for a track, from its YouCam concern outputs via a per-track scoring config. A *trend* signal, never a diagnosis. See `docs/03-tracks-and-bloom.md`.
- **Concern** — Perfect Corp's term for one skin metric (moisture, redness, texture, acne, dark-circle, spots, …). One HD skin scan can return ~14; a scan requests the union across enrolled skin tracks.
- **Fan-out** — one skin capture updating every enrolled skin track's bloom from a single API call.
- **Hair density grade** — YouCam AI Hair Density Detection output: a coarse 4-level scalp-exposure classification. A slow regrowth trend — not a follicle count, not a diagnosis.
- **Unit** — Perfect Corp's API billing unit. Skin scan 9–16 units (by concern count); apparel/fabric try-on 2 units; hair-density cost confirmed in M0. ~40 free one-time sandbox units; no recurring free tier.
- **VTO** — Virtual Try-On (Perfect Corp): AI Clothes + AI Fabric Try-On for the gentle-fabric apparel layer.
- **Sensitive track** — a track (e.g., Recovery Healing) flagged for extra privacy/consent framing.
- **Local-first** — all user data lives encrypted on-device by default; cloud sync is opt-in and never a precondition for use.
- **Patient-private** — even under a clinic license, an individual's data is visible only to them; no staff/third-party monitoring view exists.
