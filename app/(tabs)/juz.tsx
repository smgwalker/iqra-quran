import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { getSurah, juzList } from '@/lib/quran';

export default function JuzScreen() {
  const { colorScheme } = useSettings();
  const c = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={juzList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.intro, { color: c.textSecondary }]}>
            Jump to any of the 30 Juz (Para) of the Qur’an.
          </Text>
        }
        renderItem={({ item }) => {
          const startSurah = getSurah(item.start.surah);
          const endSurah = getSurah(item.end.surah);
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/surah/[id]',
                  params: {
                    id: String(item.start.surah),
                    ayah: String(item.start.ayah),
                  },
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
              <View style={[styles.badge, { backgroundColor: c.tintSoft }]}>
                <Text style={[styles.badgeText, { color: c.tint }]}>{item.id}</Text>
              </View>
              <View style={styles.body}>
                <Text style={[styles.title, { color: c.text }]}>Juz {item.id}</Text>
                <Text style={[styles.sub, { color: c.textSecondary }]}>
                  {startSurah?.transliteration} {item.start.ayah} → {endSurah?.transliteration}{' '}
                  {item.end.ayah}
                </Text>
                <Text style={[styles.meta, { color: c.textSecondary }]}>
                  {item.ayahCount} ayahs
                </Text>
              </View>
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
  intro: { fontSize: 14, marginBottom: 14, lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { fontWeight: '800', fontSize: 15 },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  meta: { fontSize: 12, marginTop: 4 },
});
