import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { BLOOM } from './copy';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  /** 'primary' = filled bloom CTA (default); 'secondary' = bloom-outlined. */
  variant?: 'primary' | 'secondary';
}

/** Bloom-colored CTA. */
export function PrimaryButton({ label, onPress, disabled = false, testID, variant = 'primary' }: PrimaryButtonProps) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[styles.button, secondary && styles.secondary, disabled && styles.disabled]}
    >
      <ThemedText style={[styles.label, secondary && styles.secondaryLabel]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: BLOOM,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  secondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: BLOOM },
  disabled: { opacity: 0.4 },
  label: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryLabel: { color: BLOOM },
});
