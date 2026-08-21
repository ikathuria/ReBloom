import { skinUnionConcerns, computeBloom, bloomsForScan } from './scoring';

// Real YouCam scores from the M0 live run (docs/04): an 8-concern HD scan.
const SCAN = {
  hd_moisture: 71,
  hd_redness: 80,
  hd_radiance: 81,
  hd_texture: 79,
  hd_age_spot: 93,
  hd_acne: 85,
  hd_oiliness: 80,
  hd_pore: 61,
};

describe('bloom scoring / fan-out', () => {
  it('unions concerns across enrolled skin tracks, de-duped', () => {
    const union = skinUnionConcerns(['recovery', 'acne']);
    expect(union.sort()).toEqual(
      ['hd_acne', 'hd_age_spot', 'hd_moisture', 'hd_oiliness', 'hd_pore', 'hd_radiance', 'hd_redness', 'hd_texture'].sort(),
    );
    expect(union).toHaveLength(8); // matches the 5–8 HD tier (16 units) from M0
  });

  it('excludes hair tracks from the skin union (separate API)', () => {
    expect(skinUnionConcerns(['hydration', 'hair-regrowth'])).toEqual(['hd_moisture']);
  });

  it('computes the same blooms the M0 spike saw (Recovery 81, Acne 77)', () => {
    expect(computeBloom('recovery', SCAN)).toBe(81);
    expect(computeBloom('acne', SCAN)).toBe(77);
  });

  it('returns null when none of a track under-eye concerns were scored', () => {
    expect(computeBloom('under-eye', SCAN)).toBeNull(); // dark_circle/eye_bag/tear_trough absent
  });

  it('fans one scan out to every enrolled skin track', () => {
    const blooms = bloomsForScan(['recovery', 'acne', 'hair-regrowth'], SCAN);
    expect(blooms).toEqual({ recovery: 81, acne: 77 }); // hair excluded, under-eye not enrolled
  });
});
