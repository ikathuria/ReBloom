import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type BloomHue, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from './copy';

export interface SelectRowProps {
  title: string;
  help?: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
  /** Optional sticker chip (emoji on a pastel hue) shown on the left. */
  emoji?: string;
  hue?: BloomHue;
}

/** A tappable rounded row with an optional sticker chip and a bloom-colored selected indicator. */
export function SelectRow({ title, help, selected, onPress, testID, emoji, hue }: SelectRowProps) {
  const theme = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
      style={[
        styles.row,
        { backgroundColor: theme.card, borderColor: theme.line },
        selected && { backgroundColor: theme.bloomSoft, borderColor: BLOOM },
      ]}
    >
      {emoji ? (
        <View style={[styles.chip, { backgroundColor: hue?.bg ?? theme.backgroundSelected }]}>
          <ThemedText style={styles.chipEmoji}>{emoji}</ThemedText>
        </View>
      ) : null}
      <View style={styles.text}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {help ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.help}>
            {help}
          </ThemedText>
        ) : null}
      </View>
      <View
        style={[
          styles.indicator,
          { borderColor: selected ? BLOOM : theme.line },
          selected && { backgroundColor: BLOOM },
        ]}
      >
        {selected ? <ThemedText style={styles.check}>✓</ThemedText> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipEmoji: { fontSize: 22 },
  text: { flex: 1, gap: 2 },
  help: { lineHeight: 18 },
  indicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#ffffff', fontSize: 15, fontWeight: '700', lineHeight: 18 },
});
