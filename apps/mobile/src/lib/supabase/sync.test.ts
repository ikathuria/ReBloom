import type { SupabaseClient } from '@supabase/supabase-js';

import { createInMemoryDb } from '@/lib/db';
import { isSyncEnabled, setSyncEnabled, pushToCloud } from './sync';

function fakeSupabase(session: { user: { id: string } } | null) {
  const captured: Record<string, unknown[]> = {};
  const sb = {
    auth: { getSession: async () => ({ data: { session } }) },
    from: (table: string) => ({
      upsert: async (rows: unknown[]) => {
        captured[table] = rows;
        return { error: null };
      },
    }),
  } as unknown as SupabaseClient;
  return { sb, captured };
}

describe('cloud sync', () => {
  it('sync flag is off by default and toggles', async () => {
    const db = createInMemoryDb();
    expect(await isSyncEnabled(db)).toBe(false);
    await setSyncEnabled(db, true);
    expect(await isSyncEnabled(db)).toBe(true);
  });

  it('refuses to push when not signed in (the gate)', async () => {
    const db = createInMemoryDb();
    await db.upsertEnrollment({ trackId: 'recovery', cadence: 'weekly', enrolledAt: '2026-08-21T00:00:00.000Z' });
    const { sb, captured } = fakeSupabase(null);
    const result = await pushToCloud(db, sb);
    expect(result).toMatchObject({ synced: false, reason: 'not-signed-in' });
    expect(captured.enrollments).toBeUndefined();
  });

  it('uploads enrollments + track points scoped to the user when signed in', async () => {
    const db = createInMemoryDb();
    await db.upsertEnrollment({ trackId: 'recovery', cadence: 'weekly', enrolledAt: '2026-08-21T00:00:00.000Z' });
    await db.addTrackPoint({ id: 'p1', trackId: 'recovery', capturedAt: '2026-08-21T10:00:00.000Z', scores: { hd_redness: 80 }, bloom: 80 });

    const { sb, captured } = fakeSupabase({ user: { id: 'user-A' } });
    const result = await pushToCloud(db, sb);

    expect(result).toMatchObject({ synced: true, enrollments: 1, points: 1 });
    expect(captured.enrollments[0]).toMatchObject({ user_id: 'user-A', track_id: 'recovery' });
    expect(captured.track_points[0]).toMatchObject({ id: 'p1', user_id: 'user-A', bloom: 80 });
    expect(captured.track_points[0]).not.toHaveProperty('image'); // never images
  });
});
