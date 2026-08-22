import { TRACK_IDS } from '@/lib/tracks';
import { DEFAULT_SKIN, SKINS, SKIN_IDS, isSkinId } from './skins';

const STAGE_KEYS = ['seed', 'sprout', 'growing', 'bud', 'bloom', 'full'] as const;

describe('skins registry', () => {
  it('defaults to Blooms', () => {
    expect(DEFAULT_SKIN.id).toBe('blooms');
  });

  it('isSkinId accepts known skins and rejects others', () => {
    expect(isSkinId('grove')).toBe(true);
    expect(isSkinId('nope')).toBe(false);
  });

  it.each(SKIN_IDS)('skin "%s" covers every track and stage', (id) => {
    const skin = SKINS[id];
    for (const track of TRACK_IDS) {
      expect(skin.trackEmoji[track]).toBeTruthy();
      expect(skin.hues.light[track]).toMatchObject({ bg: expect.any(String), ink: expect.any(String) });
      expect(skin.hues.dark[track]).toMatchObject({ bg: expect.any(String), ink: expect.any(String) });
    }
    for (const stage of STAGE_KEYS) {
      expect(skin.stageEmoji[stage]).toBeTruthy();
    }
  });
});
