import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { MOCK_PLAYLISTS, formatDuration } from '../data/mockData';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NowPlaying'>;
type Route = RouteProp<RootStackParamList, 'NowPlaying'>;

export function NowPlayingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const playlist = MOCK_PLAYLISTS.find((p) => p.id === params.playlistId) ?? MOCK_PLAYLISTS[0];
  const trackIndex = Math.max(0, playlist.tracks.findIndex((t) => t.id === params.trackId));
  const track = playlist.tracks[trackIndex];

  const [isPlaying, setIsPlaying] = useState(true);
  const [positionSec, setPositionSec] = useState(0);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPositionSec(0);
    setFeedback(null);
  }, [track.id]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setPositionSec((p) => Math.min(p + 1, track.durationSec));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, track.durationSec]);

  function goToTrack(offset: number) {
    const nextIndex = trackIndex + offset;
    if (nextIndex < 0 || nextIndex >= playlist.tracks.length) return;
    navigation.setParams({ trackId: playlist.tracks[nextIndex].id });
  }

  const progress = track.durationSec > 0 ? positionSec / track.durationSec : 0;

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
        <BlobShape size={272} color={playlist.accentColor} variant={playlist.blobVariant} />
      </View>

      <Text style={styles.trackTitle}>{track.title}</Text>
      <Text style={styles.trackArtist}>{track.artist}</Text>

      <View style={styles.moodTagWrap}>
        <Text style={styles.moodTag}>{track.moodTag}</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{formatDuration(positionSec)}</Text>
          <Text style={styles.progressLabel}>{formatDuration(track.durationSec)}</Text>
        </View>
      </View>

      <View style={styles.transport}>
        <IconButton accessibilityLabel="Previous track" variant="transparent" onPress={() => goToTrack(-1)}>
          <SkipBackIcon size={22} />
        </IconButton>
        <IconButton
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          onPress={() => setIsPlaying((p) => !p)}
        >
          {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </IconButton>
        <IconButton accessibilityLabel="Next track" variant="transparent" onPress={() => goToTrack(1)}>
          <SkipForwardIcon size={22} />
        </IconButton>
      </View>

      <View style={styles.footer}>
        <Text style={styles.explainability}>Why this track: high {track.moodTag.toLowerCase()} match</Text>
        <View style={styles.feedbackRow}>
          <IconButton
            accessibilityLabel="Dislike this track"
            variant="transparent"
            onPress={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
          >
            <ThumbsDownIcon size={18} color={feedback === 'dislike' ? colors.accentEnergy : colors.textMuted} />
          </IconButton>
          <IconButton
            accessibilityLabel="Like this track"
            variant="transparent"
            onPress={() => setFeedback(feedback === 'like' ? null : 'like')}
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
