import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/Colors';
import { AzkarTheme } from '@/constants/AzkarTheme';
import { Mushaf } from '@/constants/MushafTheme';
import { useAzkar } from '@/contexts/AzkarContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
  AZKAR_CATEGORIES,
  FAVORITES_CATEGORY_ID,
  getAzkarCategory,
  getCategoryForDua,
  getDua,
  suggestedAzkarCategory,
  totalDuaCount,
} from '@/lib/azkar';
import { getArabicFontFamily } from '@/lib/fonts';
import { getVerse } from '@/lib/quran';

/** Shown from the bundled Qur'an text (Saheeh International). */
const heroVerse = getVerse(13, 28);

export default function AzkarIndexScreen() {
  const { colorScheme, settings } = useSettings();
  const { favorites } = useAzkar();
  const c = Colors[colorScheme];
  const t = AzkarTheme[colorScheme];
  const arabicFont = getArabicFontFamily(settings.arabicFontFamily);

  const suggestedId = suggestedAzkarCategory();
  const suggested = suggestedId ? getAzkarCategory(suggestedId) : undefined;
  const favoriteDuas = favorites.map(getDua).filter((d) => d !== undefined);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: 'Dua & Azkar', headerBackTitle: 'Home' }} />

      <LinearGradient
        colors={[Mushaf.forest, Mushaf.forestDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        {heroVerse ? (
          <>
            <Text style={[styles.heroArabic, { fontFamily: arabicFont }]}>{heroVerse.ar}</Text>
            <Text style={styles.heroCaption}>“{heroVerse.en}” · Ar-Ra‘d 13:28</Text>
          </>
        ) : (
          <Text style={styles.heroTitle}>Dua & Azkar</Text>
        )}
        <View style={styles.heroStats}>
          <Text style={styles.heroStat}>{AZKAR_CATEGORIES.length} categories</Text>
          <View style={styles.dot} />
          <Text style={styles.heroStat}>{totalDuaCount()} duas</Text>
          <View style={styles.dot} />
          <Text style={styles.heroStat}>{favorites.length} saved</Text>
        </View>
      </LinearGradient>

      <View style={styles.quickRow}>
        {suggested ? (
          <Link href={{ pathname: '/azkar/[category]', params: { category: suggested.id } }} asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.quickCard,
                { backgroundColor: t.cardBg, borderColor: t.cardBorder },
              ])}>
              <View style={[styles.quickIcon, { backgroundColor: suggested.color }]}>
                <Ionicons name={suggested.icon} size={20} color="#fff" />
              </View>
              <Text style={[styles.quickEyebrow, { color: t.muted }]}>Now</Text>
              <Text style={[styles.quickTitle, { color: t.title }]} numberOfLines={1}>
                {suggested.title}
              </Text>
            </Pressable>
          </Link>
        ) : null}
        <Link href="/azkar/tasbeeh" asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.quickCard,
              { backgroundColor: t.cardBg, borderColor: t.cardBorder },
            ])}>
            <View style={[styles.quickIcon, { backgroundColor: Mushaf.gold }]}>
              <Ionicons name="ellipse-outline" size={20} color="#fff" />
            </View>
            <Text style={[styles.quickEyebrow, { color: t.muted }]}>Counter</Text>
            <Text style={[styles.quickTitle, { color: t.title }]}>Tasbeeh</Text>
          </Pressable>
        </Link>
      </View>

      {favoriteDuas.length > 0 ? (
        <View style={[styles.favCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              <Ionicons name="heart" size={15} color="#ED4956" /> Favorites
            </Text>
            <Link href={{ pathname: '/azkar/[category]', params: { category: FAVORITES_CATEGORY_ID } }} asChild>
              <Pressable hitSlop={8}>
                <Text style={[styles.seeAll, { color: c.tint }]}>See all ({favoriteDuas.length})</Text>
              </Pressable>
            </Link>
          </View>
          {favoriteDuas.slice(0, 3).map((d) => {
            const cat = getCategoryForDua(d.id);
            return (
              <Link
                key={d.id}
                href={{ pathname: '/azkar/[category]', params: { category: FAVORITES_CATEGORY_ID } }}
                asChild>
                <Pressable style={StyleSheet.flatten([styles.favRow, { borderTopColor: c.border }])}>
                  <View style={styles.favText}>
                    <Text
                      style={[styles.favArabic, { color: c.text, fontFamily: arabicFont }]}
                      numberOfLines={1}>
                      {d.arabic}
                    </Text>
                    <Text style={[styles.favMeta, { color: c.textSecondary }]} numberOfLines={1}>
                      {d.title ?? cat?.title ?? 'Dua'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
                </Pressable>
              </Link>
            );
          })}
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, styles.catHeading, { color: c.text }]}>Categories</Text>
      <View style={styles.grid}>
        {AZKAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={{ pathname: '/azkar/[category]', params: { category: cat.id } }}
            asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.catCard,
                { backgroundColor: c.card, borderColor: c.border },
              ])}>
              <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon} size={22} color="#fff" />
              </View>
              <Text style={[styles.catTitle, { color: c.text }]} numberOfLines={2}>
                {cat.title}
              </Text>
              <Text style={[styles.catSub, { color: c.textSecondary }]} numberOfLines={1}>
                {cat.duaIds.length} {cat.duaIds.length === 1 ? 'dua' : 'duas'} · {cat.subtitle}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <Text style={[styles.footnote, { color: c.textSecondary }]}>
        Texts and references from open MIT-licensed datasets (Seen-Arabic Morning & Evening Adhkar DB,
        fitrahive Dua & Dhikr). See About for details.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  hero: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    alignItems: 'center',
  },
  heroArabic: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 42,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroCaption: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
  heroStat: { color: Mushaf.sealFill, fontSize: 12, fontWeight: '700' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickEyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  quickTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  favCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 12,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  favText: { flex: 1, minWidth: 0 },
  favArabic: { fontSize: 18, textAlign: 'right', writingDirection: 'rtl' },
  favMeta: { fontSize: 12, marginTop: 2 },
  catHeading: { marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
    minHeight: 124,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  catTitle: { fontSize: 15, fontWeight: '700' },
  catSub: { fontSize: 11, marginTop: 4 },
  footnote: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 12 },
});
