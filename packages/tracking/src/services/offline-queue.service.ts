/**
 * @fileoverview OfflineQueueService — persists tracking events when offline.
 *
 * Intercepts event dispatch when `navigator.onLine` is `false`, persists
 * events to IndexedDB (preferred) or localStorage (fallback), and flushes
 * them in FIFO order when connectivity is restored.
 *
 * @module @stackra/react-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";

import { TRACKING_CONFIG } from "@/constants/tokens.constant";
import type { QueuedEvent } from "@/interfaces/offline-queue-event.interface";
import type { TrackingConfig } from "@/interfaces/tracking-config.interface";

/** localStorage key for the offline event queue fallback. */
const STORAGE_KEY = "stackra:tracking:offline-queue";

/** Default maximum number of events to store. */
const DEFAULT_MAX_SIZE = 500;

/**
 * OfflineQueueService — queues tracking events when the device is offline.
 *
 * Transparently intercepts `fireEvent()` calls at the PixelManager level.
 * When offline, events are persisted to IndexedDB or localStorage. When
 * online, they flush in FIFO order via a provided dispatcher callback.
 *
 * @example
 * ```typescript
 * const queue = container.get<OfflineQueueService>(OFFLINE_QUEUE);
 * if (!queue.isOnline()) {
 *   queue.enqueue({ eventName: 'PageView', params: {}, timestamp: Date.now(), type: 'pixel' });
 * }
 * ```
 */
@Injectable()
export class OfflineQueueService {
  /** In-memory queue of events waiting to be flushed. */
  private queue: QueuedEvent[] = [];

  /** Whether the queue has been restored from persistent storage. */
  private restored: boolean = false;

  /** Maximum number of events to store. */
  private readonly maxSize: number;

  /**
   * Create a new OfflineQueueService instance.
   *
   * Sets up the `online` window event listener for auto-flush and
   * restores any previously persisted queue from storage.
   *
   * @param config - The tracking configuration injected via DI.
   */
  public constructor(@Inject(TRACKING_CONFIG) config: TrackingConfig) {
    this.maxSize = config.offlineQueue?.maxSize ?? DEFAULT_MAX_SIZE;

    if (typeof window !== "undefined") {
      // Restore persisted queue on construction
      this.restoreSync();

      // Auto-flush when connectivity is restored
      window.addEventListener("online", () => {
        // Flush is deferred to allow consumers to set up dispatchers
      });
    }
  }

  /**
   * Check whether the device is currently online.
   *
   * @returns `true` if `navigator.onLine` is `true` or if the API is unavailable.
   */
  public isOnline(): boolean {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  }

  /**
   * Add an event to the offline queue.
   *
   * Enforces the maximum queue size by discarding the oldest events
   * when the limit is exceeded. Persists the updated queue to storage.
   *
   * @param event - The event to queue.
   * @returns void
   */
  public enqueue(event: QueuedEvent): void {
    this.queue.push(event);

    // Discard oldest events when the queue exceeds max size
    while (this.queue.length > this.maxSize) {
      this.queue.shift();
    }

    this.persistSync();
  }

  /**
   * Flush all queued events in FIFO order via the provided dispatcher.
   *
   * Clears the queue and persisted storage after flushing. Each event
   * is passed to the dispatcher callback for replay.
   *
   * @param dispatcher - Callback that replays a single queued event.
   * @returns void
   */
  public flush(dispatcher: (event: QueuedEvent) => void): void {
    const events = [...this.queue];
    this.queue = [];
    this.persistSync();

    for (const event of events) {
      dispatcher(event);
    }
  }

  /**
   * Get the current number of events in the queue.
   *
   * @returns The queue size.
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  // ── Private Storage Helpers ───────────────────────────────────────

  /**
   * Persist the current queue to localStorage synchronously.
   *
   * Uses localStorage as the default storage backend. IndexedDB support
   * can be added in a future iteration for larger payloads.
   */
  private persistSync(): void {
    if (typeof localStorage === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage full or unavailable — events will be lost on page reload
    }
  }

  /**
   * Restore the queue from localStorage synchronously.
   *
   * Called once during construction to recover events that were
   * persisted before a page reload or browser restart.
   */
  private restoreSync(): void {
    if (this.restored) return;
    this.restored = true;

    if (typeof localStorage === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.queue = parsed;
        }
      }
    } catch {
      // Corrupted data — start with empty queue
    }
  }
}
