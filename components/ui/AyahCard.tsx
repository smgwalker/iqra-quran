import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StudyPanel } from '@/components/ui/StudyPanel';
import Colors from '@/constants/Colors';
import { getArabicFontFamily } from '@/lib/fonts';
import type { ArabicFontId } from '@/lib/types';

type Props = {
  surahId: number;
  ayahId: number;
  arabic: string;
  english: string;
  showTranslation: boolean;
  arabicFontSize: number;
  arabicFontFamily: ArabicFontId;
  bookmarked: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  colorScheme: 'light' | 'dark';
  onToggleBookmark: () => void;
  onPlay: () => void;
  highlighted?: boolean;
  showWordByWord?: boolean;
  showTafsir?: boolean;
  onToggleStudy?: () => void;
  studyExpanded?: boolean;
};

export function AyahCard({
  surahId,
  ayahId,
  arabic,
  english,
  showTranslation,
  arabicFontSize,
  arabicFontFamily,
  bookmarked,
  isPlaying,
  isLoading,
  colorScheme,
  onToggleBookmark,
  onPlay,
  highlighted,
  showWordByWord,
  showTafsir,
  onToggleStudy,
  studyExpanded,
}: Props) {
  const c = Colors[colorScheme];
  const fontFamily = getArabicFontFamily(arabicFontFamily);
  const studyEnabled = Boolean(showWordByWord || showTafsir);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isPlaying || highlighted ? c.tintSoft : c.card,
          borderColor: isPlaying || highlighted ? c.tint : c.border,
          borderWidth: isPlaying ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}>
      <View style={styles.toolbar}>
        <View style={[styles.ayahBadge, { borderColor: c.ayahNumber }]}>
          <Text style={[styles.ayahNum, { color: c.ayahNumber }]}>{ayahId}</Text>
        </View>
        <View style={styles.actions}>
          {studyEnabled && onToggleStudy ? (
            <Pressable onPress={onToggleStudy} hitSlop={10} style={styles.iconBtn}>
              <Ionicons
                name={studyExpanded ? 'book' : 'book-outline'}
                size={22}
                color={studyExpanded ? c.tint : c.textSecondary}
              />
            </Pressable>
          ) : null}
          <Pressable onPress={onPlay} hitSlop={10} style={styles.iconBtn}>
            {isLoading ? (
              <ActivityIndicator size="small" color={c.tint} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={28}
                color={c.tint}
              />
            )}
          </Pressable>
          <Pressable onPress={onToggleBookmark} hitSlop={10} style={styles.iconBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? c.accent : c.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <Text
        style={[
          styles.arabic,
          {
            color: c.arabic,
            fontSize: arabicFontSize,
            lineHeight: arabicFontSize * 1.85,
            fontFamily,
          },
        ]}>
        {arabic}
      </Text>

      {showTranslation ? (
        <Text style={[styles.english, { color: c.translation }]}>{english}</Text>
      ) : null}

      {studyExpanded && studyEnabled ? (
        <StudyPanel
          surahId={surahId}
          ayahId={ayahId}
          showWordByWord={Boolean(showWordByWord)}
          showTafsir={Boolean(showTafsir)}
          colorScheme={colorScheme}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ayahBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  ayahNum: { fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 2 },
  arabic: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '500',
  },
  english: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 24,
  },
});
