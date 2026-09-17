import { Link } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import type { ThemePreference } from '@/lib/types';

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const FONT_SIZES = [22, 26, 28, 32, 36, 42];

export default function SettingsScreen() {
  const { colorScheme, settings, setShowTranslation, setArabicFontSize, setTheme } = useSettings();
  const c = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: c.text }]}>English translation</Text>
            <Text style={[styles.hint, { color: c.textSecondary }]}>
              Show Saheeh International under each ayah
            </Text>
          </View>
          <Switch
            value={settings.showTranslation}
            onValueChange={setShowTranslation}
            trackColor={{ false: c.border, true: c.tint }}
          />
        </View>
      </View>

      <Text style={[styles.section, { color: c.textSecondary }]}>Arabic font size</Text>
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.chips}>
          {FONT_SIZES.map((size) => {
            const active = settings.arabicFontSize === size;
            return (
              <Pressable
                key={size}
                onPress={() => setArabicFontSize(size)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? c.tint : c.tintSoft,
                    borderColor: active ? c.tint : c.border,
                  },
                ]}>
                <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600' }}>{size}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text
          style={{
            marginTop: 14,
            textAlign: 'right',
            writingDirection: 'rtl',
            color: c.arabic,
            fontSize: settings.arabicFontSize,
            lineHeight: settings.arabicFontSize * 1.6,
          }}>
          بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
        </Text>
      </View>

      <Text style={[styles.section, { color: c.textSecondary }]}>Theme</Text>
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.chips}>
          {THEMES.map((t) => {
            const active = settings.theme === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTheme(t.id)}
                style={[
                  styles.chipWide,
                  {
                    backgroundColor: active ? c.tint : c.tintSoft,
                    borderColor: active ? c.tint : c.border,
                  },
                ]}>
                <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600' }}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Link href="/about" asChild>
        <Pressable
          style={[styles.about, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="information-circle-outline" size={22} color={c.tint} />
          <Text style={[styles.aboutText, { color: c.text }]}>About & attributions</Text>
          <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowText: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 12, marginTop: 4 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipWide: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  about: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  aboutText: { flex: 1, fontSize: 16, fontWeight: '600' },
});
