import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from './copy';

export interface SelectRowProps {
  title: string;
  help?: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

/** A tappable row with a title, optional help line, and a bloom-colored selected indicator. */
export function SelectRow({ title, help, selected, onPress, testID }: SelectRowProps) {
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
        { backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement },
      ]}
    >
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
          { borderColor: selected ? BLOOM : theme.textSecondary },
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
    borderRadius: Spacing.three,
  },
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
