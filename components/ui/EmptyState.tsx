import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  colorScheme: 'light' | 'dark';
};

export function EmptyState({ icon, title, subtitle, colorScheme }: Props) {
  const c = Colors[colorScheme];
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={c.textSecondary} />
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: c.textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
