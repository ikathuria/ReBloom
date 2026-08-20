import { TRACK_IDS, TRACK_KIND, isTrackId } from './index';

describe('track registry (M1 skeleton)', () => {
  it('defines the 7 launch tracks', () => {
    expect(TRACK_IDS).toHaveLength(7);
    expect(TRACK_IDS).toContain('recovery');
    expect(TRACK_IDS).toContain('hair-regrowth');
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
