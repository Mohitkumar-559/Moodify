import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeartIcon } from '../components/icons';
import { MOCK_PLAYLISTS, formatDuration } from '../data/mockData';
import { colors, fonts, spacing } from '../theme/tokens';

const likedTracks = MOCK_PLAYLISTS.flatMap((p) => p.tracks.slice(0, 1));

export function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Your Library</Text>
      <Text style={styles.subtitle}>Liked songs</Text>

      <FlatList
        data={likedTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackMeta}>{item.artist}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.duration}>{formatDuration(item.durationSec)}</Text>
              <HeartIcon size={18} color={colors.accentEnergy} filled />
            </View>
          </View>
        )}
      />
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
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  trackTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  trackMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  duration: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
