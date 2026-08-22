import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from '@/features/onboarding/copy';
import { SelectRow } from '@/features/onboarding/SelectRow';
import { useSkin } from '@/lib/skins';
import { getDb } from '@/lib/db';
import { canEnrollAnother, useTier } from '@/lib/purchases';
import { TRACKS_META, TRACK_IDS, defaultCadence, type TrackId } from '@/lib/tracks';

export default function AddJourneyScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const { skin } = useSkin();
  const { tier } = useTier();
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

  const locked = !canEnrollAnother(tier, enrolled.size);

  async function add(id: TrackId) {
    // Free follows one journey — sending a second one to the paywall instead of enrolling.
    if (locked) {
      router.push('/paywall');
      return;
    }
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

          {locked && (
            <Pressable
              testID="add-pro-banner"
              onPress={() => router.push('/paywall')}
              accessibilityRole="button"
              style={[styles.banner, { backgroundColor: theme.backgroundElement }]}
            >
              <ThemedText type="smallBold">🌸 Follow more with ReBloom Pro</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.bannerBody}>
                Free tends one journey. Unlock every journey and full scan rhythm — tap to see Pro.
              </ThemedText>
            </Pressable>
          )}

          <View style={styles.rows}>
            {TRACK_IDS.map((id) => {
              const meta = TRACKS_META[id];
              const isEnrolled = enrolled.has(id);
              const showLock = locked && !isEnrolled;
              return (
                <SelectRow
                  key={id}
                  testID={`add-${id}`}
                  title={meta.sensitive ? `${meta.name}  ·  private` : meta.name}
                  help={isEnrolled ? 'Already in your garden' : showLock ? '🔒 ReBloom Pro' : meta.blurb}
                  emoji={skin.trackEmoji[id]}
                  hue={skin.hues[scheme === 'dark' ? 'dark' : 'light'][id]}
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
  backText: { fontFamily: Fonts.display, fontSize: 16 },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.three },
  subtitle: { lineHeight: 22 },
  banner: { padding: Spacing.three, borderRadius: Radius.md, gap: 2 },
  bannerBody: { lineHeight: 18 },
  rows: { gap: Spacing.two },
});
