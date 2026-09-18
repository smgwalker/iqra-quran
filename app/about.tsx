import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { STUDY_NOTES } from '@/lib/study';
import { TRANSLATIONS } from '@/lib/translations';

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
        Arabic Uthmani text, multiple English translations, surah & juz navigation, continue
        reading, bookmarks, local search, ayah audio (stream or offline download), continuous
        playback, word-by-word & tafsir panels, Amiri / Scheherazade fonts, light/dark theme.
      </Section>

      <Section title="Quran text" color={c}>
        Arabic bundled from{' '}
        <Text style={styles.mono}>quran-json@3.1.2</Text> (
        <Text style={styles.mono}>quran_en.json</Text>
        ).{'\n\n'}
        Source URL:{'\n'}
        <Text style={styles.mono}>
          https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json
        </Text>
        {'\n\n'}
        • Arabic (Uthmani): The Noble Qur’an Encyclopedia (quranenc.com){'\n'}
        • Package license: CC BY-SA 4.0 (risan/quran-json)
      </Section>

      <Section title="English translations" color={c}>
        {TRANSLATIONS.map((t) => (
          <Text key={t.id}>
            • <Text style={{ fontWeight: '700' }}>{t.label}</Text> — {t.author}
            {'\n'} {t.license}
            {'\n'} <Text style={styles.mono}>{t.source}</Text>
            {'\n\n'}
          </Text>
        ))}
        Pickthall & Yusuf Ali are bundled as compact offline JSON under{' '}
        <Text style={styles.mono}>assets/data/translations/</Text>.
      </Section>

      <Section title="Audio" color={c}>
        Recitation from everyayah.com — Mishary Rashid Alafasy (128 kbps).{'\n\n'}
        URL pattern:{'\n'}
        <Text style={styles.mono}>
          https://everyayah.com/data/Alafasy_128kbps/SSSAAA.mp3
        </Text>
        {'\n'}(SSS / AAA = zero-padded surah / ayah)
        {'\n\n'}
        Playback streams by default. Surahs can be downloaded offline via Settings → Manage audio
        downloads (native only). Local files are preferred when present. Audio is not redistributed
        with the app bundle.
      </Section>

      <Section title="Word-by-word & tafsir" color={c}>
        {STUDY_NOTES.wbwSource}.{'\n'}
        {STUDY_NOTES.tafsirSource}.{'\n'}
        {STUDY_NOTES.offlineSubset}.{'\n\n'}
        Enable in Settings, then tap the book icon on an ayah. Network is required for ayahs outside
        the offline subset (results are cached on device).
      </Section>

      <Section title="Tajweed colors" color={c}>
        Reader legend: Qalqala, Iqlab, Idgham, Ikhfa'a, Ghunna.{'\n\n'}
        Bundled annotations for surahs 1, 112–114 from Quran.com{' '}
        <Text style={styles.mono}>uthmani_tajweed</Text>. Other surahs use a lightweight
        heuristic (demo). See <Text style={styles.mono}>assets/data/SOURCES.md</Text>.
      </Section>

      <Section title="Arabic fonts" color={c}>
        • Amiri — SIL Open Font License 1.1{'\n'}
        • Scheherazade New — SIL Open Font License 1.1{'\n'}
        Bundled under <Text style={styles.mono}>assets/fonts/</Text> with OFL license texts.
      </Section>

      <Section title="Juz divisions" color={c}>
        Standard 30 Juz (Hafs) boundaries included as local JSON (conventional public division).
      </Section>

      <Section title="Privacy" color={c}>
        Bookmarks, last-read position, settings, download index, and study cache are stored only on
        your device via AsyncStorage / app documents. No account required.
      </Section>

      <Section title="Disclaimer" color={c}>
        Iqra is an independent open-data reader. It is not affiliated with QuranMajeed or any
        commercial Qur’an app. Always verify important rulings with trusted scholars.
      </Section>

      <Text style={[styles.footer, { color: c.textSecondary }]}>Iqra v1.1.0 · Expo</Text>
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
