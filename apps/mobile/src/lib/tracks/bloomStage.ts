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
