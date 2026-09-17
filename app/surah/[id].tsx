import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AyahCard } from '@/components/ui/AyahCard';
import Colors from '@/constants/Colors';
import { useAudio } from '@/contexts/AudioContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getSurah, revelationLabel } from '@/lib/quran';
import type { Verse } from '@/lib/types';

export default function SurahReaderScreen() {
  const { id, ayah } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahId = Number(id);
  const focusAyah = ayah ? Number(ayah) : undefined;
  const surah = getSurah(surahId);

  const { colorScheme, settings, setShowTranslation } = useSettings();
  const { isBookmarked, toggleBookmark, setLastReadPosition } = useBookmarks();
  const { play, pause, isPlaying, isLoading, isCurrent, playingAyahId } = useAudio();
  const c = Colors[colorScheme];
  const listRef = useRef<FlatList<Verse>>(null);
  const lastSaved = useRef<string>('');

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

  if (!surah) {
    return (
      <View style={[styles.missing, { backgroundColor: c.background }]}>
        <Text style={{ color: c.text }}>Surah not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: surah.transliteration,
          headerRight: () => (
            <Pressable
              onPress={() => setShowTranslation(!settings.showTranslation)}
              hitSlop={10}
              style={{ marginRight: 4 }}>
              <Ionicons
                name={settings.showTranslation ? 'text' : 'text-outline'}
                size={22}
                color={c.tint}
              />
            </Pressable>
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
            <Text style={[styles.arabicName, { color: c.arabic }]}>{surah.name}</Text>
            <Text style={[styles.enName, { color: c.text }]}>
              {surah.transliteration} — {surah.translation}
            </Text>
            <Text style={[styles.meta, { color: c.textSecondary }]}>
              {revelationLabel(surah.type)} · {surah.total_verses} ayahs
            </Text>
            {surah.id !== 1 && surah.id !== 9 ? (
              <Text
                style={[
                  styles.basmala,
                  {
                    color: c.arabic,
                    fontSize: Math.min(settings.arabicFontSize, 30),
                  },
                ]}>
                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
              </Text>
            ) : null}
            {isPlaying && playingAyahId ? (
              <Text style={[styles.nowPlaying, { color: c.tint }]}>
                Playing ayah {playingAyahId} · Mishary Alafasy
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <AyahCard
            surahId={surah.id}
            ayahId={item.id}
            arabic={item.ar}
            english={item.en}
            showTranslation={settings.showTranslation}
            arabicFontSize={settings.arabicFontSize}
            bookmarked={isBookmarked(surah.id, item.id)}
            isPlaying={isCurrent(surah.id, item.id) && isPlaying}
            isLoading={isCurrent(surah.id, item.id) && isLoading}
            colorScheme={colorScheme}
            highlighted={focusAyah === item.id}
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
  nowPlaying: { marginTop: 12, fontSize: 12, fontWeight: '600' },
});
