// In-memory / local mock purchases provider. Persists the entitlement tier in the encrypted
// local store (a db flag), so a "purchase" survives reloads and the whole freemium flow is
// demoable on the Simulator without StoreKit. No real money moves here.

import type { ReBloomDb } from '@/lib/db';
import type { ProProduct, PurchaseResult, PurchasesProvider, Tier } from './types';

export const TIER_FLAG = 'entitlement_tier';

/** Demo plans mirroring the intended App Store products (see PLAN.md monetization). */
const PRODUCTS: ProProduct[] = [
  { id: 'rebloom_pro_yearly', priceString: '$49.99', period: 'yearly', tagline: 'Best value — under $4.20/mo' },
  { id: 'rebloom_pro_monthly', priceString: '$5.99', period: 'monthly' },
];

export function createMockPurchases(getDbFn: () => Promise<ReBloomDb>): PurchasesProvider {
  const listeners = new Set<(tier: Tier) => void>();

  const readTier = async (): Promise<Tier> => {
    const db = await getDbFn();
    return (await db.getFlag(TIER_FLAG)) === 'pro' ? 'pro' : 'free';
  };

  const writeTier = async (tier: Tier): Promise<void> => {
    const db = await getDbFn();
    await db.setFlag(TIER_FLAG, tier);
    listeners.forEach((l) => l(tier));
  };

  return {
    getTier: readTier,
    async getProducts() {
      return PRODUCTS;
    },
    async purchasePro(productId: string): Promise<PurchaseResult> {
      if (!PRODUCTS.some((p) => p.id === productId)) {
        throw new Error(`unknown product: ${productId}`);
      }
      await writeTier('pro');
      return { tier: 'pro' };
    },
    async restore() {
      return readTier();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
