import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { AnalysisProvider } from './types';
import { createMockProvider } from './mock';
import { createPerfectCorpProvider } from './perfectcorp';

export * from './types';
export { createMockProvider, createPerfectCorpProvider };

// App-wide provider: the real Perfect Corp proxy once Supabase is configured, else the mock
// (so the app runs and demos offline / before the backend is set up).
let provider: AnalysisProvider | null = null;

export function getAnalysisProvider(): AnalysisProvider {
  if (!provider) provider = isSupabaseConfigured ? createPerfectCorpProvider() : createMockProvider();
  return provider;
}

// Hair analysis stays on the mock until the YouCam Hair Density endpoint is confirmed in the
// sandbox (the public reference doesn't list it yet — see supabase/functions/analyze-hair).
// Flip to `true` once `analyze-hair` is verified end-to-end, and hair goes real with no other change.
const HAIR_ANALYSIS_REAL = false;

export function getHairAnalyzer(): AnalysisProvider {
  return HAIR_ANALYSIS_REAL && isSupabaseConfigured ? getAnalysisProvider() : createMockProvider();
}
