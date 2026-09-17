import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/storage';
import type { AppSettings, ThemePreference } from '@/lib/types';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  colorScheme: 'light' | 'dark';
  setShowTranslation: (v: boolean) => void;
  setArabicFontSize: (v: number) => void;
  setTheme: (v: ThemePreference) => void;
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
      setShowTranslation: (showTranslation) => persist({ ...settings, showTranslation }),
      setArabicFontSize: (arabicFontSize) => persist({ ...settings, arabicFontSize }),
      setTheme: (theme) => persist({ ...settings, theme }),
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
