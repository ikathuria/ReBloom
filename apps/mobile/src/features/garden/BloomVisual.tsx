import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { bloomAccessibilityLabel, bloomStage } from '@/lib/tracks/bloomStage';
import { BLOOM } from '@/features/onboarding/copy';

/**
 * The growth-stage emoji + score + a thin progress bar. `hero` is the big version for headers.
 * Presents as one VoiceOver element with a spoken label (pass `label`/`name`) so the decorative
 * emoji is never read raw. Pass `decorative` when a parent (e.g. a garden card) already labels it.
 */
export function BloomVisual({
  bloom,
  hero = false,
  name,
  decorative = false,
}: {
  bloom: number | null;
  hero?: boolean;
  name?: string;
  decorative?: boolean;
}) {
  const theme = useTheme();
  const stage = bloomStage(bloom);
  const a11y = decorative
    ? { importantForAccessibility: 'no-hide-descendants' as const }
    : { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: bloomAccessibilityLabel(bloom, name) };
  return (
    <View style={[styles.wrap, hero && styles.wrapHero]} {...a11y}>
      <ThemedText style={hero ? styles.emojiHero : styles.emoji}>{stage.emoji}</ThemedText>
      <View style={styles.meta}>
        <ThemedText type={hero ? 'title' : 'smallBold'}>
          {bloom === null ? '—' : bloom}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {stage.label}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${bloom ?? 0}%`, backgroundColor: BLOOM }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.one },
  wrapHero: { gap: Spacing.two },
  emoji: { fontSize: 40 },
  emojiHero: { fontSize: 88 },
  meta: { alignItems: 'center', gap: 2 },
  track: { height: 6, width: 120, borderRadius: 3, overflow: 'hidden', marginTop: Spacing.one },
  fill: { height: 6, borderRadius: 3 },
});
