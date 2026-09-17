import wbwSubset from '@/assets/data/study/wbw-subset.json';
import tafsirSubset from '@/assets/data/study/tafsir-ibn-kathir-subset.json';
import {
  loadStudyCache,
  saveStudyCache,
  type StudyCacheEntry,
} from './storage';
import type { WordGloss } from './types';

/**
 * Study data strategy:
 * - Offline subset: Al-Fatiha + Al-Ikhlas + Al-Falaq + An-Nas (wbw + Ibn Kathir abridged)
 *   bundled under assets/data/study/
 * - Other ayahs: fetch from Quran.com API v4 and cache in AsyncStorage
 * - Word-by-word glosses from Quran.com English word translations
 * - Tafsir: Ibn Kathir (Abridged) via Quran.com (en-tafisr-ibn-kathir)
 */

const wbwOffline = wbwSubset as Record<string, WordGloss[]>;
const tafsirOffline = tafsirSubset as Record<string, string>;

const WBW_URL = (key: string) =>
  `https://api.quran.com/api/v4/verses/by_key/${key}?language=en&words=true&word_fields=text_uthmani`;
const TAFSIR_URL = (key: string) =>
  `https://api.quran.com/api/v4/tafsirs/en-tafisr-ibn-kathir/by_ayah/${key}`;

function ayahKey(surahId: number, ayahId: number) {
  return `${surahId}:${ayahId}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|div)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function getCache(): Promise<Record<string, StudyCacheEntry>> {
  return loadStudyCache();
}

async function putCache(key: string, patch: Partial<StudyCacheEntry>) {
  const cache = await getCache();
  const prev = cache[key] ?? { fetchedAt: Date.now() };
  cache[key] = { ...prev, ...patch, fetchedAt: Date.now() };
  // Bound cache size (~200 ayahs)
  const keys = Object.keys(cache);
  if (keys.length > 220) {
    keys
      .sort((a, b) => (cache[a].fetchedAt ?? 0) - (cache[b].fetchedAt ?? 0))
      .slice(0, keys.length - 200)
      .forEach((k) => delete cache[k]);
  }
  await saveStudyCache(cache);
}

export async function getWordByWord(
  surahId: number,
  ayahId: number,
): Promise<WordGloss[] | null> {
  const key = ayahKey(surahId, ayahId);
  if (wbwOffline[key]) return wbwOffline[key];

  const cache = await getCache();
  if (cache[key]?.wbw?.length) return cache[key].wbw as WordGloss[];

  try {
    const res = await fetch(WBW_URL(key));
    if (!res.ok) return null;
    const data = (await res.json()) as {
      verse?: {
        words?: {
          char_type_name?: string;
          text_uthmani?: string;
          text?: string;
          translation?: { text?: string };
          transliteration?: { text?: string };
        }[];
      };
    };
    const words: WordGloss[] = [];
    for (const w of data.verse?.words ?? []) {
      if (w.char_type_name && w.char_type_name !== 'word') continue;
      words.push({
        ar: w.text_uthmani || w.text || '',
        en: w.translation?.text || '',
        tr: w.transliteration?.text || '',
      });
    }
    if (words.length) await putCache(key, { wbw: words });
    return words.length ? words : null;
  } catch {
    return null;
  }
}

export async function getTafsir(
  surahId: number,
  ayahId: number,
): Promise<string | null> {
  const key = ayahKey(surahId, ayahId);
  if (tafsirOffline[key]) return tafsirOffline[key];

  const cache = await getCache();
  if (cache[key]?.tafsir) return cache[key].tafsir ?? null;

  try {
    const res = await fetch(TAFSIR_URL(key));
    if (!res.ok) return null;
    const data = (await res.json()) as { tafsir?: { text?: string } };
    const text = stripHtml(data.tafsir?.text || '');
    if (text) await putCache(key, { tafsir: text });
    return text || null;
  } catch {
    return null;
  }
}

export function hasOfflineStudy(surahId: number, ayahId: number): boolean {
  const key = ayahKey(surahId, ayahId);
  return Boolean(wbwOffline[key] || tafsirOffline[key]);
}

export const STUDY_NOTES = {
  wbwSource: 'Quran.com API v4 word-by-word English glosses',
  tafsirSource: 'Ibn Kathir (Abridged) via Quran.com (en-tafisr-ibn-kathir)',
  offlineSubset: 'Bundled for surahs 1, 112, 113, 114; other ayahs fetch + cache',
};
