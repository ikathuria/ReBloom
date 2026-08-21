import { runHairScan } from './runHairScan';
import { createInMemoryDb } from '@/lib/db';
import type { AnalysisProvider } from '@/lib/analysis';

const analyzerGrade = (grade: number): AnalysisProvider => ({
  async analyzeSkin() {
    return {};
  },
  async analyzeHair() {
    return { grade };
  },
});

describe('runHairScan', () => {
  it('maps a density grade to a hair bloom and stores one hair-regrowth point', async () => {
    const db = createInMemoryDb();
    const result = await runHairScan({
      imageBase64: 'ZmFrZQ==',
      analyzer: analyzerGrade(3),
      db,
      now: () => new Date('2026-08-21T10:00:00.000Z'),
      genId: () => 'h1',
    });

    expect(result).toMatchObject({ grade: 3, bloom: 78 });
    const points = await db.listTrackPoints('hair-regrowth');
    expect(points).toHaveLength(1);
    expect(points[0].bloom).toBe(78);
    expect(points[0].scores).toEqual({ hair_density: 78 });
  });
});
