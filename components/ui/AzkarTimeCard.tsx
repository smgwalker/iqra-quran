import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AzkarTheme } from '@/constants/AzkarTheme';
import { useAzkar } from '@/contexts/AzkarContext';
import { getAzkarCategory, getCategoryDuas, suggestedAzkarCategory } from '@/lib/azkar';

type Props = { colorScheme: 'light' | 'dark' };

/**
 * Home card: Morning azkar before 12:00, Evening azkar from 15:00 (simple local-time cutoff),
 * otherwise a general Dua & Azkar entry.
 */
export function AzkarTimeCard({ colorScheme }: Props) {
  const t = AzkarTheme[colorScheme];
  const { counts } = useAzkar();
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, []),
  );

  const suggestedId = suggestedAzkarCategory(now);
  const cat = suggestedId ? getAzkarCategory(suggestedId) : undefined;
  const duas = cat ? getCategoryDuas(cat.id) : [];
  const done = duas.filter((d) => (counts[d.id] ?? 0) >= Math.max(1, d.count)).length;

  const onPress = () => {
    if (cat) router.push({ pathname: '/azkar/[category]', params: { category: cat.id } });
    else router.push('/azkar');
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: t.cardBg, borderColor: t.cardBorder, opacity: pressed ? 0.9 : 1 },
      ]}>
      <View style={[styles.icon, { backgroundColor: cat?.color ?? t.green }]}>
        <Ionicons name={cat?.icon ?? 'hand-left'} size={22} color="#fff" />
      </View>
      <View style={styles.text}>
        <Text style={[styles.eyebrow, { color: t.muted }]}>
          {cat ? (suggestedId === 'morning' ? 'Good morning' : 'Good evening') : 'Remembrance'}
        </Text>
        <Text style={[styles.title, { color: t.title }]}>{cat ? cat.title : 'Dua & Azkar'}</Text>
        <Text style={[styles.sub, { color: t.muted }]} numberOfLines={1}>
          {cat ? `${done}/${duas.length} completed this session` : 'Daily duas, after-salah dhikr & tasbeeh'}
        </Text>
        {cat && duas.length > 0 ? (
          <View style={[styles.track, { backgroundColor: t.divider }]}>
            <View
              style={[
                styles.fill,
                { width: `${(done / duas.length) * 100}%`, backgroundColor: t.green },
              ]}
            />
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={t.gold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontSize: 17, fontWeight: '800', marginTop: 1 },
  sub: { fontSize: 12, marginTop: 2 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  fill: { height: 4, borderRadius: 2 },
});
