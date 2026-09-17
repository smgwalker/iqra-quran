import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { EmptyState } from '@/components/ui/EmptyState';
import Colors from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { searchQuran } from '@/lib/quran';

export default function SearchScreen() {
  const { colorScheme } = useSettings();
  const c = Colors[colorScheme];
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchQuran(query), [query]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Arabic or English…"
          placeholderTextColor={c.textSecondary}
          style={[styles.input, { color: c.text }]}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.surahId}:${item.ayahId}`}
        contentContainerStyle={
          query.trim().length >= 2 && results.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          query.trim().length < 2 ? (
            <EmptyState
              icon="search-outline"
              title="Search the Qur’an"
              subtitle="Type at least 2 characters in Arabic or English."
              colorScheme={colorScheme}
            />
          ) : (
            <EmptyState
              icon="sad-outline"
              title="No results"
              subtitle="Try a different word or phrase."
              colorScheme={colorScheme}
            />
          )
        }
        ListHeaderComponent={
          results.length > 0 ? (
            <Text style={[styles.count, { color: c.textSecondary }]}>
              {results.length}
              {results.length >= 80 ? '+' : ''} result{results.length === 1 ? '' : 's'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/surah/[id]',
                params: { id: String(item.surahId), ayah: String(item.ayahId) },
              })
            }
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.88 : 1 },
            ]}>
            <Text style={[styles.ref, { color: c.tint }]}>
              {item.surahName} {item.surahId}:{item.ayahId}
            </Text>
            <Text style={[styles.ar, { color: c.arabic }]} numberOfLines={2}>
              {item.arabic}
            </Text>
            <Text style={[styles.en, { color: c.translation }]} numberOfLines={3}>
              {item.english}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  input: { fontSize: 16, paddingVertical: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  count: { marginBottom: 10, fontSize: 13 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  ref: { fontWeight: '700', fontSize: 13 },
  ar: { marginTop: 8, fontSize: 18, textAlign: 'right', writingDirection: 'rtl' },
  en: { marginTop: 8, fontSize: 14, lineHeight: 20 },
});
