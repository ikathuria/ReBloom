// The seam between ReBloom and its AI vendor. Skin + hair analysis are ALWAYS accessed through
// this interface (never Perfect Corp directly from a feature) so the sole vendor can be swapped
// without touching UI/domain code. See PLAN.md risks (vendor concentration).

import type { ConcernScores } from '@/lib/tracks/scoring';

export type SkinScores = ConcernScores;

export interface AnalysisProvider {
  /**
   * Analyze a base64-encoded skin photo for the given YouCam concern keys → per-concern
   * ui_scores (1..100, higher = healthier). The real implementation proxies through the
   * analyze-skin Edge Function; the mock returns plausible scores for local dev and demos.
   */
  analyzeSkin(imageBase64: string, concerns: string[]): Promise<SkinScores>;
}
