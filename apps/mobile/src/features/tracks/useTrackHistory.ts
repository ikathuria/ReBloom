import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getDb, type TrackPoint } from '@/lib/db';
import type { TrackId } from '@/lib/tracks';

/** All of a track's points, ascending by time; reloads on focus. */
export function useTrackHistory(trackId: TrackId | undefined) {
  const [points, setPoints] = useState<TrackPoint[] | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!trackId) return;
      let alive = true;
      getDb()
        .then((db) => db.listTrackPoints(trackId))
        .then((p) => alive && setPoints(p));
      return () => {
        alive = false;
      };
    }, [trackId]),
  );
  return points;
}
