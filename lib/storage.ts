import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Bookmark, DownloadedSurahMeta, LastRead, ReadingViewMode } from './types';

const KEYS = {
  bookmarks: '@iqra/bookmarks',
  lastRead: '@iqra/lastRead',
  settings: '@iqra/settings',
  downloads: '@iqra/downloadedSurahs',
  studyCache: '@iqra/studyCache',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  showTranslation: true,
  arabicFontSize: 28,
  theme: 'system',
  translationId: 'sahih',
  arabicFontFamily: 'system',
  continuousPlayback: true,
  showWordByWord: false,
  showTafsir: false,
  readingViewMode: 'translation',
};

export async function loadBookmarks(): Promise<Bookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.bookmarks);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}

export async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
}

export async function loadLastRead(): Promise<LastRead | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.lastRead);
    return raw ? (JSON.parse(raw) as LastRead) : null;
  } catch {
    return null;
  }
}

export async function saveLastRead(last: LastRead): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastRead, JSON.stringify(last));
}

function inferReadingViewMode(partial: Partial<AppSettings>): ReadingViewMode {
  if (partial.readingViewMode) return partial.readingViewMode;
  if (partial.showWordByWord) return 'wordByWord';
  if (partial.showTranslation === false) return 'arabic';
  return 'translation';
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    const partial = JSON.parse(raw) as Partial<AppSettings>;
    const merged: AppSettings = { ...DEFAULT_SETTINGS, ...partial };
    merged.readingViewMode = inferReadingViewMode(partial);
    // Keep boolean flags aligned with the mode used by the reader.
    if (partial.readingViewMode) {
      merged.showTranslation = merged.readingViewMode === 'translation';
      merged.showWordByWord = merged.readingViewMode === 'wordByWord';
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function loadDownloadedSurahs(): Promise<DownloadedSurahMeta[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.downloads);
    return raw ? (JSON.parse(raw) as DownloadedSurahMeta[]) : [];
  } catch {
    return [];
  }
}

export async function saveDownloadedSurahs(list: DownloadedSurahMeta[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.downloads, JSON.stringify(list));
}

export type StudyCacheEntry = {
  wbw?: { ar: string; en: string; tr: string }[];
  tafsir?: string;
  fetchedAt: number;
};

export async function loadStudyCache(): Promise<Record<string, StudyCacheEntry>> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.studyCache);
    return raw ? (JSON.parse(raw) as Record<string, StudyCacheEntry>) : {};
  } catch {
    return {};
  }
}

export async function saveStudyCache(cache: Record<string, StudyCacheEntry>): Promise<void> {
  await AsyncStorage.setItem(KEYS.studyCache, JSON.stringify(cache));
}

export function bookmarkKey(surahId: number, ayahId: number): string {
  return `${surahId}:${ayahId}`;
}
