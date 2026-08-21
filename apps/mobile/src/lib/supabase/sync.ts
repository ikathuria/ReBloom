// Opt-in, one-way push of local data to the user's private cloud rows. Uploads enrollments and
// track points (the scores + blooms) — NEVER images. Off by default; requires an explicit toggle
// AND a signed-in session. RLS on the cloud tables scopes every row to its owner.

import type { SupabaseClient } from '@supabase/supabase-js';

import type { ReBloomDb } from '@/lib/db';
import { TRACK_IDS } from '@/lib/tracks';

export const SYNC_FLAG = 'cloud_sync_enabled';

export const isSyncEnabled = async (db: ReBloomDb): Promise<boolean> =>
  (await db.getFlag(SYNC_FLAG)) === 'true';

export const setSyncEnabled = (db: ReBloomDb, on: boolean): Promise<void> =>
  db.setFlag(SYNC_FLAG, on ? 'true' : 'false');

export interface PushResult {
  synced: boolean;
  reason?: 'not-signed-in';
  enrollments: number;
  points: number;
}

/** Push all local enrollments + track points to the signed-in user's cloud rows. */
export async function pushToCloud(db: ReBloomDb, supabase: SupabaseClient): Promise<PushResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { synced: false, reason: 'not-signed-in', enrollments: 0, points: 0 };
  const userId = session.user.id;

  const enrollments = await db.listEnrollments();
  if (enrollments.length) {
    const { error } = await supabase.from('enrollments').upsert(
      enrollments.map((e) => ({ user_id: userId, track_id: e.trackId, cadence: e.cadence, enrolled_at: e.enrolledAt })),
      { onConflict: 'user_id,track_id' },
    );
    if (error) throw error;
  }

  const rows: Record<string, unknown>[] = [];
  for (const trackId of TRACK_IDS) {
    for (const p of await db.listTrackPoints(trackId)) {
      rows.push({
        id: p.id,
        user_id: userId,
        track_id: p.trackId,
        captured_at: p.capturedAt,
        scores_json: JSON.stringify(p.scores),
        bloom: p.bloom,
      });
    }
  }
  if (rows.length) {
    const { error } = await supabase.from('track_points').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  return { synced: true, enrollments: enrollments.length, points: rows.length };
}

/**
 * Delete the signed-in user's synced copy (both cloud tables) and turn sync off. No-op when
 * signed out. RLS already scopes deletes to the owner; we filter by user_id explicitly too.
 */
export async function deleteCloudData(db: ReBloomDb, supabase: SupabaseClient): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;
  const userId = session.user.id;

  const points = await supabase.from('track_points').delete().eq('user_id', userId);
  if (points.error) throw points.error;
  const enrollments = await supabase.from('enrollments').delete().eq('user_id', userId);
  if (enrollments.error) throw enrollments.error;

  await setSyncEnabled(db, false);
}
