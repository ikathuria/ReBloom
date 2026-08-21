// Server-side cadence guardrail — a unit-cost safety net for the paid YouCam API.
//
// Mirrors apps/mobile/src/lib/purchases/entitlement.ts (CADENCE_DAYS + scanGate). The MOBILE
// CLIENT is the authoritative live gate today: it blocks an over-cadence scan before ever
// calling these functions (see ScanScreen/ScanHairScreen). This guard is defense-in-depth —
// any caller may pass a `cadence` hint and the function will refuse an over-cap scan, protecting
// API units against a client bug or a replay. It becomes a true trust boundary once scanning
// requires an authenticated session (M10), when `lastScanAt` can be read from server-side history
// instead of the request body.

export const CADENCE_DAYS = { weekly: 7, biweekly: 14, monthly: 30 } as const;
export type Cadence = keyof typeof CADENCE_DAYS;

export interface CadenceHint {
  /** Shortest allowed interval (days) across the journeys this scan feeds. */
  minIntervalDays: number;
  /** ISO timestamp of the most recent scan for those journeys, or null for the first. */
  lastScanAt: string | null;
  /** Present only so the upgrade signal can be tailored; not trusted for anything else. */
  tier?: 'free' | 'pro';
}

export interface CadenceCheck {
  overCap: boolean;
  waitDays?: number;
}

const DAY_MS = 86_400_000;

export function checkCadence(hint: CadenceHint | undefined, now: Date = new Date()): CadenceCheck {
  if (!hint || !hint.lastScanAt || !Number.isFinite(hint.minIntervalDays)) return { overCap: false };
  const neededMs = hint.minIntervalDays * DAY_MS;
  const elapsedMs = now.getTime() - new Date(hint.lastScanAt).getTime();
  if (elapsedMs >= neededMs) return { overCap: false };
  return { overCap: true, waitDays: Math.max(1, Math.ceil((neededMs - elapsedMs) / DAY_MS)) };
}
