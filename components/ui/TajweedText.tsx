import { StyleSheet, Text, type TextStyle } from 'react-native';

import { Mushaf } from '@/constants/MushafTheme';
import { getTajweedSegments, tajweedColor } from '@/lib/tajweed';

type Props = {
  surahId: number;
  ayahId: number;
  arabic: string;
  fontSize: number;
  fontFamily?: string;
  style?: TextStyle;
};

export function TajweedText({ surahId, ayahId, arabic, fontSize, fontFamily, style }: Props) {
  const segments = getTajweedSegments(surahId, ayahId, arabic);

  return (
    <Text
      style={[
        styles.base,
        {
          color: Mushaf.arabic,
          fontSize,
          lineHeight: fontSize * 1.9,
          fontFamily,
        },
        style,
      ]}>
      {segments.map((seg, idx) => {
        const color = tajweedColor(seg.r);
        return (
          <Text key={idx} style={color ? { color } : undefined}>
            {seg.t}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '500',
  },
});
