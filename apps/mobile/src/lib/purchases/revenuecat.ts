// Real RevenueCat / StoreKit adapter for the PurchasesProvider seam.
//
// Deliberately dependency-injected: it takes the `react-native-purchases` module as an argument
// rather than importing it, so this file compiles and the JS bundle builds WITHOUT the native
// package installed. Going live is a three-step swap, deferred to pre-submit (needs a paid
// RevenueCat account, App Store Connect products, and a native dev build — same class of deferral
// as Sign in with Apple in M7):
//
//   1. `npx expo install react-native-purchases` and rebuild the dev client.
//   2. In lib/purchases/index.ts set PURCHASES_REAL = true and pass the RC public SDK key.
//   3. Configure the `pro` entitlement + products in the RevenueCat dashboard.
//
// The adapter logic below is the genuine mapping (entitlement -> tier, offerings -> products);
// only the module wiring is deferred.

import type { ProProduct, PurchaseResult, PurchasesProvider, Tier } from './types';

/** The entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = 'pro';

// Minimal structural view of the `react-native-purchases` default export — just what we use.
export interface RevenueCatPackage {
  identifier: string;
  product: { identifier: string; priceString: string };
  packageType?: string;
}
export interface RevenueCatCustomerInfo {
  entitlements: { active: Record<string, unknown> };
}
export interface RevenueCatModule {
  configure(opts: { apiKey: string; appUserID?: string | null }): void;
  getCustomerInfo(): Promise<RevenueCatCustomerInfo>;
  getOfferings(): Promise<{ current?: { availablePackages: RevenueCatPackage[] } | null }>;
  purchasePackage(pkg: RevenueCatPackage): Promise<{ customerInfo: RevenueCatCustomerInfo }>;
  restorePurchases(): Promise<RevenueCatCustomerInfo>;
  addCustomerInfoUpdateListener(cb: (info: RevenueCatCustomerInfo) => void): void;
  removeCustomerInfoUpdateListener(cb: (info: RevenueCatCustomerInfo) => void): void;
}

const tierOf = (info: RevenueCatCustomerInfo): Tier =>
  info.entitlements.active[PRO_ENTITLEMENT] ? 'pro' : 'free';

const periodOf = (pkg: RevenueCatPackage): ProProduct['period'] =>
  (pkg.packageType ?? '').toUpperCase() === 'ANNUAL' ? 'yearly' : 'monthly';

/** Build a PurchasesProvider backed by a configured RevenueCat SDK instance. */
export function createRevenueCatProvider(Purchases: RevenueCatModule, apiKey: string): PurchasesProvider {
  Purchases.configure({ apiKey });

  return {
    async getTier() {
      return tierOf(await Purchases.getCustomerInfo());
    },
    async getProducts() {
      const offerings = await Purchases.getOfferings();
      const packages = offerings.current?.availablePackages ?? [];
      return packages.map<ProProduct>((pkg) => ({
        id: pkg.identifier,
        priceString: pkg.product.priceString,
        period: periodOf(pkg),
      }));
    },
    async purchasePro(productId: string): Promise<PurchaseResult> {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find((p) => p.identifier === productId);
      if (!pkg) throw new Error(`unknown package: ${productId}`);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return { tier: tierOf(customerInfo) };
      } catch (e) {
        if ((e as { userCancelled?: boolean }).userCancelled) return { tier: 'free', cancelled: true };
        throw e;
      }
    },
    async restore() {
      return tierOf(await Purchases.restorePurchases());
    },
    subscribe(listener) {
      const cb = (info: RevenueCatCustomerInfo) => listener(tierOf(info));
      Purchases.addCustomerInfoUpdateListener(cb);
      return () => Purchases.removeCustomerInfoUpdateListener(cb);
    },
  };
}
