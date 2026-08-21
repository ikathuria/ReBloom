import { runSkinScan } from './runScan';
import { createInMemoryDb } from '@/lib/db';
import type { AnalysisProvider } from '@/lib/analysis';

// Fixed provider returning the real M0 scan scores, so blooms are deterministic.
const fixedProvider: AnalysisProvider = {
  async analyzeSkin() {
    return {
      hd_moisture: 71,
      hd_redness: 80,
      hd_radiance: 81,
      hd_texture: 79,
      hd_age_spot: 93,
      hd_acne: 85,
      hd_oiliness: 80,
      hd_pore: 61,
    };
  },
};

async function seedEnrollments(db: ReturnType<typeof createInMemoryDb>, ids: string[]) {
  for (const trackId of ids) {
    await db.upsertEnrollment({ trackId: trackId as never, cadence: 'weekly', enrolledAt: '2026-08-12T00:00:00.000Z' });
  }
}

describe('runSkinScan', () => {
  let counter = 0;
  const deps = () => ({
    imageBase64: 'ZmFrZQ==',
    provider: fixedProvider,
    now: () => new Date('2026-08-20T10:00:00.000Z'),
    genId: () => `id-${counter++}`,
  });

  beforeEach(() => (counter = 0));

  it('fans one scan out to enrolled skin tracks and persists a point per track', async () => {
    const db = createInMemoryDb();
    await seedEnrollments(db, ['recovery', 'acne', 'hair-regrowth']);

    const result = await runSkinScan({ db, ...deps() });

    // hair excluded; recovery + acne get the M0 blooms
    expect(result.blooms.sort((a, b) => a.trackId.localeCompare(b.trackId))).toEqual([
      { trackId: 'acne', bloom: 77 },
      { trackId: 'recovery', bloom: 81 },
    ]);

    const recPoints = await db.listTrackPoints('recovery');
    expect(recPoints).toHaveLength(1);
    expect(recPoints[0].bloom).toBe(81);
    expect(recPoints[0].scores).toHaveProperty('hd_moisture', 71); // only this track's concerns
    expect(recPoints[0].scores).not.toHaveProperty('hd_acne');
    expect(await db.listTrackPoints('hair-regrowth')).toHaveLength(0);
  });

  it('no-ops cleanly when no skin tracks are enrolled', async () => {
    const db = createInMemoryDb();
    await seedEnrollments(db, ['hair-regrowth']);
    const result = await runSkinScan({ db, ...deps() });
    expect(result.blooms).toEqual([]);
  });
});
