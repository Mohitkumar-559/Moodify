import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlobShape } from '../components/BlobShape';
import { colors, fonts, spacing } from '../theme/tokens';

export function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.avatarRow}>
        <BlobShape size={72} color={colors.accentAlt1} variant={2} />
        <View>
          <Text style={styles.name}>Listener</Text>
          <Text style={styles.email}>Account & settings coming soon</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
