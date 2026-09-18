import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/storage';
import type {
  AppSettings,
  ArabicFontId,
  ReadingViewMode,
  ThemePreference,
  TranslationId,
} from '@/lib/types';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  colorScheme: 'light' | 'dark';
  setShowTranslation: (v: boolean) => void;
  setArabicFontSize: (v: number) => void;
  setTheme: (v: ThemePreference) => void;
  setTranslationId: (v: TranslationId) => void;
  setArabicFontFamily: (v: ArabicFontId) => void;
  setContinuousPlayback: (v: boolean) => void;
  setShowWordByWord: (v: boolean) => void;
  setShowTafsir: (v: boolean) => void;
  setReadingViewMode: (v: ReadingViewMode) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setReady(true);
    });
  }, []);

  const persist = useCallback((next: AppSettings) => {
    setSettings(next);
    void saveSettings(next);
  }, []);

  const colorScheme: 'light' | 'dark' =
    settings.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.theme;

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      colorScheme,
      setShowTranslation: (showTranslation) => {
        let readingViewMode = settings.readingViewMode;
        if (showTranslation) readingViewMode = 'translation';
        else if (settings.readingViewMode === 'translation') readingViewMode = 'arabic';
        persist({ ...settings, showTranslation, readingViewMode });
      },
      setArabicFontSize: (arabicFontSize) => persist({ ...settings, arabicFontSize }),
      setTheme: (theme) => persist({ ...settings, theme }),
      setTranslationId: (translationId) => persist({ ...settings, translationId }),
      setArabicFontFamily: (arabicFontFamily) => persist({ ...settings, arabicFontFamily }),
      setContinuousPlayback: (continuousPlayback) => persist({ ...settings, continuousPlayback }),
      setShowWordByWord: (showWordByWord) => {
        let readingViewMode = settings.readingViewMode;
        if (showWordByWord) readingViewMode = 'wordByWord';
        else if (settings.readingViewMode === 'wordByWord') {
          readingViewMode = settings.showTranslation ? 'translation' : 'arabic';
        }
        persist({ ...settings, showWordByWord, readingViewMode });
      },
      setShowTafsir: (showTafsir) => persist({ ...settings, showTafsir }),
      setReadingViewMode: (readingViewMode) =>
        persist({
          ...settings,
          readingViewMode,
          showTranslation: readingViewMode === 'translation',
          showWordByWord: readingViewMode === 'wordByWord',
        }),
    }),
    [settings, ready, colorScheme, persist],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
