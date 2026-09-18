import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  onboarding: '@iqra/onboardingComplete',
  streak: '@iqra/streak',
  weekly: '@iqra/weeklyMinutes',
  lifetime: '@iqra/lifetimeMinutes',
} as const;

export type StreakData = {
  count: number;
  lastDate: string;
};

export type WeeklyMinutes = {
  weekStart: string;
  minutes: number;
};

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function mondayOf(d = new Date()): string {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return todayKey(copy);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export async function loadOnboardingComplete(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.onboarding)) === '1';
  } catch {
    return false;
  }
}

export async function saveOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarding, '1');
}

export async function loadStreak(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.streak);
    if (!raw) return { count: 0, lastDate: '' };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { count: 0, lastDate: '' };
  }
}

export async function recordReadingDay(): Promise<StreakData> {
  const today = todayKey();
  const prev = await loadStreak();
  let next: StreakData;
  if (prev.lastDate === today) next = prev;
  else if (prev.lastDate === yesterdayKey()) next = { count: prev.count + 1, lastDate: today };
  else next = { count: 1, lastDate: today };
  await AsyncStorage.setItem(KEYS.streak, JSON.stringify(next));
  return next;
}

export async function loadWeeklyMinutes(): Promise<WeeklyMinutes> {
  const weekStart = mondayOf();
  try {
    const raw = await AsyncStorage.getItem(KEYS.weekly);
    if (!raw) return { weekStart, minutes: 0 };
    const parsed = JSON.parse(raw) as WeeklyMinutes;
    if (parsed.weekStart !== weekStart) return { weekStart, minutes: 0 };
    return parsed;
  } catch {
    return { weekStart, minutes: 0 };
  }
}

export async function loadLifetimeMinutes(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.lifetime);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function addReadingSeconds(seconds: number): Promise<void> {
  if (seconds < 15) return;
  const minutes = Math.max(1, Math.round(seconds / 60));
  const weekly = await loadWeeklyMinutes();
  await AsyncStorage.setItem(
    KEYS.weekly,
    JSON.stringify({ weekStart: weekly.weekStart, minutes: weekly.minutes + minutes }),
  );
  const lifetime = await loadLifetimeMinutes();
  await AsyncStorage.setItem(KEYS.lifetime, String(lifetime + minutes));
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatGregorianDate(d = new Date()): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatHijriDate(d = new Date()): string | null {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return null;
  }
}

export const WEEKLY_GOAL_MINUTES = 60;
