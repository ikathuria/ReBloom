// In-memory ReBloomDb — used by unit tests and as a safe fallback. Same contract as the
// encrypted op-sqlite implementation, so repository logic is verified here and the native
// driver is exercised on device.

import type { ConsentState } from '@/features/privacy/consent';
import type { TrackId } from '@/lib/tracks';
import type { EnrollmentRecord, ReBloomDb, TrackPoint } from './types';

export function createInMemoryDb(): ReBloomDb {
  let consent: ConsentState | null = null;
  const enrollments = new Map<TrackId, EnrollmentRecord>();
  const points: TrackPoint[] = [];
  const flags = new Map<string, string>();

  const byTimeAsc = (a: TrackPoint, b: TrackPoint) => a.capturedAt.localeCompare(b.capturedAt);

  return {
    async getConsent() {
      return consent;
    },
    async saveConsent(state) {
      consent = { ...state };
    },

    async listEnrollments() {
      return [...enrollments.values()];
    },
    async upsertEnrollment(e) {
      enrollments.set(e.trackId, { ...e });
    },
    async removeEnrollment(trackId) {
      enrollments.delete(trackId);
    },

    async addTrackPoint(p) {
      points.push({ ...p, scores: { ...p.scores } });
    },
    async listTrackPoints(trackId) {
      return points.filter((p) => p.trackId === trackId).sort(byTimeAsc);
    },
    async latestTrackPoint(trackId) {
      const ofTrack = points.filter((p) => p.trackId === trackId).sort(byTimeAsc);
      return ofTrack.length ? ofTrack[ofTrack.length - 1] : null;
    },

    async getFlag(key) {
      return flags.get(key) ?? null;
    },
    async setFlag(key, value) {
      flags.set(key, value);
    },

    async clearAll() {
      consent = null;
      enrollments.clear();
      points.length = 0;
      flags.clear();
    },
    async close() {
      /* no-op for in-memory */
    },
  };
}
