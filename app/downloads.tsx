import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useDownloads } from '@/contexts/DownloadContext';
import { useSettings } from '@/contexts/SettingsContext';
import { formatBytes } from '@/lib/downloads';
import { getSurahMeta } from '@/lib/quran';

export default function DownloadsScreen() {
  const { colorScheme } = useSettings();
  const c = Colors[colorScheme];
  const { supported, downloaded, queue, enqueue, cancel, remove, isDownloaded, getJob } =
    useDownloads();
  const [query, setQuery] = useState('');

  const surahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = getSurahMeta();
    if (!q) return all;
    return all.filter(
      (s) =>
        s.transliteration.toLowerCase().includes(q) ||
        s.translation.toLowerCase().includes(q) ||
        String(s.id) === q ||
        s.name.includes(query.trim()),
    );
  }, [query]);

  const downloadedSet = useMemo(
    () => new Set(downloaded.map((d) => d.surahId)),
    [downloaded],
  );

  if (!supported) {
    return (
      <View style={[styles.centered, { backgroundColor: c.background }]}>
        <Ionicons name="cloud-offline-outline" size={40} color={c.textSecondary} />
        <Text style={[styles.msg, { color: c.text }]}>Downloads unavailable on web</Text>
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          Use the iOS or Android app to save Alafasy audio offline.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.banner, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.bannerTitle, { color: c.text }]}>Offline Alafasy audio</Text>
        <Text style={[styles.bannerBody, { color: c.textSecondary }]}>
          Download a surah to play without streaming. Playback prefers local files when present.
        </Text>
        {queue.length > 0 ? (
          <Text style={[styles.queueHint, { color: c.tint }]}>
            Queue: {queue.map((j) => j.surahId).join(', ')}
          </Text>
        ) : null}
        {downloaded.length > 0 ? (
          <Text style={[styles.queueHint, { color: c.textSecondary }]}>
            {downloaded.length} surah
            {downloaded.length === 1 ? '' : 's'} saved ·{' '}
            {formatBytes(downloaded.reduce((n, d) => n + d.bytes, 0))}
          </Text>
        ) : null}
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search surahs to download…"
        placeholderTextColor={c.textSecondary}
        style={[
          styles.search,
          { backgroundColor: c.card, borderColor: c.border, color: c.text },
        ]}
      />

      <FlatList
        data={surahs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const job = getJob(item.id);
          const done = downloadedSet.has(item.id) || job?.status === 'done';
          const downloading = job?.status === 'downloading' || job?.status === 'queued';
          const meta = downloaded.find((d) => d.surahId === item.id);

          return (
            <View style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.rowMain}>
                <Text style={[styles.id, { color: c.tint }]}>{item.id}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: c.text }]}>{item.transliteration}</Text>
                  <Text style={[styles.sub, { color: c.textSecondary }]}>
                    {item.total_verses} ayahs
                    {meta ? ` · ${formatBytes(meta.bytes)}` : ''}
                    {job?.status === 'downloading'
                      ? ` · ${Math.round((job.progress || 0) * 100)}% (${job.completedAyahs}/${job.totalAyahs})`
                      : ''}
                    {job?.status === 'error' ? ` · ${job.error}` : ''}
                  </Text>
                  {downloading ? (
                    <View style={[styles.barBg, { backgroundColor: c.border }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: c.tint,
                            width: `${Math.max(4, Math.round((job?.progress || 0) * 100))}%`,
                          },
                        ]}
                      />
                    </View>
                  ) : null}
                </View>
              </View>

              {done ? (
                <Pressable onPress={() => void remove(item.id)} hitSlop={8} style={styles.action}>
                  <Ionicons name="trash-outline" size={22} color={c.danger} />
                </Pressable>
              ) : downloading ? (
                <Pressable onPress={() => cancel(item.id)} hitSlop={8} style={styles.action}>
                  {job?.status === 'queued' ? (
                    <Ionicons name="close-circle-outline" size={24} color={c.textSecondary} />
                  ) : (
                    <ActivityIndicator color={c.tint} />
                  )}
                </Pressable>
              ) : (
                <Pressable onPress={() => enqueue(item.id)} hitSlop={8} style={styles.action}>
                  <Ionicons name="download-outline" size={24} color={c.tint} />
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  msg: { fontSize: 17, fontWeight: '700', marginTop: 12 },
  hint: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  banner: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 12,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700' },
  bannerBody: { fontSize: 13, marginTop: 6, lineHeight: 19 },
  queueHint: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  search: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  id: { width: 28, fontWeight: '700', fontSize: 14 },
  name: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 2 },
  barBg: { height: 4, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  action: { padding: 6 },
});
