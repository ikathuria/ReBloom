// Encrypted local store, backed by op-sqlite + SQLCipher. Native only (requires a dev build —
// not Expo Go). Implements the same ReBloomDb contract verified by the in-memory tests.

import { open } from '@op-engineering/op-sqlite';

import type { Cadence, TrackId } from '@/lib/tracks';
import type { ConsentState } from '@/features/privacy/consent';
import { getOrCreateDbKey } from './encryptionKey';
import { MIGRATIONS } from './migrations';
import type { EnrollmentRecord, ReBloomDb, TrackPoint } from './types';

const DB_NAME = 'rebloom.db';

type Row = Record<string, unknown>;

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v));
const str = (v: unknown): string => (v == null ? '' : String(v));

function mapPoint(r: Row): TrackPoint {
  return {
    id: str(r.id),
    trackId: str(r.track_id) as TrackId,
    capturedAt: str(r.captured_at),
    scores: JSON.parse(str(r.scores_json)) as Record<string, number>,
    bloom: num(r.bloom),
  };
}

export async function createOpSqliteDb(): Promise<ReBloomDb> {
  const encryptionKey = await getOrCreateDbKey();
  const db = open({ name: DB_NAME, encryptionKey });

  for (const stmt of MIGRATIONS) {
    await db.execute(stmt);
  }

  const rowsOf = (result: { rows?: unknown }): Row[] => (result.rows as Row[] | undefined) ?? [];

  return {
    async getConsent(): Promise<ConsentState | null> {
      const r = rowsOf(
        await db.execute('SELECT capture, analysis, updated_at FROM consent WHERE id = 1'),
      )[0];
      if (!r) return null;
      return {
        capture: num(r.capture) === 1,
        analysis: num(r.analysis) === 1,
        updatedAt: r.updated_at == null ? null : str(r.updated_at),
      };
    },
    async saveConsent(s) {
      await db.execute(
        'INSERT OR REPLACE INTO consent (id, capture, analysis, updated_at) VALUES (1, ?, ?, ?)',
        [s.capture ? 1 : 0, s.analysis ? 1 : 0, s.updatedAt],
      );
    },

    async listEnrollments() {
      return rowsOf(
        await db.execute('SELECT track_id, cadence, enrolled_at FROM enrollments'),
      ).map<EnrollmentRecord>((r) => ({
        trackId: str(r.track_id) as TrackId,
        cadence: str(r.cadence) as Cadence,
        enrolledAt: str(r.enrolled_at),
      }));
    },
    async upsertEnrollment(e) {
      await db.execute(
        'INSERT OR REPLACE INTO enrollments (track_id, cadence, enrolled_at) VALUES (?, ?, ?)',
        [e.trackId, e.cadence, e.enrolledAt],
      );
    },
    async removeEnrollment(trackId) {
      await db.execute('DELETE FROM enrollments WHERE track_id = ?', [trackId]);
    },

    async addTrackPoint(p) {
      await db.execute(
        'INSERT OR REPLACE INTO track_points (id, track_id, captured_at, scores_json, bloom) VALUES (?, ?, ?, ?, ?)',
        [p.id, p.trackId, p.capturedAt, JSON.stringify(p.scores), p.bloom],
      );
    },
    async listTrackPoints(trackId) {
      return rowsOf(
        await db.execute(
          'SELECT * FROM track_points WHERE track_id = ? ORDER BY captured_at ASC',
          [trackId],
        ),
      ).map(mapPoint);
    },
    async latestTrackPoint(trackId) {
      const r = rowsOf(
        await db.execute(
          'SELECT * FROM track_points WHERE track_id = ? ORDER BY captured_at DESC LIMIT 1',
          [trackId],
        ),
      )[0];
      return r ? mapPoint(r) : null;
    },

    async getFlag(key) {
      const r = rowsOf(await db.execute('SELECT value FROM flags WHERE key = ?', [key]))[0];
      return r ? str(r.value) : null;
    },
    async setFlag(key, value) {
      await db.execute('INSERT OR REPLACE INTO flags (key, value) VALUES (?, ?)', [key, value]);
    },

    async clearAll() {
      await db.execute('DELETE FROM track_points');
      await db.execute('DELETE FROM enrollments');
      await db.execute('DELETE FROM consent');
      await db.execute('DELETE FROM flags');
    },
    async close() {
      db.close();
    },
  };
}
