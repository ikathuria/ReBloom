// Healing-track registry (M2 metadata level — full concern mappings + bloom scoring land in M3).
//
// A "track" is a healing journey the user opts into (see PLAN.md "The track model").
// M1 pinned the ids; M2 adds display metadata + cadence so the "choose your journeys"
// picker and enrollment can work. The YouCam concern keys + scoring (already validated
// live in docs/04-api-integration.md) are added to this registry in M3.

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
export type Cadence = 'weekly' | 'biweekly' | 'monthly';

export interface TrackMeta {
  id: TrackId;
  name: string;
  kind: TrackKind;
  /** Default scan rhythm for this track (user can scan sooner; gating comes in M8). */
  cadence: Cadence;
  /** One warm line for the picker. */
  blurb: string;
  /** Recovery carries extra privacy/consent framing (see docs/02). */
  sensitive?: boolean;
}

export const TRACKS_META: Record<TrackId, TrackMeta> = {
  recovery: {
    id: 'recovery',
    name: 'Recovery Healing',
    kind: 'skin',
    cadence: 'weekly',
    sensitive: true,
    blurb: 'Watch your skin recover its calm, hydration, and glow.',
  },
  acne: {
    id: 'acne',
    name: 'Acne Care',
    kind: 'skin',
    cadence: 'weekly',
    blurb: 'Follow breakouts, oiliness, and texture settling down.',
  },
  redness: {
    id: 'redness',
    name: 'Redness & Sensitivity',
    kind: 'skin',
    cadence: 'weekly',
    blurb: 'See redness ease as your skin barrier steadies.',
  },
  hydration: {
    id: 'hydration',
    name: 'Hydration & Dryness',
    kind: 'skin',
    cadence: 'weekly',
    blurb: 'Track moisture returning — often the first visible win.',
  },
  'dark-spots': {
    id: 'dark-spots',
    name: 'Dark Spots & Even Tone',
    kind: 'skin',
    cadence: 'biweekly',
    blurb: 'Follow marks fading and your tone evening out.',
  },
  'under-eye': {
    id: 'under-eye',
    name: 'Under-eye & Dark Circles',
    kind: 'skin',
    cadence: 'weekly',
    blurb: 'Notice the “I look rested again” moments returning.',
  },
  'hair-regrowth': {
    id: 'hair-regrowth',
    name: 'Hair Regrowth',
    kind: 'hair',
    cadence: 'monthly',
    blurb: 'A gentle month-over-month look at density coming back.',
  },
};

/** Convenience map kept for callers that only need the kind. */
export const TRACK_KIND: Record<TrackId, TrackKind> = Object.fromEntries(
  TRACK_IDS.map((id) => [id, TRACKS_META[id].kind]),
) as Record<TrackId, TrackKind>;

export const isTrackId = (v: string): v is TrackId => (TRACK_IDS as readonly string[]).includes(v);

export const defaultCadence = (id: TrackId): Cadence => TRACKS_META[id].cadence;
