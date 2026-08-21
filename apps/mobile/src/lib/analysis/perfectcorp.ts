import { getSupabase } from '@/lib/supabase/client';
import type { AnalysisProvider, HairScores, SkinScores } from './types';

/**
 * Real provider — sends the image to an Edge Function that proxies Perfect Corp's YouCam APIs
 * server-side (key never on the client) and returns scores.
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
    async analyzeHair(imageBase64) {
      const { data, error } = await getSupabase().functions.invoke('analyze-hair', {
        body: { imageBase64, contentType: 'image/jpeg' },
      });
      if (error) throw error;
      const grade = (data as { grade?: number } | null)?.grade;
      if (typeof grade !== 'number') throw new Error('analyze-hair returned no grade');
      return { grade } as HairScores;
    },
  };
}
