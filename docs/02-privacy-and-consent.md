# 02 — Privacy & Consent

ReBloom's promise: **your healing is yours.** This document is the source of truth for what we
collect, what leaves the device, and the exact consent we ask for. The onboarding copy (M2) and
the M9 pre-submit audit both derive from here. If a change to the app would contradict anything
below, the change is wrong — fix the app, not this doc.

## Principles

1. **Local-first by default.** Every scan and score lives **encrypted on the device** (op-sqlite + SQLCipher; key in the iOS Keychain / Android Keystore via expo-secure-store). The app is fully usable with **no account**.
2. **The photo leaves only transiently, only to analyze, and is never stored by us.** To score a scan we send the image to Perfect Corp's YouCam API **through our stateless proxy**, which returns numeric scores and **does not persist the image**. We keep the *scores*, not the photo.
3. **Cloud sync is opt-in and off by default.** Only if you create an account and switch sync on do encrypted *scores* (never raw photos) leave the device — to your private account, readable by no one else.
4. **Not medical. Not detection. Not monitoring.** ReBloom shows an encouraging *trend*. It does **not** diagnose conditions and does **not** detect substance use, and it is **never** a tool for staff, employers, clinics, or any third party to watch someone. Even under a future clinic license, an individual's data is visible only to that individual.
5. **Data minimization.** We request only the skin/hair metrics your enrolled tracks need, no advertising IDs, no location, no contacts, no device fingerprinting. (Contrast: audited recovery apps Loosid/Sober Grid were found harvesting ad IDs, IMEI/IMSI, and Bluetooth — the pattern we exist to reject.)
6. **You can leave with your data.** Export everything, and delete everything (local + any synced copy), from inside the app.

## What we collect, and where it goes

| Data | Where it lives | Leaves device? |
|---|---|---|
| The scan photo (selfie / scalp) | held in memory during a scan | **Only** transiently to the analysis proxy → YouCam; **never stored** by us, on device or server |
| Per-metric scores (e.g. `hd_redness`) + computed bloom | encrypted local DB | Only if you opt into cloud sync (encrypted) |
| Which tracks you enrolled in + cadence | encrypted local DB | Only if you opt into cloud sync |
| Account identity (email / Apple) | Supabase Auth | Only exists if you choose to make an account |
| Analytics / advertising IDs | **not collected** | never |

## Consent we ask for (M2 onboarding)

Consent is **explicit, granular, and revocable** — nothing is pre-checked, and declining any item is a first-class choice that the app respects.

1. **Capture** — permission to use the **camera** and/or **photo library** to take/choose a scan photo. (You can use photo-library only and never grant camera.)
2. **Transient analysis** — permission to send that photo **once, transiently,** to Perfect Corp's YouCam AI for scoring, understanding it is not stored. **Declining this blocks scanning** (there's nothing to score without it) — and the app says so plainly rather than failing silently.
3. *(Later, never in onboarding)* **Cloud sync** — a separate, explicit opt-in shown only if/when you create an account (M7).

Each toggle states, in plain language, what it enables and what happens if you decline. The "not medical / not detection / not monitoring" statement appears on the consent screen and again on every scan and results surface.

## Sensitive tracks

The **Recovery Healing** track is flagged `sensitive`. It carries the same technical guarantees as every track (nothing extra is collected), plus extra framing care: no language implying detection of use, and reinforced "this is encouragement, not surveillance" copy.

## Pre-submit audit checklist (verified in M9)

- [ ] No scan image is written to disk on the device beyond the transient in-memory buffer, and none is persisted server-side (proxy asserts no storage).
- [ ] Local DB is encrypted at rest (SQLCipher) with the key in the platform keychain, not in JS/AsyncStorage.
- [ ] No advertising ID, IDFA/IMEI/IMSI, location, contacts, or Bluetooth permissions requested.
- [ ] Cloud sync is off until explicitly enabled; disabling it stops all uploads.
- [ ] Export produces the user's full data; delete wipes local + synced copies.
- [ ] iOS privacy manifest + third-party SDK (Perfect Corp, RevenueCat) data-use declarations present and accurate.
- [ ] "Not medical / not detection / not monitoring" disclaimer visible on consent, every scan surface, each track's results, and apparel.
