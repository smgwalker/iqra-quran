import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { pauseAudio, playAyah, stopAudio } from '@/lib/audio';

type AudioContextValue = {
  playingSurahId: number | null;
  playingAyahId: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  play: (surahId: number, ayahId: number) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  isCurrent: (surahId: number, ayahId: number) => boolean;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(null);
  const [playingAyahId, setPlayingAyahId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const play = useCallback(async (surahId: number, ayahId: number) => {
    try {
      setIsLoading(true);
      setPlayingSurahId(surahId);
      setPlayingAyahId(ayahId);
      await playAyah(surahId, ayahId, (playing, finished) => {
        setIsPlaying(playing);
        if (finished) {
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setPlayingSurahId(null);
      setPlayingAyahId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pause = useCallback(async () => {
    await pauseAudio();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(async () => {
    await stopAudio();
    setIsPlaying(false);
    setPlayingSurahId(null);
    setPlayingAyahId(null);
  }, []);

  const isCurrent = useCallback(
    (surahId: number, ayahId: number) =>
      playingSurahId === surahId && playingAyahId === ayahId,
    [playingSurahId, playingAyahId],
  );

  const value = useMemo(
    () => ({
      playingSurahId,
      playingAyahId,
      isPlaying,
      isLoading,
      play,
      pause,
      stop,
      isCurrent,
    }),
    [playingSurahId, playingAyahId, isPlaying, isLoading, play, pause, stop, isCurrent],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
