import { getSupabase } from '@/lib/supabase/client';
import type { AnalysisProvider, SkinScores } from './types';

/**
 * Real provider — sends the image + concerns to the analyze-skin Edge Function, which proxies
 * Perfect Corp's YouCam Skin Analysis server-side (key never on the client) and returns scores.
 */
export function createPerfectCorpProvider(): AnalysisProvider {
  return {
    async analyzeSkin(imageBase64, concerns) {
      const { data, error } = await getSupabase().functions.invoke('analyze-skin', {
        body: { imageBase64, contentType: 'image/jpeg', concerns },
      });
      if (error) throw error;
      const scores = (data as { scores?: SkinScores } | null)?.scores;
      if (!scores) throw new Error('analyze-skin returned no scores');
      return scores;
    },
  };
}
