export type Verse = {
  id: number;
  ar: string;
  en: string;
};

export type Surah = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: 'meccan' | 'medinan' | string;
  total_verses: number;
  verses: Verse[];
};

export type JuzInfo = {
  id: number;
  start: { surah: number; ayah: number };
  end: { surah: number; ayah: number };
  startName: string;
  ayahCount: number;
};

export type Bookmark = {
  surahId: number;
  ayahId: number;
  createdAt: number;
};

export type LastRead = {
  surahId: number;
  ayahId: number;
  updatedAt: number;
};

export type ThemePreference = 'system' | 'light' | 'dark';

export type AppSettings = {
  showTranslation: boolean;
  arabicFontSize: number;
  theme: ThemePreference;
};
