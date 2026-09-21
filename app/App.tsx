import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppFonts } from './src/theme/useAppFonts';
import { colors } from './src/theme/tokens';

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.ground,
    card: colors.ground,
    text: colors.textPrimary,
    border: colors.divider,
    primary: colors.accentEnergy,
  },
};

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
