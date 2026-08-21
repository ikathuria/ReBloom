import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getDb } from '@/lib/db';
import { TRACK_KIND } from '@/lib/tracks';
import type { ConcernScores } from '@/lib/tracks/scoring';

// undefined = loading; null = no skin scans yet; else = merged latest skin scores.
type ApparelScores = ConcernScores | null | undefined;

/** Merge the most recent score per concern across the enrolled skin tracks' latest points. */
export function useApparel(): ApparelScores {
  const [scores, setScores] = useState<ApparelScores>(undefined);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const db = await getDb();
        const enrollments = await db.listEnrollments();
        const skinIds = enrollments.map((e) => e.trackId).filter((id) => TRACK_KIND[id] === 'skin');
        const merged: ConcernScores = {};
        let any = false;
        for (const id of skinIds) {
          const latest = await db.latestTrackPoint(id);
          if (latest) {
            any = true;
            Object.assign(merged, latest.scores);
          }
        }
        if (alive) setScores(any ? merged : null);
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  return scores;
}
