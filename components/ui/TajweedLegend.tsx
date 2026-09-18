import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mushaf, TAJWEED_LEGEND } from '@/constants/MushafTheme';

export function TajweedLegend() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: Mushaf.legendBg,
          borderTopColor: Mushaf.hairline,
        },
      ]}>
      {TAJWEED_LEGEND.map((item) => (
        <Text key={item.rule} style={[styles.label, { color: Mushaf.tajweed[item.rule] }]}>
          {item.label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
