// Scan orchestration (the M3 "heart"): one skin photo → analyze the union of enrolled skin
// tracks' concerns in a single call → fan out to a bloom per track → persist encrypted
// track_points. Pure and injectable, so it's fully unit-tested with a mock provider + in-memory db.

import * as Crypto from 'expo-crypto';

import type { AnalysisProvider } from '@/lib/analysis';
import type { ReBloomDb } from '@/lib/db';
import { TRACKS_META, TRACK_KIND, type TrackId } from '@/lib/tracks';
import { bloomsForScan, skinUnionConcerns, type ConcernScores } from '@/lib/tracks/scoring';

export interface TrackBloom {
  trackId: TrackId;
  bloom: number;
}

export interface ScanResult {
  capturedAt: string;
  blooms: TrackBloom[];
}

export interface RunScanParams {
  imageUri: string;
  provider: AnalysisProvider;
  db: ReBloomDb;
  /** Injected for tests. */
  now?: () => Date;
  genId?: () => string;
}

const pickTrackScores = (trackId: TrackId, scores: ConcernScores): ConcernScores => {
  const out: ConcernScores = {};
  for (const c of TRACKS_META[trackId].concerns) if (c in scores) out[c] = scores[c];
  return out;
};

export async function runSkinScan({
  imageUri,
  provider,
  db,
  now = () => new Date(),
  genId = () => Crypto.randomUUID(),
}: RunScanParams): Promise<ScanResult> {
  const capturedAt = now().toISOString();

  const skinTrackIds = (await db.listEnrollments())
    .map((e) => e.trackId)
    .filter((id) => TRACK_KIND[id] === 'skin');
  if (skinTrackIds.length === 0) return { capturedAt, blooms: [] };

  const scores = await provider.analyzeSkin(imageUri, skinUnionConcerns(skinTrackIds));
  const bloomMap = bloomsForScan(skinTrackIds, scores);

  const blooms: TrackBloom[] = [];
  for (const trackId of Object.keys(bloomMap) as TrackId[]) {
    const bloom = bloomMap[trackId];
    await db.addTrackPoint({
      id: genId(),
      trackId,
      capturedAt,
      scores: pickTrackScores(trackId, scores),
      bloom,
    });
    blooms.push({ trackId, bloom });
  }
  return { capturedAt, blooms };
}
