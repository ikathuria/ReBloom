import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';

// Placeholder garden — M4 builds the real multi-track garden with per-track blooms.
export default function GardenScreen() {
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.hero}>
          <ThemedText style={styles.bloom}>🌱</ThemedText>
          <ThemedText type="title">Your garden is growing</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
            Take a scan to update your blooms. Trends over time arrive next.
          </ThemedText>
        </View>
        <View style={styles.actions}>
          <PrimaryButton testID="garden-scan" label="Take a scan" onPress={() => router.push('/scan')} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.four, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  bloom: { fontSize: 72 },
  body: { textAlign: 'center', lineHeight: 22 },
  actions: { paddingBottom: BottomTabInset + Spacing.four },
});
