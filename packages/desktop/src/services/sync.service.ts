/**
 * Sync Service
 *
 * |--------------------------------------------------------------------------
 * | Synchronizes locally queued operations when connectivity is restored.
 * |--------------------------------------------------------------------------
 * |
 * | Processes queued operations in FIFO order via a user-provided executor.
 * | Failed operations are retained with incremented retry count.
 * | Auto-triggers sync on offline→online transition.
 * |
 * | Works identically in Electron and browser — no bridge needed.
 * |
 * | Usage:
 * |   const sync = container.get(SyncService);
 * |   sync.configureSyncStrategy({
 * |     maxRetries: 3,
 * |     executor: async (op) => { await api.post('/sync', op.payload); },
 * |   });
 * |   const progress = await sync.sync();
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { QueuedOperation, SyncConfig, SyncProgress } from '@/interfaces/offline.interface';
import { OfflineService } from './offline.service';

@Injectable()
export class SyncService {
  /** Maximum retry attempts per operation. */
  private maxRetries: number;

  /** Initial backoff interval in ms. */
  private backoffMs: number;

  /** User-provided executor function. */
  private executor: ((op: QueuedOperation) => Promise<void>) | null = null;

  /** Registered progress callbacks. */
  private progressCallbacks = new Set<(progress: SyncProgress) => void>();

  /** Registered sync-complete callbacks. */
  private completeCallbacks = new Set<() => void>();

  /** Unsubscribe function for offline state change listener. */
  private offlineUnsub: (() => void) | null = null;

  constructor(
    @Inject(OfflineService) private readonly offline: OfflineService,
    @Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions
  ) {
    const cfg = this.moduleConfig.sync;
    this.maxRetries = cfg?.maxRetries ?? 3;
    this.backoffMs = cfg?.backoffMs ?? 1000;

    /*
    |--------------------------------------------------------------------------
    | Auto-trigger sync on offline → online transition.
    |--------------------------------------------------------------------------
    */
    this.offlineUnsub = this.offline.onStateChange((online) => {
      if (online && this.executor) {
        this.sync().catch((err) => {
          console.error('[SyncService] Auto-sync failed:', err);
        });
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | sync
  |--------------------------------------------------------------------------
  |
  | Process all queued operations in FIFO order.
  | Returns a progress summary when complete.
  |
  */
  async sync(): Promise<SyncProgress> {
    if (!this.executor) {
      console.warn('[SyncService] No executor configured. Call configureSyncStrategy() first.');
      return { total: 0, completed: 0, failed: 0, inProgress: false };
    }

    const operations = await this.offline.getQueuedOperations();
    const progress: SyncProgress = {
      total: operations.length,
      completed: 0,
      failed: 0,
      inProgress: true,
    };

    this.emitProgress(progress);

    for (const op of operations) {
      /*
      |--------------------------------------------------------------------------
      | Skip operations that have exceeded max retries.
      |--------------------------------------------------------------------------
      */
      if (op.retries >= this.maxRetries) {
        progress.failed++;
        this.emitProgress(progress);
        continue;
      }

      try {
        await this.executor(op);
        await this.offline.removeOperation(op.id);
        progress.completed++;
      } catch (err) {
        /*
        |--------------------------------------------------------------------------
        | Retain failed operation with incremented retry count.
        |--------------------------------------------------------------------------
        */
        await this.offline.updateOperation(op.id, {
          retries: op.retries + 1,
          lastError: err instanceof Error ? err.message : String(err),
        });
        progress.failed++;
      }

      this.emitProgress(progress);

      /*
      |--------------------------------------------------------------------------
      | Backoff between operations if there were failures.
      |--------------------------------------------------------------------------
      */
      if (progress.failed > 0) {
        await this.delay(this.backoffMs * Math.pow(2, progress.failed - 1));
      }
    }

    progress.inProgress = false;
    this.emitProgress(progress);

    /* Emit sync-complete event. */
    for (const cb of this.completeCallbacks) {
      try {
        cb();
      } catch (err) {
        console.error('[SyncService] Complete callback error:', err);
      }
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | onSyncProgress
  |--------------------------------------------------------------------------
  |
  | Register a callback to receive sync progress updates.
  | Returns an unsubscribe function.
  |
  */
  onSyncProgress(callback: (progress: SyncProgress) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | onSyncComplete
  |--------------------------------------------------------------------------
  |
  | Register a callback for when sync finishes.
  | Returns an unsubscribe function.
  |
  */
  onSyncComplete(callback: () => void): () => void {
    this.completeCallbacks.add(callback);
    return () => {
      this.completeCallbacks.delete(callback);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | configureSyncStrategy
  |--------------------------------------------------------------------------
  |
  | Set the executor function and retry configuration.
  |
  */
  configureSyncStrategy(config: SyncConfig): void {
    this.executor = config.executor;
    if (config.maxRetries !== undefined) this.maxRetries = config.maxRetries;
    if (config.backoffMs !== undefined) this.backoffMs = config.backoffMs;
  }

  /*
  |--------------------------------------------------------------------------
  | destroy — cleanup listeners
  |--------------------------------------------------------------------------
  */
  destroy(): void {
    if (this.offlineUnsub) {
      this.offlineUnsub();
      this.offlineUnsub = null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Private Helpers
  |--------------------------------------------------------------------------
  */

  /** Emit progress to all registered callbacks. */
  private emitProgress(progress: SyncProgress): void {
    for (const cb of this.progressCallbacks) {
      try {
        cb({ ...progress });
      } catch (err) {
        console.error('[SyncService] Progress callback error:', err);
      }
    }
  }

  /** Delay for the given number of milliseconds. */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
