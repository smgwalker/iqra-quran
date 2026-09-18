import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StudyPanel } from '@/components/ui/StudyPanel';
import { TajweedText } from '@/components/ui/TajweedText';
import { Mushaf } from '@/constants/MushafTheme';
import { getArabicFontFamily } from '@/lib/fonts';
import type { ArabicFontId, ReadingViewMode } from '@/lib/types';

type Props = {
  surahId: number;
  ayahId: number;
  arabic: string;
  english: string;
  viewMode: ReadingViewMode;
  arabicFontSize: number;
  arabicFontFamily: ArabicFontId;
  bookmarked: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  colorScheme: 'light' | 'dark';
  onToggleBookmark: () => void;
  onPlay: () => void;
  highlighted?: boolean;
  /** Optional tafsir via book icon (settings); WBW is always shown in wordByWord mode. */
  showTafsir?: boolean;
  onToggleStudy?: () => void;
  studyExpanded?: boolean;
  /** Alternating cream row (even index = alt) */
  altRow?: boolean;
};

export function AyahCard({
  surahId,
  ayahId,
  arabic,
  english,
  viewMode,
  arabicFontSize,
  arabicFontFamily,
  bookmarked,
  isPlaying,
  isLoading,
  colorScheme,
  onToggleBookmark,
  onPlay,
  highlighted,
  showTafsir,
  onToggleStudy,
  studyExpanded,
  altRow,
}: Props) {
  const fontFamily = getArabicFontFamily(arabicFontFamily);
  const showTranslation = viewMode === 'translation';
  const showWbwInline = viewMode === 'wordByWord';
  const tafsirToggle = Boolean(showTafsir && onToggleStudy);
  const bg = isPlaying || highlighted ? '#E8F0E4' : altRow ? Mushaf.creamAlt : Mushaf.cream;

  return (
    <View style={[styles.row, { backgroundColor: bg, borderBottomColor: Mushaf.hairline }]}>
      <View style={styles.sealCol}>
        <View style={[styles.seal, ayahId === 1 && styles.sealFirst]}>
          {ayahId === 1 ? <View style={styles.sealFlourish} /> : null}
          <View style={styles.sealInner}>
            <Text style={styles.sealNum}>{ayahId}</Text>
          </View>
        </View>
        <View style={styles.quietActions}>
          <Pressable onPress={onPlay} hitSlop={8} style={styles.quietBtn}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Mushaf.forest} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={14}
                color={isPlaying ? Mushaf.forest : Mushaf.goldDark}
              />
            )}
          </Pressable>
          <Pressable onPress={onToggleBookmark} hitSlop={8} style={styles.quietBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={14}
              color={bookmarked ? Mushaf.goldDark : Mushaf.hairline}
            />
          </Pressable>
          {tafsirToggle ? (
            <Pressable onPress={onToggleStudy} hitSlop={8} style={styles.quietBtn}>
              <Ionicons
                name={studyExpanded ? 'book' : 'book-outline'}
                size={14}
                color={studyExpanded ? Mushaf.forest : Mushaf.hairline}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        <TajweedText
          surahId={surahId}
          ayahId={ayahId}
          arabic={arabic}
          fontSize={arabicFontSize}
          fontFamily={fontFamily}
        />

        {showTranslation ? <Text style={styles.english}>{english}</Text> : null}

        {showWbwInline ? (
          <StudyPanel
            surahId={surahId}
            ayahId={ayahId}
            showWordByWord
            showTafsir={Boolean(showTafsir && studyExpanded)}
            colorScheme={colorScheme}
          />
        ) : null}

        {!showWbwInline && studyExpanded && showTafsir ? (
          <StudyPanel
            surahId={surahId}
            ayahId={ayahId}
            showWordByWord={false}
            showTafsir
            colorScheme={colorScheme}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  sealCol: {
    width: 44,
    alignItems: 'center',
    paddingTop: 4,
  },
  seal: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealFirst: {
    marginTop: 6,
  },
  sealFlourish: {
    position: 'absolute',
    top: -8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Mushaf.gold,
    borderWidth: 1,
    borderColor: Mushaf.goldDark,
  },
  sealInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: Mushaf.sealRing,
    backgroundColor: Mushaf.sealFill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Mushaf.goldDark,
    shadowOpacity: 0.25,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  sealNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Mushaf.arabic,
  },
  quietActions: {
    marginTop: 8,
    gap: 6,
    alignItems: 'center',
  },
  quietBtn: {
    padding: 2,
    opacity: 0.85,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  english: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: Mushaf.translation,
    textAlign: 'left',
  },
});
