import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, Radius, Spacing, softShadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { BLOOM } from '@/features/onboarding/copy';
import { useSkin } from '@/lib/skins';
import { bloomAccessibilityLabel, bloomStage } from '@/lib/tracks/bloomStage';
import { useGarden, type GardenEntry } from './useGarden';

function scannedLabel(entry: GardenEntry): string {
  if (entry.bloom === null) return 'Tap to plant';
  const days = Math.floor((Date.now() - new Date(entry.lastScanAt ?? 0).getTime()) / 86_400_000);
  if (days <= 0) return 'Scanned today';
  if (days === 1) return 'Scanned yesterday';
  return `Scanned ${days}d ago`;
}

export default function GardenScreen() {
  const { entries } = useGarden();
  const theme = useTheme();
  const loading = entries === null;
  const empty = entries !== null && entries.length === 0;

  const scannedToday = !!entries?.some((e) => e.bloom !== null && scannedLabel(e) === 'Scanned today');
  const growing = entries?.length ?? 0;

  // Two-column masonry: deal cards left/right so the board reads as a staggered Pinterest board.
  const left = entries?.filter((_, i) => i % 2 === 0) ?? [];
  const right = entries?.filter((_, i) => i % 2 === 1) ?? [];

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <ThemedText style={styles.wordmark}>ReBloom</ThemedText>
            <Pressable
              testID="garden-account"
              onPress={() => router.push('/account')}
              accessibilityRole="button"
              accessibilityLabel="Account and sync"
              style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.line }]}
            >
              <ThemedText style={styles.iconGlyph}>☰</ThemedText>
            </Pressable>
          </View>

          <ThemedText type="title" style={styles.hello}>
            {'hey, you’re growing 🌿'}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            {empty
              ? 'Plant your first journey to begin.'
              : `${growing} ${growing === 1 ? 'journey' : 'journeys'} blooming${scannedToday ? ' · scanned today' : ''}`}
          </ThemedText>

          {loading && (
            <View testID="garden-loading" style={styles.center}>
              <ActivityIndicator color={BLOOM} />
            </View>
          )}

          {empty && (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyEmoji}>🌱</ThemedText>
              <ThemedText type="subtitle" style={styles.centerText}>
                Your garden is ready to plant
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.centerText}>
                Add a journey to start following your healing.
              </ThemedText>
            </View>
          )}

          {!loading && !empty && (
            <View style={styles.board}>
              <View style={styles.column}>
                {left.map((e, i) => (
                  <GardenCard key={e.trackId} entry={e} tall={i % 3 === 0} />
                ))}
                <AddTile />
              </View>
              <View style={styles.column}>
                {right.map((e, i) => (
                  <GardenCard key={e.trackId} entry={e} tall={i % 3 === 1} />
                ))}
              </View>
            </View>
          )}

          {empty && (
            <Pressable
              testID="add-journey"
              onPress={() => router.push('/add-journey')}
              accessibilityRole="button"
              style={styles.addRow}
            >
              <ThemedText style={[styles.addText, { color: BLOOM }]}>+ Add a journey</ThemedText>
            </Pressable>
          )}
        </ScrollView>

        {!empty && (
          <View style={styles.actions}>
            <PrimaryButton testID="garden-scan" label="Take a scan 🌸" onPress={() => router.push('/scan')} />
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function GardenCard({ entry, tall }: { entry: GardenEntry; tall: boolean }) {
  const scheme = useColorScheme();
  const { skin } = useSkin();
  const dark = scheme === 'dark';
  const hue = skin.hues[dark ? 'dark' : 'light'][entry.trackId];
  const stage = bloomStage(entry.bloom);
  // Translucent chrome that reads on both a pale (light) and a deep (dark) pastel card.
  const chromeBg = dark ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.6)';
  const trackBg = dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.55)';
  const label = `${entry.name}${entry.sensitive ? ', private' : ''}. ${bloomAccessibilityLabel(entry.bloom)}. ${scannedLabel(entry)}`;
  return (
    <Pressable
      testID={`garden-card-${entry.trackId}`}
      onPress={() => router.push(`/track/${entry.trackId}`)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens this journey"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: hue.bg },
        pressed && styles.cardPressed,
      ]}
    >
      {entry.bloom !== null && (
        <View style={[styles.scorePill, { backgroundColor: chromeBg }]}>
          <ThemedText style={[styles.scoreText, { color: hue.ink }]}>{entry.bloom}</ThemedText>
        </View>
      )}
      <ThemedText style={[styles.cardEmoji, tall && styles.cardEmojiTall]}>{skin.stageEmoji[stage.key]}</ThemedText>
      <ThemedText style={[styles.cardName, { color: hue.ink }]} numberOfLines={2}>
        {entry.name}
      </ThemedText>
      <ThemedText style={[styles.cardMeta, { color: hue.ink }]} numberOfLines={1}>
        {entry.sensitive ? 'PRIVATE · ' : ''}
        {entry.bloom === null ? 'not planted' : stage.label.toLowerCase()}
      </ThemedText>
      <View style={[styles.prog, { backgroundColor: trackBg }]}>
        <View style={[styles.progFill, { width: `${entry.bloom ?? 4}%`, backgroundColor: hue.ink }]} />
      </View>
    </Pressable>
  );
}

function AddTile() {
  const theme = useTheme();
  return (
    <Pressable
      testID="add-journey"
      onPress={() => router.push('/add-journey')}
      accessibilityRole="button"
      accessibilityLabel="Add a journey"
      style={({ pressed }) => [styles.addTile, { borderColor: theme.line }, pressed && styles.cardPressed]}
    >
      <ThemedText style={[styles.addPlus, { color: BLOOM }]}>＋</ThemedText>
      <ThemedText style={[styles.addTileText, { color: theme.textSecondary }]}>add a journey</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.four },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  wordmark: { fontFamily: Fonts.displayBold, fontSize: 20, color: BLOOM },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 18 },
  hello: { fontSize: 30, lineHeight: 36 },
  subtitle: { marginTop: Spacing.one, marginBottom: Spacing.four },
  board: { flexDirection: 'row', gap: Spacing.three },
  column: { flex: 1, gap: Spacing.three },
  card: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    ...softShadow,
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.94 },
  scorePill: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  scoreText: { fontFamily: Fonts.display, fontSize: 15 },
  cardEmoji: { fontSize: 36, marginBottom: Spacing.two },
  cardEmojiTall: { fontSize: 52, marginTop: Spacing.two },
  cardName: { fontFamily: Fonts.display, fontSize: 16, lineHeight: 20 },
  cardMeta: { fontFamily: Fonts.bodyBold, fontSize: 11.5, opacity: 0.72, marginTop: 2, letterSpacing: 0.2 },
  prog: { height: 7, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.55)', overflow: 'hidden', marginTop: Spacing.three },
  progFill: { height: 7, borderRadius: Radius.pill },
  addTile: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  addPlus: { fontFamily: Fonts.display, fontSize: 26 },
  addTileText: { fontFamily: Fonts.display, fontSize: 14 },
  addRow: { alignSelf: 'center', paddingVertical: Spacing.three },
  addText: { fontFamily: Fonts.display, fontSize: 16 },
  actions: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset + Spacing.four, paddingTop: Spacing.two },
  center: { alignItems: 'center', paddingVertical: Spacing.six },
  centerText: { textAlign: 'center' },
  emptyState: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.six, paddingBottom: Spacing.four },
  emptyEmoji: { fontSize: 56 },
});
