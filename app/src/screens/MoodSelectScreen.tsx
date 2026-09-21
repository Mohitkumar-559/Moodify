import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoodChip } from '../components/MoodChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { MOCK_PLAYLISTS, MOOD_CHIPS } from '../data/mockData';
import { colors, fonts, spacing } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MoodSelect'>;

export function MoodSelectScreen() {
  const navigation = useNavigation<Nav>();
  const [prompt, setPrompt] = useState('');
  const [selectedChip, setSelectedChip] = useState<string | null>('Chill');

  const canGenerate = prompt.trim().length > 0 || selectedChip !== null;

  function handleGenerate() {
    if (!canGenerate) return;
    // FR-02/FR-03: mood interpreter + recommendation engine live in the backend.
    // Scaffold maps to a mock playlist until that API exists.
    const playlist = MOCK_PLAYLISTS[0];
    navigation.navigate('PlaylistResult', { playlistId: playlist.id });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.wordmark}>Moodify</Text>

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

      <View style={styles.footer}>
        <PrimaryButton label="Generate playlist" onPress={handleGenerate} disabled={!canGenerate} />
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
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.md,
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
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
});
