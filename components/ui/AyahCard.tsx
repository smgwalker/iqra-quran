import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';

type Props = {
  surahId: number;
  ayahId: number;
  arabic: string;
  english: string;
  showTranslation: boolean;
  arabicFontSize: number;
  bookmarked: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  colorScheme: 'light' | 'dark';
  onToggleBookmark: () => void;
  onPlay: () => void;
  highlighted?: boolean;
};

export function AyahCard({
  ayahId,
  arabic,
  english,
  showTranslation,
  arabicFontSize,
  bookmarked,
  isPlaying,
  isLoading,
  colorScheme,
  onToggleBookmark,
  onPlay,
  highlighted,
}: Props) {
  const c = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: highlighted ? c.tintSoft : c.card,
          borderColor: highlighted ? c.tint : c.border,
        },
      ]}>
      <View style={styles.toolbar}>
        <View style={[styles.ayahBadge, { borderColor: c.ayahNumber }]}>
          <Text style={[styles.ayahNum, { color: c.ayahNumber }]}>{ayahId}</Text>
        </View>
        <View style={styles.actions}>
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
          },
        ]}>
        {arabic}
      </Text>

      {showTranslation ? (
        <Text style={[styles.english, { color: c.translation }]}>{english}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
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
