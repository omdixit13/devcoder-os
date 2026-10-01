import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationStatus {
  supported: boolean;
  permission: 'granted' | 'denied' | 'prompt' | 'default';
  isNative: boolean;
}

/**
 * Checks whether notifications are supported in the current environment
 */
export function isNotificationSupported(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets the current notification permission state
 */
export async function getNotificationPermissionStatus(): Promise<NotificationStatus> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const status = await LocalNotifications.checkPermissions();
      const perm = status.display === 'granted' ? 'granted' : status.display === 'denied' ? 'denied' : 'prompt';
      return { supported: true, permission: perm, isNative: true };
    } catch {
      return { supported: false, permission: 'denied', isNative: true };
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    const perm = window.Notification.permission;
    return {
      supported: true,
      permission: perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : 'prompt',
      isNative: false,
    };
  }

  return { supported: false, permission: 'denied', isNative: false };
}

/**
 * Prompts user for notification permission (supports both Android native & Web PWA)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        // Schedule a welcome notification
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now() % 100000,
              title: 'DevCareer OS Notifications Active 🚀',
              body: 'Daily coding streaks, contest alerts, and revision reminders are now enabled.',
              schedule: { at: new Date(Date.now() + 1000) },
              smallIcon: 'ic_launcher',
            },
          ],
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to request native notification permissions:', err);
      return false;
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const perm = await window.Notification.requestPermission();
      if (perm === 'granted') {
        new window.Notification('DevCareer OS Notifications Active 🚀', {
          body: 'Daily coding streaks, contest alerts, and revision reminders are now enabled.',
          icon: '/icon.svg',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to request web notification permissions:', err);
      return false;
    }
  }

  return false;
}

/**
 * Sends a notification if permitted
 */
export async function sendNotification(title: string, body: string, id?: number): Promise<boolean> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: id || (Date.now() % 100000),
            title,
            body,
            schedule: { at: new Date(Date.now() + 500) },
            smallIcon: 'ic_launcher',
          },
        ],
      });
      return true;
    } catch (err) {
      console.error('Native notification error:', err);
      return false;
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
    try {
      new window.Notification(title, {
        body,
        icon: '/icon.svg',
      });
      return true;
    } catch (err) {
      console.error('Web notification error:', err);
      return false;
    }
  }

  return false;
}
