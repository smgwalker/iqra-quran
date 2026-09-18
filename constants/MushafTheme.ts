/** Traditional cream / forest-green / gold mushaf palette for the surah reader. */
export const Mushaf = {
  forest: '#1B5E3B',
  forestDeep: '#154A2F',
  cream: '#F7F0E1',
  creamAlt: '#EFE4CF',
  creamSoft: '#FBF6EC',
  paper: '#F9F3E6',
  gold: '#C9A227',
  goldBright: '#D4AF37',
  goldDark: '#8B6914',
  goldBorder: '#B8860B',
  sealFill: '#F5E6B8',
  sealRing: '#C9A227',
  hairline: '#C4A882',
  arabic: '#1A1A1A',
  translation: '#2A2A2A',
  bannerCream: '#F3EBD8',
  bannerPattern: 'rgba(201, 162, 39, 0.12)',
  white: '#FFFFFF',
  chevron: '#C9A227',
  legendBg: '#FFFaf3',
  /** Tajweed legend colors (match reference labels) */
  tajweed: {
    qalqala: '#2E7D32', // green
    iqlab: '#1565C0', // blue
    idgham: '#7B1FA2', // purple
    ikhfa: '#C62828', // red
    ghunna: '#EF6C00', // orange
  },
} as const;

export type TajweedRule = keyof typeof Mushaf.tajweed;

export const TAJWEED_LEGEND: { rule: TajweedRule; label: string }[] = [
  { rule: 'qalqala', label: 'Qalqala' },
  { rule: 'iqlab', label: "Iqlab" },
  { rule: 'idgham', label: 'Idgham' },
  { rule: 'ikhfa', label: "Ikhfa'a" },
  { rule: 'ghunna', label: 'Ghunna' },
];
