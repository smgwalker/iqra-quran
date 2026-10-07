import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Gentle tick for each count. No-ops on web / unsupported devices. */
export function tapHaptic(): void {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

/** Slightly stronger feedback when a target is reached. */
export function successHaptic(): void {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
