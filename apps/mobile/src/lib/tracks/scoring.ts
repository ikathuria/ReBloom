// Bloom scoring — the "fan-out" math (see PLAN.md M3 + docs/04-api-integration.md).
//
// One skin scan requests the UNION of the user's enrolled skin tracks' concerns in a single
// YouCam call; each track then computes its own bloom from its slice of the returned scores.
// YouCam ui_scores are 1..100 where higher = healthier, so a bloom is just the (equal-weight)
// average of a track's concern scores — no inversion. Bloom is an encouragement trend, not a
// diagnosis.

import { TRACKS_META, TRACK_KIND, type TrackId } from './index';

/** Per-concern scores returned by a skin scan, keyed by YouCam concern key. */
export type ConcernScores = Record<string, number>;

/** The distinct set of skin concerns to request for a set of enrolled track ids. */
export function skinUnionConcerns(trackIds: TrackId[]): string[] {
  const set = new Set<string>();
  for (const id of trackIds) {
    if (TRACK_KIND[id] === 'skin') for (const c of TRACKS_META[id].concerns) set.add(c);
  }
  return [...set];
}

/**
 * A track's bloom (0..100) from a scan's concern scores — the average of the track's concerns
 * that are present. Returns null if none of the track's concerns were scored (nothing to show).
 */
export function computeBloom(trackId: TrackId, scores: ConcernScores): number | null {
  const values = TRACKS_META[trackId].concerns
    .map((c) => scores[c])
    .filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Fan one skin scan out to every enrolled skin track → { trackId: bloom }. */
export function bloomsForScan(trackIds: TrackId[], scores: ConcernScores): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of trackIds) {
    if (TRACK_KIND[id] !== 'skin') continue;
    const bloom = computeBloom(id, scores);
    if (bloom !== null) out[id] = bloom;
  }
  return out;
}
