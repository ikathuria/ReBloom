// Healing-track registry (skeleton — full TrackDefinitions + bloom scoring land in M3).
//
// A "track" is a healing journey the user opts into (see PLAN.md "The track model").
// M1 pins only the canonical set of track ids so routing/enrollment can reference them;
// M3 fills in each track's YouCam concern keys, cadence, scoring, and copy — the concern
// mappings are already validated against the live API in docs/04-api-integration.md.

export const TRACK_IDS = [
  'recovery',
  'acne',
  'redness',
  'hydration',
  'dark-spots',
  'under-eye',
  'hair-regrowth',
] as const;

export type TrackId = (typeof TRACK_IDS)[number];

export type TrackKind = 'skin' | 'hair';

/** Which tracks are hair vs skin — the only track detail M1 needs (skin tracks fan out from one scan). */
export const TRACK_KIND: Record<TrackId, TrackKind> = {
  recovery: 'skin',
  acne: 'skin',
  redness: 'skin',
  hydration: 'skin',
  'dark-spots': 'skin',
  'under-eye': 'skin',
  'hair-regrowth': 'hair',
};

export const isTrackId = (v: string): v is TrackId => (TRACK_IDS as readonly string[]).includes(v);
