import { initialConsent, setConsent, hasDecided, canScan, scanBlockReason } from './consent';

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

  it('revoking a consent blocks scanning again', () => {
    let s = setConsent(setConsent(initialConsent(), 'capture', true, T0), 'analysis', true, T0);
    expect(canScan(s)).toBe(true);
    s = setConsent(s, 'analysis', false, T0);
    expect(canScan(s)).toBe(false);
    expect(scanBlockReason(s)).toMatch(/analyze/i);
  });
});
