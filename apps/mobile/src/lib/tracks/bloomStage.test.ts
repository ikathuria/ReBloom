import { bloomAccessibilityLabel, bloomStage } from './bloomStage';
import { concernLabel } from './concernLabels';

describe('bloomStage', () => {
  it('maps null to a warm "ready to start" seed (never a failure state)', () => {
    expect(bloomStage(null)).toMatchObject({ key: 'seed', label: 'Ready to start' });
  });

  it('climbs stages with score', () => {
    expect(bloomStage(10).key).toBe('sprout');
    expect(bloomStage(50).key).toBe('growing');
    expect(bloomStage(70).key).toBe('bud');
    expect(bloomStage(80).key).toBe('bloom');
    expect(bloomStage(95).key).toBe('full');
  });

  it('speaks a clear label for VoiceOver (no raw emoji)', () => {
    expect(bloomAccessibilityLabel(80, 'Recovery Healing')).toBe('Recovery Healing, blooming, 80 out of 100');
    expect(bloomAccessibilityLabel(null, 'Acne Care')).toBe('Acne Care, ready to start, no scans yet');
    expect(bloomAccessibilityLabel(50)).toBe('growing, 50 out of 100');
  });

  it('has friendly, non-diagnostic concern labels', () => {
    expect(concernLabel('hd_redness')).toBe('Calm skin');
    expect(concernLabel('hd_acne')).toBe('Clear skin');
    expect(concernLabel('unknown_key')).toBe('unknown_key'); // graceful fallback
  });
});
