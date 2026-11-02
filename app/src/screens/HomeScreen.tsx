import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlobShape } from '../components/BlobShape';
import { IconButton } from '../components/IconButton';
import { SearchIcon, PlusIcon } from '../components/icons';
import { listPlaylists } from '../api/playlists';
import { ApiError } from '../api/client';
import { PlaylistSummary } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      setIsLoading(true);
      listPlaylists(token)
        .then((data) => {
          if (!cancelled) setPlaylists(data);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof ApiError ? e.message : 'Failed to load playlists');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>Moodify</Text>
        <IconButton accessibilityLabel="Search" onPress={() => navigation.navigate('Tabs', { screen: 'Search' })}>
          <SearchIcon size={20} color={colors.textPrimary} />
        </IconButton>
      </View>

      <Text style={styles.title}>Your mood playlists</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.accentEnergy} style={styles.centerState} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : playlists.length === 0 ? (
        <Text style={styles.emptyText}>No playlists yet — tap + to generate your first mood playlist.</Text>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate('PlaylistResult', { playlistId: item.id })}
            >
              <BlobShape size={84} color={item.cover_accent_color ?? colors.accentEnergy} variant={0} />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </Pressable>
          )}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start a new mood playlist"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('MoodSelect')}
      >
        <PlusIcon size={26} color={colors.ground} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  centerState: {
    marginTop: spacing.xxl,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accentEnergy,
    marginTop: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  grid: {
    paddingBottom: spacing.xxl,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentEnergy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
  },
});
