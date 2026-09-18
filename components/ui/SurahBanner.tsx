import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Mushaf } from '@/constants/MushafTheme';

type Props = {
  englishName: string;
  arabicName: string;
  arabicFontFamily?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
};

export function SurahBanner({
  englishName,
  arabicName,
  arabicFontFamily,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: Props) {
  return (
    <View style={styles.wrap}>
      {/* Filigree-ish patterned strip */}
      <View style={styles.patternRow}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.motif} />
        ))}
      </View>

      <View style={styles.row}>
        <Pressable
          onPress={onPrev}
          disabled={!hasPrev}
          hitSlop={12}
          style={[styles.chevronBox, !hasPrev && styles.chevronDisabled]}>
          <Ionicons name="chevron-back" size={22} color={Mushaf.goldDark} />
        </Pressable>

        <View style={styles.titleCard}>
          <Text style={styles.english}>Surah {englishName}</Text>
          <Text style={[styles.arabic, { fontFamily: arabicFontFamily }]}>{arabicName}</Text>
        </View>

        <Pressable
          onPress={onNext}
          disabled={!hasNext}
          hitSlop={12}
          style={[styles.chevronBox, !hasNext && styles.chevronDisabled]}>
          <Ionicons name="chevron-forward" size={22} color={Mushaf.goldDark} />
        </Pressable>
      </View>

      <View style={styles.patternRow}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.motif} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Mushaf.bannerCream,
    borderBottomWidth: 1,
    borderBottomColor: Mushaf.gold,
    borderTopWidth: 1,
    borderTopColor: Mushaf.gold,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 4,
    opacity: 0.55,
  },
  motif: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Mushaf.gold,
    transform: [{ rotate: '45deg' }],
    backgroundColor: Mushaf.bannerPattern,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chevronBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Mushaf.goldBorder,
    backgroundColor: Mushaf.sealFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronDisabled: {
    opacity: 0.35,
  },
  titleCard: {
    flex: 1,
    backgroundColor: Mushaf.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Mushaf.gold,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  english: {
    fontSize: 13,
    fontWeight: '600',
    color: Mushaf.goldDark,
    marginBottom: 2,
  },
  arabic: {
    fontSize: 22,
    fontWeight: '700',
    color: Mushaf.arabic,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
