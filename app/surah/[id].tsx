import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AyahCard } from '@/components/ui/AyahCard';
import Colors from '@/constants/Colors';
import { useAudio } from '@/contexts/AudioContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useDownloads } from '@/contexts/DownloadContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getArabicFontFamily } from '@/lib/fonts';
import { getSurah, revelationLabel } from '@/lib/quran';
import { getTranslationMeta, getVerseTranslation } from '@/lib/translations';
import type { Verse } from '@/lib/types';

export default function SurahReaderScreen() {
  const { id, ayah } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahId = Number(id);
  const focusAyah = ayah ? Number(ayah) : undefined;
  const surah = getSurah(surahId);

  const { colorScheme, settings, setShowTranslation } = useSettings();
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
    continuousActive,
  } = useAudio();
  const { isDownloaded, enqueue, supported } = useDownloads();
  const c = Colors[colorScheme];
  const listRef = useRef<FlatList<Verse>>(null);
  const lastSaved = useRef<string>('');
  const [expandedStudy, setExpandedStudy] = useState<number | null>(null);
  const arabicFont = getArabicFontFamily(settings.arabicFontFamily);
  const translationMeta = getTranslationMeta(settings.translationId);

  useLayoutEffect(() => {
    // title set via Stack.Screen below
  }, []);

  useEffect(() => {
    if (!surah || !focusAyah) return;
    const index = Math.max(0, focusAyah - 1);
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.15 });
    }, 350);
    return () => clearTimeout(t);
  }, [surah, focusAyah]);

  // Auto-scroll to currently playing ayah during continuous playback
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
    await play(surahId, 1, { continuous: true });
  }, [play, surahId]);

  if (!surah) {
    return (
      <View style={[styles.missing, { backgroundColor: c.background }]}>
        <Text style={{ color: c.text }}>Surah not found.</Text>
      </View>
    );
  }

  const downloaded = isDownloaded(surah.id);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: surah.transliteration,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 4 }}>
              {isPlaying && playingSurahId === surah.id ? (
                <Pressable onPress={() => void stop()} hitSlop={10}>
                  <Ionicons name="stop-circle-outline" size={24} color={c.tint} />
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => setShowTranslation(!settings.showTranslation)}
                hitSlop={10}>
                <Ionicons
                  name={settings.showTranslation ? 'text' : 'text-outline'}
                  size={22}
                  color={c.tint}
                />
              </Pressable>
            </View>
          ),
        }}
      />

      <FlatList
        ref={listRef}
        data={surah.verses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
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
          <View style={[styles.header, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.arabicName, { color: c.arabic, fontFamily: arabicFont }]}>
              {surah.name}
            </Text>
            <Text style={[styles.enName, { color: c.text }]}>
              {surah.transliteration} — {surah.translation}
            </Text>
            <Text style={[styles.meta, { color: c.textSecondary }]}>
              {revelationLabel(surah.type)} · {surah.total_verses} ayahs · {translationMeta.shortLabel}
            </Text>
            {surah.id !== 1 && surah.id !== 9 ? (
              <Text
                style={[
                  styles.basmala,
                  {
                    color: c.arabic,
                    fontSize: Math.min(settings.arabicFontSize, 30),
                    fontFamily: arabicFont,
                  },
                ]}>
                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
              </Text>
            ) : null}

            <View style={styles.headerActions}>
              <Pressable
                onPress={() => void playSurahFromStart()}
                style={[styles.headerBtn, { backgroundColor: c.tint }]}>
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.headerBtnText}>Play surah</Text>
              </Pressable>
              {supported ? (
                <Pressable
                  onPress={() => (downloaded ? undefined : enqueue(surah.id))}
                  disabled={downloaded}
                  style={[
                    styles.headerBtn,
                    {
                      backgroundColor: downloaded ? c.tintSoft : c.card,
                      borderWidth: 1,
                      borderColor: c.tint,
                    },
                  ]}>
                  <Ionicons
                    name={downloaded ? 'checkmark-circle' : 'download-outline'}
                    size={16}
                    color={c.tint}
                  />
                  <Text style={[styles.headerBtnText, { color: c.tint }]}>
                    {downloaded ? 'Downloaded' : 'Download'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {isPlaying && playingAyahId && playingSurahId === surah.id ? (
              <Text style={[styles.nowPlaying, { color: c.tint }]}>
                Playing ayah {playingAyahId}
                {continuousActive || settings.continuousPlayback ? ' · continuous' : ''} · Alafasy
                {downloaded ? ' · offline' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <AyahCard
            surahId={surah.id}
            ayahId={item.id}
            arabic={item.ar}
            english={getVerseTranslation(surah.id, item.id, settings.translationId)}
            showTranslation={settings.showTranslation}
            arabicFontSize={settings.arabicFontSize}
            arabicFontFamily={settings.arabicFontFamily}
            bookmarked={isBookmarked(surah.id, item.id)}
            isPlaying={isCurrent(surah.id, item.id) && isPlaying}
            isLoading={isCurrent(surah.id, item.id) && isLoading}
            colorScheme={colorScheme}
            highlighted={focusAyah === item.id}
            showWordByWord={settings.showWordByWord}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  header: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  arabicName: { fontSize: 32, fontWeight: '700', writingDirection: 'rtl' },
  enName: { fontSize: 16, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  meta: { fontSize: 13, marginTop: 4 },
  basmala: {
    marginTop: 18,
    textAlign: 'center',
    writingDirection: 'rtl',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    justifyContent: 'center',
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  nowPlaying: { marginTop: 12, fontSize: 12, fontWeight: '600' },
});
