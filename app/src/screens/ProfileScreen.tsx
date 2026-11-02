import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlobShape } from '../components/BlobShape';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radii, spacing } from '../theme/tokens';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.avatarRow}>
        <BlobShape size={72} color={colors.accentAlt1} variant={2} />
        <View>
          <Text style={styles.name}>{user?.display_name ?? 'Listener'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
        onPress={logout}
      >
        <Text style={styles.logoutLabel}>Log out</Text>
      </Pressable>

      <Pressable
        accessibilityRole="link"
        style={styles.creditsRow}
        onPress={() => Linking.openURL('https://creativecommons.org/licenses/by/3.0/')}
      >
        <Text style={styles.creditsText}>
          Some tracks by Broke For Free, licensed CC BY 3.0
        </Text>
      </Pressable>
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
  logoutButton: {
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  logoutLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accentEnergy,
  },
  creditsRow: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  creditsText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
