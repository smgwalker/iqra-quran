import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { DuaCard } from '@/components/ui/DuaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import Colors from '@/constants/Colors';
import { AzkarTheme } from '@/constants/AzkarTheme';
import { useAzkar } from '@/contexts/AzkarContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
  FAVORITES_CATEGORY_ID,
  getAzkarCategory,
  getCategoryDuas,
  getCategoryForDua,
  getDua,
  type Dua,
} from '@/lib/azkar';
import { getArabicFontFamily } from '@/lib/fonts';

export default function AzkarCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { colorScheme, settings } = useSettings();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    prefs,
    setShowTransliteration,
    counts,
    setCount,
    resetCounts,
  } = useAzkar();
  const c = Colors[colorScheme];
  const t = AzkarTheme[colorScheme];
  const arabicFont = getArabicFontFamily(settings.arabicFontFamily);

  const isFavorites = category === FAVORITES_CATEGORY_ID;
  const meta = isFavorites ? undefined : getAzkarCategory(category ?? '');
  const title = isFavorites ? 'Favorites' : (meta?.title ?? 'Azkar');

  const duas: Dua[] = useMemo(() => {
    if (isFavorites) return favorites.map(getDua).filter((d): d is Dua => Boolean(d));
    return getCategoryDuas(category ?? '');
  }, [isFavorites, favorites, category]);

  const completed = duas.filter((d) => (counts[d.id] ?? 0) >= Math.max(1, d.count)).length;
  const anyCounted = duas.some((d) => (counts[d.id] ?? 0) > 0);

  if (!isFavorites && !meta) {
    return (
      <View style={[styles.flex, { backgroundColor: c.background }]}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState icon="alert-circle-outline" title="Category not found" colorScheme={colorScheme} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title, headerBackTitle: 'Azkar' }} />
      <FlatList
        data={duas}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={[styles.summary, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
              <View style={[styles.summaryIcon, { backgroundColor: meta?.color ?? '#ED4956' }]}>
                <Ionicons name={meta?.icon ?? 'heart'} size={22} color="#fff" />
              </View>
              <View style={styles.summaryText}>
                <Text style={[styles.summaryTitle, { color: t.title }]}>{title}</Text>
                <Text style={[styles.summarySub, { color: t.muted }]}>
                  {isFavorites ? 'Your saved duas' : meta?.subtitle} · {completed}/{duas.length} completed
                </Text>
              </View>
              {anyCounted ? (
                <Pressable
                  onPress={() => resetCounts(duas.map((d) => d.id))}
                  hitSlop={8}
                  accessibilityLabel="Reset all counters">
                  <Ionicons name="refresh-circle" size={28} color={t.gold} />
                </Pressable>
              ) : null}
            </View>
            <View style={[styles.toggleRow, { borderColor: c.border, backgroundColor: c.card }]}>
              <Text style={[styles.toggleLabel, { color: c.text }]}>Show transliteration</Text>
              <Switch
                value={prefs.showTransliteration}
                onValueChange={setShowTransliteration}
                trackColor={{ true: t.green, false: c.border }}
              />
            </View>
            <Text style={[styles.hint, { color: c.textSecondary }]}>
              Tap the counter to count each repetition · long-press to reset
            </Text>
          </View>
        }
        ListEmptyComponent={
          isFavorites ? (
            <View style={styles.empty}>
              <EmptyState
                icon="heart-outline"
                title="No favorites yet"
                subtitle="Tap the heart on any dua to save it here."
                colorScheme={colorScheme}
              />
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/azkar'))}
                style={[styles.browse, { backgroundColor: t.green }]}>
                <Text style={styles.browseText}>Browse categories</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <DuaCard
            dua={item}
            index={index}
            colorScheme={colorScheme}
            arabicFontFamily={arabicFont}
            arabicFontSize={settings.arabicFontSize}
            showTransliteration={prefs.showTransliteration}
            favorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            count={counts[item.id] ?? 0}
            onCountChange={(v) => setCount(item.id, v)}
            eyebrow={isFavorites ? getCategoryForDua(item.id)?.title : undefined}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, paddingBottom: 40 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { flex: 1, minWidth: 0 },
  summaryTitle: { fontSize: 17, fontWeight: '800' },
  summarySub: { fontSize: 12, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 11, textAlign: 'center', marginVertical: 10 },
  empty: { alignItems: 'center', paddingTop: 24 },
  browse: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  browseText: { color: '#fff', fontWeight: '700' },
});
