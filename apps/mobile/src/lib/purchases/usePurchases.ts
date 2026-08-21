import { useCallback, useEffect, useState } from 'react';

import { getPurchases } from './index';
import type { Tier } from './types';

/**
 * Reactive entitlement tier. Reads the current tier from the app's purchases provider and
 * re-renders on any change (a purchase or restore), so gated UI unlocks immediately.
 */
export function useTier(): { tier: Tier; loading: boolean; refresh: () => void } {
  const [tier, setTier] = useState<Tier>('free');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    getPurchases()
      .getTier()
      .then(setTier)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let alive = true;
    const purchases = getPurchases();
    purchases.getTier().then((t) => {
      if (!alive) return;
      setTier(t);
      setLoading(false);
    });
    const unsubscribe = purchases.subscribe((t) => alive && setTier(t));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return { tier, loading, refresh };
}
