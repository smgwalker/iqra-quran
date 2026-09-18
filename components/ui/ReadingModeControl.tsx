import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Mushaf } from '@/constants/MushafTheme';
import type { ReadingViewMode } from '@/lib/types';

const MODES: { id: ReadingViewMode; label: string; short: string }[] = [
  { id: 'arabic', label: 'Arabic only', short: 'Arabic' },
  { id: 'translation', label: 'With translation', short: 'Translation' },
  { id: 'wordByWord', label: 'Word by word', short: 'Word-by-word' },
];

type Props = {
  mode: ReadingViewMode;
  onChange: (mode: ReadingViewMode) => void;
};

export function ReadingModeControl({ mode, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.segment}>
        {MODES.map((m) => {
          const active = m.id === mode;
          return (
            <Pressable
              key={m.id}
              onPress={() => onChange(m.id)}
              style={[styles.segBtn, active && styles.segBtnActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={m.label}>
              <Text style={[styles.segText, active && styles.segTextActive]} numberOfLines={1}>
                {m.short}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Mushaf.creamSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Mushaf.hairline,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Mushaf.creamAlt,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: Mushaf.gold,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: {
    backgroundColor: Mushaf.forest,
  },
  segText: {
    fontSize: 12,
    fontWeight: '600',
    color: Mushaf.goldDark,
  },
  segTextActive: {
    color: '#fff',
  },
});
