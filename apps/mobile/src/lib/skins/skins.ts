// Garden "skins" — selectable visual vibes for the whole app. Each skin swaps the growth-stage
// emojis, the per-track pastel/earthy hue, and the journey identity emoji. One identity, three
// looks, so the user picks what feels like theirs (see the Appearance picker in the Account screen).
//
// Skins change *presentation only* — scores, tracks, privacy, and copy are untouched.

import { type BloomHue, hueFor } from '@/constants/theme';
import type { BloomStage } from '@/lib/tracks/bloomStage';
import { TRACK_IDS, type TrackId } from '@/lib/tracks';

export type SkinId = 'blooms' | 'grove' | 'zen' | 'custom';
export type StageKey = BloomStage['key'];

export interface Skin {
  id: SkinId;
  name: string;
  blurb: string;
  /** Shown in the picker + as the tab icon vibe. */
  previewEmoji: string;
  /** Growth-stage emoji, keyed by bloom stage (seed → full). */
  stageEmoji: Record<StageKey, string>;
  /** Identity emoji per journey (pickers, onboarding + add-journey chips). */
  trackEmoji: Record<TrackId, string>;
  /** Per-track card colors, per color scheme. */
  hues: { light: Record<TrackId, BloomHue>; dark: Record<TrackId, BloomHue> };
}

type Hues = Record<TrackId, BloomHue>;
const hues = (light: Hues, dark: Hues) => ({ light, dark });

// --- Blooms (soft florals) — reuses the base pastel palette from constants/theme -----------------
const bloomsHues = (scheme: 'light' | 'dark'): Hues =>
  Object.fromEntries(TRACK_IDS.map((id) => [id, hueFor(id, scheme)])) as Hues;

const BLOOMS: Skin = {
  id: 'blooms',
  name: 'Blooms',
  blurb: 'Soft florals & pastels',
  previewEmoji: '🌸',
  stageEmoji: { seed: '🌰', sprout: '🌱', growing: '🌿', bud: '🌷', bloom: '🌸', full: '🌺' },
  trackEmoji: {
    recovery: '🌸',
    acne: '🌼',
    redness: '🌺',
    hydration: '💧',
    'dark-spots': '✨',
    'under-eye': '🌙',
    'hair-regrowth': '🌿',
  },
  hues: hues(bloomsHues('light'), bloomsHues('dark')),
};

// --- Grove (earthy trees & plants) — the gender-neutral, plant-parent palette --------------------
const GROVE: Skin = {
  id: 'grove',
  name: 'Grove',
  blurb: 'Earthy trees & foliage',
  previewEmoji: '🌳',
  stageEmoji: { seed: '🌰', sprout: '🌱', growing: '🌿', bud: '🪴', bloom: '🌳', full: '🌲' },
  trackEmoji: {
    recovery: '🌿',
    acne: '🌱',
    redness: '🍃',
    hydration: '💧',
    'dark-spots': '☀️',
    'under-eye': '🌙',
    'hair-regrowth': '🌳',
  },
  hues: hues(
    {
      recovery: { bg: '#DDE9D3', ink: '#45702F' },
      acne: { bg: '#F2DDC7', ink: '#96562C' },
      redness: { bg: '#E4E7CE', ink: '#5E6B2C' },
      hydration: { bg: '#D0E7EA', ink: '#1E6E7A' },
      'dark-spots': { bg: '#F0E6C6', ink: '#7E5F18' },
      'under-eye': { bg: '#DCE2EA', ink: '#3E4E68' },
      'hair-regrowth': { bg: '#D6E3D0', ink: '#3C6B3A' },
    },
    {
      recovery: { bg: '#24301C', ink: '#B4D69A' },
      acne: { bg: '#34271C', ink: '#E7B489' },
      redness: { bg: '#2C301E', ink: '#C3CE93' },
      hydration: { bg: '#16302F', ink: '#8FD3D6' },
      'dark-spots': { bg: '#322B18', ink: '#E4CB8A' },
      'under-eye': { bg: '#222833', ink: '#AEBBD2' },
      'hair-regrowth': { bg: '#223020', ink: '#A9CCA0' },
    },
  ),
};

