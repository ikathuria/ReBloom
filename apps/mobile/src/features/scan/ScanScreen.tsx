import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { BLOOM } from '@/features/onboarding/copy';
import { canScan, scanBlockReason } from '@/features/privacy/consent';
import { getAnalysisProvider } from '@/lib/analysis';
import { getDb } from '@/lib/db';
import { TRACKS_META } from '@/lib/tracks';
import { runSkinScan, type ScanResult } from './runScan';

type State = 'checking' | 'blocked' | 'idle' | 'analyzing' | 'done' | 'error';

export default function ScanScreen() {
  const [state, setState] = useState<State>('checking');
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    let alive = true;
    getDb()
      .then((db) => db.getConsent())
      .then((consent) => {
        if (!alive) return;
        if (consent && canScan(consent)) setState('idle');
        else {
          setBlockReason(consent ? scanBlockReason(consent) : scanBlockReason({ capture: false, analysis: false, updatedAt: null }));
          setState('blocked');
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  async function capture(source: 'camera' | 'library') {
    const opts: ImagePicker.ImagePickerOptions = { quality: 0.6, base64: true, mediaTypes: ['images'] };
    const picked =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
    const base64 = picked.assets?.[0]?.base64;
    if (picked.canceled || !base64) return;
    setState('analyzing');
    try {
      const db = await getDb();
      const r = await runSkinScan({ imageBase64: base64, provider: getAnalysisProvider(), db });
      setResult(r);
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.panel}>
          {state === 'checking' && <Centered><ActivityIndicator color={BLOOM} /></Centered>}

          {state === 'blocked' && (
            <Centered>
              <ThemedText style={styles.emoji}>🌿</ThemedText>
              <ThemedText type="subtitle" style={styles.center}>Scanning is off</ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
                {blockReason}
              </ThemedText>
            </Centered>
          )}

          {state === 'idle' && (
            <>
              <View style={styles.header}>
                <ThemedText type="title">Take a scan</ThemedText>
                <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
                  A clear, front-facing photo in soft, even light works best. This is an encouraging
                  trend — not medical advice, not a diagnosis. Your photo is analyzed once and never
                  stored.
                </ThemedText>
              </View>
              <View style={styles.actions}>
                <PrimaryButton testID="scan-camera" label="Take a photo" onPress={() => capture('camera')} />
                <SecondaryButton testID="scan-library" label="Choose a photo" onPress={() => capture('library')} />
              </View>
            </>
          )}

          {state === 'analyzing' && (
            <Centered>
              <ActivityIndicator size="large" color={BLOOM} />
              <ThemedText type="subtitle" style={styles.center}>Reading your bloom…</ThemedText>
            </Centered>
          )}

          {state === 'done' && result && (
            <>
              <View style={styles.header}>
                <ThemedText style={styles.emoji}>🌸</ThemedText>
                <ThemedText type="title">Your bloom today</ThemedText>
              </View>
              <View style={styles.results}>
                {result.blooms.length === 0 ? (
                  <ThemedText type="default" themeColor="textSecondary">
                    You have no skin journeys yet. Add one to start tracking.
                  </ThemedText>
                ) : (
                  result.blooms.map((b) => (
                    <BloomRow key={b.trackId} name={TRACKS_META[b.trackId].name} bloom={b.bloom} />
                  ))
                )}
              </View>
              <View style={styles.actions}>
                <PrimaryButton testID="scan-done" label="Back to garden" onPress={() => router.back()} />
              </View>
            </>
          )}

          {state === 'error' && (
            <Centered>
              <ThemedText type="subtitle" style={styles.center}>That scan didn’t go through</ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
                Let’s try again in a moment.
              </ThemedText>
              <View style={styles.actions}>
                <PrimaryButton testID="scan-retry" label="Try again" onPress={() => setState('idle')} />
              </View>
            </Centered>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function BloomRow({ name, bloom }: { name: string; bloom: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.bloomRow, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold" style={styles.bloomName}>{name}</ThemedText>
      <ThemedText style={[styles.bloomValue, { color: BLOOM }]}>{bloom}</ThemedText>
    </View>
  );
}

function SecondaryButton({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  const theme = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="button" style={[styles.secondary, { borderColor: theme.backgroundSelected }]}>
      <ThemedText style={styles.secondaryLabel}>{label}</ThemedText>
    </Pressable>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  panel: { flex: 1, paddingHorizontal: Spacing.four, justifyContent: 'space-between' },
  header: { paddingTop: Spacing.five, gap: Spacing.three },
  body: { lineHeight: 22 },
  actions: { gap: Spacing.two, paddingVertical: Spacing.three },
  results: { flex: 1, justifyContent: 'center', gap: Spacing.two },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  center: { textAlign: 'center' },
  emoji: { fontSize: 64, textAlign: 'center' },
  bloomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three, borderRadius: Spacing.three },
  bloomName: { flex: 1 },
  bloomValue: { fontSize: 28, fontWeight: '800' },
  secondary: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Spacing.four, borderWidth: 2, alignItems: 'center' },
  secondaryLabel: { fontSize: 16, fontWeight: '700' },
});
