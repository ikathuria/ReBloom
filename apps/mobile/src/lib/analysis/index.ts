import type { AnalysisProvider } from './types';
import { createMockProvider } from './mock';

export * from './types';
export { createMockProvider };

// App-wide provider. TODO(M3 part 3): return a PerfectCorpProvider that calls the
// analyze-skin Supabase Edge Function; keep the mock for tests/web/offline demos.
let provider: AnalysisProvider | null = null;

export function getAnalysisProvider(): AnalysisProvider {
  if (!provider) provider = createMockProvider();
  return provider;
}
