// Track enrollment — pure logic (persisted by lib/db; UI is the onboarding "choose your journeys"
// picker). Free-tier "1 track" gating is added in M8; here enrollment is unrestricted.

import { type Cadence, type TrackId, TRACK_KIND, defaultCadence } from '@/lib/tracks';

export interface Enrollment {
  trackId: TrackId;
  cadence: Cadence;
  enrolledAt: string; // ISO
}

/** Ordered by enrollment time (first-enrolled first). */
export type EnrollmentState = Enrollment[];

export const initialEnrollments = (): EnrollmentState => [];

export const isEnrolled = (state: EnrollmentState, trackId: TrackId): boolean =>
  state.some((e) => e.trackId === trackId);

/** Idempotent: enrolling an already-enrolled track returns the same state. */
export function enroll(
  state: EnrollmentState,
  trackId: TrackId,
  now: Date = new Date(),
  cadence: Cadence = defaultCadence(trackId),
): EnrollmentState {
  if (isEnrolled(state, trackId)) return state;
  return [...state, { trackId, cadence, enrolledAt: now.toISOString() }];
}

export function unenroll(state: EnrollmentState, trackId: TrackId): EnrollmentState {
  return state.filter((e) => e.trackId !== trackId);
}

export const enrolledTrackIds = (state: EnrollmentState): TrackId[] => state.map((e) => e.trackId);

/** Skin tracks satisfied by one face scan (fan-out set for M3). */
export const enrolledSkinTrackIds = (state: EnrollmentState): TrackId[] =>
  enrolledTrackIds(state).filter((id) => TRACK_KIND[id] === 'skin');

export const hasHairTrack = (state: EnrollmentState): boolean =>
  enrolledTrackIds(state).some((id) => TRACK_KIND[id] === 'hair');
