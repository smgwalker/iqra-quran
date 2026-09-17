import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { getAyahAudioUrl, getSurah, pad3 } from './quran';
import {
  loadDownloadedSurahs,
  saveDownloadedSurahs,
} from './storage';
import type { DownloadedSurahMeta } from './types';

const ROOT = 'alafasy';

function audioRoot(): string | null {
  if (Platform.OS === 'web') return null;
  const base = FileSystem.documentDirectory;
  if (!base) return null;
  return `${base}${ROOT}/`;
}

export function getLocalAyahUri(surahId: number, ayahId: number): string | null {
  const root = audioRoot();
  if (!root) return null;
  return `${root}${pad3(surahId)}/${pad3(surahId)}${pad3(ayahId)}.mp3`;
}

export async function ayahIsDownloaded(surahId: number, ayahId: number): Promise<boolean> {
  const uri = getLocalAyahUri(surahId, ayahId);
  if (!uri) return false;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists === true && !info.isDirectory && (info.size ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Prefer local file when present; otherwise stream CDN URL. */
export async function resolveAyahAudioUri(surahId: number, ayahId: number): Promise<string> {
  const local = getLocalAyahUri(surahId, ayahId);
  if (local) {
    try {
      const info = await FileSystem.getInfoAsync(local);
      if (info.exists && !info.isDirectory && (info.size ?? 0) > 0) return local;
    } catch {
      /* fall through */
    }
  }
  return getAyahAudioUrl(surahId, ayahId);
}

async function ensureSurahDir(surahId: number): Promise<string | null> {
  const root = audioRoot();
  if (!root) return null;
  const dir = `${root}${pad3(surahId)}/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export type DownloadProgressCb = (progress: {
  surahId: number;
  completedAyahs: number;
  totalAyahs: number;
  progress: number;
}) => void;

const cancelFlags = new Set<number>();

export function cancelSurahDownload(surahId: number) {
  cancelFlags.add(surahId);
}

export async function downloadSurahAudio(
  surahId: number,
  onProgress?: DownloadProgressCb,
): Promise<DownloadedSurahMeta> {
  if (Platform.OS === 'web') {
    throw new Error('Offline audio downloads are not available on web.');
  }
  const surah = getSurah(surahId);
  if (!surah) throw new Error(`Unknown surah ${surahId}`);

  cancelFlags.delete(surahId);
  const dir = await ensureSurahDir(surahId);
  if (!dir) throw new Error('No document directory available');

  const totalAyahs = surah.total_verses;
  let completed = 0;
  let bytes = 0;

  for (let ayahId = 1; ayahId <= totalAyahs; ayahId++) {
    if (cancelFlags.has(surahId)) {
      cancelFlags.delete(surahId);
      throw new Error('cancelled');
    }

    const dest = `${dir}${pad3(surahId)}${pad3(ayahId)}.mp3`;
    const existing = await FileSystem.getInfoAsync(dest);
    if (existing.exists && !existing.isDirectory && (existing.size ?? 0) > 0) {
      bytes += existing.size ?? 0;
      completed += 1;
      onProgress?.({
        surahId,
        completedAyahs: completed,
        totalAyahs,
        progress: completed / totalAyahs,
      });
      continue;
    }

    const url = getAyahAudioUrl(surahId, ayahId);
    const result = await FileSystem.downloadAsync(url, dest);
    if (result.status && result.status >= 400) {
      throw new Error(`Download failed for ${surahId}:${ayahId} (HTTP ${result.status})`);
    }
    const info = await FileSystem.getInfoAsync(dest);
    bytes += info.exists && !info.isDirectory ? (info.size ?? 0) : 0;
    completed += 1;
    onProgress?.({
      surahId,
      completedAyahs: completed,
      totalAyahs,
      progress: completed / totalAyahs,
    });
  }

  const meta: DownloadedSurahMeta = {
    surahId,
    ayahCount: totalAyahs,
    downloadedAt: Date.now(),
    bytes,
  };

  const list = await loadDownloadedSurahs();
  const next = [...list.filter((s) => s.surahId !== surahId), meta].sort(
    (a, b) => a.surahId - b.surahId,
  );
  await saveDownloadedSurahs(next);
  return meta;
}

export async function deleteSurahAudio(surahId: number): Promise<void> {
  const root = audioRoot();
  if (root) {
    const dir = `${root}${pad3(surahId)}`;
    try {
      const info = await FileSystem.getInfoAsync(dir);
      if (info.exists) {
        await FileSystem.deleteAsync(dir, { idempotent: true });
      }
    } catch {
      /* ignore */
    }
  }
  const list = await loadDownloadedSurahs();
  await saveDownloadedSurahs(list.filter((s) => s.surahId !== surahId));
}

export async function refreshDownloadedSurahs(): Promise<DownloadedSurahMeta[]> {
  return loadDownloadedSurahs();
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function downloadsSupported(): boolean {
  return Platform.OS !== 'web' && !!FileSystem.documentDirectory;
}
