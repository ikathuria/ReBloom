import { recommendFabrics } from './recommend';

describe('recommendFabrics', () => {
  it('flags reactive skin as sensitive and suggests the gentlest fabrics', () => {
    const advice = recommendFabrics({ hd_redness: 30, hd_moisture: 35, hd_texture: 40 });
    expect(advice.level).toBe('sensitive');
    expect(advice.sensitivity).toBeGreaterThanOrEqual(60);
    expect(advice.recommended.map((r) => r.fabric)).toContain('Mulberry silk');
    expect(advice.avoid.map((a) => a.fabric)).toContain('Wool');
  });

  it('treats healthy skin as calm', () => {
    const advice = recommendFabrics({ hd_redness: 85, hd_moisture: 80, hd_texture: 82 });
    expect(advice.level).toBe('calm');
    expect(advice.sensitivity).toBeLessThan(35);
    expect(advice.recommended.length).toBeGreaterThan(0);
  });

  it('lands mid-range skin in "settling"', () => {
    const advice = recommendFabrics({ hd_redness: 55, hd_moisture: 52, hd_texture: 58 });
    expect(advice.level).toBe('settling');
  });

  it('falls back gracefully when the relevant concerns are absent', () => {
    const advice = recommendFabrics({ hd_acne: 70 });
    expect(['calm', 'settling', 'sensitive']).toContain(advice.level);
    expect(advice.recommended.length).toBeGreaterThan(0);
  });
});
