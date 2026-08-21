import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BLOOM } from '@/features/onboarding/copy';
import { SelectRow } from '@/features/onboarding/SelectRow';
import { getDb } from '@/lib/db';
import { TRACKS_META, TRACK_IDS, defaultCadence, type TrackId } from '@/lib/tracks';

export default function AddJourneyScreen() {
  const [enrolled, setEnrolled] = useState<Set<TrackId>>(new Set());

  useEffect(() => {
    let alive = true;
    getDb()
      .then((db) => db.listEnrollments())
      .then((es) => alive && setEnrolled(new Set(es.map((e) => e.trackId))));
    return () => {
      alive = false;
    };
  }, []);

  async function add(id: TrackId) {
    const db = await getDb();
    await db.upsertEnrollment({ trackId: id, cadence: defaultCadence(id), enrolledAt: new Date().toISOString() });
    setEnrolled((prev) => new Set(prev).add(id));
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <Pressable testID="add-back" onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <ThemedText style={[styles.backText, { color: BLOOM }]}>‹ Garden</ThemedText>
        </Pressable>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText type="title">Add a journey</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Follow another kind of healing. Tap to add it to your garden.
          </ThemedText>
          <View style={styles.rows}>
            {TRACK_IDS.map((id) => {
              const meta = TRACKS_META[id];
              const isEnrolled = enrolled.has(id);
              return (
                <SelectRow
                  key={id}
                  testID={`add-${id}`}
                  title={meta.sensitive ? `${meta.name}  ·  private` : meta.name}
                  help={isEnrolled ? 'Already in your garden' : meta.blurb}
                  selected={isEnrolled}
                  onPress={() => !isEnrolled && add(id)}
                />
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  backText: { fontSize: 16, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.three },
  subtitle: { lineHeight: 22 },
  rows: { gap: Spacing.two },
});
