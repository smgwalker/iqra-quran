import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.appName, { color: c.tint }]}>Iqra</Text>
                <Text style={[styles.tagline, { color: c.textSecondary }]}>
                  Read · Listen · Reflect
                </Text>
              </View>
              <Link href="/about" asChild>
                <Pressable hitSlop={12}>
                  <Ionicons name="information-circle-outline" size={26} color={c.textSecondary} />
                </Pressable>
              </Link>
            </View>

            {lastSurah && lastRead ? (
              <ContinueCard
                surahName={lastSurah.transliteration}
                arabicName={lastSurah.name}
                ayahId={lastRead.ayahId}
                colorScheme={colorScheme}
                onPress={() =>
                  router.push({
                    pathname: '/surah/[id]',
                    params: { id: String(lastRead.surahId), ayah: String(lastRead.ayahId) },
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
  list: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { fontSize: 13, marginTop: 2 },
  section: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
});
