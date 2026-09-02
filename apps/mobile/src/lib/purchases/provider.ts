// App-wide purchases provider (its own leaf module so `index` and `usePurchases`
// don't form an import cycle — index re-exports both `getPurchases` and
// `useTier`, and `useTier` needs `getPurchases`).
//
// Stays on the local MOCK (fully demoable: a purchase flips a persisted flag and
// unlocks Pro) until the native RevenueCat SDK + store products are wired. Flip
// PURCHASES_REAL and construct createRevenueCatProvider(Purchases, key) here to
// go live — see lib/purchases/revenuecat for the (deferred) three-step swap.

import { getDb } from '@/lib/db';
import { createMockPurchases } from './mock';
import type { PurchasesProvider } from './types';

const PURCHASES_REAL = false;

let provider: PurchasesProvider | null = null;

export function getPurchases(): PurchasesProvider {
  if (!provider) {
    if (PURCHASES_REAL) {
      // require('react-native-purchases') + createRevenueCatProvider(...) once the SDK is installed.
      throw new Error('RevenueCat provider not wired yet — see lib/purchases/revenuecat.');
    }
    provider = createMockPurchases(getDb);
  }
  return provider;
}
