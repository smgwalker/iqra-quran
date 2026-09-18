import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, ViewToken } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AyahCard } from '@/components/ui/AyahCard';
import { ReadingModeControl } from '@/components/ui/ReadingModeControl';
import { ReaderTopBar } from '@/components/ui/ReaderTopBar';
import { SurahBanner } from '@/components/ui/SurahBanner';
import { TajweedLegend } from '@/components/ui/TajweedLegend';
import { Mushaf } from '@/constants/MushafTheme';
import { useAudio } from '@/contexts/AudioContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getArabicFontFamily } from '@/lib/fonts';
import { getSurah } from '@/lib/quran';
import { getVerseTranslation } from '@/lib/translations';
import type { Verse } from '@/lib/types';

export default function SurahReaderScreen() {
  const { id, ayah } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const router = useRouter();
  const surahId = Number(id);
  const focusAyah = ayah ? Number(ayah) : undefined;
  const surah = getSurah(surahId);

  const { colorScheme, settings, setTranslationId, setReadingViewMode } = useSettings();
  const { isBookmarked, toggleBookmark, setLastReadPosition } = useBookmarks();
  const {
    play,
    pause,
    stop,
    isPlaying,
    isLoading,
    isCurrent,
    playingAyahId,
    playingSurahId,
  } = useAudio();
  const listRef = useRef<FlatList<Verse>>(null);
  const lastSaved = useRef<string>('');
  const [expandedStudy, setExpandedStudy] = useState<number | null>(null);
  const arabicFont = getArabicFontFamily(settings.arabicFontFamily);

  const prevSurah = surahId > 1 ? getSurah(surahId - 1) : undefined;
  const nextSurah = surahId < 114 ? getSurah(surahId + 1) : undefined;

  useEffect(() => {
    if (!surah || !focusAyah) return;
    const index = Math.max(0, focusAyah - 1);
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.15 });
    }, 350);
    return () => clearTimeout(t);
  }, [surah, focusAyah]);

  useEffect(() => {
    if (!surah || playingSurahId !== surah.id || !playingAyahId) return;
    const index = Math.max(0, playingAyahId - 1);
    const t = setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
      } catch {
        /* ignore */
      }
    }, 200);
    return () => clearTimeout(t);
  }, [surah, playingSurahId, playingAyahId]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems.find((v) => v.isViewable && v.item);
      if (!first || !surah) return;
      const verse = first.item as Verse;
      const key = `${surah.id}:${verse.id}`;
      if (key === lastSaved.current) return;
      lastSaved.current = key;
      setLastReadPosition(surah.id, verse.id);
    },
  ).current;

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 55, minimumViewTime: 400 }),
    [],
  );

  const onPlayToggle = useCallback(
    async (ayahId: number) => {
      if (isCurrent(surahId, ayahId) && isPlaying) {
        await pause();
      } else {
        await play(surahId, ayahId);
      }
    },
    [isCurrent, isPlaying, pause, play, surahId],
  );

  const playSurahFromStart = useCallback(async () => {
    if (isPlaying && playingSurahId === surahId) {
      await stop();
      return;
    }
    await play(surahId, 1, { continuous: true });
  }, [isPlaying, play, playingSurahId, stop, surahId]);

  const goPrev = useCallback(() => {
    if (prevSurah) router.replace(`/surah/${prevSurah.id}`);
  }, [prevSurah, router]);

  const goNext = useCallback(() => {
    if (nextSurah) router.replace(`/surah/${nextSurah.id}`);
  }, [nextSurah, router]);

  if (!surah) {
    return (
      <View style={[styles.missing, { backgroundColor: Mushaf.cream }]}>
        <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
        <Text style={{ color: Mushaf.arabic }}>Surah not found.</Text>
      </View>
    );
  }

  const surahPlaying = isPlaying && playingSurahId === surah.id;
  const surahLoading = isLoading && playingSurahId === surah.id && playingAyahId === 1 && !isPlaying;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ReaderTopBar
        translationId={settings.translationId}
        onSelectTranslation={setTranslationId}
        isPlaying={surahPlaying}
        isLoading={surahLoading || (isLoading && playingSurahId === surah.id)}
        onTogglePlay={() => void playSurahFromStart()}
      />

      <SurahBanner
        englishName={surah.transliteration}
        arabicName={surah.name}
        arabicFontFamily={arabicFont}
        onPrev={goPrev}
        onNext={goNext}
        hasPrev={Boolean(prevSurah)}
        hasNext={Boolean(nextSurah)}
      />

      <ReadingModeControl
        mode={settings.readingViewMode}
        onChange={setReadingViewMode}
      />

      <FlatList
        ref={listRef}
        style={styles.list}
        data={surah.verses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        initialNumToRender={12}
        maxToRenderPerBatch={16}
        windowSize={9}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 400);
        }}
        ListHeaderComponent={
          surah.id !== 1 && surah.id !== 9 ? (
            <View style={styles.basmalaWrap}>
              <Text
                style={[
                  styles.basmala,
                  {
                    fontSize: Math.min(settings.arabicFontSize, 28),
                    fontFamily: arabicFont,
                  },
                ]}>
                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <AyahCard
            surahId={surah.id}
            ayahId={item.id}
            arabic={item.ar}
            english={getVerseTranslation(surah.id, item.id, settings.translationId)}
            viewMode={settings.readingViewMode}
            arabicFontSize={settings.arabicFontSize}
            arabicFontFamily={settings.arabicFontFamily}
            bookmarked={isBookmarked(surah.id, item.id)}
            isPlaying={isCurrent(surah.id, item.id) && isPlaying}
            isLoading={isCurrent(surah.id, item.id) && isLoading}
            colorScheme={colorScheme}
            highlighted={focusAyah === item.id}
            altRow={index % 2 === 1}
            showTafsir={settings.showTafsir}
            studyExpanded={expandedStudy === item.id}
            onToggleStudy={() =>
              setExpandedStudy((prev) => (prev === item.id ? null : item.id))
            }
            onToggleBookmark={() => toggleBookmark(surah.id, item.id)}
            onPlay={() => onPlayToggle(item.id)}
          />
        )}
      />

      <TajweedLegend />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Mushaf.cream,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    backgroundColor: Mushaf.cream,
  },
  listContent: {
    paddingBottom: 12,
  },
  basmalaWrap: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Mushaf.creamSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Mushaf.hairline,
  },
  basmala: {
    textAlign: 'center',
    writingDirection: 'rtl',
    fontWeight: '500',
    color: Mushaf.arabic,
  },
});
