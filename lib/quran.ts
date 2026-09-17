import quranData from '@/assets/data/quran.json';
import juzData from '@/assets/data/juz.json';
import type { JuzInfo, Surah, Verse } from './types';

export const surahs = quranData as Surah[];
export const juzList = juzData as JuzInfo[];

const surahById = new Map(surahs.map((s) => [s.id, s]));

export function getSurah(id: number): Surah | undefined {
  return surahById.get(id);
}

export function getVerse(surahId: number, ayahId: number): Verse | undefined {
  return getSurah(surahId)?.verses.find((v) => v.id === ayahId);
}

export function getSurahMeta() {
  return surahs.map(({ id, name, transliteration, translation, type, total_verses }) => ({
    id,
    name,
    transliteration,
    translation,
    type,
    total_verses,
  }));
}

/** Absolute ayah number 1–6236 for CDN audio patterns that need it */
export function getAbsoluteAyahNumber(surahId: number, ayahId: number): number {
  let n = 0;
  for (const s of surahs) {
    if (s.id === surahId) {
      return n + ayahId;
    }
    n += s.total_verses;
  }
  return 0;
}

export function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

/** everyayah.com Alafasy 128kbps */
export function getAyahAudioUrl(surahId: number, ayahId: number): string {
  return `https://everyayah.com/data/Alafasy_128kbps/${pad3(surahId)}${pad3(ayahId)}.mp3`;
}

export type SearchHit = {
  surahId: number;
  ayahId: number;
  surahName: string;
  arabic: string;
  english: string;
};

export function searchQuran(query: string, limit = 80): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const hits: SearchHit[] = [];
  for (const s of surahs) {
    for (const v of s.verses) {
      if (v.en.toLowerCase().includes(q) || v.ar.includes(query.trim())) {
        hits.push({
          surahId: s.id,
          ayahId: v.id,
          surahName: s.transliteration,
          arabic: v.ar,
          english: v.en,
        });
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}

export function getJuzAyahs(juzId: number): { surahId: number; ayahId: number }[] {
  const juz = juzList.find((j) => j.id === juzId);
  if (!juz) return [];

  const result: { surahId: number; ayahId: number }[] = [];
  for (let sid = juz.start.surah; sid <= juz.end.surah; sid++) {
    const surah = getSurah(sid);
    if (!surah) continue;
    const startA = sid === juz.start.surah ? juz.start.ayah : 1;
    const endA = sid === juz.end.surah ? juz.end.ayah : surah.total_verses;
    for (let a = startA; a <= endA; a++) {
      result.push({ surahId: sid, ayahId: a });
    }
  }
  return result;
}

export function revelationLabel(type: string): string {
  return type === 'meccan' ? 'Meccan' : type === 'medinan' ? 'Medinan' : type;
}
