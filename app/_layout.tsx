import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { AudioProvider } from '@/contexts/AudioContext';
import { BookmarksProvider } from '@/contexts/BookmarksContext';
import { DownloadProvider } from '@/contexts/DownloadContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { BrandSplash } from '@/components/ui/BrandSplash';
import { loadOnboardingComplete } from '@/lib/engagement';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Amiri: require('../assets/fonts/Amiri-Regular.ttf'),
    ScheherazadeNew: require('../assets/fonts/ScheherazadeNew-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const [showBrand, setShowBrand] = useState(true);

  useEffect(() => {
    if (!loaded) return;
    SplashScreen.hideAsync();
    const t = setTimeout(() => setShowBrand(false), 1600);
    return () => clearTimeout(t);
  }, [loaded]);

  if (!loaded || showBrand) {
    return <BrandSplash />;
  }

  return (
    <SettingsProvider>
      <BookmarksProvider>
        <DownloadProvider>
          <AudioProvider>
            <RootLayoutNav />
          </AudioProvider>
        </DownloadProvider>
      </BookmarksProvider>
    </SettingsProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme } = useSettings();
  const c = Colors[colorScheme];
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadOnboardingComplete().then((done) => {
      if (cancelled) return;
      setReady(true);
      if (!done) {
        router.replace('/onboarding');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

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

  if (!ready) return null;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="surah/[id]"
          options={{
            title: 'Surah',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="surahs"
          options={{
            title: 'Read Quran',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="downloads"
          options={{
            title: 'Audio downloads',
            presentation: 'modal',
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
