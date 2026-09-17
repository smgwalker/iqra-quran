import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/ui/EmptyState';
import Colors from '@/constants/Colors';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getSurah, getVerse } from '@/lib/quran';

export default function BookmarksScreen() {
  const { colorScheme } = useSettings();
  const { bookmarks, removeBookmark } = useBookmarks();
  const c = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => `${item.surahId}:${item.ayahId}`}
        contentContainerStyle={bookmarks.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="No bookmarks yet"
            subtitle="Tap the bookmark icon on any ayah while reading."
            colorScheme={colorScheme}
          />
        }
        renderItem={({ item }) => {
          const surah = getSurah(item.surahId);
          const verse = getVerse(item.surahId, item.ayahId);
          if (!surah || !verse) return null;
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/surah/[id]',
                  params: { id: String(item.surahId), ayah: String(item.ayahId) },
                })
              }
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <View style={styles.top}>
                <Text style={[styles.ref, { color: c.tint }]}>
                  {surah.transliteration} {item.surahId}:{item.ayahId}
                </Text>
                <Pressable
                  hitSlop={10}
                  onPress={() => removeBookmark(item.surahId, item.ayahId)}>
                  <Ionicons name="trash-outline" size={20} color={c.danger} />
                </Pressable>
              </View>
              <Text style={[styles.ar, { color: c.arabic }]} numberOfLines={2}>
                {verse.ar}
              </Text>
              <Text style={[styles.en, { color: c.translation }]} numberOfLines={2}>
                {verse.en}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ref: { fontWeight: '700', fontSize: 14 },
  ar: { marginTop: 10, fontSize: 20, textAlign: 'right', writingDirection: 'rtl' },
  en: { marginTop: 8, fontSize: 14, lineHeight: 20 },
});
