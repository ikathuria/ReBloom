import type { AnalysisProvider, SkinScores } from './types';

/**
 * Mock analysis — returns plausible, healthy-leaning scores (60..95) for the requested concerns,
 * after a short delay so the UI feels like it's working. Ignores the image. Used until the real
 * analyze-skin Edge Function is wired (M3 part 3). Deterministic given a seed (for tests).
 */
export function createMockProvider(seed = Date.now()): AnalysisProvider {
  let n = seed % 0x7fffffff;
  const rand = () => {
    n = (n * 1103515245 + 12345) & 0x7fffffff;
    return n / 0x7fffffff;
  };
  return {
    async analyzeSkin(_imageBase64, concerns) {
      await new Promise((r) => setTimeout(r, 900));
      const scores: SkinScores = {};
      for (const c of concerns) scores[c] = 60 + Math.round(rand() * 35);
      return scores;
    },
  };
}
