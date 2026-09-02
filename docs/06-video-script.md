# 06 — Demo Video Script (~2:45)

A tight problem → demo → impact arc for the submission video. **[VISUAL]** = what's on
screen · **VO** = narration. Aim for 2:30–3:00. Record the live app (simulator or device) at
full resolution — not slides. Make sure the "not medical / not detection / not monitoring" line
is visible at least once.

---

**[0:00–0:18 · Hook — your face, or a black card with the tagline]**

> VO: "When you're healing — recovering from substance use, clearing your skin, regrowing your
> hair — the progress is real, but it's *invisible day to day*. So people quit right before it
> shows. **ReBloom turns invisible physical healing into a garden you can watch grow.**"

**[0:18–0:35 · Onboarding: "Watch yourself heal" → consent screen]**

> VO: "It opens by telling you the deal in plain words. Everything stays on your device. Your
> photo is analyzed once and never stored. And it's framed as encouragement — *not* medical
> advice, not detection, not monitoring. That line is on every screen."

**[0:35–0:52 · "Choose your journey" picker]**

> VO: "You pick a healing journey — Recovery, Acne, Redness, Hydration, Dark Spots, Under-eye,
> or Hair Regrowth. Each is just config, so adding a new one is data, not code. I'll start with
> Recovery — the private, underserved track no one else serves well."

**[0:52–1:15 · Take a scan → choose photo → "Your bloom today: 79"]**

> VO: "Now the core loop: a gentle scan. On the backend a Supabase Edge Function calls Perfect
> Corp's YouCam skin analysis — the key never touches the phone, and the image is never
> persisted. It returns 14 skin metrics, and ReBloom turns them into a single encouraging
> **bloom score**. One face scan fans out to every skin journey you've enrolled."

**[1:15–1:35 · Garden home — bloom grew from seed 🌰 to flower 🌸]**

> VO: "Back in the garden, the journey grew — from a seed to a bloom. This is the whole point:
> healing you couldn't see, now visible and rewarding. Tap in…"

**[1:35–1:52 · Track detail — trend + "What went into it"]**

> VO: "…and you get your trend over time, plus what went into the score — reframed into
> *positive* language: clear skin, balanced oil, calm skin. It's a trend to encourage you,
> never a diagnosis."

**[1:52–2:10 · Comfort tab — fabric recommendations]**

> VO: "Because sensitive, healing skin reacts to what it touches, the Comfort tab reads your
> latest scan and suggests gentle fabrics — reach for cotton and bamboo, skip the sweaty
> synthetics."

**[2:10–2:28 · Account — skins + Export/Delete]**

> VO: "It's yours to shape and yours to leave. Pick a garden style so the look isn't
> gender-locked. Export everything as JSON — scores, never photos — or erase every trace in one
> tap. And under the hood it's all encrypted at rest with SQLCipher."

**[2:28–2:45 · Close — logo / garden]**

> VO: "ReBloom. Built with Expo and Supabase, privacy-first from the first line of code. Because
> you *are* healing — now you can finally watch it bloom."

---

## Recording checklist

- [ ] Full-resolution capture of the **live app** (simulator or device), not slides.
- [ ] Keep it **under 3 minutes**.
- [ ] The **"not medical / not detection / not monitoring"** disclaimer appears on screen at least once.
- [ ] Show the full core loop: onboarding → scan → garden growth → track detail.
- [ ] End on the tagline / garden.

## Honesty guardrails (what's real vs. roadmap)

- **Real & demoable:** skin scan via Perfect Corp YouCam (Edge Function proxy), bloom scoring +
  fan-out, encrypted local-first storage, consent/disclaimers, data export/delete, garden styles.
- **Roadmap (don't claim as live):** hair-density scan, apparel virtual try-on, RevenueCat
  billing, Sign in with Apple — these are written but mock/stubbed pending vendor confirmation.
