import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Mushaf } from '@/constants/MushafTheme';
import { TRANSLATIONS } from '@/lib/translations';
import type { TranslationId } from '@/lib/types';

type Props = {
  translationId: TranslationId;
  onSelectTranslation: (id: TranslationId) => void;
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePlay: () => void;
};

export function ReaderTopBar({
  translationId,
  onSelectTranslation,
  isPlaying,
  isLoading,
  onTogglePlay,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const meta = TRANSLATIONS.find((t) => t.id === translationId) ?? TRANSLATIONS[0];

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6, backgroundColor: Mushaf.forest }]}>
      <View style={styles.row}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <Pressable onPress={() => setPickerOpen(true)} style={styles.dropdown} hitSlop={8}>
          <Text style={styles.dropdownText} numberOfLines={1}>
            {meta.shortLabel}
          </Text>
          <Ionicons name="caret-down" size={12} color="#fff" />
        </Pressable>

        <View style={styles.spacer} />

        <View style={styles.reciter}>
          <Text style={styles.reciterText}>Mishary</Text>
          <Ionicons name="caret-down" size={12} color="#fff" />
        </View>

        <Pressable onPress={onTogglePlay} hitSlop={10} style={styles.playBtn}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name={isPlaying ? 'volume-high' : 'volume-medium'} size={22} color="#fff" />
          )}
        </Pressable>
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Translation</Text>
            {TRANSLATIONS.map((t) => {
              const active = t.id === translationId;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    onSelectTranslation(t.id);
                    setPickerOpen(false);
                  }}
                  style={[styles.option, active && styles.optionActive]}>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{t.label}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color={Mushaf.forest} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 2,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 140,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  spacer: { flex: 1 },
  reciter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reciterText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  playBtn: {
    padding: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    backgroundColor: Mushaf.creamSoft,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Mushaf.gold,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Mushaf.forest,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionActive: {
    backgroundColor: 'rgba(27, 94, 59, 0.08)',
  },
  optionText: {
    fontSize: 15,
    color: Mushaf.arabic,
  },
  optionTextActive: {
    fontWeight: '700',
    color: Mushaf.forest,
  },
});
