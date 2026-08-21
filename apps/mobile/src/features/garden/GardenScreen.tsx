import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { BLOOM } from '@/features/onboarding/copy';
import { BloomVisual } from './BloomVisual';
import { useGarden, type GardenEntry } from './useGarden';

function scannedLabel(entry: GardenEntry): string {
  if (entry.bloom === null) return 'Take your first scan';
  const days = Math.floor((Date.now() - new Date(entry.lastScanAt ?? 0).getTime()) / 86_400_000);
  if (days <= 0) return 'Scanned today';
  if (days === 1) return 'Scanned yesterday';
  return `Scanned ${days}d ago`;
}

export default function GardenScreen() {
  const { entries } = useGarden();

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable
            testID="garden-account"
            onPress={() => router.push('/account')}
            accessibilityRole="button"
            style={styles.accountLink}
          >
            <ThemedText style={[styles.accountText, { color: BLOOM }]}>Account</ThemedText>
          </Pressable>
          <ThemedText type="title">Your garden</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Each journey grows as you heal. Take a scan to tend it.
          </ThemedText>

          <View style={styles.grid}>
            {entries?.map((e) => <GardenCard key={e.trackId} entry={e} />)}
          </View>

          <Pressable
            testID="add-journey"
            onPress={() => router.push('/add-journey')}
            accessibilityRole="button"
            style={styles.addRow}
          >
            <ThemedText style={[styles.addText, { color: BLOOM }]}>+ Add a journey</ThemedText>
          </Pressable>
        </ScrollView>

        <View style={styles.actions}>
          <PrimaryButton testID="garden-scan" label="Take a scan" onPress={() => router.push('/scan')} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function GardenCard({ entry }: { entry: GardenEntry }) {
  const theme = useTheme();
  return (
    <Pressable
      testID={`garden-card-${entry.trackId}`}
      onPress={() => router.push(`/track/${entry.trackId}`)}
      accessibilityRole="button"
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}
    >
      <BloomVisual bloom={entry.bloom} />
      <ThemedText type="smallBold" style={styles.cardName} numberOfLines={1}>
        {entry.name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {scannedLabel(entry)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.four },
  accountLink: { alignSelf: 'flex-end', paddingVertical: Spacing.one },
  accountText: { fontSize: 15, fontWeight: '700' },
  subtitle: { lineHeight: 22, marginBottom: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, justifyContent: 'space-between' },
  card: {
    width: '47%',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.four,
  },
  cardName: { marginTop: Spacing.two, textAlign: 'center' },
  addRow: { alignSelf: 'center', paddingVertical: Spacing.three },
  addText: { fontSize: 16, fontWeight: '700' },
  actions: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset + Spacing.four },
});
