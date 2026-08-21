// Local store contracts. The app uses an encrypted op-sqlite/SQLCipher implementation on
// device (lib/db/opsqlite — added with the dev build); tests and pure logic run against the
// in-memory implementation (lib/db/memory) behind this same interface. See docs/02 + PLAN.md M2.

import type { Cadence, TrackId } from '@/lib/tracks';
import type { ConsentState } from '@/features/privacy/consent';

export interface EnrollmentRecord {
  trackId: TrackId;
  cadence: Cadence;
  enrolledAt: string; // ISO
}

/** One point on a track's healing trend — the durable result of a scan. */
export interface TrackPoint {
  id: string;
  trackId: TrackId;
  capturedAt: string; // ISO
  /** Per-concern YouCam ui_scores that fed this track (1..100). Never the image. */
  scores: Record<string, number>;
  /** Deterministic 0..100 bloom for this track at this point. */
  bloom: number;
}

/** The local, encrypted store. All methods are async so the op-sqlite impl can honor the contract. */
export interface ReBloomDb {
  // consent
  getConsent(): Promise<ConsentState | null>;
  saveConsent(state: ConsentState): Promise<void>;

  // enrollments
  listEnrollments(): Promise<EnrollmentRecord[]>;
  upsertEnrollment(e: EnrollmentRecord): Promise<void>;
  removeEnrollment(trackId: TrackId): Promise<void>;

  // track points (trend history)
  addTrackPoint(p: TrackPoint): Promise<void>;
  listTrackPoints(trackId: TrackId): Promise<TrackPoint[]>; // ascending by capturedAt
  latestTrackPoint(trackId: TrackId): Promise<TrackPoint | null>;

  // simple key/value flags (e.g. cloud-sync opt-in)
  getFlag(key: string): Promise<string | null>;
  setFlag(key: string, value: string): Promise<void>;

  /** Wipe everything (used by privacy "delete all data", M9). */
  clearAll(): Promise<void>;
  close(): Promise<void>;
}
