# 04 — Perfect Corp YouCam API Integration

_Milestone 0 spike notes. Sourced from docs.perfectcorp.com on **2026-08-12**. Lines marked **⟳ confirm live** are from docs and must be verified with a real sandbox call before we rely on them. Update this file with observed values as the spike runs._

## Status of M0 tasks

| M0 task | State |
|---|---|
| Enumerate real skin concern keys + map every skin track | ✅ done from docs (below) |
| Auth scheme + base URL + full skin-analysis flow documented | ✅ done + **confirmed live 2026-08-12** |
| Runnable spike code (`spike/analyze-skin.mjs`) ready | ✅ written + **ran green on first live call** |
| Live skin-analysis call returns JSON on a real selfie | ✅ **done — 8 HD concerns returned, ~6s** |
| Fan-out: one scan → multiple track blooms | ✅ **done — Recovery=81, Acne=77 from one call** |
| **GO / NO-GO on REST-only path** | ✅ **GO** (see bottom) |
| Hair Density Detection endpoint + unit cost | ⏳ endpoint not in public reference; confirm in sandbox console (M5) |
| Observed per-scan unit cost by concern-count tier | ⏳ **read remaining units from console** (see below) |

## Observed — live run 2026-08-12

- Endpoints, `Bearer` auth, and the file→task→poll flow all worked **exactly as documented**. Response envelope parsed on the first try (no parser changes) — `file_id`, `data.task_id`, and `data.results.output[]` with `type` + `ui_score` were all present as expected.
- Poll reached `success` on the **3rd poll (~6s)**. Results are 24h-retained; no tight polling needed.
- **8-concern HD request** (`recovery,acne` union) returned all 8 scores: `hd_moisture 71, hd_redness 80, hd_radiance 81, hd_texture 79, hd_age_spot 93, hd_acne 85, hd_oiliness 80, hd_pore 61`. Blooms: **Recovery Healing 81, Acne Care 77.**
- **HEIC accepted** even though the spike sent `content_type: image/jpeg` for a `.HEIC` file — the presigned upload didn't hard-validate content-type. **Production TODO:** label content-type correctly and/or transcode HEIC→JPEG on device rather than depending on this leniency.
- **✅ Unit cost observed: 16 credits** for this **8-concern HD** scan — confirms the documented 5–8-concern HD tier (16 units). So ~40 free units ≈ **2.5 scans**. At ~$0.047/unit that's **~$0.75/scan → ~$3/user/mo** at a weekly cadence.
  - **Product lever:** cost is tiered by concern *union* size (1–4 = 12u, 5–8 = 16u HD). More enrolled tracks → bigger union → higher tier. **Free = 1 track** keeps a user in the cheap tier and caps per-user cost. Minimize the requested union to only enrolled tracks' concerns.

---

## Authentication

- **Scheme:** static API key as a Bearer token. **No** RSA `id_token` / OAuth exchange for the self-serve YouCam AI API (that older flow is the enterprise S2S SDK; the YCE API is simpler).
- **Header:** `Authorization: Bearer <API_KEY>`
- **Key source:** the YouCam AI API console — sign in at <https://yce.perfectcorp.com/ai-api>, issue a key, get **~40 free units** (one-time). Console/keys page: `https://yce.makeupar.com/api-console/…` ⟳ confirm exact path.
- **Where the key lives:** in the spike, an env var (`PERFECTCORP_API_KEY`). In production, **only** in Supabase Edge Function secrets — never in the client bundle (see PLAN.md).

## Base URL

```
https://yce-api-01.makeupar.com
```
All task endpoints are under `/s2s/v2.0/`.

## Skin Analysis — end-to-end flow

Four HTTP calls. The image is uploaded to a presigned URL, then referenced by `file_id`.

**1) Request an upload URL** — `POST /s2s/v2.0/file`
```json
{ "files": [ { "content_type": "image/jpeg", "file_name": "selfie.jpg", "file_size": 547541 } ] }
```
Returns (⟳ confirm exact nesting): a `file_id` and a `requests` entry with `{ url, headers, method: "PUT" }`.

**2) Upload the bytes** — `PUT <presigned url>` with the returned headers (`Content-Type`, `Content-Length`) and the raw image body. *(Calling the File API alone does not upload the file — you must PUT to the returned URL.)*

**3) Create the task** — `POST /s2s/v2.0/task/skin-analysis`
```json
{ "src_file_id": "<file_id>", "dst_actions": ["hd_moisture","hd_redness","hd_acne"], "miniserver_args": { "enable_mask_overlay": false }, "format": "json" }
```
Returns `{ "status": 200, "data": { "task_id": "…" } }`.

