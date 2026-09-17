import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { getTafsir, getWordByWord, hasOfflineStudy } from '@/lib/study';
import type { WordGloss } from '@/lib/types';

type Props = {
  surahId: number;
  ayahId: number;
  showWordByWord: boolean;
  showTafsir: boolean;
  colorScheme: 'light' | 'dark';
};

export function StudyPanel({
  surahId,
  ayahId,
  showWordByWord,
  showTafsir,
  colorScheme,
}: Props) {
  const c = Colors[colorScheme];
  const [words, setWords] = useState<WordGloss[] | null>(null);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loadingWbw, setLoadingWbw] = useState(false);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    if (showWordByWord) {
      setLoadingWbw(true);
      getWordByWord(surahId, ayahId)
        .then((w) => {
          if (!cancelled) setWords(w);
        })
        .catch(() => {
          if (!cancelled) setError('Could not load word-by-word');
        })
        .finally(() => {
          if (!cancelled) setLoadingWbw(false);
        });
    } else {
      setWords(null);
    }

    if (showTafsir) {
      setLoadingTafsir(true);
      getTafsir(surahId, ayahId)
        .then((t) => {
          if (!cancelled) setTafsir(t);
        })
        .catch(() => {
          if (!cancelled) setError('Could not load tafsir');
        })
        .finally(() => {
          if (!cancelled) setLoadingTafsir(false);
        });
    } else {
      setTafsir(null);
    }

    return () => {
      cancelled = true;
    };
  }, [surahId, ayahId, showWordByWord, showTafsir]);

  if (!showWordByWord && !showTafsir) return null;

  const offline = hasOfflineStudy(surahId, ayahId);

  return (
    <View style={[styles.wrap, { borderTopColor: c.border }]}>
      {!offline ? (
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          Fetched from Quran.com · cached on device
        </Text>
      ) : (
        <Text style={[styles.hint, { color: c.textSecondary }]}>Offline study pack</Text>
      )}

      {showWordByWord ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.tint }]}>Word by word</Text>
          {loadingWbw ? (
            <ActivityIndicator color={c.tint} style={{ marginVertical: 8 }} />
          ) : words?.length ? (
            <View style={styles.words}>
              {words.map((w, i) => (
                <View
                  key={`${i}-${w.ar}`}
                  style={[styles.wordChip, { backgroundColor: c.tintSoft, borderColor: c.border }]}>
                  <Text style={[styles.wordAr, { color: c.arabic }]}>{w.ar}</Text>
                  {w.tr ? (
                    <Text style={[styles.wordTr, { color: c.textSecondary }]}>{w.tr}</Text>
                  ) : null}
                  <Text style={[styles.wordEn, { color: c.translation }]}>{w.en}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.empty, { color: c.textSecondary }]}>No gloss available</Text>
          )}
        </View>
      ) : null}

      {showTafsir ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.tint }]}>
            Tafsir · Ibn Kathir (abridged)
          </Text>
          {loadingTafsir ? (
            <ActivityIndicator color={c.tint} style={{ marginVertical: 8 }} />
          ) : tafsir ? (
            <Text style={[styles.tafsir, { color: c.translation }]}>{tafsir}</Text>
          ) : (
            <Text style={[styles.empty, { color: c.textSecondary }]}>No tafsir available</Text>
          )}
        </View>
      ) : null}

      {error ? <Text style={[styles.empty, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hint: { fontSize: 11, marginBottom: 8 },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  words: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  wordChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: '48%',
    alignItems: 'center',
  },
  wordAr: { fontSize: 18, writingDirection: 'rtl', textAlign: 'center' },
  wordTr: { fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  wordEn: { fontSize: 12, marginTop: 2, textAlign: 'center' },
  tafsir: { marginTop: 8, fontSize: 13, lineHeight: 20 },
  empty: { marginTop: 6, fontSize: 13 },
});
