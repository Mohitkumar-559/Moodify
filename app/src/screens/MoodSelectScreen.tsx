import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton';
import { MoodChip } from '../components/MoodChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { ChevronLeftIcon } from '../components/icons';
import { MOOD_CHIPS } from '../data/mockData';
import { generatePlaylist } from '../api/playlists';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MoodSelect'>;

export function MoodSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedChip, setSelectedChip] = useState<string | null>('Chill');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = (prompt.trim().length > 0 || selectedChip !== null) && !isGenerating;

  async function handleGenerate() {
    if (!canGenerate || !token) return;
    setError(null);
    setIsGenerating(true);
    try {
      // FR-01/02/03: mood prompt or chip -> backend's mood interpreter + recommendation engine.
      const playlist = await generatePlaylist(token, {
        moodPromptText: prompt.trim() || undefined,
        moodSlug: prompt.trim() ? undefined : selectedChip?.toLowerCase(),
      });
      navigation.navigate('PlaylistResult', { playlistId: playlist.id });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not generate a playlist');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton accessibilityLabel="Go back" onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={colors.textPrimary} />
        </IconButton>
        <Text style={styles.wordmark}>Moodify</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.heading}>How are you feeling right now?</Text>
      <Text style={styles.subheading}>Type a mood or pick one below</Text>

      <TextInput
        style={styles.input}
        placeholder={'Try "rainy day coding" or "workout"'}
        placeholderTextColor={colors.textMuted}
        value={prompt}
        onChangeText={(text) => {
          setPrompt(text);
          if (text.trim().length > 0) setSelectedChip(null);
        }}
        accessibilityLabel="Describe your mood"
      />

      <View style={styles.chipGrid}>
        {MOOD_CHIPS.map((mood) => (
          <MoodChip
            key={mood}
            label={mood}
            selected={selectedChip === mood}
            onPress={() => {
              setSelectedChip(mood);
              setPrompt('');
            }}
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.footer}>
        {isGenerating ? (
          <ActivityIndicator color={colors.accentEnergy} />
        ) : (
          <PrimaryButton label="Generate playlist" onPress={handleGenerate} disabled={!canGenerate} />
        )}
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
  headerSpacer: {
    width: 44,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  input: {
    marginTop: spacing.lg,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.accentEnergy,
    marginTop: spacing.lg,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
});
