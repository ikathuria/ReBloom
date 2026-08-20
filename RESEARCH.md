# ReBloom — Research Report

> Mode: deep (5 parallel research agents) · Researched: 2026-08-12 · By: idea-research skill
> Idea: A private, opt-in React Native app that turns invisible physical healing into something visible — YouCam Skin/Hair AI scans shown as encouraging "bloom" trends, plus a gentle-fabric apparel try-on layer. Fully private, self-initiated, encrypted local-first.

> **Scope update (2026-08-12, post-research):** the product was broadened from a recovery-only app into a **general, multi-track "visible healing" tracker** — 7 launch tracks (Recovery Healing, Acne Care, Hair Regrowth, Redness & Sensitivity, Hydration, Dark Spots & Even Tone, Under-eye & Dark Circles), each tracked separately with its own bloom. Drug/substance-recovery healing is now **one first-class track among peers.** This research was framed around the recovery lane; its recovery-specific findings now validate *one track*, while the market read below is re-scored for the broader positioning. Skin/hair-tracking demand (16.8% CAGR, "sober glow up," AI-skin-app niche) supports the broader product; the competitive picture is correspondingly more crowded.

---

## Verdict

| | |
|---|---|
| **Build it?** | **yes-with-changes** — spike the API path first (Milestone 0), and bake privacy + non-appearance-shaming framing into the core, not the polish |
| **Market (recovery-only framing)** | **crowded-with-gap** — nobody combined recovery tracking with visible physical-healing |
| **Market (general-tracker positioning, chosen)** | **crowded — no empty quadrant** — skin/acne/hair-tracking apps are each mature; the wedge is now the *combination* (multi-track in one private app) + the underserved recovery track, not novelty. Acne is the most saturated lane; recovery the emptiest |
| **Demand** | **moderate (recurring, behavioral)** — strongest evidence is people *already* posting milestone face/body photos as proof of progress, unprompted |
| **Direction** | **tailwind (cautious)** — "sober curious" shift + AI-skin-analysis market growing ~16.8% CAGR; offset by vendor risk (Perfect Corp going private) and tightening health-data regulation |
| **Feasibility** | **medium** — the AI is real and self-serve; the spike is React Native integration (no first-class RN SDK → REST via backend proxy) + App Store health/biometric review |
| **Free to build** | **mostly** — dev/prototype is free; **YouCam has no recurring free tier** — a ~50-user weekly-scan pilot costs ~$150–235/mo |
| **Monetization** | **B2C freemium, usage-gated** (free tier must cap scans below API cost) + clinic B2B licensing to cover per-scan cost later |

**In two sentences (updated for the general-tracker scope):** As a multi-track healing tracker, ReBloom trades the clean recovery-only whitespace for a bigger but busier market — its moat becomes the *combination* of many conditions in one private, encouraging app plus a recovery track nobody else can build, all on a single confirmed, self-serve AI vendor. The catches are unchanged: the AI costs real money per scan (no recurring free tier) so prove the REST path on free units first and gate the free tier hard; and in a crowded field the differentiation is execution, warmth, and privacy — not the novelty of the mechanic.

---

## Competitors

| Name | Pricing | Strength | Limitations | User complaints |
|---|---|---|---|---|
| **I Am Sober** | Freemium; paid ≈ "$4.99/month is fair" per reviews (annual figures vary $39.99–$119.88 across sources) | Dominant sobriety tracker; 4.9★ / 185K ratings; streaks, pledges, community | Day-counter + community only; **no visual/physical tracking** | "the community is toxic" |
| **Reframe** | ~$100/yr (~$8/mo) or $9.99–$19.99/mo; coaching add-ons $9.99–$249.99/mo | Neuroscience-based drinking-reduction program | Premium price; abstinence-adjacent, not physical-healing | — |
| **Sunnyside** | $12/mo, $29/qtr, $99/yr; +Med naltrexone add-on $99/mo | Moderation (not abstinence) focus; raised $11.5M (Nov 2023); 600k+ users | Alcohol-only; coaching/telehealth upsell | — |
| **Sober Grid** | (defunct) | Was the leading recovery social network | **Dead** — unpublished Nov 2023, deadpooled (Tracxn) | Login/outage issues before shutdown |
| **TroveSkin** | Freemium; exact price not transparent | Closest skin analog — AI selfie analysis over time (moisture, spots, texture, "skin age") + product recs | Skincare-only, no recovery context | (page unfetchable) |
| **Perfect365 / YouCam Makeup** | ~$6–$10/mo; paid ~$9.99/mo | Perfect Corp's own consumer AI-beauty apps | Beauty/makeup framing, not health/recovery | — |

