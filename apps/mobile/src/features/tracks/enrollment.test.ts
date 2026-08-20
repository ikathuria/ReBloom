import {
  initialEnrollments,
  enroll,
  unenroll,
  isEnrolled,
  enrolledSkinTrackIds,
  hasHairTrack,
} from './enrollment';

const T0 = new Date('2026-08-12T10:00:00.000Z');

describe('track enrollment', () => {
  it('starts empty', () => {
    expect(initialEnrollments()).toEqual([]);
  });

  it('enrolls with the track default cadence and timestamp', () => {
    const s = enroll(initialEnrollments(), 'hair-regrowth', T0);
    expect(isEnrolled(s, 'hair-regrowth')).toBe(true);
    expect(s[0]).toMatchObject({ trackId: 'hair-regrowth', cadence: 'monthly', enrolledAt: T0.toISOString() });
  });

  it('is idempotent — re-enrolling does not duplicate', () => {
    const once = enroll(initialEnrollments(), 'acne', T0);
    const twice = enroll(once, 'acne', T0);
    expect(twice).toBe(once);
    expect(twice).toHaveLength(1);
  });

  it('separates skin tracks from hair for scan fan-out', () => {
    let s = initialEnrollments();
    s = enroll(s, 'recovery', T0);
    s = enroll(s, 'acne', T0);
    s = enroll(s, 'hair-regrowth', T0);
    expect(enrolledSkinTrackIds(s).sort()).toEqual(['acne', 'recovery']);
    expect(hasHairTrack(s)).toBe(true);
  });

  it('unenrolls', () => {
    const s = unenroll(enroll(initialEnrollments(), 'hydration', T0), 'hydration');
    expect(isEnrolled(s, 'hydration')).toBe(false);
  });
});
