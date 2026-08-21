// Hair scan orchestration: one scalp photo → density grade → hair bloom → persist one encrypted
// track_point for the hair-regrowth track. Separate from the skin fan-out (hair is its own capture).

import * as Crypto from 'expo-crypto';

import type { AnalysisProvider } from '@/lib/analysis';
import type { ReBloomDb } from '@/lib/db';
import { hairBloom } from '@/lib/tracks/hairBloom';

const HAIR_TRACK = 'hair-regrowth' as const;

export interface HairScanResult {
  capturedAt: string;
  grade: number;
  bloom: number;
}

export interface RunHairScanParams {
  imageBase64: string;
  analyzer: AnalysisProvider;
  db: ReBloomDb;
  now?: () => Date;
  genId?: () => string;
}

export async function runHairScan({
  imageBase64,
  analyzer,
  db,
  now = () => new Date(),
  genId = () => Crypto.randomUUID(),
}: RunHairScanParams): Promise<HairScanResult> {
  const { grade } = await analyzer.analyzeHair(imageBase64);
  const bloom = hairBloom(grade);
  const capturedAt = now().toISOString();
  await db.addTrackPoint({
    id: genId(),
    trackId: HAIR_TRACK,
    capturedAt,
    scores: { hair_density: bloom },
    bloom,
  });
  return { capturedAt, grade, bloom };
}
