import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OnboardingFlow, useOnboardingGate } from '@/features/onboarding';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { status, complete } = useOnboardingGate();

  if (status === 'loading') {
    return <ThemedView style={styles.fill} />;
  }

  if (status === 'needed') {
    return <OnboardingFlow onComplete={complete} />;
  }

  // status === 'done' — placeholder garden until M4 builds the real one.
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.center}>
        <ThemedText style={styles.bloom}>🌱</ThemedText>
        <ThemedText type="title">Your garden is growing</ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
          Your journeys are set. Scanning and your bloom trends arrive next.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  bloom: { fontSize: 72 },
  body: { textAlign: 'center', lineHeight: 22 },
});
