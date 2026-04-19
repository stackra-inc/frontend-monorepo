/**
 * Notification Service
 *
 * |--------------------------------------------------------------------------
 * | Rich OS notifications with actions, sounds, badges, and queuing.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: uses Electron Notification API via IPC.
 * | In browser: uses Web Notification API with graceful degradation.
 * |
 * | Notifications submitted in rapid succession are queued and
 * | displayed sequentially with a configurable delay.
 * |
 * | Usage:
 * |   const notif = container.get(NotificationService);
 * |   await notif.show({ title: 'Order Ready', body: 'Order #42 is ready.' });
 * |   notif.onAction((notifId, actionId) => console.log(notifId, actionId));
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { NotificationOptions } from '@/interfaces/system.interface';
import { DesktopManager } from './desktop-manager.service';

/** Internal queue entry. */
interface QueuedNotification {
  options: NotificationOptions;
  resolve: (id: string) => void;
  reject: (err: Error) => void;
}

@Injectable()
export class NotificationService {
  /** Notification queue for sequential display. */
  private readonly queue: QueuedNotification[] = [];

  /** Whether the queue is currently being processed. */
  private processing = false;

  /** Delay between consecutive notifications in ms. */
  private readonly delay: number;

  /** Auto-incrementing notification ID counter. */
  private idCounter = 0;

  /** Registered action callbacks. */
  private actionCallbacks = new Set<(notificationId: string, actionId: string) => void>();

  /** Unsubscribe function for IPC action listener. */
  private actionUnsub: (() => void) | null = null;

  constructor(
    @Inject(DesktopManager) private readonly desktop: DesktopManager,
    @Inject(DESKTOP_CONFIG) private readonly config: DesktopModuleOptions
  ) {
    this.delay = this.config.notificationDelay ?? 500;

    /*
    |--------------------------------------------------------------------------
    | Listen for notification action events from the main process.
    |--------------------------------------------------------------------------
    */
    if (this.desktop.isDesktop) {
      this.actionUnsub = this.desktop.bridge.onMenuAction('notify:action', (...args: unknown[]) => {
        const notifId = args[0] as string;
        const actionId = args[1] as string;
        this.emitAction(notifId, actionId);
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | show
  |--------------------------------------------------------------------------
  |
  | Queues a notification for display. Returns the notification ID.
  | Notifications are displayed sequentially with the configured delay.
  |
  */
  async show(options: NotificationOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.queue.push({ options, resolve, reject });
      this.processQueue();
    });
  }

  /*
  |--------------------------------------------------------------------------
  | onAction
  |--------------------------------------------------------------------------
  |
  | Register a callback for notification action button clicks.
  | Returns an unsubscribe function.
  |
  */
  onAction(callback: (notificationId: string, actionId: string) => void): () => void {
    this.actionCallbacks.add(callback);
    return () => {
      this.actionCallbacks.delete(callback);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | setBadgeCount
  |--------------------------------------------------------------------------
  |
  | Updates the application badge count (dock on macOS, taskbar on Windows).
  |
  */
  async setBadgeCount(count: number): Promise<void> {
    if (this.desktop.isDesktop) {
      await this.desktop.bridge.invoke('dock:badge', String(count));
    } else if ('setAppBadge' in navigator) {
      await (navigator as any).setAppBadge(count);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | destroy — cleanup listeners
  |--------------------------------------------------------------------------
  */
  destroy(): void {
    if (this.actionUnsub) {
      this.actionUnsub();
      this.actionUnsub = null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Private: Queue Processing
  |--------------------------------------------------------------------------
  */

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const entry = this.queue.shift()!;
      try {
        const id = await this.displayNotification(entry.options);
        entry.resolve(id);
      } catch (err) {
        entry.reject(err instanceof Error ? err : new Error(String(err)));
      }

      /* Delay between consecutive notifications. */
      if (this.queue.length > 0) {
        await this.wait(this.delay);
      }
    }

    this.processing = false;
  }

  /** Display a single notification. */
  private async displayNotification(options: NotificationOptions): Promise<string> {
    const id = `notif-${++this.idCounter}`;

    if (this.desktop.isDesktop) {
      await this.desktop.bridge.invoke('notify:show', { ...options, id });
      return id;
    }

    /* Browser fallback: Web Notification API. */
    return this.browserNotify(id, options);
  }

  /** Browser fallback using Web Notification API. */
  private async browserNotify(id: string, options: NotificationOptions): Promise<string> {
    if (!('Notification' in globalThis)) {
      console.warn('[NotificationService] Notification API not available.');
      return id;
    }

    /* Request permission if needed. */
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission !== 'granted') {
      console.warn('[NotificationService] Notification permission denied.');
      return id;
    }

    const notif = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      silent: options.silent ?? !options.sound,
    });

    /* Web Notifications don't support action buttons natively. */
    notif.onclick = () => {
      this.emitAction(id, 'click');
    };

    return id;
  }

  /** Emit an action event to all registered callbacks. */
  private emitAction(notificationId: string, actionId: string): void {
    for (const cb of this.actionCallbacks) {
      try {
        cb(notificationId, actionId);
      } catch (err) {
        console.error('[NotificationService] Action callback error:', err);
      }
    }
  }

  /** Wait for the given number of milliseconds. */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
