/**
 * Offline & Sync Interfaces
 *
 * |--------------------------------------------------------------------------
 * | Types for offline state detection, operation queuing, and sync.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| Queued Operation
|--------------------------------------------------------------------------
*/

/** An operation queued for later execution when offline. */
export interface QueuedOperation {
  /** Unique identifier (UUID). */
  id: string;
  /** Operation type (e.g. 'sale', 'inventory-update'). */
  type: string;
  /** Arbitrary JSON-serializable payload. */
  payload: unknown;
  /** Timestamp when the operation was queued (Date.now()). */
  timestamp: number;
  /** Number of sync retry attempts so far. */
  retries: number;
  /** Last sync error message, if any. */
  lastError?: string;
}

/*
|--------------------------------------------------------------------------
| Offline Config
|--------------------------------------------------------------------------
*/

/** Configuration for the OfflineService. */
export interface OfflineConfig {
  /** URL to ping for connectivity checks. */
  pingUrl?: string;
  /** Interval between pings in ms. @default 30000 */
  pingInterval?: number;
  /** Key prefix for localStorage/IndexedDB storage. @default 'desktop-offline' */
  storageKey?: string;
}

/*
|--------------------------------------------------------------------------
| Sync Config
|--------------------------------------------------------------------------
*/

/** Configuration for the SyncService. */
export interface SyncConfig {
  /** Maximum retry attempts per operation. @default 3 */
  maxRetries?: number;
  /** Initial backoff interval in ms (doubles each retry). @default 1000 */
  backoffMs?: number;
  /** User-provided function to execute a queued operation. */
  executor: (op: QueuedOperation) => Promise<void>;
}

/*
|--------------------------------------------------------------------------
| Sync Progress
|--------------------------------------------------------------------------
*/

/** Progress report during a sync operation. */
export interface SyncProgress {
  /** Total number of operations to process. */
  total: number;
  /** Number of operations completed successfully. */
  completed: number;
  /** Number of operations that failed. */
  failed: number;
  /** Whether sync is currently in progress. */
  inProgress: boolean;
}
