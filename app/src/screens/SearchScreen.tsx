import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchIcon } from '../components/icons';
import { MOCK_PLAYLISTS, formatDuration } from '../data/mockData';
import { colors, fonts, radii, spacing } from '../theme/tokens';

export function SearchScreen() {
  const [query, setQuery] = useState('');

  const allTracks = useMemo(
    () => MOCK_PLAYLISTS.flatMap((p) => p.tracks.map((t) => ({ ...t, playlistTitle: p.title }))),
    [],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.moodTag.toLowerCase().includes(q),
    );
  }, [query, allTracks]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Search</Text>

      <View style={styles.inputWrap}>
        <SearchIcon size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search songs, artists, moods, genres"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search songs, artists, moods, or genres"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.trim().length > 0 ? (
            <Text style={styles.empty}>No results for &ldquo;{query}&rdquo;</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackMeta}>{item.artist} · {item.playlistTitle}</Text>
            </View>
            <Text style={styles.duration}>{formatDuration(item.durationSec)}</Text>
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  list: {
    paddingTop: spacing.lg,
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
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
