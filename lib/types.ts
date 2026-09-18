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

export type TranslationId = 'sahih' | 'pickthall' | 'yusufali';

export type ArabicFontId = 'system' | 'amiri' | 'scheherazade';

/** Surah reader layout: Arabic only, translation under ayah, or word-by-word glosses. */
export type ReadingViewMode = 'arabic' | 'translation' | 'wordByWord';

export type AppSettings = {
  showTranslation: boolean;
  arabicFontSize: number;
  theme: ThemePreference;
  translationId: TranslationId;
  arabicFontFamily: ArabicFontId;
  continuousPlayback: boolean;
  showWordByWord: boolean;
  showTafsir: boolean;
  readingViewMode: ReadingViewMode;
};

export type DownloadedSurahMeta = {
  surahId: number;
  ayahCount: number;
  downloadedAt: number;
  bytes: number;
};

export type DownloadJob = {
  surahId: number;
  status: 'queued' | 'downloading' | 'done' | 'error' | 'cancelled';
  progress: number;
  completedAyahs: number;
  totalAyahs: number;
  error?: string;
};

export type WordGloss = {
  ar: string;
  en: string;
  tr: string;
};