// --- Zen (quiet stone, moss & sand) — a calm, low-saturation minimalist garden --------------------
const ZEN: Skin = {
  id: 'zen',
  name: 'Zen',
  blurb: 'Quiet stone & moss',
  previewEmoji: '🎋',
  stageEmoji: { seed: '🪨', sprout: '🌱', growing: '🌿', bud: '🎋', bloom: '🪴', full: '🌳' },
  trackEmoji: {
    recovery: '🍃',
    acne: '🌿',
    redness: '🪷',
    hydration: '💧',
    'dark-spots': '🪨',
    'under-eye': '🌙',
    'hair-regrowth': '🎋',
  },
  // Muted, near-monochromatic earth tones — the palette carries the calm, minimal feel.
  hues: hues(
    {
      recovery: { bg: '#DDE4D6', ink: '#4A5B3E' },
      acne: { bg: '#E9E1D3', ink: '#6E5E45' },
      redness: { bg: '#E7DEDA', ink: '#7A5952' },
      hydration: { bg: '#DCE5E6', ink: '#45605F' },
      'dark-spots': { bg: '#E9E3D6', ink: '#6B5C3E' },
      'under-eye': { bg: '#DBE0E7', ink: '#46536B' },
      'hair-regrowth': { bg: '#DEE5DA', ink: '#4C6144' },
    },
    {
      recovery: { bg: '#232A1E', ink: '#B6C4A6' },
      acne: { bg: '#2C2820', ink: '#D8C7A9' },
      redness: { bg: '#2C2523', ink: '#D4B8B0' },
      hydration: { bg: '#202B2B', ink: '#A9C4C3' },
      'dark-spots': { bg: '#2B271E', ink: '#D6C6A6' },
      'under-eye': { bg: '#22262E', ink: '#AAB4C6' },
      'hair-regrowth': { bg: '#232B20', ink: '#B2C2A6' },
    },
  ),
};

// --- Custom (Pro) — the user picks their own growth emoji per stage ------------------------------
// The colors + journey emojis inherit from Grove (a calm, neutral base), so a Pro user only
// personalizes the fun part: the growth-stage emojis. Its `stageEmoji` here are the *starting*
// defaults; the live values are the user's saved choices, merged in by SkinProvider.
const CUSTOM: Skin = {
  ...GROVE,
  id: 'custom',
  name: 'Custom',
  blurb: 'Your own emojis',
  previewEmoji: '✨',
  stageEmoji: { ...GROVE.stageEmoji },
};

/** Order + friendly labels for the six growth stages (used by the Pro emoji editor). */
export const STAGE_ORDER: StageKey[] = ['seed', 'sprout', 'growing', 'bud', 'bloom', 'full'];
export const STAGE_LABELS: Record<StageKey, string> = {
  seed: 'Seed',
  sprout: 'Sprouting',
  growing: 'Growing',
  bud: 'Budding',
  bloom: 'Blooming',
  full: 'Full bloom',
};

/** A generous, varied palette the Pro emoji editor offers for each stage. */
export const EMOJI_PALETTE: string[] = [
  '🌱', '🌿', '🍀', '🍃', '🌳', '🌲', '🎋', '🪴', '🌵',
  '🌸', '🌼', '🌺', '🌷', '🌻', '🪷', '💐',
  '⭐', '🌙', '✨', '💫', '🔥', '🌈', '☀️', '💧', '❄️',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🍎', '🍓', '🫐', '🍋', '🐢', '🦋', '🐝', '💎', '👑',
];

export const SKINS: Record<SkinId, Skin> = { blooms: BLOOMS, grove: GROVE, zen: ZEN, custom: CUSTOM };
export const SKIN_IDS = ['blooms', 'grove', 'zen', 'custom'] as const;
export const DEFAULT_SKIN: Skin = BLOOMS;

export const isSkinId = (v: string): v is SkinId => (SKIN_IDS as readonly string[]).includes(v);

