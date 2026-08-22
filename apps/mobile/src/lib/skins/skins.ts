// Garden "skins" — selectable visual vibes for the whole app. Each skin swaps the growth-stage
// emojis, the per-track pastel/earthy hue, and the journey identity emoji. One identity, three
// looks, so the user picks what feels like theirs (see the Appearance picker in the Account screen).
//
// Skins change *presentation only* — scores, tracks, privacy, and copy are untouched.

import { type BloomHue, hueFor } from '@/constants/theme';
import type { BloomStage } from '@/lib/tracks/bloomStage';
import { TRACK_IDS, type TrackId } from '@/lib/tracks';

export type SkinId = 'blooms' | 'grove' | 'harvest';
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

// --- Harvest (seed → fruit orchard) — warm, playful, a satisfying "grows into fruit" payoff -------
const HARVEST: Skin = {
  id: 'harvest',
  name: 'Harvest',
  blurb: 'Sun-ripened orchard',
  previewEmoji: '🍎',
  stageEmoji: { seed: '🌰', sprout: '🌱', growing: '🌿', bud: '🌼', bloom: '🍏', full: '🍎' },
  trackEmoji: {
    recovery: '🍏',
    acne: '🍑',
    redness: '🍓',
    hydration: '🫐',
    'dark-spots': '🍋',
    'under-eye': '🍇',
    'hair-regrowth': '🌰',
  },
  hues: hues(
    {
      recovery: { bg: '#DDECC9', ink: '#4E6B24' },
      acne: { bg: '#FBD9C0', ink: '#9A4E2A' },
      redness: { bg: '#F8D3D0', ink: '#A83A3F' },
      hydration: { bg: '#D9E2F3', ink: '#3A4E86' },
      'dark-spots': { bg: '#F6ECC0', ink: '#7E6A18' },
      'under-eye': { bg: '#E6D9F0', ink: '#5B3E7A' },
      'hair-regrowth': { bg: '#ECE0C6', ink: '#7A5A24' },
    },
    {
      recovery: { bg: '#2A331C', ink: '#C4D89A' },
      acne: { bg: '#382619', ink: '#F2B790' },
      redness: { bg: '#37232A', ink: '#F0AEB2' },
      hydration: { bg: '#212B3E', ink: '#AEBEE6' },
      'dark-spots': { bg: '#322E18', ink: '#E7D48C' },
      'under-eye': { bg: '#2C2338', ink: '#CDB6E6' },
      'hair-regrowth': { bg: '#322B1C', ink: '#E2CA96' },
    },
  ),
};

export const SKINS: Record<SkinId, Skin> = { blooms: BLOOMS, grove: GROVE, harvest: HARVEST };
export const SKIN_IDS = ['blooms', 'grove', 'harvest'] as const;
export const DEFAULT_SKIN: Skin = BLOOMS;

export const isSkinId = (v: string): v is SkinId => (SKIN_IDS as readonly string[]).includes(v);
