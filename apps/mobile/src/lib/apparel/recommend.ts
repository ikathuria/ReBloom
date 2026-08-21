// Sensitivity → gentle-fabric guidance. Early-recovery skin is often hypersensitive (dry, red,
// reactive), so ReBloom suggests soft, breathable, non-irritating fabrics and flags irritating
// ones. Derived from the latest skin scan's scores. Encouragement + comfort, not medical advice.

import type { ConcernScores } from '@/lib/tracks/scoring';

export interface FabricTip {
  fabric: string;
  why: string;
}
export type SensitivityLevel = 'calm' | 'settling' | 'sensitive';
export interface FabricAdvice {
  /** 0..100, higher = more sensitive skin right now. */
  sensitivity: number;
  level: SensitivityLevel;
  recommended: FabricTip[];
  avoid: FabricTip[];
  note: string;
}

const val = (scores: ConcernScores, ...keys: string[]): number | undefined => {
  for (const k of keys) if (typeof scores[k] === 'number') return scores[k];
  return undefined;
};

const RECOMMEND: Record<SensitivityLevel, FabricTip[]> = {
  sensitive: [
    { fabric: 'Mulberry silk', why: 'Smooth and cool — almost no friction on tender skin.' },
    { fabric: 'Bamboo lyocell', why: 'Silky, breathable, and naturally moisture-wicking.' },
    { fabric: 'Modal / TENCEL', why: 'Soft, drapey, and gentle on reactive skin.' },
    { fabric: 'Combed organic cotton', why: 'Breathable with the short, scratchy fibres removed.' },
  ],
  settling: [
    { fabric: 'Bamboo', why: 'Soft and breathable while your barrier steadies.' },
    { fabric: 'Soft cotton', why: 'Airy and low-friction for everyday wear.' },
    { fabric: 'TENCEL', why: 'Smooth and temperature-regulating.' },
  ],
  calm: [
    { fabric: 'Cotton', why: 'Breathable and easy — your skin is handling more.' },
    { fabric: 'Linen', why: 'Cool and airy for warm days.' },
    { fabric: 'Bamboo', why: 'A soft, breathable everyday favourite.' },
  ],
};

const AVOID: Record<SensitivityLevel, FabricTip[]> = {
  sensitive: [
    { fabric: 'Wool', why: 'Coarse fibres can prickle and itch.' },
    { fabric: 'Polyester / nylon', why: 'Traps heat and sweat, which can flare redness.' },
    { fabric: 'Coarse linen', why: 'Stiff weave can rub tender spots.' },
  ],
  settling: [
    { fabric: 'Heavy synthetics', why: 'Less breathable — can trap heat and sweat.' },
    { fabric: 'Scratchy wool', why: 'May still irritate while things settle.' },
  ],
  calm: [{ fabric: 'Sweaty synthetics', why: 'Fine occasionally, but naturals stay comfier.' }],
};

const NOTE: Record<SensitivityLevel, string> = {
  sensitive: 'Your skin looks reactive right now — lean into the softest, most breathable fabrics.',
  settling: 'Your barrier is steadying. Soft, breathable fabrics keep it comfortable.',
  calm: 'Your skin looks calm — most breathable fabrics will feel good.',
};

export function recommendFabrics(scores: ConcernScores): FabricAdvice {
  // Lower ui_scores = more sensitive. Use redness / moisture / texture where present.
  const signals = [
    val(scores, 'hd_redness', 'redness'),
    val(scores, 'hd_moisture', 'moisture'),
    val(scores, 'hd_texture', 'texture'),
  ].filter((v): v is number => typeof v === 'number');

  const base = signals.length ? signals.reduce((a, b) => a + b, 0) / signals.length : 60;
  const sensitivity = Math.max(0, Math.min(100, Math.round(100 - base)));
  const level: SensitivityLevel = sensitivity >= 60 ? 'sensitive' : sensitivity >= 35 ? 'settling' : 'calm';

  return { sensitivity, level, recommended: RECOMMEND[level], avoid: AVOID[level], note: NOTE[level] };
}
