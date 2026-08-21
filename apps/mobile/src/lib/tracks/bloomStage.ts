// Maps a 0..100 bloom to a warm growth stage for the garden visual. Encouragement, never
// clinical — a low score is "sprouting", not "bad".

export interface BloomStage {
  key: 'seed' | 'sprout' | 'growing' | 'bud' | 'bloom' | 'full';
  emoji: string;
  label: string;
}

export function bloomStage(bloom: number | null): BloomStage {
  if (bloom === null) return { key: 'seed', emoji: '🌰', label: 'Ready to start' };
  if (bloom < 40) return { key: 'sprout', emoji: '🌱', label: 'Sprouting' };
  if (bloom < 60) return { key: 'growing', emoji: '🌿', label: 'Growing' };
  if (bloom < 75) return { key: 'bud', emoji: '🌷', label: 'Budding' };
  if (bloom < 90) return { key: 'bloom', emoji: '🌸', label: 'Blooming' };
  return { key: 'full', emoji: '🌺', label: 'Full bloom' };
}

/**
 * Spoken label for a bloom visual (VoiceOver). Turns the decorative emoji + number into one clear
 * phrase, e.g. "Recovery Healing, blooming, 80 out of 100" — never reads a raw emoji.
 */
export function bloomAccessibilityLabel(bloom: number | null, name?: string): string {
  const prefix = name ? `${name}, ` : '';
  if (bloom === null) return `${prefix}ready to start, no scans yet`;
  return `${prefix}${bloomStage(bloom).label.toLowerCase()}, ${bloom} out of 100`;
}
