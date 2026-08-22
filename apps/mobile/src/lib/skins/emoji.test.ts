import { firstEmoji } from './emoji';

describe('firstEmoji', () => {
  it('returns a plain emoji', () => {
    expect(firstEmoji('🌸')).toBe('🌸');
  });

  it('trims surrounding whitespace', () => {
    expect(firstEmoji('  🔥 ')).toBe('🔥');
  });

  it('pulls the first emoji out of surrounding text', () => {
    expect(firstEmoji('my fave 🌙 fr')).toBe('🌙');
  });

  it('keeps a skin-tone modifier with its base', () => {
    expect(firstEmoji('👍🏽')).toBe('👍🏽');
  });

  it('keeps a variation selector (❤️, not ❤)', () => {
    expect(firstEmoji('❤️')).toBe('❤️');
  });

  it('keeps a ZWJ sequence as one emoji', () => {
    expect(firstEmoji('👩‍🌾')).toBe('👩‍🌾');
  });

  it('returns only the first of several', () => {
    expect(firstEmoji('🌱🌿🌳')).toBe('🌱');
  });

  it('returns null for empty or letters-only input', () => {
    expect(firstEmoji('')).toBeNull();
    expect(firstEmoji('   ')).toBeNull();
    expect(firstEmoji('hello')).toBeNull();
  });
});
