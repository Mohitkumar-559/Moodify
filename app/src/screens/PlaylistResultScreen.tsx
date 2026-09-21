import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlobShape } from '../components/BlobShape';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ChevronLeftIcon, HeartIcon } from '../components/icons';
import { MOCK_PLAYLISTS, formatDuration } from '../data/mockData';
import { colors, fonts, spacing } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PlaylistResult'>;
type Route = RouteProp<RootStackParamList, 'PlaylistResult'>;

export function PlaylistResultScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const playlist = MOCK_PLAYLISTS.find((p) => p.id === params.playlistId) ?? MOCK_PLAYLISTS[0];

  const totalMin = Math.round(playlist.tracks.reduce((sum, t) => sum + t.durationSec, 0) / 60);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <IconButton accessibilityLabel="Go back" onPress={() => navigation.goBack()}>
        <ChevronLeftIcon size={20} color={colors.textPrimary} />
      </IconButton>

      <View style={styles.hero}>
        <BlobShape size={64} color={playlist.accentColor} variant={playlist.blobVariant} />
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>{playlist.moodPromptEcho.toUpperCase()}</Text>
          <Text style={styles.title}>{playlist.title}</Text>
          <Text style={styles.meta}>{playlist.tracks.length} tracks · {totalMin} min</Text>
        </View>
      </View>

      <PrimaryButton
        label="Play all"
        onPress={() => navigation.navigate('NowPlaying', { playlistId: playlist.id, trackId: playlist.tracks[0].id })}
      />

      <FlatList
        data={playlist.tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            accessibilityRole="button"
            onPress={() => navigation.navigate('NowPlaying', { playlistId: playlist.id, trackId: item.id })}
          >
            <View>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackArtist}>{item.artist}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.duration}>{formatDuration(item.durationSec)}</Text>
              <IconButton accessibilityLabel={`Like ${item.title}`} variant="transparent" onPress={() => {}}>
                <HeartIcon size={18} color={colors.textMuted} />
              </IconButton>
            </View>
          </Pressable>
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.accentCalm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  list: {
    marginTop: spacing.lg,
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
    gap: spacing.sm,
  },
  trackTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  trackArtist: {
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
