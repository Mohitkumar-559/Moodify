import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlaylist, useAudioPlaylistStatus } from 'expo-audio';
import { BlobShape } from '../components/BlobShape';
import { IconButton } from '../components/IconButton';
import {
  ChevronLeftIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ThumbsDownIcon,
} from '../components/icons';
import { formatDuration } from '../data/mockData';
import { getPlaylist, submitTrackFeedback } from '../api/playlists';
import { ApiError } from '../api/client';
import { FeedbackType, PlaylistDetail } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NowPlaying'>;
type Route = RouteProp<RootStackParamList, 'NowPlaying'>;

export function NowPlayingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { token } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          if (!cancelled) setError(e instanceof ApiError ? e.message : 'Failed to load track');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token, params.playlistId]),
  );

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
        <IconButton accessibilityLabel="Go back" onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={colors.textPrimary} />
        </IconButton>
        <Text style={styles.errorText}>{error ?? 'Playlist not found'}</Text>
      </SafeAreaView>
    );
  }

  const initialIndex = Math.max(0, playlist.tracks.findIndex((t) => t.track.id === params.trackId));

  // Keyed by playlist id so switching to a different playlist mounts a fresh
  // AudioPlaylist instance with the right sources, instead of trying to
  // reconcile the native player's queue in place.
  return <NowPlayingPlayer key={playlist.id} playlist={playlist} initialIndex={initialIndex} />;
}

function NowPlayingPlayer({ playlist, initialIndex }: { playlist: PlaylistDetail; initialIndex: number }) {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const sources = playlist.tracks.map((t) => t.track.preview_url ?? null);
  const audioPlaylist = useAudioPlaylist({ sources, loop: 'none' });
  const status = useAudioPlaylistStatus(audioPlaylist);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    audioPlaylist.skipTo(initialIndex);
    audioPlaylist.play();
    setHasStarted(true);
    // Intentionally runs once per mount (this component remounts via `key` on playlist change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFeedback(null);
  }, [status.currentIndex]);

  const currentIndex = hasStarted ? status.currentIndex : initialIndex;
  const playlistTrack = playlist.tracks[currentIndex] ?? playlist.tracks[initialIndex];
  const track = playlistTrack.track;
  const hasAudio = !!track.preview_url;

  function sendFeedback(feedbackType: FeedbackType, playbackPositionSec?: number) {
    if (!token) return;
    submitTrackFeedback(token, track.id, {
      playlistId: playlist.id,
      feedbackType,
      playbackPositionSec,
    }).catch(() => {
      // Best-effort — feedback isn't critical to the listening experience.
    });
  }

  useEffect(() => {
    if (status.didJustFinish) {
      sendFeedback('completed', Math.floor(status.duration));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.didJustFinish]);

  function handleSkip(direction: 1 | -1) {
    if (direction === 1) {
      sendFeedback(status.currentTime >= status.duration * 0.9 ? 'completed' : 'skip', Math.floor(status.currentTime));
      audioPlaylist.next();
    } else {
      audioPlaylist.previous();
    }
  }

  function toggleFeedback(type: 'like' | 'dislike') {
    const next = feedback === type ? null : type;
    setFeedback(next);
    if (next) sendFeedback(next);
  }

  const positionSec = hasAudio ? Math.floor(status.currentTime) : 0;
  const durationSec = hasAudio && status.duration > 0 ? Math.floor(status.duration) : track.duration_sec;
  const progress = durationSec > 0 ? positionSec / durationSec : 0;
  const moodLabel = playlist.primary_mood?.name ?? 'Mood';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton accessibilityLabel="Go back" onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={colors.textPrimary} />
        </IconButton>
        <Text style={styles.headerTitle}>{playlist.title.toUpperCase()}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.artworkWrap}>
        <BlobShape size={272} color={playlist.cover_accent_color ?? colors.accentEnergy} variant={0} />
      </View>

      <Text style={styles.trackTitle}>{track.title}</Text>
      <Text style={styles.trackArtist}>{track.artist}</Text>

      <View style={styles.moodTagWrap}>
        <Text style={styles.moodTag}>{moodLabel}</Text>
      </View>

      {!hasAudio && <Text style={styles.noAudio}>No audio preview available for this track</Text>}

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{formatDuration(positionSec)}</Text>
          <Text style={styles.progressLabel}>{formatDuration(durationSec)}</Text>
        </View>
      </View>

      <View style={styles.transport}>
        <IconButton accessibilityLabel="Previous track" variant="transparent" onPress={() => handleSkip(-1)}>
          <SkipBackIcon size={22} />
        </IconButton>
        <IconButton
          accessibilityLabel={status.playing ? 'Pause' : 'Play'}
          onPress={() => (status.playing ? audioPlaylist.pause() : audioPlaylist.play())}
        >
          {status.playing ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </IconButton>
        <IconButton accessibilityLabel="Next track" variant="transparent" onPress={() => handleSkip(1)}>
          <SkipForwardIcon size={22} />
        </IconButton>
      </View>

      <View style={styles.footer}>
        <Text style={styles.explainability}>Why this track: high {moodLabel.toLowerCase()} match</Text>
        <View style={styles.feedbackRow}>
          <IconButton
            accessibilityLabel="Dislike this track"
            variant="transparent"
            onPress={() => toggleFeedback('dislike')}
          >
            <ThumbsDownIcon size={18} color={feedback === 'dislike' ? colors.accentEnergy : colors.textMuted} />
          </IconButton>
          <IconButton
            accessibilityLabel="Like this track"
            variant="transparent"
            onPress={() => toggleFeedback('like')}
          >
            <HeartIcon
              size={18}
              color={feedback === 'like' ? colors.accentEnergy : colors.textMuted}
              filled={feedback === 'like'}
            />
          </IconButton>
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
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accentEnergy,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  artworkWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  trackTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  trackArtist: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  moodTagWrap: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  moodTag: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.accentCalm,
  },
  noAudio: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  progressWrap: {
    marginTop: spacing.xl,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentEnergy,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  explainability: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
