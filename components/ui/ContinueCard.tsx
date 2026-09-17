import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';

type Props = {
  surahName: string;
  arabicName: string;
  ayahId: number;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
};

export function ContinueCard({ surahName, arabicName, ayahId, colorScheme, onPress }: Props) {
  const c = Colors[colorScheme];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.tint, opacity: pressed ? 0.9 : 1 },
      ]}>
      <View style={styles.left}>
        <Text style={styles.label}>Continue reading</Text>
        <Text style={styles.title}>
          {surahName} · Ayah {ayahId}
        </Text>
        <Text style={styles.arabic}>{arabicName}</Text>
      </View>
      <Ionicons name="book" size={32} color="rgba(255,255,255,0.9)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  left: { flex: 1, paddingRight: 12 },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  arabic: { color: 'rgba(255,255,255,0.95)', fontSize: 20, marginTop: 4, textAlign: 'left' },
});
