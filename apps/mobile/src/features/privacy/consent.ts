// Consent state — pure logic (persisted by lib/db; UI in onboarding). See docs/02-privacy-and-consent.md.
//
// Two granular, revocable consents gate scanning:
//   - capture:  the user agrees to provide a scan photo (camera and/or photo library)
//   - analysis: the user agrees to send that photo transiently to YouCam for scoring (not stored)
// This models the user's in-app agreement; OS-level camera/library permissions are handled
// separately at the capture screen.

export type ConsentKey = 'capture' | 'analysis';

export interface ConsentState {
  capture: boolean;
  analysis: boolean;
  /** ISO timestamp of the last decision; null = the user has not completed the consent step. */
  updatedAt: string | null;
}

export const initialConsent = (): ConsentState => ({
  capture: false,
  analysis: false,
  updatedAt: null,
});

/** Record a consent choice. `now` is injected so callers/tests control the clock. */
export function setConsent(
  state: ConsentState,
  key: ConsentKey,
  value: boolean,
  now: Date = new Date(),
): ConsentState {
  return { ...state, [key]: value, updatedAt: now.toISOString() };
}

/** The user has finished the consent step once they've made any explicit decision. */
export const hasDecided = (s: ConsentState): boolean => s.updatedAt !== null;

/** Scanning requires both a way to provide a photo and agreement to analyze it. */
export const canScan = (s: ConsentState): boolean => s.capture && s.analysis;

/**
 * Why scanning is blocked, for honest UI copy (docs/02 principle: never fail silently).
 * Returns null when scanning is allowed.
 */
export function scanBlockReason(s: ConsentState): string | null {
  if (!s.capture && !s.analysis) return 'ReBloom needs your ok to take a photo and analyze it before it can scan.';
  if (!s.capture) return 'Turn on camera or photo access to add a scan.';
  if (!s.analysis) return 'Scanning needs permission to analyze your photo. Your photo is sent once for scoring and never stored.';
  return null;
}
