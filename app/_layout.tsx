import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AudioProvider } from '@/contexts/AudioContext';
import { BookmarksProvider } from '@/contexts/BookmarksContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import Colors from '@/constants/Colors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SettingsProvider>
      <BookmarksProvider>
        <AudioProvider>
          <RootLayoutNav />
        </AudioProvider>
      </BookmarksProvider>
    </SettingsProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme } = useSettings();
  const c = Colors[colorScheme];

  const navTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: c.tint,
      background: c.background,
      card: c.headerBg,
      text: c.text,
      border: c.border,
      notification: c.accent,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="surah/[id]"
          options={{
            title: 'Surah',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: 'About Iqra',
            presentation: 'modal',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
