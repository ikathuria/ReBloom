# 05 — Deploy (M10)

How ReBloom goes from a local build to TestFlight. Everything the repo can carry is already here
(`eas.json`, a DSN-gated Sentry path in the Edge Functions, a privacy-scrubbing telemetry seam, a
Sign-in-with-Apple seam, and `.github/workflows/deploy.yml`). The steps below are the ones that
need **your accounts and credentials** — an agent can't create accounts, enter passwords, or accept
Apple/Play agreements, so run these yourself.

> ⚠️ **Rotate the YouCam key first.** The `PERFECTCORP_API_KEY` used in local dev was pasted in
> plaintext during development and must be treated as compromised. Generate a fresh key in the
> Perfect Corp console and use only the new one below.

## Accounts you'll need
- **Expo / EAS** (free tier is fine) — `npm i -g eas-cli && eas login`
- **Apple Developer Program** ($99/yr) + an **App Store Connect** app record (bundle `com.ikathuria.rebloom`)
- **Cloud Supabase** project (the app has been running on the local Docker stack)
- **RevenueCat** account + App Store Connect in-app products (`rebloom_pro_monthly`, `rebloom_pro_yearly`) under a `pro` entitlement
- **Sentry** project (two DSNs: one client, one for Edge Functions)

---

## 1 · Cloud Supabase
```bash
supabase link --project-ref <your-project-ref>
supabase db push                                   # applies supabase/migrations (enrollments + track_points + RLS)
supabase secrets set PERFECTCORP_API_KEY=<NEW_ROTATED_KEY>
supabase secrets set SENTRY_DSN=<edge-function-sentry-dsn>   # optional; enables _shared/report.ts
supabase functions deploy analyze-skin analyze-hair tryon-apparel
```
Then grab the project **URL** and **anon key** from the dashboard (Settings → API) for step 2.

## 2 · Client production env
Set these for the production build (via `eas env:create --environment production` or an EAS-managed
`.env`). `EXPO_PUBLIC_*` are bundled — never put a server secret here.
```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
EXPO_PUBLIC_SENTRY_DSN=<client sentry dsn>
EXPO_PUBLIC_REVENUECAT_IOS_KEY=<revenuecat public ios key>
```

## 3 · Turn on RevenueCat (flips the M8 mock → real)
```bash
npx expo install react-native-purchases
```
- In `apps/mobile/src/lib/purchases/index.ts`: set `PURCHASES_REAL = true` and, in `getPurchases()`,
  `return createRevenueCatProvider(require('react-native-purchases').default, process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!)`.
- In the RevenueCat dashboard: create the `pro` entitlement and attach the two products.
- The gating logic (`entitlement.ts`) and paywall UI need **no changes** — only the provider swaps.

## 4 · Turn on Sign in with Apple (the M7 deferral)
```bash
npx expo install expo-apple-authentication
```
- `app.json`: add `"expo-apple-authentication"` to `plugins` and set `ios.usesAppleSignIn: true`.
- Add an Apple button to the Account screen that calls `AppleAuthentication.signInAsync(...)`, then
  hands the `identityToken` to the existing `signInWithAppleToken()` seam (`lib/supabase/auth`).
- In Supabase Auth → Providers → **Apple**, configure the Service ID / key.

## 5 · Turn on Sentry (crash + error monitoring)
```bash
npx expo install @sentry/react-native
```
- Init Sentry at app start, then `registerReporter((e) => Sentry.captureMessage(e.message, { extra: e.context }))`
  from `lib/telemetry` — the telemetry seam already **scrubs images/PII** before the reporter sees them.
- Edge Functions already report via `_shared/report.ts` once `SENTRY_DSN` is set (step 1).

## 6 · Build + submit
- Fill the placeholders in `apps/mobile/eas.json` → `submit.production.ios`
  (`appleId`, `ascAppId`, `appleTeamId`).
```bash
cd apps/mobile
eas init                                   # writes extra.eas.projectId to app.json
eas build --platform ios --profile production
eas submit --platform ios --profile production   # → TestFlight
```
CI alternative: set the repo secret **`EXPO_TOKEN`** and push a `v*` tag — `.github/workflows/deploy.yml`
runs the production build.

## 7 · Verify the privacy manifest (the M9 build-time item)
After the first native build:
- Confirm `PrivacyInfo.xcprivacy` is present in the app bundle and matches `app.json`'s
  `ios.privacyManifests` (no tracking; required-reason APIs `CA92.1` + `C617.1`).
- Reconcile with the manifests bundled by **Perfect Corp / op-sqlite / RevenueCat / Sentry** — EAS
  merges them; make sure the App Store "privacy nutrition label" matches `docs/02`.
- Set `ios.infoPlist.ITSAppUsesNonExemptEncryption` correctly for SQLCipher (export compliance).

## 8 · Device smoke test (TestFlight)
Onboarding → choose a journey → take a scan → see the bloom in the garden → open the track detail.
Then: enable cloud sync, force-quit, relaunch (data persists), and run **Export** + **Delete
everything** from the Account screen. Trigger a forced error and confirm it lands in Sentry with **no
image/PII** in the payload.
