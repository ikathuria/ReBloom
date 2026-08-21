import { createInMemoryDb } from '@/lib/db/memory';
import { createMockPurchases, TIER_FLAG } from './mock';

describe('mock purchases provider', () => {
  it('starts free and unlocks pro after a purchase, persisting the tier', async () => {
    const db = createInMemoryDb();
    const p = createMockPurchases(async () => db);

    expect(await p.getTier()).toBe('free');

    const products = await p.getProducts();
    expect(products.length).toBeGreaterThan(0);

    const result = await p.purchasePro(products[0].id);
    expect(result.tier).toBe('pro');
    expect(await p.getTier()).toBe('pro');
    expect(await db.getFlag(TIER_FLAG)).toBe('pro');
  });

  it('restore reflects the persisted tier', async () => {
    const db = createInMemoryDb();
    await db.setFlag(TIER_FLAG, 'pro');
    const p = createMockPurchases(async () => db);
    expect(await p.restore()).toBe('pro');
  });

  it('notifies subscribers on a purchase and stops after unsubscribe', async () => {
    const db = createInMemoryDb();
    const p = createMockPurchases(async () => db);
    const seen: string[] = [];
    const unsub = p.subscribe((t) => seen.push(t));

    await p.purchasePro('rebloom_pro_monthly');
    unsub();
    await p.purchasePro('rebloom_pro_yearly');

    expect(seen).toEqual(['pro']); // only the pre-unsubscribe purchase
  });

  it('rejects an unknown product', async () => {
    const db = createInMemoryDb();
    const p = createMockPurchases(async () => db);
    await expect(p.purchasePro('not_a_product')).rejects.toThrow();
  });
});
