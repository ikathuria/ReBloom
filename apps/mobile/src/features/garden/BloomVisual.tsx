import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { bloomStage } from '@/lib/tracks/bloomStage';
import { BLOOM } from '@/features/onboarding/copy';

/** The growth-stage emoji + score + a thin progress bar. `hero` is the big version for headers. */
export function BloomVisual({ bloom, hero = false }: { bloom: number | null; hero?: boolean }) {
  const theme = useTheme();
  const stage = bloomStage(bloom);
  return (
    <View style={[styles.wrap, hero && styles.wrapHero]}>
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
