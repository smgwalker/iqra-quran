import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_AZKAR_PREFS,
  loadAzkarFavorites,
  loadAzkarPrefs,
  saveAzkarFavorites,
  saveAzkarPrefs,
  type AzkarPrefs,
} from '@/lib/azkar';

type AzkarContextValue = {
  favorites: string[];
  isFavorite: (duaId: string) => boolean;
  toggleFavorite: (duaId: string) => void;
  prefs: AzkarPrefs;
  setShowTransliteration: (v: boolean) => void;
  /** Session-only repeat counters (reset when the app restarts). */
  counts: Record<string, number>;
  setCount: (duaId: string, value: number) => void;
  resetCounts: (duaIds: string[]) => void;
};

const AzkarContext = createContext<AzkarContextValue | null>(null);

export function AzkarProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<AzkarPrefs>(DEFAULT_AZKAR_PREFS);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([loadAzkarFavorites(), loadAzkarPrefs()]).then(([f, p]) => {
      setFavorites(f);
      setPrefs(p);
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      void saveAzkarFavorites(next);
      return next;
    });
  }, []);

  const setShowTransliteration = useCallback((showTransliteration: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, showTransliteration };
      void saveAzkarPrefs(next);
      return next;
    });
  }, []);

  const setCount = useCallback((id: string, value: number) => {
    setCounts((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetCounts = useCallback((ids: string[]) => {
    setCounts((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });
  }, []);

  const value = useMemo<AzkarContextValue>(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      prefs,
      setShowTransliteration,
      counts,
      setCount,
      resetCounts,
    }),
    [favorites, isFavorite, toggleFavorite, prefs, setShowTransliteration, counts, setCount, resetCounts],
  );

  return <AzkarContext.Provider value={value}>{children}</AzkarContext.Provider>;
}

export function useAzkar() {
  const ctx = useContext(AzkarContext);
  if (!ctx) throw new Error('useAzkar must be used within AzkarProvider');
  return ctx;
}
