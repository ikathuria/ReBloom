import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Radius, Spacing, softShadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from '@/features/onboarding/copy';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { HAIR_TREND, NOT_MEDICAL } from '@/features/privacy/disclaimer';
import { useSkin } from '@/lib/skins';
import { bloomAccessibilityLabel, bloomStage } from '@/lib/tracks/bloomStage';
import { concernLabel } from '@/lib/tracks/concernLabels';
import { TRACKS_META, isTrackId } from '@/lib/tracks';
import { useTrackHistory } from './useTrackHistory';

export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const scheme = useColorScheme();
  const { skin } = useSkin();
  const trackId = id && isTrackId(id) ? id : undefined;
  const points = useTrackHistory(trackId);

  if (!trackId) return <ThemedView style={styles.fill} />;
  const meta = TRACKS_META[trackId];
  const hue = skin.hues[scheme === 'dark' ? 'dark' : 'light'][trackId];
  const isHair = meta.kind === 'hair';
  const scanRoute = isHair ? '/scan-hair' : '/scan';
  const loading = points === null;
  const latest = points && points.length ? points[points.length - 1] : null;

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <Pressable testID="track-back" onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <ThemedText style={[styles.backText, { color: BLOOM }]}>‹ garden</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View testID="track-loading" style={styles.loading}>
              <ActivityIndicator color={BLOOM} />
            </View>
          ) : latest ? (
            <>
              <View
                style={[styles.hero, { backgroundColor: hue.bg }]}
                accessible
                accessibilityRole="image"
                accessibilityLabel={bloomAccessibilityLabel(latest.bloom, meta.name)}
              >
                <ThemedText style={styles.heroEmoji}>{skin.stageEmoji[bloomStage(latest.bloom).key]}</ThemedText>
                <ThemedText style={[styles.heroScore, { color: hue.ink }]}>{latest.bloom}</ThemedText>
                <ThemedText style={[styles.heroStage, { color: hue.ink }]}>
                  {bloomStage(latest.bloom).label}
                  {meta.sensitive ? ' · private' : ''}
                </ThemedText>
              </View>

              <ThemedText type="subtitle" style={styles.name}>
                {meta.name}
              </ThemedText>

              <Section title="Your trend">
                {points && points.length >= 2 ? (
                  <TrendBars values={points.map((p) => p.bloom)} color={hue.ink} />
                ) : (
                  <View style={[styles.softCard, { backgroundColor: theme.card, borderColor: theme.line }]}>
                    <ThemedText type="small" themeColor="textSecondary">
                      One scan so far. Come back after your next one to see your trend grow.
                    </ThemedText>
                  </View>
                )}
              </Section>

              <Section title="What went into it">
                <View style={[styles.softCard, { backgroundColor: theme.card, borderColor: theme.line }]}>
                  {Object.entries(latest.scores).map(([key, score]) => (
                    <View key={key} style={styles.concernRow}>
                      <ThemedText type="small" style={styles.concernName}>
                        {concernLabel(key)}
                      </ThemedText>
                      <View style={[styles.concernTrack, { backgroundColor: theme.line }]}>
                        <View style={[styles.concernFill, { width: `${score}%`, backgroundColor: hue.ink }]} />
                      </View>
                      <ThemedText style={styles.concernScore}>{score}</ThemedText>
                    </View>
                  ))}
                </View>
              </Section>

              <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
                {isHair ? `${HAIR_TREND} ${NOT_MEDICAL}` : NOT_MEDICAL}
              </ThemedText>

              {isHair && (
                <PrimaryButton testID="track-hair-rescan" label="Take a hair scan 🌿" onPress={() => router.push('/scan-hair')} />
              )}
            </>
          ) : (
            <View style={styles.empty}>
              <View style={[styles.hero, styles.emptyHero, { backgroundColor: hue.bg }]}>
                <ThemedText style={styles.heroEmoji}>{skin.stageEmoji.sprout}</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.center}>
                Your bloom is starting
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
                Take your first scan and this journey will begin to grow.
              </ThemedText>
              <PrimaryButton testID="track-first-scan" label="Take a scan 🌸" onPress={() => router.replace(scanRoute)} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function TrendBars({ values, color }: { values: number[]; color: string }) {
  const recent = values.slice(-12);
  return (
    <View style={styles.bars}>
      {recent.map((v, i) => (
        <View key={i} style={styles.barSlot}>
          <View style={[styles.bar, { height: `${Math.max(8, v)}%`, backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  backText: { fontFamily: Fonts.display, fontSize: 16 },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.three },
  loading: { alignItems: 'center', paddingVertical: Spacing.six },
  hero: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: 2,
    ...softShadow,
  },
  heroEmoji: { fontSize: 80, lineHeight: 88 },
  heroScore: { fontFamily: Fonts.displayBold, fontSize: 48, lineHeight: 52 },
  heroStage: { fontFamily: Fonts.bodyBold, fontSize: 12.5, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.85 },
  name: { marginTop: Spacing.one },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 16 },
  softCard: { borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.three },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    height: 110,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  barSlot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 8, minHeight: 8 },
  concernRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 7 },
  concernName: { width: 108 },
  concernTrack: { flex: 1, height: 7, borderRadius: Radius.pill, overflow: 'hidden' },
  concernFill: { height: 7, borderRadius: Radius.pill },
  concernScore: { fontFamily: Fonts.display, fontSize: 13, width: 26, textAlign: 'right' },
  disclaimer: { lineHeight: 18, marginTop: Spacing.two },
  empty: { alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.four },
  emptyHero: { width: '100%' },
  center: { textAlign: 'center' },
});
