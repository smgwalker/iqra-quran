import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/Colors';

type Props = {
  streak: number;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
};

export function JourneyCard({ streak, colorScheme, onPress }: Props) {
  const c = Colors[colorScheme];
  const subtitle = streak > 0 ? `${streak}-day streak · keep going` : 'Start Your Streak';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, marginBottom: 20 }]}>
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#0D1F2D', '#1A2A3A'] : ['#E8F5FE', '#F0F7FF']}
          style={styles.art}>
          <Ionicons
            name="moon"
            size={18}
            color={c.tint}
            style={{ position: 'absolute', top: 10, right: 12 }}
          />
          <Ionicons name="book" size={28} color={c.tint} />
        </LinearGradient>
        <View style={styles.body}>
          <Text style={[styles.title, { color: c.tint }]}>Daily Quran Journey</Text>
          <Text style={[styles.sub, { color: c.text }]}>{subtitle}</Text>
        </View>
        <View style={[styles.chevron, { backgroundColor: c.tint }]}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    minHeight: 88,
  },
  art: {
    width: 72,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, paddingHorizontal: 14, paddingVertical: 14 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, fontWeight: '500' },
  chevron: {
    width: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
