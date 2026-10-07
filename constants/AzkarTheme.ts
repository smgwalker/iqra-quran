import { Mushaf } from '@/constants/MushafTheme';

/** Dua card palette: mushaf cream/gold/green in light mode, deep green in dark mode. */
export const AzkarTheme = {
  light: {
    cardBg: Mushaf.creamSoft,
    cardBorder: '#E3D3AE',
    headerBg: Mushaf.bannerCream,
    arabic: Mushaf.arabic,
    title: Mushaf.forest,
    text: Mushaf.translation,
    muted: '#6B5E45',
    gold: Mushaf.goldDark,
    goldSoft: Mushaf.sealFill,
    green: Mushaf.forest,
    greenSoft: '#E3EFE6',
    divider: 'rgba(184, 134, 11, 0.25)',
  },
  dark: {
    cardBg: '#0F1F17',
    cardBorder: '#2E4A38',
    headerBg: '#132A1E',
    arabic: '#FBF6EC',
    title: '#D4AF37',
    text: '#E4DCCB',
    muted: '#A8A08C',
    gold: '#D4AF37',
    goldSoft: '#3A3016',
    green: '#4CAF7A',
    greenSoft: '#173B27',
    divider: 'rgba(212, 175, 55, 0.25)',
  },
} as const;

export type AzkarPalette = (typeof AzkarTheme)['light'] | (typeof AzkarTheme)['dark'];
