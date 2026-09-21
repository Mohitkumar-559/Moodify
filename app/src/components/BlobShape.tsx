import { StyleSheet, View, ViewStyle } from 'react-native';

/**
 * Organic "blob" shape per docs/design-system.md.
 * RN's borderRadius only takes numbers (no CSS % shorthand), so each preset's
 * percentages are pre-resolved per corner and scaled to the given size.
 */
const BLOB_PRESETS = [
  { tl: 0.54, tr: 0.44, br: 0.5, bl: 0.52 }, // design-system.md default
  { tl: 0.46, tr: 0.56, br: 0.42, bl: 0.5 },
  { tl: 0.5, tr: 0.48, br: 0.58, bl: 0.4 },
  { tl: 0.6, tr: 0.4, br: 0.46, bl: 0.5 },
] as const;

type Props = {
  size: number;
  color: string;
  variant?: 0 | 1 | 2 | 3;
  style?: ViewStyle;
};

export function BlobShape({ size, color, variant = 0, style }: Props) {
  const p = BLOB_PRESETS[variant];
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderTopLeftRadius: size * p.tl,
          borderTopRightRadius: size * p.tr,
          borderBottomRightRadius: size * p.br,
          borderBottomLeftRadius: size * p.bl,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
