import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EngagementSection } from '@/components/ui/EngagementSection';
import { FeatureGrid, type FeatureItem } from '@/components/ui/FeatureGrid';
import { JourneyCard } from '@/components/ui/JourneyCard';
import { StoryCircle } from '@/components/ui/StoryCircle';
import Colors from '@/constants/Colors';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useDownloads } from '@/contexts/DownloadContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
  formatGregorianDate,
  formatHijriDate,
  loadLifetimeMinutes,
  loadStreak,
  loadWeeklyMinutes,
} from '@/lib/engagement';
import { getSurah } from '@/lib/quran';

const STORY_SHORTCUTS: {
  key: string;
  label: string;
  surahId?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  href?: '/juz' | '/search';
}[] = [
  { key: 'fatiha', label: 'Fatiha', surahId: 1 },
  { key: 'yasin', label: 'Yasin', surahId: 36 },
  { key: 'mulk', label: 'Mulk', surahId: 67 },
  { key: 'kahf', label: 'Kahf', surahId: 18 },
  { key: 'rahman', label: 'Rahman', surahId: 55 },
  { key: 'juz', label: 'Juz', icon: 'layers-outline', href: '/juz' },
  { key: 'search', label: 'Search', icon: 'search', href: '/search' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useSettings();
  const { lastRead, bookmarks } = useBookmarks();
  const { downloaded } = useDownloads();
  const c = Colors[colorScheme];

  const [streak, setStreak] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [lifetimeMinutes, setLifetimeMinutes] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refreshEngagement = useCallback(async () => {
    const [s, w, life] = await Promise.all([
      loadStreak(),
      loadWeeklyMinutes(),
      loadLifetimeMinutes(),
    ]);
    setStreak(s.count);
    setWeeklyMinutes(w.minutes);
    setLifetimeMinutes(life);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshEngagement();
    }, [refreshEngagement]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEngagement();
    setRefreshing(false);
  };

  const lastSurah = lastRead ? getSurah(lastRead.surahId) : null;
  const gregorian = formatGregorianDate();
  const hijri = formatHijriDate();

  const openContinue = () => {
    if (lastRead) {
      router.push({
        pathname: '/surah/[id]',
        params: { id: String(lastRead.surahId), ayah: String(lastRead.ayahId) },
      });
    } else {
      router.push('/surahs');
    }
  };

  const features: FeatureItem[] = [
    { key: 'read', label: 'Read Quran', icon: 'book', color: '#0095F6', onPress: () => router.push('/surahs') },
    { key: 'juz', label: 'Juz', icon: 'layers', color: '#5856D6', onPress: () => router.push('/juz') },
    { key: 'bookmarks', label: 'Bookmarks', icon: 'bookmark', color: '#F5A623', onPress: () => router.push('/bookmarks') },
    { key: 'search', label: 'Search', icon: 'search', color: '#34C759', onPress: () => router.push('/search') },
    { key: 'downloads', label: 'Downloads', icon: 'cloud-download', color: '#FF2D55', onPress: () => router.push('/downloads') },
    { key: 'study', label: 'Word-by-word', icon: 'school', color: '#AF52DE', onPress: () => router.push('/settings') },
    { key: 'settings', label: 'Settings', icon: 'settings', color: '#8E8E93', onPress: () => router.push('/settings') },
    { key: 'about', label: 'About', icon: 'information-circle', color: '#64D2FF', onPress: () => router.push('/about') },
  ];

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={c.tint}
          />
        }
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[c.heroGradientStart, c.heroGradientEnd]}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <View style={styles.heroTop}>
            <Text style={styles.brandMark}>Iqra</Text>
            <Pressable onPress={() => router.push('/about')} hitSlop={12}>
              <Ionicons name="person-circle-outline" size={28} color="rgba(255,255,255,0.85)" />
            </Pressable>
          </View>

          <Pressable onPress={openContinue} style={styles.heroFocus}>
            <Text style={styles.heroLabel}>Continue reading</Text>
            {lastSurah && lastRead ? (
              <>
                <Text style={styles.heroTitle}>{lastSurah.transliteration}</Text>
                <Text style={styles.heroSub}>
                  Ayah {lastRead.ayahId} · {lastSurah.name}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.heroTitle}>Start with Al-Fatiha</Text>
                <Text style={styles.heroSub}>Your journey begins here</Text>
              </>
            )}
          </Pressable>

          <View style={styles.heroDates}>
            <View>
              {hijri ? <Text style={styles.hijri}>{hijri}</Text> : null}
              <Text style={styles.gregorian}>{gregorian}</Text>
            </View>
            <Pressable onPress={openContinue} style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Open</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.moon} />
          <View style={styles.dome} />
        </LinearGradient>

        <View style={styles.body}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stories}
            style={styles.storiesScroll}>
            {STORY_SHORTCUTS.map((s) => (
              <StoryCircle
                key={s.key}
                label={s.label}
                icon={s.icon}
                innerText={s.surahId ? String(s.surahId) : undefined}
                colorScheme={colorScheme}
                onPress={() => {
                  if (s.surahId) {
                    router.push({ pathname: '/surah/[id]', params: { id: String(s.surahId) } });
                  } else if (s.href) {
                    router.push(s.href);
                  }
                }}
              />
            ))}
          </ScrollView>

          <FeatureGrid items={features} colorScheme={colorScheme} />

          <JourneyCard streak={streak} colorScheme={colorScheme} onPress={openContinue} />

          <EngagementSection
            weeklyMinutes={weeklyMinutes}
            lifetimeMinutes={lifetimeMinutes}
            bookmarksCount={bookmarks.length}
            downloadsCount={downloaded.length}
            colorScheme={colorScheme}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: 'hidden',
    minHeight: 260,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  brandMark: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroFocus: { alignItems: 'center', marginBottom: 24 },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  heroDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hijri: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 },
  gregorian: { color: '#fff', fontSize: 14, fontWeight: '600' },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroCtaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  moon: {
    position: 'absolute',
    top: 60,
    right: 36,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dome: {
    position: 'absolute',
    bottom: -20,
    left: 40,
    width: 80,
    height: 50,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  body: { paddingHorizontal: 16, marginTop: -8 },
  storiesScroll: { marginBottom: 8 },
  stories: { gap: 4, paddingVertical: 12, paddingRight: 8 },
});
