import { getDb } from '@/lib/db';
import { createMockPurchases } from './mock';
import type { PurchasesProvider } from './types';

export * from './types';
export * from './entitlement';
export { createMockPurchases, TIER_FLAG } from './mock';
export { createRevenueCatProvider, PRO_ENTITLEMENT } from './revenuecat';
export { useTier } from './usePurchases';

// App-wide purchases provider. Stays on the local MOCK (fully demoable: a purchase flips a
// persisted flag and unlocks Pro) until the native RevenueCat SDK + store products are wired.
// Flip PURCHASES_REAL and construct createRevenueCatProvider(Purchases, key) here to go live —
// see lib/purchases/revenuecat for the (deferred) three-step swap.
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
