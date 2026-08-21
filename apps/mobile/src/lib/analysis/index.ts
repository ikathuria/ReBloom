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
