import { createInMemoryDb } from '@/lib/db/memory';
import { setConsent } from './consent';
import { deleteAllData } from './deleteData';
import { buildExport, serializeExport, EXPORT_SCHEMA } from './exportData';

const seed = async () => {
  const db = createInMemoryDb();
  await db.saveConsent(setConsent(setConsent({ capture: false, analysis: false, updatedAt: null }, 'capture', true), 'analysis', true));
  await db.upsertEnrollment({ trackId: 'recovery', cadence: 'weekly', enrolledAt: '2026-08-01T00:00:00.000Z' });
  await db.addTrackPoint({ id: 'b', trackId: 'recovery', capturedAt: '2026-08-10T00:00:00.000Z', scores: { hd_moisture: 70 }, bloom: 72 });
  await db.addTrackPoint({ id: 'a', trackId: 'recovery', capturedAt: '2026-08-03T00:00:00.000Z', scores: { hd_moisture: 60 }, bloom: 64 });
  return db;
};

describe('export', () => {
  it('gathers consent, enrollments, and all scan points (time-ordered)', async () => {
    const db = await seed();
    const data = await buildExport(db, () => new Date('2026-08-20T12:00:00.000Z'));

    expect(data.app).toBe('ReBloom');
    expect(data.schema).toBe(EXPORT_SCHEMA);
    expect(data.exportedAt).toBe('2026-08-20T12:00:00.000Z');
    expect(data.consent?.capture).toBe(true);
    expect(data.enrollments).toHaveLength(1);
    expect(data.trackPoints.map((p) => p.id)).toEqual(['a', 'b']); // sorted by capturedAt
    expect(data.note.toLowerCase()).toContain('never stores your photos');
  });

  it('serializes to valid, round-trippable JSON', async () => {
    const db = await seed();
    const json = serializeExport(await buildExport(db));
    expect(JSON.parse(json).trackPoints).toHaveLength(2);
  });
});

describe('delete', () => {
  it('wipes the local store and reports cloud skipped when no cloud step is given', async () => {
    const db = await seed();
    const result = await deleteAllData(db);

    expect(result).toEqual({ local: true, cloud: 'skipped' });
    expect(await db.getConsent()).toBeNull();
    expect(await db.listEnrollments()).toHaveLength(0);
    expect(await db.listTrackPoints('recovery')).toHaveLength(0);
  });

  it('runs the cloud deletion before wiping local, and reports it', async () => {
    const db = await seed();
    const calls: string[] = [];
    const deleteCloud = async () => {
      // local must still be intact when the cloud step runs (cloud-first ordering)
      expect(await db.listEnrollments()).toHaveLength(1);
      calls.push('cloud');
    };
    const result = await deleteAllData(db, deleteCloud);

    expect(calls).toEqual(['cloud']);
    expect(result.cloud).toBe('deleted');
    expect(await db.listEnrollments()).toHaveLength(0);
  });
});