**Positioning (recovery framing):** crowded-with-gap — no product pairs sobriety/recovery tracking with selfie-based physical-healing visualization. Tellingly, **Sober Tracker already markets "clearer complexion" as a sobriety benefit but ships no skin-tracking feature** — the benefit is claimed, the tooling is missing. Sober Grid's death was an idiosyncratic founder-death operational failure, *not* a demand signal.

**Positioning (general-tracker, chosen 2026-08-12):** crowded with **no single empty quadrant.** As a general multi-condition healing tracker, ReBloom competes directly with skin-tracking (TroveSkin), acne apps (saturated), and hair apps (HairLine.ai, MyHairCounts). The defensible wedge is the **combination**: (1) many healing conditions tracked *separately* in one app with a unified, warm "garden of blooms"; (2) **privacy/local-first** (a real trust differentiator post the Loosid/Sober Grid audits); (3) a **first-class recovery track** the skin/hair incumbents ignore and the recovery incumbents can't build (no imaging). Novelty is not the moat — execution, brand warmth, and the underserved recovery lane are.

---

## What users actually say

The strongest demand signal is **behavioral, not stated**: recovery communities post physical-transformation photos as unprompted milestone proof, and existing day-counter rituals are the DIY version of what ReBloom would formalize.

> "The weight is the least important thing I've lost. I'm no longer bloated, miserable and addicted." — [r/stopdrinking, TSA didn't recognize me (2018 vs 2023)](https://reddit.com/r/stopdrinking/comments/137lvjc/) (2023-05-04)

> "I don't recognise the woman in the mirror. I hate her." — [r/stopdrinking relapse post](https://reddit.com/r/stopdrinking/comments/12j22px/) (2023-04-11) *(the flip side — appearance carries real emotional weight as a recovery signal)*

> "I lost the 4am anxiety spells, and I gained a lot more: energy, peace, clearer skin, and a stronger sense of who I am." — [Donna Francis, "My Skin Type Is Sober" Substack](https://myskintypeissober.substack.com/about) (sobriety date 2024-07-19)

> "improvements are visible within 1-2 weeks... by one month, many people notice reduced puffiness, clearer complexion, and brighter eyes" — [sober-tracker.com marketing](https://sober-tracker.com/) *(a competitor selling the benefit without building the feature)*

**DIY workarounds found:** milestone selfie/gallery posts (r/addiction's top-of-year posts are dominated by "94 days sober from meth," "5 months clean," "2 years clean" photo posts); before/after photo comparisons kept as personal motivation; day-counters and anniversary rituals (r/Sober). A beauty editor built an entire newsletter on the sobriety-as-skincare framing — evidence of a receptive wellness-adjacent audience segment distinct from hard-recovery subreddits.

**Demand-strength read:** **recurring and moderately painful** — expressed through behavior (photo-milestone posting) rather than explicit "I wish an app did this" asks. That's softer than a loud pain point but is a real, observable pattern.

**Counter-signal (design around it):** recovery-culture commentary cautions that appearance-based validation can be fraught, especially for women. No sharp "skin-tracking feels triggering/surveillance-y" quote surfaced, but the risk is real enough to shape framing: center *health/healing* metrics (hydration, redness, texture), never attractiveness ranking; allow the user to de-emphasize the "face" framing; never gamify looks.

---

## Demand signals

**Video (YouTube):** **moderate-to-strong.** "Sober glow up" is a branded, recurring content category; a board-certified dermatologist posted "Will Facial Redness Go Away After You Quit Drinking?" (2026-07-18) — mainstream health-authority validation of the exact metaphor. AI skin-analysis apps (ScanSkinAI, Glamora, Haut.ai, GlowNowX) have their own review/tutorial niche. Active but dedicated, not yet viral-mainstream.

**Search interest / market:** **rising.** AI skin-analysis market ≈ $2.13B in 2026 → $6.30B by 2033 (16.8% CAGR, Coherent Market Insights). Google Trends itself was rate-limited (429); read via proxies.

**News & momentum:**
- **Sober-curious tailwind** — Gen Z drinks ~20% less than millennials did at the same age; 65% planned to drink less in 2026 (nuance: Gen Z 21+ drinking is rising as the cohort ages in).
- **Digital-health funding rebounding but concentrating** — $7.4B H1 2026; 45% of capital in megadeals — a hard raise environment for an unfunded B2C wellness app.
- **⚠️ Vendor risk** — **Perfect Corp (YouCam) signed a definitive going-private merger, July 2026.** Going-private transactions often precede API pricing/partner-program/strategy shifts — material for a core single-vendor dependency.
- **Privacy regulation tightening** — FTC enforcement vs. BetterHelp / GoodRx / Premom for non-HIPAA health-data sharing; HIPAA Security Rule overhaul finalizing ~May 2026. Double-edged: raises ReBloom's compliance bar *and* makes local-first/private a defensible differentiator.

---

## Feasibility

- **The spike:** React Native integration with Perfect Corp's native-first SDKs — there is **no first-class RN SDK** (iOS/Android/Web/Flutter/Unity only). **Approach:** call the **REST API from a backend proxy** (Supabase Edge Function), not the client — this avoids native bridging, protects the API key, and lets us meter per-scan cost. The AI itself is **not** the hard part.
- **Both APIs confirmed real & self-serve** (read from the live rendered pricing dashboard, 2026-08-19):
  - Skin Analysis V2.0/2.1: **9–16 units per scan** (1–4 concerns = 9 SD / 12 HD; 5–8 concerns = 12 SD / 16 HD). Claims HIPAA/GDPR compliance.
  - **AI Clothes Virtual Try-On + AI Fabric Virtual Try-On both exist** (2 units/call) — the apparel layer is a genuine Perfect Corp product, no substitution needed.
- **Hair regrowth tracking is feasible on the same vendor & integration path** (added scope, 2026-08-12): Perfect Corp announced an **11-API "AI Hair & Beard" suite on 2026-06-16** on the same YouCam platform ([BusinessWire](https://www.businesswire.com/news/home/20260616828286/en/), [StockTitan PERF](https://www.stocktitan.net/news/PERF/perfect-corp-launches-industry-s-most-comprehensive-ai-hair-beard-bkz7f80zyc6q.html)), including **AI Hair Density Detection** (classifies scalp exposure into **4 density grades**) plus hair type/length/frizziness — same free playground key, same REST pattern. Caveats: density is **coarse (4 grades)** and regrowth is **slow (months)** → monthly cadence, long-horizon framing; consumer hair-density accuracy is contested (often inferred from lighting/shadows; no consumer app holds FDA clearance as of mid-2025 per [therighthairstyles / HairLine.ai coverage](https://www.myhairline.ai/blog/hair-loss-tracking-app-comparison-2026)) → same "trend, not diagnosis" disclaimer + capture-consistency guidance. Hair unit cost not yet read from the JS-rendered pricing page — **confirm in Milestone 0.** Dedicated hair-tracking apps exist (MyHairCounts, HairLine.ai, Hairgen.ai) but none in a recovery context — the whitespace holds.
- **Cost audit:**

| Service | Free tier | At the limit | Card up front? | Self-host alt? |
|---|---|---|---|---|
| **Perfect Corp YouCam (Skin + VTO)** | **one-time ~40 units sandbox** (not recurring) | hard stop until you buy units/subscribe | No | **No — proprietary** |
| Perfect Corp — pilot reality | — | 50 users × weekly scan+VTO ≈ 3,200 units/mo → **~$150–235/mo** | — | No |
| Supabase (auth+DB+Edge Functions) | 500MB DB, 50k MAU, 1GB storage, 5GB egress, 2 projects | soft — auto-pauses after 1wk idle | typically no | Yes |
| Expo EAS Build | 15 iOS + 15 Android builds/mo | builds queue/fail | unconfirmed | n/a |
| RevenueCat (IAP) | free under ~$2.5k/mo tracked revenue | — | no | n/a |
| Alt skin APIs (Haut.ai/Revieve/Orbo) | **no public pricing** (enterprise/contact-sales) | unknown | unknown | No |

- **⚠️ No free path at scale:** Perfect Corp is the one component with **no recurring $0 tier**. Ironically it's the *most* transparent vendor here — the enterprise fallbacks (Haut.ai/Revieve/Orbo) publish no pricing at all.
- **Prior-art failures / warnings:**
  - ExpressVPN Digital Security Lab audited 10 addiction-recovery apps — 7/10 accessed advertising IDs, 5 collected phone numbers, 3 accessed IMEI/IMSI, 7 requested Bluetooth. **Loosid and Sober Grid named.** This is the "recovery app as surveillance" pattern ReBloom exists to reject — and a concrete design constraint (justify why a beauty-tech vendor's API sees a user's face weekly).
  - Sober Grid went dark after its founder's death, stranding user data — argues for export/portability and not a single point of failure.
  - App Store: health + recurring biometric selfies land squarely in **Guideline 5.1.1** (consent, data minimization, no surveillance) + third-party SDK **privacy-manifest** requirements.
- **Classification:** **medium (medium-to-hard).** Not an ML problem; the risk is integration friction + App Store review + getting privacy architecture right.
- **Milestone 0 must prove:** RN camera capture → backend REST call to Skin Analysis → parse 5–8 concern scores → store one trend point → render a single "bloom" point — all on the ~40 free sandbox units, before spending a cent or building the apparel layer.

---

## Monetization

**Recommended: B2C freemium with a usage gate, priced to sit alongside the category and cover per-scan API cost.**

- **Why usage-gated:** each scan costs real money (~12–16 units ≈ $0.56–$0.75/user/month at a weekly cadence, at ~$0.047/unit). A free tier that allowed unlimited weekly scans would lose money per user, so the **free tier must cap scans** (e.g., onboarding scan + one scan/month + the bloom dashboard) while **paid unlocks weekly scans, full history/trends, and the apparel try-on.**
- **Price anchor:** I Am Sober "$4.99/mo is fair"; skin apps $6–$10/mo. Target **~$5.99–$8.99/mo** (or ~$49–$69/yr), delivered via **RevenueCat + StoreKit/Play Billing** (Apple/Google require in-app purchase for digital goods — Stripe can't be used in-app).
- **Clinic pilot (B2B, later):** license per-seat to recovery clinics/sober-living programs; this is where the ~$150–235/mo API cost is comfortably covered and where distribution actually exists. Keep data patient-private even under a clinic license (no staff dashboards of individuals).
- **Unit-economics guardrail:** meter units server-side; alert if any account's scan volume implies negative margin; cap free-tier scans hard.

---

## Conflicts & unknowns

- **Stated vs. behavioral demand.** Communities *show* strong milestone-photo behavior but rarely *ask* for a skin-tracking app — the pain is real but latent. A landing-page / waitlist test framed around "see your recovery heal" would de-risk this before heavy build.
- **Appearance framing tension.** The same appearance-signal that drives engagement can harm (esp. women). Unresolved: how hard to lean on the visual/face metaphor vs. abstract "bloom" health score. Recommend user-testing both framings.
- **Vendor concentration.** Core AI is single-vendor (Perfect Corp) *and* that vendor is going private. Mitigation: abstract skin analysis behind an interface from day one so a fallback (or on-device model) can be swapped without rewrites.
- **Reddit depth gap.** The Reddit MCP's search and comment-thread retrieval were non-functional this session (credentials/rate-limits); community evidence leans on RSS titles/snippets + web-search synthesis, so *comment-level* willingness-to-pay and counter-signal language is under-sampled.

## Could not access

- `search_reddit` / `get_post_details` (reddit-mcp-buddy) — "Access forbidden" / "Cannot access r/X" all session; no comment threads retrievable (only `browse_subreddit` RSS titles + ~300-char snippets).
- r/SkincareAddiction, r/OpiatesRecovery — RSS HTTP 429; r/leaves, r/decidingtobebetter, r/redditorsinrecovery — unreached within budget.
- `trends.google.com/trends/explore` — HTTP 429 (expected anti-bot). Exploding Topics had no dedicated page for these terms.
- `yce.perfectcorp.com/ai-api/api-pricing` — pricing table did NOT render for the competitor agent (indirect hackathon pricing only), but DID render for the feasibility agent (concrete unit costs above) — feasibility figures supersede.
- Perfect Corp SDK platform matrix (docs.perfectcorp.com) — RN-gap synthesized from secondary sources; re-verify against live SDK docs before committing the integration approach.
- Haut.ai / Revieve / Orbo pricing/contact pages — only marketing landers surfaced; "contact-sales only" inferred, not confirmed.
- Apple Guideline 5.1.1 verbatim text — synthesized from secondary sources, not fetched from developer.apple.com.
- TroveSkin exact pricing + verbatim reviews (appgrooves DNS failure); I Am Sober exact annual price (sources disagree).
