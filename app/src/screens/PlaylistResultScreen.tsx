import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlobShape } from '../components/BlobShape';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ChevronLeftIcon, HeartIcon } from '../components/icons';
import { formatDuration } from '../data/mockData';
import { getPlaylist, submitTrackFeedback } from '../api/playlists';
import { ApiError } from '../api/client';
import { PlaylistDetail } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PlaylistResult'>;
type Route = RouteProp<RootStackParamList, 'PlaylistResult'>;

export function PlaylistResultScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { token } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      setIsLoading(true);
      getPlaylist(token, params.playlistId)
        .then((data) => {
          if (!cancelled) setPlaylist(data);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof ApiError ? e.message : 'Failed to load playlist');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token, params.playlistId]),
  );

  async function handleLike(trackId: string) {
    if (!token) return;
    setLikedTrackIds((prev) => new Set(prev).add(trackId));
    try {
      await submitTrackFeedback(token, trackId, { playlistId: params.playlistId, feedbackType: 'like' });
    } catch {
      setLikedTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerState]} edges={['top']}>
        <ActivityIndicator color={colors.accentEnergy} />
      </SafeAreaView>
    );
  }

  if (error || !playlist) {
    return (
      <SafeAreaView style={[styles.container, styles.centerState]} edges={['top']}>
        <Text style={styles.errorText}>{error ?? 'Playlist not found'}</Text>
      </SafeAreaView>
    );
  }

  const totalMin = Math.round(playlist.tracks.reduce((sum, t) => sum + t.track.duration_sec, 0) / 60);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <IconButton accessibilityLabel="Go back" onPress={() => navigation.goBack()}>
        <ChevronLeftIcon size={20} color={colors.textPrimary} />
      </IconButton>

      <View style={styles.hero}>
        <BlobShape size={64} color={playlist.cover_accent_color ?? colors.accentEnergy} variant={0} />
        <View style={styles.heroText}>
          {playlist.mood_prompt_text && (
            <Text style={styles.eyebrow}>FOR YOUR {playlist.mood_prompt_text.toUpperCase()}</Text>
          )}
          <Text style={styles.title}>{playlist.title}</Text>
          <Text style={styles.meta}>{playlist.tracks.length} tracks · {totalMin} min</Text>
        </View>
      </View>

      <PrimaryButton
        label="Play all"
        onPress={() =>
          navigation.navigate('NowPlaying', {
            playlistId: playlist.id,
            trackId: playlist.tracks[0].track.id,
          })
        }
      />

      <FlatList
        data={playlist.tracks}
        keyExtractor={(item) => item.track.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            accessibilityRole="button"
            onPress={() => navigation.navigate('NowPlaying', { playlistId: playlist.id, trackId: item.track.id })}
          >
            <View>
              <Text style={styles.trackTitle}>{item.track.title}</Text>
              <Text style={styles.trackArtist}>{item.track.artist}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.duration}>{formatDuration(item.track.duration_sec)}</Text>
              <IconButton
                accessibilityLabel={`Like ${item.track.title}`}
                variant="transparent"
                onPress={() => handleLike(item.track.id)}
              >
                <HeartIcon
                  size={18}
                  color={likedTrackIds.has(item.track.id) ? colors.accentEnergy : colors.textMuted}
                  filled={likedTrackIds.has(item.track.id)}
                />
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
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accentEnergy,
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
