import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Bookmark, LastRead } from './types';

const KEYS = {
  bookmarks: '@iqra/bookmarks',
  lastRead: '@iqra/lastRead',
  settings: '@iqra/settings',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  showTranslation: true,
  arabicFontSize: 28,
  theme: 'system',
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

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function bookmarkKey(surahId: number, ayahId: number): string {
  return `${surahId}:${ayahId}`;
}
