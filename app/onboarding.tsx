import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { palette } from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { loadOnboardingComplete, saveOnboardingComplete } from '@/lib/engagement';
import { ARABIC_FONTS } from '@/lib/fonts';
import type { ArabicFontId, ThemePreference } from '@/lib/types';

const { width } = Dimensions.get('window');

const THEMES: { id: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'Light', icon: 'sunny-outline' },
  { id: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const {
    colorScheme,
    settings,
    setShowTranslation,
    setContinuousPlayback,
    setShowWordByWord,
    setTheme,
    setArabicFontFamily,
  } = useSettings();
  const c = Colors[colorScheme];

  useEffect(() => {
    void loadOnboardingComplete().then((done) => {
      if (done) router.replace('/(tabs)');
    });
  }, []);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setPage(index);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const finish = async () => {
    await saveOnboardingComplete();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        bounces={false}>
        <View style={[styles.page, { width }]}>
          <View style={styles.center}>
            <LinearGradient
              colors={[palette.storyPink, palette.storyOrange, palette.storyPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoRing}>
              <View style={[styles.logoInner, { backgroundColor: c.background }]}>
                <Text style={[styles.logoMark, { color: c.tint }]}>اقْرَأْ</Text>
              </View>
            </LinearGradient>
            <Text style={[styles.brand, { color: c.text }]}>Iqra</Text>
            <Text style={[styles.bismillah, { color: c.arabic }]}>بِسْمِ ٱللَّهِ</Text>
            <Text style={[styles.tagline, { color: c.textSecondary }]}>
              {'Read · Listen · Reflect\nA calm Qur’an companion, offline-first.'}
            </Text>
          </View>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <Pressable
              onPress={() => goTo(1)}
              style={[styles.primaryBtn, { backgroundColor: c.primaryButton }]}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
            <Dots page={0} active={c.text} inactive={c.border} />
          </View>
        </View>

        <View style={[styles.page, { width }]}>
          <View style={styles.center}>
            <Text style={[styles.stepTitle, { color: c.text }]}>Make reading yours</Text>
            <View style={[styles.illus, { backgroundColor: c.tintSoft }]}>
              <Ionicons name="book-outline" size={48} color={c.tint} />
            </View>
            <View style={styles.toggleList}>
              <ToggleRow
                label="Show translation"
                value={settings.showTranslation}
                onChange={setShowTranslation}
                textColor={c.text}
                border={c.border}
                tint={c.tint}
              />
              <ToggleRow
                label="Continuous playback"
                value={settings.continuousPlayback}
                onChange={setContinuousPlayback}
                textColor={c.text}
                border={c.border}
                tint={c.tint}
              />
              <ToggleRow
                label="Word-by-word"
                value={settings.showWordByWord}
                onChange={setShowWordByWord}
                textColor={c.text}
                border={c.border}
                tint={c.tint}
              />
            </View>
            <Text style={[styles.hint, { color: c.textSecondary }]}>
              You can change these anytime in Settings
            </Text>
          </View>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <Pressable
              onPress={() => goTo(2)}
              style={[styles.primaryBtn, { backgroundColor: c.primaryButton }]}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
            <Dots page={1} active={c.text} inactive={c.border} />
          </View>
        </View>

        <View style={[styles.page, { width }]}>
          <View style={styles.center}>
            <Text style={[styles.stepTitle, { color: c.text }]}>Look & feel</Text>
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Theme</Text>
            <View style={styles.chips}>
              {THEMES.map((t) => {
                const active = settings.theme === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTheme(t.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? c.tint : c.card,
                        borderColor: active ? c.tint : c.border,
                      },
                    ]}>
                    <Ionicons name={t.icon} size={18} color={active ? '#fff' : c.text} />
                    <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600' }}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.sectionLabel, { color: c.textSecondary, marginTop: 24 }]}>
              Arabic font
            </Text>
            <View style={styles.chips}>
              {ARABIC_FONTS.map((f) => {
                const active = settings.arabicFontFamily === f.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => setArabicFontFamily(f.id as ArabicFontId)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? c.tint : c.card,
                        borderColor: active ? c.tint : c.border,
                      },
                    ]}>
                    <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600' }}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <Pressable
              onPress={() => void finish()}
              style={[styles.primaryBtn, { backgroundColor: c.primaryButton }]}>
              <Text style={styles.primaryBtnText}>Finish</Text>
            </Pressable>
            <Dots page={2} active={c.text} inactive={c.border} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  textColor,
  border,
  tint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  textColor: string;
  border: string;
  tint: string;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: textColor }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: border, true: tint }}
        thumbColor="#fff"
      />
    </View>
  );
}

function Dots({
  page,
  active,
  inactive,
}: {
  page: number;
  active: string;
  inactive: string;
}) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === page ? active : inactive,
              width: i === page ? 18 : 7,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  page: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginBottom: 20,
  },
  logoInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { fontSize: 28, fontWeight: '700' },
  brand: { fontSize: 40, fontWeight: '800', letterSpacing: 0.5 },
  bismillah: { fontSize: 28, marginTop: 12, writingDirection: 'rtl' },
  tagline: { fontSize: 15, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  illus: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  toggleList: { width: '100%', maxWidth: 320, gap: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  toggleLabel: { fontSize: 17, fontWeight: '500' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 20, lineHeight: 18 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    alignSelf: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: { paddingTop: 8 },
  primaryBtn: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { height: 7, borderRadius: 4 },
});
