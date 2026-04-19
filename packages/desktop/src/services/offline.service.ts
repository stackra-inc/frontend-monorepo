/**
 * Offline Service
 *
 * |--------------------------------------------------------------------------
 * | Detects online/offline state and queues operations for later sync.
 * |--------------------------------------------------------------------------
 * |
 * | Uses navigator.onLine + periodic connectivity checks.
 * | Queued operations are persisted to localStorage.
 * | Works identically in Electron and browser — no bridge needed.
 * |
 * | Usage:
 * |   const offline = container.get(OfflineService);
 * |   const unsub = offline.onStateChange((online) => console.log(online));
 * |   if (!offline.isOnline()) {
 * |     await offline.queueOperation({ type: 'sale', payload: { ... } });
 * |   }
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { QueuedOperation, OfflineConfig } from '@/interfaces/offline.interface';

@Injectable()
export class OfflineService {
  /** Current online state. */
  private online: boolean;

  /** Registered state change callbacks. */
  private callbacks = new Set<(online: boolean) => void>();

  /** Ping interval timer ID. */
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  /** localStorage key prefix. */
  private readonly storageKey: string;

  /** Ping URL for connectivity checks. */
  private readonly pingUrl: string | undefined;

  /** Ping interval in ms. */
  private readonly pingInterval: number;

  constructor(@Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions) {
    const cfg: OfflineConfig = this.moduleConfig.offline ?? {};
    this.storageKey = cfg.storageKey ?? 'desktop-offline';
    this.pingUrl = cfg.pingUrl;
    this.pingInterval = cfg.pingInterval ?? 30000;

    /*
    |--------------------------------------------------------------------------
    | Initialize online state from navigator.
    |--------------------------------------------------------------------------
    */
    this.online = typeof navigator !== 'undefined' ? navigator.onLine : true;

    /*
    |--------------------------------------------------------------------------
    | Listen for browser online/offline events.
    |--------------------------------------------------------------------------
    */
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
    }

    /*
    |--------------------------------------------------------------------------
    | Start periodic ping if configured.
    |--------------------------------------------------------------------------
    */
    if (this.pingUrl) {
      this.startPing();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | isOnline
  |--------------------------------------------------------------------------
  */
  isOnline(): boolean {
    return this.online;
  }

  /*
  |--------------------------------------------------------------------------
  | onStateChange
  |--------------------------------------------------------------------------
  |
  | Register a callback for online/offline state changes.
  | Returns an unsubscribe function.
  |
  */
  onStateChange(callback: (online: boolean) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | queueOperation
  |--------------------------------------------------------------------------
  |
  | Persist an operation to localStorage for later sync.
  | Returns the generated operation ID.
  |
  */
  async queueOperation(
    operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>
  ): Promise<string> {
    const id = this.generateId();
    const queued: QueuedOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retries: 0,
    };

    const ops = this.loadQueue();
    ops.push(queued);
    this.saveQueue(ops);

    return id;
  }

  /*
  |--------------------------------------------------------------------------
  | getQueuedOperations
  |--------------------------------------------------------------------------
  */
  async getQueuedOperations(): Promise<QueuedOperation[]> {
    return this.loadQueue();
  }

  /*
  |--------------------------------------------------------------------------
  | clearQueue
  |--------------------------------------------------------------------------
  */
  async clearQueue(): Promise<void> {
    this.saveQueue([]);
  }

  /*
  |--------------------------------------------------------------------------
  | removeOperation (used by SyncService)
  |--------------------------------------------------------------------------
  */
  async removeOperation(id: string): Promise<void> {
    const ops = this.loadQueue().filter((op) => op.id !== id);
    this.saveQueue(ops);
  }

  /*
  |--------------------------------------------------------------------------
  | updateOperation (used by SyncService for retry count)
  |--------------------------------------------------------------------------
  */
  async updateOperation(id: string, updates: Partial<QueuedOperation>): Promise<void> {
    const ops = this.loadQueue();
    const idx = ops.findIndex((op) => op.id === id);
    if (idx !== -1) {
      ops[idx] = { ...ops[idx], ...updates } as QueuedOperation;
      this.saveQueue(ops);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | destroy — cleanup timers and listeners
  |--------------------------------------------------------------------------
  */
  destroy(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Private Helpers
  |--------------------------------------------------------------------------
  */

  /** Update online state and notify callbacks. */
  private setOnline(value: boolean): void {
    if (this.online === value) return;
    this.online = value;
    for (const cb of this.callbacks) {
      try {
        cb(value);
      } catch (err) {
        console.error('[OfflineService] Callback error:', err);
      }
    }
  }

  /** Start periodic connectivity ping. */
  private startPing(): void {
    this.pingTimer = setInterval(async () => {
      try {
        const response = await fetch(this.pingUrl!, { method: 'HEAD', cache: 'no-store' });
        this.setOnline(response.ok);
      } catch {
        this.setOnline(false);
      }
    }, this.pingInterval);
  }

  /** Load the operation queue from localStorage. */
  private loadQueue(): QueuedOperation[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${this.storageKey}:queue`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** Save the operation queue to localStorage. */
  private saveQueue(ops: QueuedOperation[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(`${this.storageKey}:queue`, JSON.stringify(ops));
  }

  /** Generate a simple UUID v4. */
  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
