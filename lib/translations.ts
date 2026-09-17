import pickthallData from '@/assets/data/translations/pickthall.json';
import yusufaliData from '@/assets/data/translations/yusufali.json';
import { getSurah } from './quran';
import type { TranslationId } from './types';

/** Compact grid: translations[surahIndex][ayahIndex] */
type TranslationGrid = string[][];

const pickthall = pickthallData as TranslationGrid;
const yusufali = yusufaliData as TranslationGrid;

export type TranslationMeta = {
  id: TranslationId;
  label: string;
  shortLabel: string;
  author: string;
  license: string;
  source: string;
};

export const TRANSLATIONS: TranslationMeta[] = [
  {
    id: 'sahih',
    label: 'Saheeh International',
    shortLabel: 'Saheeh',
    author: 'Umm Muhammad',
    license: 'Via Tanzil / quran-json (CC BY-SA 4.0 package)',
    source: 'tanzil.net/trans/en.sahih',
  },
  {
    id: 'pickthall',
    label: 'Pickthall',
    shortLabel: 'Pickthall',
    author: 'Mohammed Marmaduke William Pickthall',
    license: 'Public domain (via alquran.cloud / Tanzil en.pickthall)',
    source: 'api.alquran.cloud/v1/quran/en.pickthall',
  },
  {
    id: 'yusufali',
    label: 'Yusuf Ali',
    shortLabel: 'Yusuf Ali',
    author: 'Abdullah Yusuf Ali',
    license: 'Widely redistributed with attribution (Tanzil en.yusufali)',
    source: 'api.alquran.cloud/v1/quran/en.yusufali',
  },
];

export function getTranslationMeta(id: TranslationId): TranslationMeta {
  return TRANSLATIONS.find((t) => t.id === id) ?? TRANSLATIONS[0];
}

export function getVerseTranslation(
  surahId: number,
  ayahId: number,
  translationId: TranslationId,
): string {
  if (translationId === 'sahih') {
    return getSurah(surahId)?.verses.find((v) => v.id === ayahId)?.en ?? '';
  }
  const grid = translationId === 'pickthall' ? pickthall : yusufali;
  return grid[surahId - 1]?.[ayahId - 1] ?? '';
}
