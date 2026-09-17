import type { ArabicFontId } from './types';

export type ArabicFontMeta = {
  id: ArabicFontId;
  label: string;
  /** expo-font family name, or undefined for system default */
  fontFamily?: string;
  license: string;
};

export const ARABIC_FONTS: ArabicFontMeta[] = [
  {
    id: 'system',
    label: 'System',
    license: 'Device default',
  },
  {
    id: 'amiri',
    label: 'Amiri',
    fontFamily: 'Amiri',
    license: 'SIL Open Font License 1.1',
  },
  {
    id: 'scheherazade',
    label: 'Scheherazade New',
    fontFamily: 'ScheherazadeNew',
    license: 'SIL Open Font License 1.1',
  },
];

export function getArabicFontFamily(id: ArabicFontId): string | undefined {
  return ARABIC_FONTS.find((f) => f.id === id)?.fontFamily;
}
