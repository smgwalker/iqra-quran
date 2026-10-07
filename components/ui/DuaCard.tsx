import { useEffect, useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { AzkarTheme } from '@/constants/AzkarTheme';
import { formatDuaForSharing, type Dua } from '@/lib/azkar';
import { successHaptic, tapHaptic } from '@/lib/haptics';

type Props = {
  dua: Dua;
  index: number;
  colorScheme: 'light' | 'dark';
  arabicFontFamily?: string;
  arabicFontSize: number;
  showTransliteration: boolean;
  favorite: boolean;
  onToggleFavorite: () => void;
  count: number;
  onCountChange: (value: number) => void;
  /** Small label above the title, e.g. the category on the favorites screen */
  eyebrow?: string;
};

export function DuaCard({
  dua,
  index,
  colorScheme,
  arabicFontFamily,
  arabicFontSize,
  showTransliteration,
  favorite,
  onToggleFavorite,
  count,
  onCountChange,
  eyebrow,
}: Props) {
  const t = AzkarTheme[colorScheme];
  const target = Math.max(1, dua.count);
  const done = count >= target;
  const [copied, setCopied] = useState(false);
  const [showVirtue, setShowVirtue] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const increment = () => {
    if (done) {
      tapHaptic();
      return;
    }
    const next = count + 1;
    onCountChange(next);
    if (next >= target) successHaptic();
    else tapHaptic();
  };

  const copy = async () => {
    await Clipboard.setStringAsync(formatDuaForSharing(dua));
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  const share = () => {
    Share.share({ message: formatDuaForSharing(dua) }).catch(() => {});
  };

  // Keep Arabic comfortable on small cards even if the reader font size is large.
  const fontSize = Math.min(Math.max(arabicFontSize - 4, 20), 34);
  const progress = Math.min(count / target, 1);

  return (
    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.divider }]}>
        <View style={[styles.seal, { backgroundColor: t.goldSoft, borderColor: t.gold }]}>
          <Text style={[styles.sealText, { color: t.gold }]}>{index + 1}</Text>
        </View>
        <View style={styles.headerText}>
          {eyebrow ? (
            <Text style={[styles.eyebrow, { color: t.muted }]} numberOfLines={1}>
              {eyebrow}
            </Text>
          ) : null}
          <Text style={[styles.title, { color: t.title }]} numberOfLines={2}>
            {dua.title ?? (target > 1 ? `Recite ${target}×` : 'Recite once')}
          </Text>
        </View>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Save to favorites'}>
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={22}
            color={favorite ? '#ED4956' : t.gold}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text
          style={[
            styles.arabic,
            {
              color: t.arabic,
              fontFamily: arabicFontFamily,
              fontSize,
              lineHeight: Math.round(fontSize * 1.9),
            },
          ]}>
          {dua.arabic}
        </Text>

        {showTransliteration && dua.transliteration ? (
          <Text style={[styles.translit, { color: t.green }]}>{dua.transliteration}</Text>
        ) : null}

        <Text style={[styles.translation, { color: t.text }]}>{dua.translation}</Text>

        {dua.virtue ? (
          <Pressable onPress={() => setShowVirtue((v) => !v)} style={styles.virtueToggle}>
            <Ionicons name={showVirtue ? 'chevron-down' : 'chevron-forward'} size={14} color={t.gold} />
            <Text style={[styles.virtueLabel, { color: t.gold }]}>Virtue & notes</Text>
          </Pressable>
        ) : null}
        {showVirtue && dua.virtue ? (
          <Text style={[styles.virtue, { color: t.muted }]}>{dua.virtue}</Text>
        ) : null}

        {dua.reference ? (
          <View style={[styles.refRow, { borderTopColor: t.divider }]}>
            <Ionicons name="library-outline" size={14} color={t.gold} style={styles.refIcon} />
            <Text style={[styles.reference, { color: t.muted }]}>{dua.reference}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, { borderTopColor: t.divider }]}>
        <Pressable
          onPress={increment}
          onLongPress={() => onCountChange(0)}
          style={({ pressed }) => [
            styles.counter,
            {
              backgroundColor: done ? t.green : t.greenSoft,
              borderColor: t.green,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Count ${count} of ${target}. Tap to count, long press to reset.`}>
          <View
            style={[
              styles.counterFill,
              { width: `${progress * 100}%`, backgroundColor: done ? 'transparent' : t.divider },
            ]}
          />
          <Ionicons
            name={done ? 'checkmark-circle' : 'finger-print'}
            size={18}
            color={done ? '#fff' : t.green}
          />
          <Text style={[styles.counterText, { color: done ? '#fff' : t.green }]}>
            {count} / {target}
          </Text>
        </Pressable>

        <View style={styles.actions}>
          {count > 0 ? (
            <Pressable onPress={() => onCountChange(0)} hitSlop={8} style={styles.action} accessibilityLabel="Reset counter">
              <Ionicons name="refresh" size={19} color={t.muted} />
            </Pressable>
          ) : null}
          <Pressable onPress={() => void copy()} hitSlop={8} style={styles.action} accessibilityLabel="Copy dua">
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={19} color={copied ? t.green : t.muted} />
          </Pressable>
          <Pressable onPress={share} hitSlop={8} style={styles.action} accessibilityLabel="Share dua">
            <Ionicons name="share-outline" size={19} color={t.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  seal: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: { fontSize: 12, fontWeight: '800' },
  headerText: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontSize: 14, fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  arabic: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translit: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  translation: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
  },
  virtueToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  virtueLabel: { fontSize: 12, fontWeight: '700' },
  virtue: { marginTop: 6, fontSize: 13, lineHeight: 20 },
  refRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  refIcon: { marginTop: 2, marginRight: 6 },
  reference: { flex: 1, fontSize: 12, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  counterFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  counterText: { fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  action: { padding: 4 },
});
