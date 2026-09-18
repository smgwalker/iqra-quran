import tajweedSubset from '@/assets/data/tajweed/subset.json';
import { Mushaf, type TajweedRule } from '@/constants/MushafTheme';

export type TajweedSegment = {
  t: string;
  r?: TajweedRule;
};

type TajweedAyah = {
  segments: TajweedSegment[];
  plain: string;
  source?: string;
};

const subset = tajweedSubset as Record<string, TajweedAyah>;

const QALQALA = new Set(['ق', 'ط', 'ب', 'ج', 'د']);
const SUKOON = new Set(['ْ', 'ۡ']);
const SHADDA = 'ّ';
const TANWEEN = new Set(['ً', 'ٌ', 'ٍ']);
const IDGHAM_LETTERS = new Set(['ي', 'ر', 'م', 'ل', 'و', 'ن']);
const THROAT = new Set(['ا', 'ه', 'ع', 'ح', 'غ', 'خ', 'إ', 'أ', 'آ', 'ٱ']);

function isArabicLetter(c: string): boolean {
  return (c >= '\u0621' && c <= '\u064A') || c === 'ٱ';
}

function nextLetterIndex(chars: string[], start: number): number {
  for (let j = start; j < chars.length; j++) {
    const c = chars[j];
    if (isArabicLetter(c)) return j;
    if (SUKOON.has(c) || c === SHADDA || TANWEEN.has(c)) continue;
    if (c >= '\u064B' && c <= '\u065F') continue;
    if (c === 'ٰ' || c === 'ٓ' || c === 'ٔ' || c === 'ٕ' || c === ' ') continue;
  }
  return -1;
}

/** Lightweight heuristic coloring for ayahs without bundled tajweed data. */
export function heuristicTajweed(text: string): TajweedSegment[] {
  const chars = Array.from(text);
  const rules: (TajweedRule | null)[] = Array(chars.length).fill(null);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    // Ghunna: ن/م + shadda
    if ((ch === 'ن' || ch === 'م') && i + 1 < chars.length && chars[i + 1] === SHADDA) {
      rules[i] = 'ghunna';
      rules[i + 1] = 'ghunna';
      continue;
    }

    // Qalqala: قطبجد + sukoon
    if (QALQALA.has(ch) && i + 1 < chars.length && SUKOON.has(chars[i + 1])) {
      rules[i] = 'qalqala';
      continue;
    }

    // Noon saakin
    if (ch === 'ن' && i + 1 < chars.length && SUKOON.has(chars[i + 1]) && !rules[i]) {
      const nj = nextLetterIndex(chars, i + 2);
      if (nj >= 0) {
        const nc = chars[nj];
        let rule: TajweedRule | null = null;
        if (nc === 'ب') rule = 'iqlab';
        else if (IDGHAM_LETTERS.has(nc)) rule = 'idgham';
        else if (!THROAT.has(nc)) rule = 'ikhfa';
        if (rule) {
          rules[i] = rule;
          rules[i + 1] = rule;
        }
      }
    }

    // Tanween
    if (TANWEEN.has(ch) && !rules[i]) {
      const nj = nextLetterIndex(chars, i + 1);
      if (nj >= 0) {
        const nc = chars[nj];
        if (nc === 'ب') rules[i] = 'iqlab';
        else if (IDGHAM_LETTERS.has(nc)) rules[i] = 'idgham';
        else if (!THROAT.has(nc)) rules[i] = 'ikhfa';
      }
    }
  }

  const segs: TajweedSegment[] = [];
  let i = 0;
  while (i < chars.length) {
    const r = rules[i];
    let j = i + 1;
    while (j < chars.length && rules[j] === r) j++;
    const piece: TajweedSegment = { t: chars.slice(i, j).join('') };
    if (r) piece.r = r;
    segs.push(piece);
    i = j;
  }
  return segs;
}

export function getTajweedSegments(surahId: number, ayahId: number, fallbackArabic: string): TajweedSegment[] {
  const key = `${surahId}:${ayahId}`;
  const bundled = subset[key];
  if (bundled?.segments?.length) {
    const hasLegend = bundled.segments.some((s) => s.r);
    // Use Quran.com orthography only when it carries legend-colored spans;
    // otherwise keep bundled quran.json text + heuristic for consistency.
    if (hasLegend) return bundled.segments as TajweedSegment[];
  }
  return heuristicTajweed(fallbackArabic);
}

export function tajweedColor(rule?: TajweedRule): string | undefined {
  if (!rule) return undefined;
  return Mushaf.tajweed[rule];
}

export function hasBundledTajweed(surahId: number): boolean {
  return subset[`${surahId}:1`] != null;
}
