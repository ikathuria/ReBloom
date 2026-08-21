import { hairBloom } from './hairBloom';

describe('hairBloom', () => {
  it('maps the 4 density grades to an encouraging, rising bloom', () => {
    expect(hairBloom(1)).toBe(45);
    expect(hairBloom(2)).toBe(62);
    expect(hairBloom(3)).toBe(78);
    expect(hairBloom(4)).toBe(92);
  });

  it('never returns a demoralizing near-zero (coarse + kind)', () => {
    expect(hairBloom(1)).toBeGreaterThanOrEqual(40);
  });

  it('clamps and rounds out-of-range/fractional grades', () => {
    expect(hairBloom(0)).toBe(45);
    expect(hairBloom(9)).toBe(92);
    expect(hairBloom(2.4)).toBe(62);
  });
});
