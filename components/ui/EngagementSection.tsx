import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/Colors';
import { WEEKLY_GOAL_MINUTES, formatMinutes } from '@/lib/engagement';

type Props = {
  weeklyMinutes: number;
  lifetimeMinutes: number;
  bookmarksCount: number;
  downloadsCount: number;
  colorScheme: 'light' | 'dark';
};

export function EngagementSection({
  weeklyMinutes,
  lifetimeMinutes,
  bookmarksCount,
  downloadsCount,
  colorScheme,
}: Props) {
  const c = Colors[colorScheme];
  const progress = Math.min(1, weeklyMinutes / WEEKLY_GOAL_MINUTES);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: c.text }]}>Quran Engagement</Text>
        <View style={[styles.line, { backgroundColor: c.border }]} />
      </View>
      <View style={styles.row}>
        <View style={[styles.col, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.colTitle, { color: c.textSecondary }]}>Yours this week</Text>
          <View style={styles.ringWrap}>
            <LinearGradient
              colors={['#F58529', '#DD2A7B', '#0095F6', '#22C55E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ringOuter}>
              <View style={[styles.ringInner, { backgroundColor: c.card }]}>
                <Text style={[styles.mins, { color: c.text }]}>{weeklyMinutes}</Text>
                <Text style={[styles.minsLabel, { color: c.textSecondary }]}>minutes</Text>
              </View>
            </LinearGradient>
            {progress < 1 ? (
              <View
                pointerEvents="none"
                style={[styles.progressHint, { borderColor: c.border, opacity: 0.35 }]}
              />
            ) : null}
          </View>
          <Text style={[styles.lifetime, { color: c.textSecondary }]}>
            Lifetime: {formatMinutes(lifetimeMinutes)}
          </Text>
        </View>

        <View style={[styles.col, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.colTitle, { color: c.textSecondary }]}>Your library</Text>
          <View style={styles.libBlock}>
            <Ionicons name="cloud-offline-outline" size={36} color={c.tint} />
            <Text style={[styles.libStat, { color: c.text }]}>
              {downloadsCount} offline surah{downloadsCount === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={[styles.libDivider, { backgroundColor: c.border }]} />
          <View style={styles.libBlock}>
            <Ionicons name="bookmark" size={28} color={c.accent} />
            <Text style={[styles.libStat, { color: c.text }]}>
              {bookmarksCount} bookmark{bookmarksCount === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  header: { fontSize: 14, fontWeight: '700' },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', gap: 12 },
  col: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    alignItems: 'center',
    minHeight: 180,
  },
  colTitle: { fontSize: 12, fontWeight: '600', marginBottom: 12, alignSelf: 'flex-start' },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  ringOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  ringInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mins: { fontSize: 22, fontWeight: '800' },
  minsLabel: { fontSize: 11, marginTop: 2 },
  progressHint: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  lifetime: { fontSize: 11, marginTop: 12, textAlign: 'center' },
  libBlock: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  libStat: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  libDivider: { width: '80%', height: StyleSheet.hairlineWidth, marginVertical: 4 },
});
