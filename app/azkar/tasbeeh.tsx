import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { AzkarTheme } from '@/constants/AzkarTheme';
import { Mushaf } from '@/constants/MushafTheme';
import { useSettings } from '@/contexts/SettingsContext';
import { DEFAULT_TASBEEH, getDua, loadTasbeeh, saveTasbeeh, type TasbeehState } from '@/lib/azkar';
import { getArabicFontFamily } from '@/lib/fonts';
import { successHaptic, tapHaptic } from '@/lib/haptics';

type Preset = {
  id: string;
  label: string;
  /** Dataset entry (after-salah list) providing the Arabic + transliteration */
  duaId?: string;
  target: number;
};

const PRESETS: Preset[] = [
  { id: 'subhanallah', label: 'SubhanAllah', duaId: 'fh-dhikr-after-salah-4', target: 33 },
  { id: 'alhamdulillah', label: 'Alhamdulillah', duaId: 'fh-dhikr-after-salah-5', target: 33 },
  { id: 'allahuakbar', label: 'Allahu Akbar', duaId: 'fh-dhikr-after-salah-6', target: 34 },
  { id: 'custom', label: 'Custom', target: 0 },
];

export default function TasbeehScreen() {
  const { colorScheme, settings } = useSettings();
  const c = Colors[colorScheme];
  const t = AzkarTheme[colorScheme];
  const arabicFont = getArabicFontFamily(settings.arabicFontFamily);

  const [state, setState] = useState<TasbeehState>(DEFAULT_TASBEEH);
  const [rounds, setRounds] = useState(0);
  const [customText, setCustomText] = useState(String(DEFAULT_TASBEEH.customTarget));
  const loaded = useRef(false);

  useEffect(() => {
    loadTasbeeh().then((s) => {
      setState(s);
      setCustomText(String(s.customTarget));
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (loaded.current) void saveTasbeeh(state);
  }, [state]);

  const preset = PRESETS.find((p) => p.id === state.presetId) ?? PRESETS[0];
  const target = preset.id === 'custom' ? state.customTarget : preset.target;
  const dua = preset.duaId ? getDua(preset.duaId) : undefined;
  const progress = target > 0 ? Math.min(state.current / target, 1) : 0;

  const tap = () => {
    const nextCurrent = state.current + 1;
    if (nextCurrent >= target) {
      successHaptic();
      setRounds((r) => r + 1);
      setState({ ...state, current: 0, total: state.total + 1 });
    } else {
      tapHaptic();
      setState({ ...state, current: nextCurrent, total: state.total + 1 });
    }
  };

  const selectPreset = (id: string) => {
    if (id === state.presetId) return;
    setRounds(0);
    setState({ ...state, presetId: id, current: 0 });
  };

  const applyCustom = (text: string) => {
    setCustomText(text.replace(/[^0-9]/g, ''));
    const n = parseInt(text, 10);
    if (Number.isFinite(n) && n > 0 && n <= 99999) {
      setState((s) => ({ ...s, customTarget: n, current: Math.min(s.current, n - 1) }));
    }
  };

  const reset = () => {
    setRounds(0);
    setState({ ...state, current: 0 });
  };

  const resetTotal = () => {
    const doReset = () => setState((s) => ({ ...s, total: 0 }));
    if (Platform.OS === 'web') {
      doReset();
      return;
    }
    Alert.alert('Reset lifetime total?', 'This clears your saved tasbeeh total.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: doReset },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Tasbeeh', headerBackTitle: 'Back' }} />

      <View style={styles.presets}>
        {PRESETS.map((p) => {
          const active = p.id === preset.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => selectPreset(p.id)}
              style={[
                styles.preset,
                {
                  backgroundColor: active ? t.green : c.card,
                  borderColor: active ? t.green : c.border,
                },
              ]}>
              <Text style={[styles.presetLabel, { color: active ? '#fff' : c.text }]}>{p.label}</Text>
              <Text style={[styles.presetTarget, { color: active ? 'rgba(255,255,255,0.8)' : c.textSecondary }]}>
                {p.id === 'custom' ? state.customTarget : p.target}×
              </Text>
            </Pressable>
          );
        })}
      </View>

      {preset.id === 'custom' ? (
        <View style={[styles.customRow, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.customLabel, { color: c.text }]}>Target</Text>
          <TextInput
            value={customText}
            onChangeText={applyCustom}
            keyboardType="number-pad"
            maxLength={5}
            style={[styles.customInput, { color: c.text, borderColor: c.border }]}
            accessibilityLabel="Custom target"
          />
        </View>
      ) : null}

      <View style={styles.phrase}>
        {dua ? (
          <>
            <Text style={[styles.phraseArabic, { color: c.text, fontFamily: arabicFont }]}>{dua.arabic}</Text>
            <Text style={[styles.phraseSub, { color: c.textSecondary }]}>
              {dua.transliteration} · {dua.translation}
            </Text>
          </>
        ) : (
          <Text style={[styles.phraseSub, { color: c.textSecondary }]}>Your own dhikr</Text>
        )}
      </View>

      <Pressable
        onPress={tap}
        style={({ pressed }) => [
          styles.tapOuter,
          { borderColor: Mushaf.gold, backgroundColor: t.goldSoft, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Count ${state.current} of ${target}. Tap to count.`}>
        <View style={[styles.tapInner, { backgroundColor: t.green }]}>
          <Text style={styles.count}>{state.current}</Text>
          <Text style={styles.countTarget}>of {target}</Text>
        </View>
      </Pressable>

      <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: Mushaf.gold }]} />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.statValue, { color: c.text }]}>{rounds}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Rounds (session)</Text>
        </View>
        <Pressable
          onLongPress={resetTotal}
          style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}
          accessibilityHint="Long-press to reset lifetime total">
          <Text style={[styles.statValue, { color: c.text }]}>{state.total.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Lifetime total</Text>
        </Pressable>
      </View>

      <Pressable onPress={reset} style={[styles.reset, { borderColor: c.border }]}>
        <Ionicons name="refresh" size={18} color={c.text} />
        <Text style={[styles.resetText, { color: c.text }]}>Reset count</Text>
      </Pressable>
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        Long-press the lifetime total to clear it.
      </Text>
    </ScrollView>
  );
}

const SIZE = 240;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, alignItems: 'stretch' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  preset: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  presetLabel: { fontSize: 15, fontWeight: '700' },
  presetTarget: { fontSize: 12, marginTop: 2 },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  customLabel: { fontSize: 14, fontWeight: '600' },
  customInput: {
    minWidth: 90,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    textAlign: 'center',
  },
  phrase: { alignItems: 'center', marginVertical: 8, minHeight: 70 },
  phraseArabic: { fontSize: 32, lineHeight: 56, textAlign: 'center', writingDirection: 'rtl' },
  phraseSub: { fontSize: 13, textAlign: 'center', marginTop: 2 },
  tapOuter: {
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    padding: 12,
    marginVertical: 12,
  },
  tapInner: {
    flex: 1,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { color: '#fff', fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'] },
  countTarget: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginHorizontal: 40, marginBottom: 16 },
  progressFill: { height: 6, borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 10,
    marginTop: 14,
  },
  resetText: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
