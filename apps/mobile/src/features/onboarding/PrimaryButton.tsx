import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing, softShadow } from '@/constants/theme';
import { BLOOM, BLOOM_DEEP } from './copy';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  /** 'primary' = filled bloom pill (default); 'secondary' = bloom-outlined pill. */
  variant?: 'primary' | 'secondary';
}

/** Chunky, rounded bloom pill — the app's signature call to action. */
export function PrimaryButton({ label, onPress, disabled = false, testID, variant = 'primary' }: PrimaryButtonProps) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        !secondary && styles.shadow,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
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
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  shadow: { ...softShadow, shadowColor: BLOOM_DEEP, shadowOpacity: 0.4 },
  secondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: BLOOM },
  disabled: { opacity: 0.4 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  label: { color: '#ffffff', fontFamily: Fonts.display, fontSize: 17 },
  secondaryLabel: { color: BLOOM },
});
