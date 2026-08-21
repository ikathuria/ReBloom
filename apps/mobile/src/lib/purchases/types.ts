// Monetization contracts (M8). ReBloom is freemium: Free = one journey at a capped (monthly)
// cadence; Pro = every journey, each at its natural cadence, plus the apparel try-on.
//
// A PurchasesProvider hides the payment vendor behind an interface — the same seam as
// lib/analysis. The app runs on the in-memory MOCK provider (fully demoable: a "purchase" flips
// a persisted flag and unlocks Pro), and the real RevenueCat/StoreKit adapter (lib/purchases/
// revenuecat) swaps in via dependency injection once the native SDK + store products exist.

export type Tier = 'free' | 'pro';

/** A purchasable Pro plan shown on the paywall. */
export interface ProProduct {
  id: string;
  /** Localized display price, e.g. "$5.99". */
  priceString: string;
  period: 'monthly' | 'yearly';
  /** Short marketing line, e.g. "billed yearly — save 30%". */
  tagline?: string;
}

export interface PurchaseResult {
  tier: Tier;
  /** True when the user backed out of the purchase sheet (not an error). */
  cancelled?: boolean;
}

/** The payment surface the app depends on. Implemented by the mock + the RevenueCat adapter. */
export interface PurchasesProvider {
  /** Current entitlement tier. */
  getTier(): Promise<Tier>;
  /** Plans to show on the paywall. */
  getProducts(): Promise<ProProduct[]>;
  /** Start a purchase; resolves with the resulting tier (or `cancelled`). */
  purchasePro(productId: string): Promise<PurchaseResult>;
  /** Restore prior purchases (App Store "Restore"). */
  restore(): Promise<Tier>;
  /** Subscribe to tier changes across the app; returns an unsubscribe fn. */
  subscribe(listener: (tier: Tier) => void): () => void;
}
