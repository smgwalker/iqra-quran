import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { revelationLabel } from '@/lib/quran';

type Props = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  totalVerses: number;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
};

export function SurahRow({
  id,
  name,
  transliteration,
  translation,
  type,
  totalVerses,
  colorScheme,
  onPress,
}: Props) {
  const c = Colors[colorScheme];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.badge, { backgroundColor: c.tintSoft }]}>
        <Text style={[styles.badgeText, { color: c.tint }]}>{id}</Text>
      </View>
      <View style={styles.mid}>
        <Text style={[styles.title, { color: c.text }]}>{transliteration}</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]} numberOfLines={1}>
          {translation} · {revelationLabel(type)} · {totalVerses} ayahs
        </Text>
      </View>
      <Text style={[styles.arabic, { color: c.arabic }]}>{name}</Text>
      <Ionicons name="chevron-forward" size={18} color={c.textSecondary} style={{ marginLeft: 4 }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { fontWeight: '700', fontSize: 14 },
  mid: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  sub: { fontSize: 12 },
  arabic: { fontSize: 20, fontWeight: '600', writingDirection: 'rtl' },
});
