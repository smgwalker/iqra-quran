import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ionicons } from '@expo/vector-icons';

import azkarData from '@/assets/data/azkar.json';

export type Dua = {
  id: string;
  /** Present for entries from the fitrahive dataset */
  title?: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  /** Recommended repetitions (from the dataset; 1 when the source gives none) */
  count: number;
  /** Original count wording from the dataset, e.g. "Three times" / "Read 33x" */
  countLabel?: string;
  reference?: string;
  virtue?: string;
  /** Dataset path the entry was copied from */
  origin: string;
};

export type AzkarCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  duaIds: string[];
};

export type AzkarSource = {
  id: string;
  name: string;
  url: string;
  version?: string;
  commit: string;
  file: string;
  license: string;
  usedFor: string;
};

type AzkarFile = {
  meta: { note: string; sources: AzkarSource[] };
  categories: AzkarCategory[];
  duas: Record<string, Dua>;
};

const data = azkarData as unknown as AzkarFile;

export const AZKAR_CATEGORIES: AzkarCategory[] = data.categories;
export const AZKAR_SOURCES: AzkarSource[] = data.meta.sources;
export const FAVORITES_CATEGORY_ID = 'favorites';

export function getAzkarCategory(id: string): AzkarCategory | undefined {
  return AZKAR_CATEGORIES.find((c) => c.id === id);
}

export function getDua(id: string): Dua | undefined {
  return data.duas[id];
}

export function getCategoryDuas(id: string): Dua[] {
  const cat = getAzkarCategory(id);
  if (!cat) return [];
  return cat.duaIds.map((d) => data.duas[d]).filter((d): d is Dua => Boolean(d));
}

/** First category that contains the dua (for labelling favorites). */
export function getCategoryForDua(duaId: string): AzkarCategory | undefined {
  return AZKAR_CATEGORIES.find((c) => c.duaIds.includes(duaId));
}

export function totalDuaCount(): number {
  return Object.keys(data.duas).length;
}

/**
 * Simple local-time suggestion: morning azkar before 12:00, evening azkar from 15:00
 * (roughly after Asr). Returns null in between.
 */
export function suggestedAzkarCategory(now = new Date()): 'morning' | 'evening' | null {
  const h = now.getHours();
  if (h < 12) return 'morning';
  if (h >= 15) return 'evening';
  return null;
}

export function formatDuaForSharing(dua: Dua): string {
  const parts = [dua.title, dua.arabic, dua.transliteration, dua.translation];
  if (dua.reference) parts.push(`Source: ${dua.reference}`);
  parts.push('— shared from Axs Iqra');
  return parts.filter(Boolean).join('\n\n');
}

// ---------------------------------------------------------------------------
// Persistence

const KEYS = {
  favorites: '@iqra/azkar/favorites',
  prefs: '@iqra/azkar/prefs',
  tasbeeh: '@iqra/tasbeeh',
} as const;

export type AzkarPrefs = {
  showTransliteration: boolean;
};

export const DEFAULT_AZKAR_PREFS: AzkarPrefs = { showTransliteration: true };

export async function loadAzkarFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.favorites);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return list.filter((id) => Boolean(data.duas[id]));
  } catch {
    return [];
  }
}

export async function saveAzkarFavorites(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(ids));
}

export async function loadAzkarPrefs(): Promise<AzkarPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.prefs);
    return raw ? { ...DEFAULT_AZKAR_PREFS, ...(JSON.parse(raw) as Partial<AzkarPrefs>) } : DEFAULT_AZKAR_PREFS;
  } catch {
    return DEFAULT_AZKAR_PREFS;
  }
}

export async function saveAzkarPrefs(prefs: AzkarPrefs): Promise<void> {
  await AsyncStorage.setItem(KEYS.prefs, JSON.stringify(prefs));
}

export type TasbeehState = {
  /** Lifetime number of taps across all presets */
  total: number;
  presetId: string;
  customTarget: number;
  /** Current count within the active round */
  current: number;
};

export const DEFAULT_TASBEEH: TasbeehState = {
  total: 0,
  presetId: 'subhanallah',
  customTarget: 100,
  current: 0,
};

export async function loadTasbeeh(): Promise<TasbeehState> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.tasbeeh);
    return raw ? { ...DEFAULT_TASBEEH, ...(JSON.parse(raw) as Partial<TasbeehState>) } : DEFAULT_TASBEEH;
  } catch {
    return DEFAULT_TASBEEH;
  }
}

export async function saveTasbeeh(state: TasbeehState): Promise<void> {
  await AsyncStorage.setItem(KEYS.tasbeeh, JSON.stringify(state));
}
