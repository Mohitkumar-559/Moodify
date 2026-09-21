import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { MoodSelectScreen } from '../screens/MoodSelectScreen';
import { PlaylistResultScreen } from '../screens/PlaylistResultScreen';
import { NowPlayingScreen } from '../screens/NowPlayingScreen';
import { colors } from '../theme/tokens';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ground },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="MoodSelect" component={MoodSelectScreen} />
      <Stack.Screen name="PlaylistResult" component={PlaylistResultScreen} />
      <Stack.Screen name="NowPlaying" component={NowPlayingScreen} />
    </Stack.Navigator>
  );
}
