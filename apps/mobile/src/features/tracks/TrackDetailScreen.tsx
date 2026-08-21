import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from '@/features/onboarding/copy';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { BloomVisual } from '@/features/garden/BloomVisual';
import { HAIR_TREND, NOT_MEDICAL } from '@/features/privacy/disclaimer';
import { concernLabel } from '@/lib/tracks/concernLabels';
import { TRACKS_META, isTrackId } from '@/lib/tracks';
import { useTrackHistory } from './useTrackHistory';

export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const trackId = id && isTrackId(id) ? id : undefined;
  const points = useTrackHistory(trackId);

  if (!trackId) return <ThemedView style={styles.fill} />;
  const meta = TRACKS_META[trackId];
  const isHair = meta.kind === 'hair';
  const scanRoute = isHair ? '/scan-hair' : '/scan';
  const loading = points === null;
  const latest = points && points.length ? points[points.length - 1] : null;

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <Pressable testID="track-back" onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <ThemedText style={[styles.backText, { color: BLOOM }]}>‹ Garden</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText type="title">{meta.sensitive ? `${meta.name}  ·  private` : meta.name}</ThemedText>

          {loading ? (
            <View testID="track-loading" style={styles.loading}>
              <ActivityIndicator color={BLOOM} />
            </View>
          ) : latest ? (
            <>
              <View style={styles.hero}>
                <BloomVisual bloom={latest.bloom} hero name={meta.name} />
              </View>

              <Section title="Your trend">
                {points && points.length >= 2 ? (
                  <TrendBars values={points.map((p) => p.bloom)} />
                ) : (
                  <ThemedText type="small" themeColor="textSecondary">
                    One scan so far. Come back after your next one to see your trend grow.
                  </ThemedText>
                )}
              </Section>

              <Section title="What went into it">
                {Object.entries(latest.scores).map(([key, score]) => (
                  <View key={key} style={styles.concernRow}>
                    <ThemedText type="small" style={styles.concernName}>{concernLabel(key)}</ThemedText>
                    <View style={[styles.concernTrack, { backgroundColor: theme.backgroundSelected }]}>
                      <View style={[styles.concernFill, { width: `${score}%`, backgroundColor: BLOOM }]} />
                    </View>
                    <ThemedText type="smallBold" style={styles.concernScore}>{score}</ThemedText>
                  </View>
                ))}
              </Section>

              <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
                {isHair ? `${HAIR_TREND} ${NOT_MEDICAL}` : NOT_MEDICAL}
              </ThemedText>

              {isHair && (
                <PrimaryButton testID="track-hair-rescan" label="Take a hair scan" onPress={() => router.push('/scan-hair')} />
              )}
            </>
          ) : (
            <View style={styles.empty}>
              <ThemedText style={styles.emptyEmoji}>🌱</ThemedText>
              <ThemedText type="subtitle" style={styles.center}>Your bloom is starting</ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
                Take your first scan and this journey will begin to grow.
              </ThemedText>
              <PrimaryButton testID="track-first-scan" label="Take a scan" onPress={() => router.replace(scanRoute)} />
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
      <ThemedText type="smallBold">{title}</ThemedText>
      {children}
    </View>
  );
}

function TrendBars({ values }: { values: number[] }) {
  const recent = values.slice(-12);
  return (
    <View style={styles.bars}>
      {recent.map((v, i) => (
        <View key={i} style={styles.barSlot}>
          <View style={[styles.bar, { height: Math.max(6, v), backgroundColor: BLOOM }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  backText: { fontSize: 16, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.four },
  loading: { alignItems: 'center', paddingVertical: Spacing.six },
  hero: { alignItems: 'center', paddingVertical: Spacing.three },
  section: { gap: Spacing.two },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, height: 110, paddingTop: Spacing.two },
  barSlot: { width: 22, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 18, borderRadius: 5 },
  concernRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 6 },
  concernName: { width: 120 },
  concernTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  concernFill: { height: 6, borderRadius: 3 },
  concernScore: { width: 28, textAlign: 'right' },
  disclaimer: { lineHeight: 18, marginTop: Spacing.two },
  empty: { alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.six },
  emptyEmoji: { fontSize: 64 },
  center: { textAlign: 'center' },
});
