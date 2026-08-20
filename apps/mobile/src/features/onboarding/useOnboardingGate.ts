import { useCallback, useEffect, useState } from 'react';

import { getDb } from '@/lib/db';
import { hasDecided } from '@/features/privacy/consent';
import { defaultCadence } from '@/lib/tracks';
import type { OnboardingResult } from './OnboardingFlow';

export type GateStatus = 'loading' | 'needed' | 'done';

/**
 * First-run gate: reads consent from the local store and decides whether onboarding is needed.
 * `complete()` persists the onboarding result and flips to 'done'.
 *
 * Note: until the op-sqlite driver lands, the store is in-memory, so every cold start shows
 * onboarding. Once persistence is real, a returning user skips straight to their garden.
 */
export function useOnboardingGate() {
  const [status, setStatus] = useState<GateStatus>('loading');

  useEffect(() => {
    let alive = true;
    getDb()
      .then((db) => db.getConsent())
      .then((consent) => {
        if (alive) setStatus(consent && hasDecided(consent) ? 'done' : 'needed');
      })
      .catch(() => {
        if (alive) setStatus('needed');
      });
    return () => {
      alive = false;
    };
  }, []);

  const complete = useCallback(async (result: OnboardingResult) => {
    const db = await getDb();
    await db.saveConsent(result.consent);
    for (const trackId of result.trackIds) {
      await db.upsertEnrollment({
        trackId,
        cadence: defaultCadence(trackId),
        enrolledAt: new Date().toISOString(),
      });
    }
    setStatus('done');
  }, []);

  return { status, complete };
}
