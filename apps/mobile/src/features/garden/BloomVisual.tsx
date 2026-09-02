import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type BloomHue, Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { bloomAccessibilityLabel, bloomStage } from '@/lib/tracks/bloomStage';
import { useSkin } from '@/lib/skins';
import { BLOOM } from '@/features/onboarding/copy';

/**
 * The growth-stage emoji + score + a rounded progress bar. `hero` is the big version for headers.
 * Presents as one VoiceOver element with a spoken label (pass `label`/`name`) so the decorative
 * emoji is never read raw. Pass `decorative` when a parent (e.g. a garden card) already labels it.
 * `hue` tints the score + progress fill to match the journey's card.
 */
export function BloomVisual({
  bloom,
  hero = false,
  name,
  decorative = false,
  hue,
}: {
  bloom: number | null;
  hero?: boolean;
  name?: string;
  decorative?: boolean;
  hue?: BloomHue;
}) {
  const theme = useTheme();
  const { skin } = useSkin();
  const stage = bloomStage(bloom);
  const accent = hue?.ink ?? BLOOM;
  const a11y = decorative
    ? { importantForAccessibility: 'no-hide-descendants' as const }
    : {
        accessible: true,
        accessibilityRole: 'image' as const,
        accessibilityLabel: bloomAccessibilityLabel(bloom, name),
      };
  return (
    <View style={[styles.wrap, hero && styles.wrapHero]} {...a11y}>
      <ThemedText style={hero ? styles.emojiHero : styles.emoji}>{skin.stageEmoji[stage.key]}</ThemedText>
      <View style={styles.meta}>
        <ThemedText style={[hero ? styles.scoreHero : styles.score, { color: accent }]}>
          {bloom === null ? '—' : bloom}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {stage.label}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.line }]}>
        <View style={[styles.fill, { width: `${bloom ?? 0}%`, backgroundColor: accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.one },
  wrapHero: { gap: Spacing.two },
  emoji: { fontSize: 40, lineHeight: 48 },
  emojiHero: { fontSize: 92, lineHeight: 108 },
  meta: { alignItems: 'center', gap: 2 },
  score: { fontFamily: Fonts.display, fontSize: 15 },
  scoreHero: { fontFamily: Fonts.displayBold, fontSize: 48, lineHeight: 52 },
  track: { height: 8, width: 130, borderRadius: Radius.pill, overflow: 'hidden', marginTop: Spacing.one },
  fill: { height: 8, borderRadius: Radius.pill },
});
