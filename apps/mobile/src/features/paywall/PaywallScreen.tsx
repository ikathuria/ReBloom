import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from '@/features/onboarding/copy';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { getPurchases, type ProProduct } from '@/lib/purchases';

const BENEFITS = [
  { emoji: '🌿', title: 'Every journey', body: 'Follow all your healing tracks at once — not just one.' },
  { emoji: '📅', title: 'Full rhythm', body: 'Scan as often as each journey allows — weekly skin, monthly hair.' },
  { emoji: '👕', title: 'Gentle try-on', body: 'See soft, skin-kind fabrics on you before you buy.' },
] as const;

export default function PaywallScreen() {
  const theme = useTheme();
  const [products, setProducts] = useState<ProProduct[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getPurchases()
      .getProducts()
      .then((p) => alive && setProducts(p));
    return () => {
      alive = false;
    };
  }, []);

  async function buy(productId: string) {
    setBusy(productId);
    setNote(null);
    try {
      const { tier, cancelled } = await getPurchases().purchasePro(productId);
      if (cancelled) return;
      if (tier === 'pro') router.back();
    } catch {
      setNote('That didn’t go through. You can try again.');
    } finally {
      setBusy(null);
    }
  }

  async function restore() {
    setBusy('restore');
    setNote(null);
    try {
      const tier = await getPurchases().restore();
      if (tier === 'pro') router.back();
      else setNote('No previous purchase found on this account.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <Pressable testID="paywall-close" onPress={() => router.back()} style={styles.close} accessibilityRole="button">
          <ThemedText style={[styles.closeText, { color: theme.textSecondary }]}>✕</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.mark}>🌸</ThemedText>
          <ThemedText type="title" style={styles.center}>ReBloom Pro</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={[styles.center, styles.subtitle]}>
            Tend your whole garden. Everything below stays as private as it is today.
          </ThemedText>

          <View style={styles.benefits}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={[styles.benefit, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.benefitEmoji}>{b.emoji}</ThemedText>
                <View style={styles.benefitText}>
                  <ThemedText type="smallBold">{b.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.benefitBody}>{b.body}</ThemedText>
                </View>
              </View>
            ))}
          </View>

          {products === null ? (
            <ActivityIndicator color={BLOOM} style={styles.loading} />
          ) : (
            <View style={styles.plans}>
              {products.map((p, i) => (
                <PrimaryButton
                  key={p.id}
                  testID={`paywall-buy-${p.period}`}
                  label={busy === p.id ? 'Starting…' : planLabel(p)}
                  onPress={() => buy(p.id)}
                  disabled={busy !== null}
                  variant={i === 0 ? 'primary' : 'secondary'}
                />
              ))}
            </View>
          )}

          {note ? <ThemedText type="small" style={[styles.center, { color: '#c0392b' }]}>{note}</ThemedText> : null}

          <Pressable testID="paywall-restore" onPress={restore} disabled={busy !== null} accessibilityRole="button" style={styles.link}>
            <ThemedText style={[styles.linkText, { color: BLOOM }]}>Restore purchase</ThemedText>
          </Pressable>
          <Pressable testID="paywall-later" onPress={() => router.back()} accessibilityRole="button" style={styles.link}>
            <ThemedText type="small" themeColor="textSecondary">Maybe later</ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={[styles.center, styles.fine]}>
            Billed through the App Store. Cancel anytime. Free always keeps one journey.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const planLabel = (p: ProProduct): string => {
  const cycle = p.period === 'yearly' ? 'year' : 'month';
  return `Go Pro — ${p.priceString}/${cycle}`;
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  close: { alignSelf: 'flex-end', paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  closeText: { fontSize: 20, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.two },
  mark: { fontSize: 56, textAlign: 'center' },
  center: { textAlign: 'center' },
  subtitle: { lineHeight: 22, marginBottom: Spacing.three },
  benefits: { gap: Spacing.two, marginBottom: Spacing.three },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.md },
  benefitEmoji: { fontSize: 28 },
  benefitText: { flex: 1, gap: 2 },
  benefitBody: { lineHeight: 18 },
  loading: { paddingVertical: Spacing.four },
  plans: { gap: Spacing.two },
  link: { alignSelf: 'center', paddingVertical: Spacing.two },
  linkText: { fontFamily: Fonts.display, fontSize: 15 },
  fine: { lineHeight: 18, marginTop: Spacing.two },
});
