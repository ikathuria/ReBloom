/**
 * ReBloom "Bloom Board" design tokens.
 *
 * Direction: a Pinterest-style garden with a warm, Gen-Z palette — playful pastel cards, chunky
 * rounded type, and a soft, encouraging voice. Calm and private at its core, never clinical.
 *
 * Palette is a warm paper ground + a hopeful green ("the bloom") as the soul, plus a set of soft
 * pastel hues — one per journey — for that colorful board energy. Type pairs Fredoka (rounded
 * display) with Nunito (warm, readable body); both load at runtime (see app/_layout.tsx).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#241E1B', // warm near-black
    background: '#FBF7F2', // warm paper ground
    backgroundElement: '#FFFFFF', // cards / surfaces
    backgroundSelected: '#EFE7DD', // warm line / track / pressed
    textSecondary: '#8C8179', // warm muted
    // ReBloom semantic tokens
    card: '#FFFFFF',
    line: '#EFE7DD',
    bloom: '#2FA36B', // the soul: hopeful green
    bloomDeep: '#1E7A4E', // green that reads on the warm ground
    bloomSoft: '#EAF7F0', // tinted fill for selected / highlighted rows
    coral: '#FF7A59', // gen-z pop accent (sparingly)
    danger: '#C0392B',
  },
  dark: {
    text: '#F5EEE6',
    background: '#17120F', // warm near-black-brown
    backgroundElement: '#241E19', // cards / surfaces
    backgroundSelected: '#322A23',
    textSecondary: '#A89A8C',
    card: '#241E19',
    line: '#322A23',
    bloom: '#3DBE81',
    bloomDeep: '#7FE0AE',
    bloomSoft: '#1B3328',
    coral: '#FF8A6B',
    danger: '#E5766A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Soft pastel hues, one assigned per journey — the colorful "board" energy. Each hue is a card
 * background + an ink color that reads on it (used for the name, score, and progress fill).
 */
export interface BloomHue {
  bg: string;
  ink: string;
}

export const BloomHues = {
  light: {
    mint: { bg: '#CFF3E0', ink: '#1E7A4E' },
    peach: { bg: '#FFDDCB', ink: '#8A431F' },
    rose: { bg: '#FBD6E4', ink: '#A02B5C' },
    sky: { bg: '#D6ECFB', ink: '#1E5F8A' },
    butter: { bg: '#FCEECB', ink: '#8A6516' },
    lilac: { bg: '#E7DEFB', ink: '#5140A0' },
    sage: { bg: '#DDEFD3', ink: '#3E6B2E' },
  },
  dark: {
    mint: { bg: '#1E332A', ink: '#9FE7C2' },
    peach: { bg: '#3A2A22', ink: '#F2C4A8' },
    rose: { bg: '#3A2430', ink: '#F2B6CE' },
    sky: { bg: '#1E2E3A', ink: '#A9D6F2' },
    butter: { bg: '#35301E', ink: '#ECD79A' },
    lilac: { bg: '#2C2740', ink: '#C9BEF5' },
    sage: { bg: '#26331E', ink: '#B8DFA3' },
  },
} as const;

export type BloomHueName = keyof typeof BloomHues.light;
export type Scheme = 'light' | 'dark';

/** Stable, distinct hue per launch track. Falls back to mint for anything unmapped. */
const TRACK_HUE: Record<string, BloomHueName> = {
  recovery: 'mint',
  acne: 'peach',
  redness: 'rose',
  hydration: 'sky',
  'dark-spots': 'butter',
  'under-eye': 'lilac',
  'hair-regrowth': 'sage',
};

export function hueFor(trackId: string, scheme: Scheme): BloomHue {
  const name = TRACK_HUE[trackId] ?? 'mint';
  return BloomHues[scheme][name];
}

/** Rounded, friendly type (Fredoka) + warm readable body (Nunito). Loaded in app/_layout.tsx. */
export const Fonts = {
  display: 'Fredoka_600SemiBold',
  displayMedium: 'Fredoka_500Medium',
  displayBold: 'Fredoka_700Bold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemibold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtra: 'Nunito_800ExtraBold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }) as string,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Chunky rounded corners are core to the look. */
export const Radius = {
  sm: 14,
  md: 20,
  lg: 26,
  xl: 30,
  pill: 999,
} as const;

/** Soft, warm-tinted shadow used on cards and the primary CTA. */
export const softShadow = {
  shadowColor: '#5A3A1E',
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 4,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
