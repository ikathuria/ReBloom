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
import { BloomVisual } from '@/features/garden/BloomVisual';
import { canScan, scanBlockReason } from '@/features/privacy/consent';
import { getHairAnalyzer } from '@/lib/analysis';
import { getDb } from '@/lib/db';
import { runHairScan, type HairScanResult } from './runHairScan';

type State = 'checking' | 'blocked' | 'idle' | 'analyzing' | 'done' | 'error';

export default function ScanHairScreen() {
  const [state, setState] = useState<State>('checking');
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [result, setResult] = useState<HairScanResult | null>(null);

  useEffect(() => {
    let alive = true;
    getDb()
      .then((db) => db.getConsent())
      .then((consent) => {
        if (!alive) return;
        if (consent && canScan(consent)) setState('idle');
        else {
          setBlockReason(scanBlockReason(consent ?? { capture: false, analysis: false, updatedAt: null }));
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
      source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    const base64 = picked.assets?.[0]?.base64;
    if (picked.canceled || !base64) return;
    setState('analyzing');
    try {
      const db = await getDb();
      const r = await runHairScan({ imageBase64: base64, analyzer: getHairAnalyzer(), db });
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
          {state === 'checking' && (
            <View style={styles.centered}>
              <ActivityIndicator color={BLOOM} />
            </View>
          )}

          {state === 'blocked' && (
            <View style={styles.centered}>
              <ThemedText style={styles.emoji}>🌿</ThemedText>
              <ThemedText type="subtitle" style={styles.center}>Scanning is off</ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.center}>{blockReason}</ThemedText>
            </View>
          )}

          {state === 'idle' && (
            <>
              <View style={styles.header}>
                <ThemedText type="title">Check your hair</ThemedText>
                <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
                  Part your hair and hold the camera above, looking down at your scalp, in bright even
                  light. Try the same spot each time. Hair grows slowly — a monthly check is plenty.
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
                  This is a coarse month-to-month trend — not a follicle count, not a diagnosis.
                </ThemedText>
              </View>
              <View style={styles.actions}>
                <PrimaryButton testID="hair-camera" label="Take a photo" onPress={() => capture('camera')} />
                <SecondaryButton testID="hair-library" label="Choose a photo" onPress={() => capture('library')} />
              </View>
            </>
          )}

          {state === 'analyzing' && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={BLOOM} />
              <ThemedText type="subtitle" style={styles.center}>Looking at your hair…</ThemedText>
            </View>
          )}

          {state === 'done' && result && (
            <>
              <View style={styles.header}>
                <ThemedText style={styles.emoji}>🌸</ThemedText>
                <ThemedText type="title">Your hair bloom</ThemedText>
              </View>
              <View style={styles.centered}>
                <BloomVisual bloom={result.bloom} hero />
                <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
                  Gentle and slow is the goal. See you next month.
                </ThemedText>
              </View>
              <View style={styles.actions}>
                <PrimaryButton testID="hair-done" label="Back to garden" onPress={() => router.back()} />
              </View>
            </>
          )}

          {state === 'error' && (
            <View style={styles.centered}>
              <ThemedText type="subtitle" style={styles.center}>That scan didn’t go through</ThemedText>
              <PrimaryButton testID="hair-retry" label="Try again" onPress={() => setState('idle')} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  panel: { flex: 1, paddingHorizontal: Spacing.four, justifyContent: 'space-between' },
  header: { paddingTop: Spacing.five, gap: Spacing.three },
  body: { lineHeight: 22 },
  actions: { gap: Spacing.two, paddingVertical: Spacing.three },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  center: { textAlign: 'center' },
  emoji: { fontSize: 64, textAlign: 'center' },
  secondary: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Spacing.four, borderWidth: 2, alignItems: 'center' },
  secondaryLabel: { fontSize: 16, fontWeight: '700' },
});
