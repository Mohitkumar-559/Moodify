import { Pressable, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { colors, touchTarget } from '../theme/tokens';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  variant?: 'surface' | 'transparent';
};

export function IconButton({ onPress, accessibilityLabel, children, variant = 'surface' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        variant === 'surface' && styles.surface,
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: touchTarget.min / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
