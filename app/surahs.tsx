import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { ContinueCard } from '@/components/ui/ContinueCard';
import { SurahRow } from '@/components/ui/SurahRow';
import Colors from '@/constants/Colors';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getSurah, surahs } from '@/lib/quran';

export default function SurahsScreen() {
  const { colorScheme } = useSettings();
  const { lastRead } = useBookmarks();
  const c = Colors[colorScheme];
  const lastSurah = lastRead ? getSurah(lastRead.surahId) : null;
  const data = useMemo(() => surahs, []);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: 'Read Quran', headerBackTitle: 'Home' }} />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {lastSurah && lastRead ? (
              <ContinueCard
                surahName={lastSurah.transliteration}
                arabicName={lastSurah.name}
                ayahId={lastRead.ayahId}
                colorScheme={colorScheme}
                onPress={() =>
                  router.push({
                    pathname: '/surah/[id]',
                    params: {
                      id: String(lastRead.surahId),
                      ayah: String(lastRead.ayahId),
                    },
                  })
                }
              />
            ) : null}
            <Text style={[styles.section, { color: c.text }]}>114 Surahs</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SurahRow
            id={item.id}
            name={item.name}
            transliteration={item.transliteration}
            translation={item.translation}
            type={item.type}
            totalVerses={item.total_verses}
            colorScheme={colorScheme}
            onPress={() =>
              router.push({ pathname: '/surah/[id]', params: { id: String(item.id) } })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 32 },
  section: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    marginHorizontal: 16,
    marginTop: 8,
  },
});
