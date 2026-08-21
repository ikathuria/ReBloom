// "Leave with your data" — export (docs/02 principle 6). Gathers everything ReBloom holds about
// a user into one plain-JSON object: consent, enrolled journeys, and every scan point (scores +
// bloom). Never a photo — ReBloom never stores one. Pure + injectable, so it's unit-tested.

import type { ConsentState } from '@/features/privacy/consent';
import type { EnrollmentRecord, ReBloomDb, TrackPoint } from '@/lib/db';
import { TRACK_IDS } from '@/lib/tracks';

export const EXPORT_SCHEMA = 1 as const;

export interface ReBloomExport {
  app: 'ReBloom';
  schema: typeof EXPORT_SCHEMA;
  exportedAt: string;
  note: string;
  consent: ConsentState | null;
  enrollments: EnrollmentRecord[];
  trackPoints: TrackPoint[];
}

/** Collect the user's full local dataset. */
export async function buildExport(db: ReBloomDb, now: () => Date = () => new Date()): Promise<ReBloomExport> {
  const consent = await db.getConsent();
  const enrollments = await db.listEnrollments();

  const trackPoints: TrackPoint[] = [];
  for (const trackId of TRACK_IDS) trackPoints.push(...(await db.listTrackPoints(trackId)));
  trackPoints.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));

  return {
    app: 'ReBloom',
    schema: EXPORT_SCHEMA,
    exportedAt: now().toISOString(),
    note: 'Your ReBloom data — scores and blooms only. ReBloom never stores your photos.',
    consent,
    enrollments,
    trackPoints,
  };
}

/** Pretty JSON, ready to share or save. */
export const serializeExport = (data: ReBloomExport): string => JSON.stringify(data, null, 2);
