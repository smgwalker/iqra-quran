import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { pauseAudio, playAyah, stopAudio } from '@/lib/audio';
import { getSurah } from '@/lib/quran';
import { useSettings } from './SettingsContext';

type AudioContextValue = {
  playingSurahId: number | null;
  playingAyahId: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  continuousActive: boolean;
  play: (surahId: number, ayahId: number, opts?: { continuous?: boolean }) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  isCurrent: (surahId: number, ayahId: number) => boolean;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(null);
  const [playingAyahId, setPlayingAyahId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [continuousActive, setContinuousActive] = useState(false);

  const continuousRef = useRef(false);
  const generationRef = useRef(0);
  const settingsContRef = useRef(settings.continuousPlayback);
  settingsContRef.current = settings.continuousPlayback;

  const advanceToNext = useCallback(async (surahId: number, ayahId: number, gen: number) => {
    if (gen !== generationRef.current) return;
    if (!continuousRef.current) {
      setIsPlaying(false);
      return;
    }
    const surah = getSurah(surahId);
    if (!surah) {
      setIsPlaying(false);
      setContinuousActive(false);
      continuousRef.current = false;
      return;
    }
    const nextAyah = ayahId + 1;
    if (nextAyah > surah.total_verses) {
      setIsPlaying(false);
      setContinuousActive(false);
      continuousRef.current = false;
      return;
    }
    // Play next ayah
    try {
      setIsLoading(true);
      setPlayingSurahId(surahId);
      setPlayingAyahId(nextAyah);
      await playAyah(surahId, nextAyah, (playing, finished) => {
        if (gen !== generationRef.current) return;
        setIsPlaying(playing);
        if (finished) {
          void advanceToNext(surahId, nextAyah, gen);
        }
      });
      if (gen === generationRef.current) setIsPlaying(true);
    } catch {
      if (gen === generationRef.current) {
        setIsPlaying(false);
        setContinuousActive(false);
        continuousRef.current = false;
      }
    } finally {
      if (gen === generationRef.current) setIsLoading(false);
    }
  }, []);

  const play = useCallback(
    async (surahId: number, ayahId: number, opts?: { continuous?: boolean }) => {
      const wantContinuous = opts?.continuous ?? settingsContRef.current;
      generationRef.current += 1;
      const gen = generationRef.current;
      continuousRef.current = wantContinuous;
      setContinuousActive(wantContinuous);

      try {
        setIsLoading(true);
        setPlayingSurahId(surahId);
        setPlayingAyahId(ayahId);
        await playAyah(surahId, ayahId, (playing, finished) => {
          if (gen !== generationRef.current) return;
          setIsPlaying(playing);
          if (finished) {
            void advanceToNext(surahId, ayahId, gen);
          }
        });
        if (gen === generationRef.current) setIsPlaying(true);
      } catch {
        if (gen === generationRef.current) {
          setIsPlaying(false);
          setPlayingSurahId(null);
          setPlayingAyahId(null);
          setContinuousActive(false);
          continuousRef.current = false;
        }
      } finally {
        if (gen === generationRef.current) setIsLoading(false);
      }
    },
    [advanceToNext],
  );

  const pause = useCallback(async () => {
    // Pausing keeps continuous mode armed so resume continues the sequence
    await pauseAudio();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(async () => {
    generationRef.current += 1;
    continuousRef.current = false;
    setContinuousActive(false);
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
      continuousActive,
      play,
      pause,
      stop,
      isCurrent,
    }),
    [
      playingSurahId,
      playingAyahId,
      isPlaying,
      isLoading,
      continuousActive,
      play,
      pause,
      stop,
      isCurrent,
    ],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
