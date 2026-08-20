import { TRACK_IDS, TRACK_KIND, TRACKS_META, defaultCadence, isTrackId } from './index';

describe('track registry', () => {
  it('defines the 7 launch tracks', () => {
    expect(TRACK_IDS).toHaveLength(7);
    expect(TRACK_IDS).toContain('recovery');
    expect(TRACK_IDS).toContain('hair-regrowth');
  });

  it('has metadata (name, kind, cadence) for every track', () => {
    for (const id of TRACK_IDS) {
      const meta = TRACKS_META[id];
      expect(meta.id).toBe(id);
      expect(meta.name.length).toBeGreaterThan(0);
      expect(['weekly', 'biweekly', 'monthly']).toContain(meta.cadence);
    }
  });

  it('flags only recovery as sensitive, and hair-regrowth as monthly', () => {
    expect(TRACKS_META.recovery.sensitive).toBe(true);
    expect(TRACK_IDS.filter((id) => TRACKS_META[id].sensitive)).toEqual(['recovery']);
    expect(defaultCadence('hair-regrowth')).toBe('monthly');
  });

  it('classifies exactly one hair track; the rest are skin', () => {
    const hair = TRACK_IDS.filter((id) => TRACK_KIND[id] === 'hair');
    const skin = TRACK_IDS.filter((id) => TRACK_KIND[id] === 'skin');
    expect(hair).toEqual(['hair-regrowth']);
    expect(skin).toHaveLength(6);
  });

  it('narrows unknown strings with isTrackId', () => {
    expect(isTrackId('acne')).toBe(true);
    expect(isTrackId('nope')).toBe(false);
  });
});
