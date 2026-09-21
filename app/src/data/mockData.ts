import { colors } from '../theme/tokens';

export type Track = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  moodTag: string;
};

export type Playlist = {
  id: string;
  title: string;
  moodPromptEcho: string;
  moodTag: string;
  accentColor: string;
  blobVariant: 0 | 1 | 2 | 3;
  tracks: Track[];
};

export const MOOD_CHIPS = ['Chill', 'Focus', 'Happy', 'Workout', 'Romantic', 'Sad'] as const;

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'quiet-focus',
    title: 'Quiet Focus',
    moodPromptEcho: 'For your rainy day coding mood',
    moodTag: 'Focus · Calm',
    accentColor: colors.accentCalm,
    blobVariant: 1,
    tracks: [
      { id: 't1', title: 'Slow Static', artist: 'Marina Voss', durationSec: 204, moodTag: 'Focus' },
      { id: 't2', title: 'Grey Window', artist: 'Halden', durationSec: 178, moodTag: 'Focus' },
      { id: 't3', title: 'Low Light', artist: 'Runa Park', durationSec: 242, moodTag: 'Calm' },
      { id: 't4', title: 'Keystrokes', artist: 'Oberon Fields', durationSec: 191, moodTag: 'Focus' },
      { id: 't5', title: 'Cold Coffee', artist: 'Marina Voss', durationSec: 227, moodTag: 'Calm' },
    ],
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus',
    moodPromptEcho: 'For your heads-down work session',
    moodTag: 'Focus',
    accentColor: colors.accentEnergy,
    blobVariant: 0,
    tracks: [
      { id: 't6', title: 'Signal Path', artist: 'Halden', durationSec: 213, moodTag: 'Focus' },
      { id: 't7', title: 'Underline', artist: 'Runa Park', durationSec: 199, moodTag: 'Focus' },
    ],
  },
  {
    id: 'chill-evenings',
    title: 'Chill Evenings',
    moodPromptEcho: 'For winding down tonight',
    moodTag: 'Chill',
    accentColor: colors.accentCalm,
    blobVariant: 2,
    tracks: [
      { id: 't8', title: 'Harbor Light', artist: 'Oberon Fields', durationSec: 231, moodTag: 'Chill' },
      { id: 't9', title: 'Soft Static', artist: 'Marina Voss', durationSec: 208, moodTag: 'Chill' },
    ],
  },
  {
    id: 'workout-push',
    title: 'Workout Push',
    moodPromptEcho: 'For pushing through the last set',
    moodTag: 'Workout',
    accentColor: colors.accentAlt1,
    blobVariant: 3,
    tracks: [
      { id: 't10', title: 'Redline', artist: 'Halden', durationSec: 176, moodTag: 'Workout' },
      { id: 't11', title: 'Overdrive', artist: 'Runa Park', durationSec: 189, moodTag: 'Workout' },
    ],
  },
  {
    id: 'rainy-day',
    title: 'Rainy Day',
    moodPromptEcho: 'For rain against the window',
    moodTag: 'Sad · Calm',
    accentColor: colors.accentAlt2,
    blobVariant: 1,
    tracks: [
      { id: 't12', title: 'Window Seat', artist: 'Marina Voss', durationSec: 219, moodTag: 'Calm' },
      { id: 't13', title: 'Grey Hour', artist: 'Oberon Fields', durationSec: 201, moodTag: 'Sad' },
    ],
  },
];

export function formatDuration(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
