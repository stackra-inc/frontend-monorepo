/**
 * Lock Service
 *
 * |--------------------------------------------------------------------------
 * | Screen lock and idle timeout management.
 * |--------------------------------------------------------------------------
 * |
 * | Monitors user activity (mouse, keyboard, touch) and triggers
 * | a lock event when the idle timeout elapses.
 * | Works in both Electron and browser — uses DOM event listeners.
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';

/** Activity events to monitor. */
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'touchstart', 'mousedown', 'scroll'] as const;

@Injectable()
export class LockService {
  /** Whether the screen is currently locked. */
  private locked = false;

  /** Idle timeout in seconds. */
  private idleTimeout: number;

  /** Timer ID for the idle check. */
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  /** Timestamp of the last user activity. */
  private lastActivity = Date.now();

  /** Registered lock state change callbacks. */
  private callbacks = new Set<(locked: boolean) => void>();

  /** Bound activity handler reference. */
  private readonly handleActivity: () => void;

  constructor(@Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions) {
    this.idleTimeout = this.moduleConfig.lock?.idleTimeout ?? 300;
    this.handleActivity = this.onActivity.bind(this);

    /*
    |--------------------------------------------------------------------------
    | Start monitoring if we have a valid timeout and DOM is available.
    |--------------------------------------------------------------------------
    */
    if (this.idleTimeout > 0 && typeof document !== 'undefined') {
      this.startMonitoring();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | setIdleTimeout
  |--------------------------------------------------------------------------
  */
  setIdleTimeout(seconds: number): void {
    this.idleTimeout = seconds;
    this.restartTimer();
  }

  /*
  |--------------------------------------------------------------------------
  | lock / unlock
  |--------------------------------------------------------------------------
  */
  lock(): void {
    if (this.locked) return;
    this.locked = true;
    this.emit(true);
  }

  unlock(): void {
    if (!this.locked) return;
    this.locked = false;
    this.lastActivity = Date.now();
    this.emit(false);
    this.restartTimer();
  }

  /*
  |--------------------------------------------------------------------------
  | isLocked
  |--------------------------------------------------------------------------
  */
  isLocked(): boolean {
    return this.locked;
  }

  /*
  |--------------------------------------------------------------------------
  | onLockStateChange
  |--------------------------------------------------------------------------
  */
  onLockStateChange(callback: (locked: boolean) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | destroy — cleanup timers and listeners
  |--------------------------------------------------------------------------
  */
  destroy(): void {
    this.stopMonitoring();
  }

  /*
  |--------------------------------------------------------------------------
  | Private
  |--------------------------------------------------------------------------
  */

  private startMonitoring(): void {
    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, this.handleActivity, { passive: true });
    }
    this.restartTimer();
  }

  private stopMonitoring(): void {
    if (typeof document !== 'undefined') {
      for (const event of ACTIVITY_EVENTS) {
        document.removeEventListener(event, this.handleActivity);
      }
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private onActivity(): void {
    this.lastActivity = Date.now();
    if (this.locked) return;
    this.restartTimer();
  }

  private restartTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.idleTimeout <= 0) return;

    this.idleTimer = setTimeout(() => {
      if (!this.locked) {
        const elapsed = (Date.now() - this.lastActivity) / 1000;
        if (elapsed >= this.idleTimeout) {
          this.lock();
        } else {
          this.restartTimer();
        }
      }
    }, this.idleTimeout * 1000);
  }

  private emit(locked: boolean): void {
    for (const cb of this.callbacks) {
      try {
        cb(locked);
      } catch (err) {
        console.error('[LockService] Callback error:', err);
      }
    }
  }
}