**4) Poll** — `GET /s2s/v2.0/task/skin-analysis/<task_id>`
```json
{ "status": 200, "data": { "task_status": "success",
  "results": { "output": [ { "type": "hd_texture", "ui_score": 68, "raw_score": 57.33, "mask_urls": ["https://…"] } ] } } }
```
`task_status` ∈ `success | error`. Results retained 24h — no short-interval polling needed. Set `enable_mask_overlay: false` unless we render masks (we don't in MVP).

## Scores

- Both `raw_score` and `ui_score` range **1–100**, where **higher = healthier**.
- ⇒ **Bloom = weighted average of a track's concern `ui_score`s, no inversion.** Bloom is a 0–100 encouragement *trend*, never a diagnosis.

## Skin concern keys (the real ones)

**HD concerns** (use these — HD is our default):
`hd_redness`, `hd_oiliness`, `hd_age_spot`, `hd_radiance`, `hd_moisture`, `hd_dark_circle`, `hd_eye_bag`, `hd_droopy_upper_eyelid`, `hd_droopy_lower_eyelid`, `hd_firmness`, `hd_texture`, `hd_acne`, `hd_pore`, `hd_wrinkle`, `hd_tear_trough`, `hd_skin_type`

**SD concerns** (do not mix SD + HD in one request):
`wrinkle`, `droopy_upper_eyelid`, `droopy_lower_eyelid`, `firmness`, `acne`, `moisture`, `eye_bag`, `dark_circle_v2`, `age_spot`, `radiance`, `redness`, `oiliness`, `pore`, `texture`, `tear_trough`, `skin_type`

> **Gap found:** there is **no dedicated "sensitivity" or "complexion evenness" concern.** Redness & Sensitivity Calm approximates sensitivity with `hd_redness` + `hd_moisture`; "even tone" is proxied by `hd_age_spot` + `hd_radiance` + `hd_texture`. Revisit if a sensitivity/evenness concern appears.

## Track → concern mapping (launch catalog)

| Track | Concerns (HD keys) | Cadence | Notes |
|---|---|---|---|
| Recovery Healing `sensitive` | `hd_moisture`, `hd_redness`, `hd_radiance`, `hd_texture`, `hd_age_spot` | weekly | evenness proxied by radiance+age_spot+texture |
| Acne Care | `hd_acne`, `hd_oiliness`, `hd_pore`, `hd_redness`, `hd_texture` | weekly | |
| Redness & Sensitivity Calm | `hd_redness`, `hd_moisture` | weekly | ⚠ no real "sensitivity" concern |
| Hydration & Dryness | `hd_moisture` | weekly | |
| Dark Spots & Even Tone | `hd_age_spot`, `hd_radiance`, `hd_texture` | biweekly | |
| Under-eye & Dark Circles | `hd_dark_circle`, `hd_eye_bag`, `hd_tear_trough` | weekly | |
| Hair Regrowth | Hair Density API (separate) | monthly | not a skin `dst_action` — see below |

**Union sizes (drive unit cost):** Recovery = 5 · Acne = 5 · Recovery+Acne = 8 · all 6 skin tracks = 11 distinct concerns (`hd_moisture, hd_redness, hd_radiance, hd_texture, hd_age_spot, hd_acne, hd_oiliness, hd_pore, hd_dark_circle, hd_eye_bag, hd_tear_trough`). Because one call requests the **union**, cost grows with breadth of enrollment, not number of scans. Free tier = 1 track keeps the union small.

## Unit cost (per the pricing dashboard, ⟳ confirm live)

- Skin Analysis by concern count: **1–4 concerns → 9 (SD)/12 (HD) units; 5–8 → 12 (SD)/16 (HD) units** — the **16 (HD) figure confirmed live** on an 8-concern request. Tier for **9–16 concerns not yet read** — an all-6-tracks scan (11 concerns) likely costs a higher tier; **confirm in console.**
- Apparel Clothes/Fabric VTO: 2 units/call.
- Hair Density: **⟳ unknown — record from console.**
- Free: ~40 one-time sandbox units. No recurring free tier.

## Hair Density Detection (for M5)

- Part of the **AI Hair & Beard API suite** (launched 2026-06-16). Output: a coarse **4-grade** scalp-exposure density classification.
- **Exact endpoint path + `dst_action` key not in the public reference yet.** Expected to follow the same File → task → poll pattern (likely `POST /s2s/v2.0/task/…hair…`). **Confirm the endpoint, request key, response shape, and unit cost directly in the sandbox console during M0/M5.**

## Open questions to close during the live run

1. Exact File API response nesting (`result.files[0]` vs `data.files[0]`) — the spike parser tries several; record the real shape.
2. Does HD skin analysis require a `dst_actions` that are all `hd_*` (no SD mixing)? Confirm an all-HD request succeeds.
3. Real unit cost for an 8-concern and an 11-concern HD request.
4. Hair Density endpoint + key + unit cost.
5. Face-detection / image-quality pre-checks — does the API reject a poor selfie, and with what error? (Affects capture-guidance UX.)

## GO / NO-GO

> **Decision: ✅ GO (2026-08-12).** One selfie completed the full 4-step flow over plain REST (Bearer key, no native SDK), returned all 8 requested HD `ui_score`s in ~6s, and the spike computed 2 distinct track blooms (Recovery 81 / Acne 77) from that single response. The riskiest assumption — that we can drive YouCam Skin Analysis from JS and fan one scan out to multiple tracks — is retired. Proceed to M1.
>
> **Follow-ups that do NOT block M1:** (1) read remaining free units from the console to fix the per-scan cost; (2) confirm the Hair Density endpoint/keys/cost in the console before M5; (3) handle image content-type/HEIC properly in the real capture flow.
