import { createInMemoryDb } from './memory';
import { MIGRATIONS } from './migrations';
import type { TrackPoint } from './types';
import { initialConsent, setConsent } from '@/features/privacy/consent';

const T = (iso: string) => new Date(iso);

const point = (over: Partial<TrackPoint> = {}): TrackPoint => ({
  id: 'p1',
  trackId: 'recovery',
  capturedAt: '2026-08-12T10:00:00.000Z',
  scores: { hd_redness: 80, hd_moisture: 71 },
  bloom: 76,
  ...over,
});

describe('local store (in-memory contract)', () => {
  it('round-trips consent', async () => {
    const db = createInMemoryDb();
    expect(await db.getConsent()).toBeNull();
    const c = setConsent(initialConsent(), 'capture', true, T('2026-08-12T10:00:00.000Z'));
    await db.saveConsent(c);
    expect(await db.getConsent()).toEqual(c);
  });

  it('upserts and removes enrollments', async () => {
    const db = createInMemoryDb();
    await db.upsertEnrollment({ trackId: 'acne', cadence: 'weekly', enrolledAt: '2026-08-12T10:00:00.000Z' });
    await db.upsertEnrollment({ trackId: 'acne', cadence: 'biweekly', enrolledAt: '2026-08-12T11:00:00.000Z' });
    let list = await db.listEnrollments();
    expect(list).toHaveLength(1);
    expect(list[0].cadence).toBe('biweekly'); // upsert overwrote
    await db.removeEnrollment('acne');
    expect(await db.listEnrollments()).toHaveLength(0);
  });

  it('adds track points and reads latest ascending by time', async () => {
    const db = createInMemoryDb();
    await db.addTrackPoint(point({ id: 'a', capturedAt: '2026-08-01T00:00:00.000Z', bloom: 60 }));
    await db.addTrackPoint(point({ id: 'b', capturedAt: '2026-08-15T00:00:00.000Z', bloom: 74 }));
    const all = await db.listTrackPoints('recovery');
    expect(all.map((p) => p.id)).toEqual(['a', 'b']);
    expect((await db.latestTrackPoint('recovery'))?.bloom).toBe(74);
    expect(await db.latestTrackPoint('acne')).toBeNull();
  });

  it('clearAll wipes everything', async () => {
    const db = createInMemoryDb();
    await db.saveConsent(setConsent(initialConsent(), 'analysis', true));
    await db.upsertEnrollment({ trackId: 'hydration', cadence: 'weekly', enrolledAt: '2026-08-12T10:00:00.000Z' });
    await db.addTrackPoint(point());
    await db.clearAll();
    expect(await db.getConsent()).toBeNull();
    expect(await db.listEnrollments()).toHaveLength(0);
    expect(await db.listTrackPoints('recovery')).toHaveLength(0);
  });

  it('ships the expected schema (single consent row, enrollments PK, points index)', () => {
    const sql = MIGRATIONS.join('\n');
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS consent/);
    expect(sql).toMatch(/track_id\s+TEXT PRIMARY KEY/); // enrollments keyed by track
    expect(sql).toMatch(/idx_track_points_track_time/);
  });
});
