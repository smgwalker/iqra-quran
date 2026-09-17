import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';

export default function AboutScreen() {
  const { colorScheme } = useSettings();
  const c = Colors[colorScheme];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.content}>
      <Text style={[styles.app, { color: c.tint }]}>Iqra</Text>
      <Text style={[styles.tag, { color: c.textSecondary }]}>
        A calm, offline-first Qur’an reader for iOS & Android.
      </Text>

      <Section title="Features" color={c}>
        Arabic Uthmani text, English translation, surah & juz navigation, continue reading,
        bookmarks, local search, ayah audio, light/dark theme.
      </Section>

      <Section title="Quran text & translation" color={c}>
        Bundled from{' '}
        <Text style={styles.mono}>quran-json@3.1.2</Text> (
        <Text style={styles.mono}>quran_en.json</Text>
        ).{'\n\n'}
        Source URL:{'\n'}
        <Text style={styles.mono}>
          https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json
        </Text>
        {'\n\n'}
        • Arabic (Uthmani): The Noble Qur’an Encyclopedia (quranenc.com){'\n'}
        • English: Saheeh International (Umm Muhammad), via Tanzil.net
        (tanzil.net/trans/en.sahih){'\n'}
        • Package license: CC BY-SA 4.0 (risan/quran-json)
      </Section>

      <Section title="Audio" color={c}>
        Recitation streamed from everyayah.com — Mishary Rashid Alafasy (128 kbps).{'\n\n'}
        URL pattern:{'\n'}
        <Text style={styles.mono}>
          https://everyayah.com/data/Alafasy_128kbps/{SSS}{AAA}.mp3
        </Text>
        {'\n\n'}
        Requires network for playback. Audio is not redistributed with this app.
      </Section>

      <Section title="Juz divisions" color={c}>
        Standard 30 Juz (Hafs) boundaries included as local JSON (conventional public
        division).
      </Section>

      <Section title="Privacy" color={c}>
        Bookmarks, last-read position, and settings are stored only on your device via
        AsyncStorage. No account required.
      </Section>

      <Section title="Disclaimer" color={c}>
        Iqra is an independent open-data reader. It is not affiliated with QuranMajeed or any
        commercial Qur’an app. Always verify important rulings with trusted scholars.
      </Section>

      <Text style={[styles.footer, { color: c.textSecondary }]}>Iqra v1.0.0 · Expo</Text>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.card, { backgroundColor: color.card, borderColor: color.border }]}>
      <Text style={[styles.title, { color: color.text }]}>{title}</Text>
      <Text style={[styles.body, { color: color.textSecondary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  app: { fontSize: 32, fontWeight: '800' },
  tag: { fontSize: 15, marginTop: 6, marginBottom: 20, lineHeight: 22 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22 },
  mono: { fontFamily: 'SpaceMono', fontSize: 11 },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 12 },
});
