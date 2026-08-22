import {
  canCustomizeEmojis,
  canEnrollAnother,
  canUseTryOn,
  effectiveCadence,
  FREE_TRACK_LIMIT,
  maxTracks,
  scanGate,
} from './entitlement';

describe('track-count gating', () => {
  it('free allows exactly one journey', () => {
    expect(maxTracks('free')).toBe(FREE_TRACK_LIMIT);
    expect(canEnrollAnother('free', 0)).toBe(true);
    expect(canEnrollAnother('free', 1)).toBe(false);
  });

  it('pro is unlimited', () => {
    expect(maxTracks('pro')).toBe(Infinity);
    expect(canEnrollAnother('pro', 6)).toBe(true);
  });
});

describe('cadence + perks', () => {
  it('free is capped to monthly on any journey; pro uses natural cadence', () => {
    expect(effectiveCadence('free', 'hydration')).toBe('monthly'); // natural weekly
    expect(effectiveCadence('pro', 'hydration')).toBe('weekly');
    expect(effectiveCadence('pro', 'dark-spots')).toBe('biweekly');
  });

  it('try-on is Pro-only', () => {
    expect(canUseTryOn('free')).toBe(false);
    expect(canUseTryOn('pro')).toBe(true);
  });

  it('custom garden emojis are Pro-only', () => {
    expect(canCustomizeEmojis('free')).toBe(false);
    expect(canCustomizeEmojis('pro')).toBe(true);
  });
});

describe('scanGate', () => {
  const now = new Date('2026-08-21T12:00:00.000Z');
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();

  it('allows the first scan (no prior point)', () => {
    expect(scanGate('free', ['hydration'], null, now).allowed).toBe(true);
  });

  it('blocks a free rescan inside the monthly cap and reports the wait', () => {
    const g = scanGate('free', ['hydration'], daysAgo(10), now);
    expect(g.allowed).toBe(false);
    expect(g.reason).toBe('cadence');
    expect(g.waitDays).toBe(20); // 30 - 10
    expect(g.nextAllowedAt).toBe(new Date('2026-09-10T12:00:00.000Z').toISOString());
  });

  it('allows a free rescan once 30 days have passed', () => {
    expect(scanGate('free', ['hydration'], daysAgo(30), now).allowed).toBe(true);
  });

  it('pro can rescan a weekly journey after 7 days but not after 3', () => {
    expect(scanGate('pro', ['hydration'], daysAgo(7), now).allowed).toBe(true);
    expect(scanGate('pro', ['hydration'], daysAgo(3), now).allowed).toBe(false);
  });

  it('for a fan-out, uses the shortest cadence among the scanned journeys', () => {
    // pro: dark-spots (biweekly=14) + hydration (weekly=7) -> 7-day floor
    expect(scanGate('pro', ['dark-spots', 'hydration'], daysAgo(8), now).allowed).toBe(true);
    expect(scanGate('pro', ['dark-spots', 'hydration'], daysAgo(6), now).allowed).toBe(false);
  });
});
