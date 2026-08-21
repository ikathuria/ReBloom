import { initialConsent, setConsent, hasDecided, markDecided, canScan, scanBlockReason } from './consent';

const T0 = new Date('2026-08-12T10:00:00.000Z');

describe('consent state', () => {
  it('starts undecided and cannot scan', () => {
    const s = initialConsent();
    expect(hasDecided(s)).toBe(false);
    expect(canScan(s)).toBe(false);
    expect(scanBlockReason(s)).toMatch(/before it can scan/i);
  });

  it('records a decision with a timestamp', () => {
    const s = setConsent(initialConsent(), 'capture', true, T0);
    expect(s.capture).toBe(true);
    expect(hasDecided(s)).toBe(true);
    expect(s.updatedAt).toBe(T0.toISOString());
  });

  it('allows scanning only when both capture and analysis are granted', () => {
    let s = setConsent(initialConsent(), 'capture', true, T0);
    expect(canScan(s)).toBe(false);
    expect(scanBlockReason(s)).toMatch(/analyze your photo/i);
    s = setConsent(s, 'analysis', true, T0);
    expect(canScan(s)).toBe(true);
    expect(scanBlockReason(s)).toBeNull();
  });

  it('markDecided stamps a decision even when both toggles are off, idempotently', () => {
    const decided = markDecided(initialConsent(), T0);
    expect(hasDecided(decided)).toBe(true); // completing onboarding counts as done
    expect(canScan(decided)).toBe(false); // ...but declining still blocks scanning
    const again = markDecided(decided, new Date('2027-01-01T00:00:00.000Z'));
    expect(again.updatedAt).toBe(T0.toISOString()); // idempotent — keeps the first timestamp
  });

  it('revoking a consent blocks scanning again', () => {
    let s = setConsent(setConsent(initialConsent(), 'capture', true, T0), 'analysis', true, T0);
    expect(canScan(s)).toBe(true);
    s = setConsent(s, 'analysis', false, T0);
    expect(canScan(s)).toBe(false);
    expect(scanBlockReason(s)).toMatch(/analyze/i);
  });
});
