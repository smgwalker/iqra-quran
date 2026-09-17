import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { resolveAyahAudioUri } from './downloads';

let player: AudioPlayer | null = null;
let currentKey: string | null = null;
let finishSub: { remove: () => void } | null = null;

async function ensureAudioMode() {
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
  });
}

function clearFinishSub() {
  if (finishSub) {
    try {
      finishSub.remove();
    } catch {
      /* ignore */
    }
    finishSub = null;
  }
}

function bindFinish(
  next: AudioPlayer,
  onStatus?: (playing: boolean, finished: boolean) => void,
) {
  clearFinishSub();
  finishSub = next.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) {
      onStatus?.(false, true);
    }
  });
}

export async function stopAudio(): Promise<void> {
  clearFinishSub();
  if (player) {
    try {
      player.pause();
      player.remove();
    } catch {
      /* ignore */
    }
    player = null;
    currentKey = null;
  }
}

export async function playAyah(
  surahId: number,
  ayahId: number,
  onStatus?: (playing: boolean, finished: boolean) => void,
): Promise<void> {
  const key = `${surahId}:${ayahId}`;
  await ensureAudioMode();

  if (player && currentKey === key) {
    bindFinish(player, onStatus);
    if (player.playing) {
      player.pause();
      onStatus?.(false, false);
      return;
    }
    player.play();
    onStatus?.(true, false);
    return;
  }

  await stopAudio();
  const uri = await resolveAyahAudioUri(surahId, ayahId);
  const next = createAudioPlayer({ uri }, { updateInterval: 500 });
  player = next;
  currentKey = key;
  bindFinish(next, onStatus);

  next.play();
  onStatus?.(true, false);
}

export async function pauseAudio(): Promise<void> {
  if (player?.playing) {
    player.pause();
  }
}

export function getCurrentAudioKey(): string | null {
  return currentKey;
}
