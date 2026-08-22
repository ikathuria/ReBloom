import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from '@/features/onboarding/copy';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { type FabricTip, recommendFabrics } from '@/lib/apparel/recommend';
import { NOT_MEDICAL } from '@/features/privacy/disclaimer';
import { canUseTryOn, useTier } from '@/lib/purchases';
import { useApparel } from './useApparel';

const LEVEL_LABEL = { calm: 'Calm', settling: 'Settling', sensitive: 'Sensitive' } as const;

export default function ApparelScreen() {
  const scores = useApparel();
  const theme = useTheme();
  const { tier } = useTier();

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText type="title">Gentle on your skin</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Fabric suggestions tuned to how your skin looks right now.
          </ThemedText>

          {scores === undefined && (
            <View testID="apparel-loading" style={styles.loading}>
              <ActivityIndicator color={BLOOM} />
            </View>
          )}

          {scores === null && (
            <View style={styles.empty}>
              <ThemedText style={styles.emoji}>🧴</ThemedText>
              <ThemedText type="subtitle" style={styles.center}>Take a skin scan first</ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
                Once we’ve seen your skin, we’ll suggest fabrics that feel good on it.
              </ThemedText>
              <PrimaryButton testID="apparel-scan" label="Take a scan" onPress={() => router.push('/scan')} />
            </View>
          )}

          {scores && scores !== null && (() => {
            const advice = recommendFabrics(scores);
            return (
              <>
                <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="smallBold">Skin comfort: {LEVEL_LABEL[advice.level]}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.note}>{advice.note}</ThemedText>
                </View>

                <ThemedText type="smallBold" style={styles.section}>Reach for</ThemedText>
                {advice.recommended.map((t) => <TipRow key={t.fabric} tip={t} good />)}

                <ThemedText type="smallBold" style={styles.section}>Maybe skip for now</ThemedText>
                {advice.avoid.map((t) => <TipRow key={t.fabric} tip={t} />)}

                <View style={[styles.tryon, { borderColor: theme.backgroundSelected }]}>
                  <ThemedText type="smallBold">Virtual try-on</ThemedText>
                  {canUseTryOn(tier) ? (
                    <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
                      Included with your Pro plan — live try-on is arriving soon.
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
                        See these fabrics on you before you buy — part of ReBloom Pro.
                      </ThemedText>
                      <View style={styles.tryonCta}>
                        <PrimaryButton
                          testID="apparel-upgrade"
                          label="Unlock with Pro"
                          variant="secondary"
                          onPress={() => router.push('/paywall')}
                        />
                      </View>
                    </>
                  )}
                </View>

                <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
                  Comfort suggestions to help sensitive skin. {NOT_MEDICAL}
                </ThemedText>
              </>
            );
          })()}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function TipRow({ tip, good = false }: { tip: FabricTip; good?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.tip, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.dot, { backgroundColor: good ? BLOOM : theme.textSecondary }]} />
      <View style={styles.tipText}>
        <ThemedText type="smallBold">{tip.fabric}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>{tip.why}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two, paddingBottom: BottomTabInset + Spacing.five },
  subtitle: { lineHeight: 22, marginBottom: Spacing.two },
  badge: { padding: Spacing.three, borderRadius: Radius.md, gap: 2, marginBottom: Spacing.two },
  note: { lineHeight: 18 },
  section: { marginTop: Spacing.three, marginBottom: Spacing.one },
  tip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.md },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tipText: { flex: 1, gap: 2 },
  tryon: { marginTop: Spacing.four, padding: Spacing.three, borderRadius: Radius.md, borderWidth: 2, gap: 2 },
  tryonCta: { marginTop: Spacing.two },
  disclaimer: { marginTop: Spacing.three, lineHeight: 18 },
  empty: { alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.six },
  emoji: { fontSize: 56 },
  center: { textAlign: 'center' },
  loading: { alignItems: 'center', paddingVertical: Spacing.six },
});
