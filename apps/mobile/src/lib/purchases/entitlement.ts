// Pure freemium gating rules — the single source of truth for what each tier unlocks.
// No I/O, so every rule is unit-tested. UI + scan orchestration import these; the Edge
// Functions mirror CADENCE_DAYS server-side (see supabase/functions/_shared/cadence.ts).

import { TRACKS_META, type Cadence, type TrackId } from '@/lib/tracks';
import type { Tier } from './types';

/** Free accounts can follow exactly one journey. */
export const FREE_TRACK_LIMIT = 1;

/** How many journeys a tier may be enrolled in at once. */
export const maxTracks = (tier: Tier): number => (tier === 'pro' ? Infinity : FREE_TRACK_LIMIT);

/** Can this tier enroll another journey, given how many it already has? */
export const canEnrollAnother = (tier: Tier, currentCount: number): boolean =>
  currentCount < maxTracks(tier);

/** Minimum days between scans for a given cadence. */
export const CADENCE_DAYS: Record<Cadence, number> = { weekly: 7, biweekly: 14, monthly: 30 };

/** Free is capped to monthly on every journey; Pro gets each journey's natural cadence. */
export const FREE_CADENCE: Cadence = 'monthly';

export const effectiveCadence = (tier: Tier, trackId: TrackId): Cadence =>
  tier === 'pro' ? TRACKS_META[trackId].cadence : FREE_CADENCE;

/** The apparel virtual try-on is a Pro perk. */
export const canUseTryOn = (tier: Tier): boolean => tier === 'pro';

const DAY_MS = 86_400_000;

export interface ScanGate {
  allowed: boolean;
  reason?: 'cadence';
  /** ISO timestamp when the next scan unlocks (only when blocked). */
  nextAllowedAt?: string;
  /** Whole days left to wait (only when blocked). */
  waitDays?: number;
}

/**
 * Whether a scan is allowed now under the tier's cadence cap. A skin scan fans out over several
 * journeys, so we use the *shortest* effective cadence among the ones being scanned (most
 * permissive to the user). Pass the single track for a hair scan.
 */
export function scanGate(
  tier: Tier,
  trackIds: TrackId[],
  lastScanAt: string | null,
  now: Date = new Date(),
): ScanGate {
  if (!lastScanAt || trackIds.length === 0) return { allowed: true };

  const minDays = Math.min(...trackIds.map((id) => CADENCE_DAYS[effectiveCadence(tier, id)]));
  const neededMs = minDays * DAY_MS;
  const elapsedMs = now.getTime() - new Date(lastScanAt).getTime();
  if (elapsedMs >= neededMs) return { allowed: true };

  return {
    allowed: false,
    reason: 'cadence',
    nextAllowedAt: new Date(new Date(lastScanAt).getTime() + neededMs).toISOString(),
    waitDays: Math.max(1, Math.ceil((neededMs - elapsedMs) / DAY_MS)),
  };
}
