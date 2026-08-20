# ReBloom — Milestone 0 spike

Throwaway code to prove the riskiest assumption before we build anything: that we can
drive **Perfect Corp YouCam Skin Analysis over plain REST from JS**, and that **one selfie
scan can feed multiple track blooms** (the cost-efficiency the whole product leans on).

No Expo, no Supabase, no install — just Node ≥ 18 (global `fetch`). This deliberately calls
YouCam directly; the real app proxies through a Supabase Edge Function so the key never ships
to the client (see PLAN.md M3).

## What you need to do (the one step I can't)

1. Go to <https://yce.perfectcorp.com/ai-api>, sign in, and **issue an API key** (comes with ~40 free units). Creating the account / handling the key is yours — I can't create accounts or enter credentials.
2. Save a clear, front-facing selfie somewhere, e.g. `./selfie.jpg`.

## Run it

```bash
PERFECTCORP_API_KEY=your_key_here node spike/analyze-skin.mjs ./selfie.jpg
```

Score a specific set of tracks (requests the union of their concerns in ONE call):

```bash
PERFECTCORP_API_KEY=your_key_here node spike/analyze-skin.mjs ./selfie.jpg recovery,acne,under-eye
```

Track ids: `recovery, acne, redness, hydration, dark-spots, under-eye` (all skin).
`hair-regrowth` uses a separate Hair Density API not covered by this script (M5).

## What "GO" looks like

The script prints each concern's `ui_score` (1–100, higher = healthier) and a **bloom per
track** computed from that single scan, e.g.:

```
  🌱 Recovery Healing              bloom=71
  🌱 Acne Care                     bloom=64
✔ REST path proven: one selfie → one analysis call → multiple track blooms.
```

If it works: note the **unit cost** shown in the YouCam console, drop it (and any response-shape
tweaks the script needed) into `docs/04-api-integration.md`, and flip the **GO/NO-GO** gate there.

## If something breaks

The YouCam response envelope (`result` vs `data` nesting) isn't 100% pinned from docs — the
script tries several shapes and, if it still can't find `file_id` or `task_id`, prints the raw
JSON so we can adjust the parser in one line. Paste that output back to me and I'll fix it.
