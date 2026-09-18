import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';

export type FeatureItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

type Props = {
  items: FeatureItem[];
  colorScheme: 'light' | 'dark';
};

export function FeatureGrid({ items, colorScheme }: Props) {
  const c = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable key={item.key} onPress={item.onPress} style={styles.cell}>
            <View style={[styles.circle, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={[styles.label, { color: c.text }]} numberOfLines={2}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: { fontSize: 11, fontWeight: '500', textAlign: 'center', lineHeight: 14 },
});
