// ReBloom — Milestone 0 spike: track definitions + bloom scoring.
//
// This is THROWAWAY spike code to prove the concept. The real version lives in
// apps/mobile/src/lib/tracks/ (see PLAN.md M3). Concern keys are the REAL Perfect
// Corp YouCam HD Skin Analysis keys (verified against docs 2026-08-12, see
// docs/04-api-integration.md) — but the exact per-track weighting is provisional
// until we see live scores respond on real recovery/acne/etc. skin.
//
// Scoring model: YouCam ui_score is 1..100 where HIGHER = HEALTHIER. So a track's
// bloom is simply the (weighted) average of its concerns' ui_scores — no inversion
// needed. Bloom is a 0..100 encouragement TREND, never a diagnosis.

/** @typedef {{ id:string, name:string, kind:'skin'|'hair', concerns:string[], cadence:'weekly'|'biweekly'|'monthly', sensitive?:boolean, note?:string }} TrackDefinition */

/** The 6 skin tracks + 1 hair track from the launch catalog (PLAN.md). @type {TrackDefinition[]} */
export const TRACKS = [
  {
    id: 'recovery',
    name: 'Recovery Healing',
    kind: 'skin',
    concerns: ['hd_moisture', 'hd_redness', 'hd_radiance', 'hd_texture', 'hd_age_spot'],
    cadence: 'weekly',
    sensitive: true,
    note: 'Hero track. "Complexion evenness" is proxied by radiance + age_spot + texture (no dedicated evenness concern).',
  },
  {
    id: 'acne',
    name: 'Acne Care',
    kind: 'skin',
    concerns: ['hd_acne', 'hd_oiliness', 'hd_pore', 'hd_redness', 'hd_texture'],
    cadence: 'weekly',
  },
  {
    id: 'redness',
    name: 'Redness & Sensitivity Calm',
    kind: 'skin',
    concerns: ['hd_redness', 'hd_moisture'],
    cadence: 'weekly',
    note: 'FLAG: YouCam has NO dedicated "sensitivity" concern. Approximated by redness + moisture (barrier). Revisit if a sensitivity concern appears.',
  },
  {
    id: 'hydration',
    name: 'Hydration & Dryness',
    kind: 'skin',
    concerns: ['hd_moisture'],
    cadence: 'weekly',
  },
  {
    id: 'dark-spots',
    name: 'Dark Spots & Even Tone',
    kind: 'skin',
    concerns: ['hd_age_spot', 'hd_radiance', 'hd_texture'],
    cadence: 'biweekly',
  },
  {
    id: 'under-eye',
    name: 'Under-eye & Dark Circles',
    kind: 'skin',
    concerns: ['hd_dark_circle', 'hd_eye_bag', 'hd_tear_trough'],
    cadence: 'weekly',
  },
  {
    id: 'hair-regrowth',
    name: 'Hair Regrowth',
    kind: 'hair',
    concerns: ['hair_density'], // separate Hair Density API — endpoint TBC in sandbox (M5)
    cadence: 'monthly',
    note: 'Uses the AI Hair Density Detection API, not skin dst_actions. Coarse 4-grade signal.',
  },
];

/** The union of HD skin concerns needed for a set of enrolled skin-track ids. */
export function unionConcerns(trackIds) {
  const set = new Set();
  for (const t of TRACKS) {
    if (t.kind === 'skin' && trackIds.includes(t.id)) t.concerns.forEach((c) => set.add(c));
  }
  return [...set];
}

/**
 * Compute a track's bloom (0..100) from a map of concern -> ui_score (1..100).
 * Equal weights for the spike. Missing concerns are skipped (and reported by caller).
 */
export function bloom(track, scoresByConcern) {
  const vals = track.concerns.map((c) => scoresByConcern[c]).filter((v) => typeof v === 'number');
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg);
}
