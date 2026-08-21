import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getDb } from '@/lib/db';
import { TRACKS_META, TRACK_KIND, type TrackId, type TrackKind } from '@/lib/tracks';

export interface GardenEntry {
  trackId: TrackId;
  name: string;
  kind: TrackKind;
  sensitive: boolean;
  bloom: number | null;
  lastScanAt: string | null;
  scanCount: number;
}

/** Loads the enrolled tracks with their latest bloom; reloads whenever the garden is focused
 *  (so a fresh scan shows up on return). */
export function useGarden() {
  const [entries, setEntries] = useState<GardenEntry[] | null>(null);

  const load = useCallback(async () => {
    const db = await getDb();
    const enrollments = await db.listEnrollments();
    const out: GardenEntry[] = [];
    for (const e of enrollments) {
      const points = await db.listTrackPoints(e.trackId);
      const latest = points.length ? points[points.length - 1] : null;
      out.push({
        trackId: e.trackId,
        name: TRACKS_META[e.trackId].name,
        kind: TRACK_KIND[e.trackId],
        sensitive: Boolean(TRACKS_META[e.trackId].sensitive),
        bloom: latest?.bloom ?? null,
        lastScanAt: latest?.capturedAt ?? null,
        scanCount: points.length,
      });
    }
    setEntries(out);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { entries, reload: load };
}
