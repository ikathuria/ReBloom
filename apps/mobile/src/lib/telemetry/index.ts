// Privacy-first error telemetry. No-op by default: nothing is sent until a reporter is registered
// (Sentry, wired at deploy — see docs/05-deploy.md). Every event is scrubbed of images/PII first,
// so a misconfigured reporter can never leak a scan photo or identity.

import { scrubContext } from './scrub';

export { scrubContext, scrubValue } from './scrub';

export interface TelemetryEvent {
  message: string;
  context?: Record<string, unknown>;
}

export type Reporter = (event: TelemetryEvent) => void;

let reporter: Reporter | null = null;

/** Plug in a reporter (e.g. Sentry) at app start; pass null to disable. */
export function registerReporter(r: Reporter | null): void {
  reporter = r;
}

/** Report a caught error. Safe to call anywhere; never throws, never sends unscrubbed data. */
export function captureError(error: unknown, context: Record<string, unknown> = {}): void {
  const message = error instanceof Error ? error.message : String(error);
  const scrubbed = scrubContext(context);
  if (reporter) {
    try {
      reporter({ message, context: scrubbed });
    } catch {
      // Telemetry must never break the app.
    }
  } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn('[telemetry]', message, scrubbed);
  }
}
