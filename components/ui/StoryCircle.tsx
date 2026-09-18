import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Colors, { palette } from '@/constants/Colors';

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  innerText?: string;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
  size?: number;
};

export function StoryCircle({
  label,
  icon,
  innerText,
  colorScheme,
  onPress,
  size = 64,
}: Props) {
  const c = Colors[colorScheme];
  const inner = size - 6;

  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <LinearGradient
        colors={[palette.storyPink, palette.storyOrange, palette.storyPurple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
        <View
          style={[
            styles.inner,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: c.card,
            },
          ]}>
          {icon ? (
            <Ionicons name={icon} size={22} color={c.text} />
          ) : (
            <Text style={[styles.innerText, { color: c.text }]}>{innerText}</Text>
          )}
        </View>
      </LinearGradient>
      <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 76 },
  ring: { alignItems: 'center', justifyContent: 'center', padding: 3 },
  inner: { alignItems: 'center', justifyContent: 'center' },
  innerText: { fontSize: 13, fontWeight: '700' },
  label: { marginTop: 6, fontSize: 11, fontWeight: '500', textAlign: 'center' },
});
