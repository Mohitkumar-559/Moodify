import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, touchTarget } from '../theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function MoodChip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexBasis: '48%',
    minHeight: touchTarget.min + 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: colors.accentEnergy,
    borderColor: colors.accentEnergy,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.ground,
  },
});
