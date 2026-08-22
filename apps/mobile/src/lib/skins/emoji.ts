// Extract a single emoji from free-typed / pasted text for the Pro "Custom" garden style.
//
// Emoji are not one code point — skin tones (👍🏽), variation selectors (❤️), and ZWJ sequences
// (👩‍🌾) span several. Naively taking `str[0]` splits them. On modern engines (Hermes/V8) we match a
// whole emoji cluster with Unicode property escapes; older engines fall back to grapheme
// segmentation, then to a first code point, so this never throws.

// One emoji "cluster": a pictographic base + optional skin-tone / variation selector, followed by
// any number of ZWJ-joined pictographs (each with their own modifiers).
const EMOJI_CLUSTER =
  '\\p{Extended_Pictographic}[\\u{1F3FB}-\\u{1F3FF}\\uFE0F]*(?:\\u200D\\p{Extended_Pictographic}[\\u{1F3FB}-\\u{1F3FF}\\uFE0F]*)*';

// Whether this engine supports Unicode property escapes (`\p{…}`) in regex. Computed once.
const PROPERTY_ESCAPES = (() => {
  try {
    return new RegExp('\\p{Extended_Pictographic}', 'u').test('🌸');
  } catch {
    return false;
  }
})();

/**
 * The first emoji in `input`, or `null` if there isn't one. Whitespace is ignored, and on
 * property-escape engines non-emoji text (plain letters) yields `null` so the field stays
 * emoji-only. Returns the full grapheme, so skin tones, ❤️-style selectors, and ZWJ sequences
 * survive intact.
 */
export function firstEmoji(input: string): string | null {
  const s = input.trim();
  if (!s) return null;

  if (PROPERTY_ESCAPES) {
    const m = s.match(new RegExp(EMOJI_CLUSTER, 'u'));
    return m ? m[0] : null;
  }

  // Fallback engines without \p{} support: best-effort first grapheme, else first code point.
  const Seg = (Intl as unknown as { Segmenter?: new (...a: unknown[]) => { segment: (s: string) => Iterable<{ segment: string }> } })
    .Segmenter;
  if (typeof Seg === 'function') {
    try {
      for (const g of new Seg(undefined, { granularity: 'grapheme' }).segment(s)) return g.segment;
    } catch {
      // fall through
    }
  }
  return Array.from(s)[0] ?? null;
}
