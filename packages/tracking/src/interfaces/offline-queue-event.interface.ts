/**
 * @fileoverview QueuedEvent interface — shape of events stored in the offline queue.
 *
 * Defines the data structure for events persisted by {@link OfflineQueueService}
 * when the device is offline. Events are flushed in FIFO order when
 * connectivity is restored.
 *
 * @module @stackra/react-tracking
 * @category Interfaces
 */

/**
 * Shape of an event stored in the offline queue.
 *
 * Contains all data needed to replay the event when connectivity
 * is restored, including the original timestamp for accurate timing.
 *
 * @example
 * ```typescript
 * const event: QueuedEvent = {
 *   eventName: 'PageView',
 *   params: { url: '/products' },
 *   eventId: 'abc-123',
 *   timestamp: Date.now(),
 *   type: 'pixel',
 * };
 * ```
 */
export interface QueuedEvent {
  /**
   * The canonical event name (e.g., `'PageView'`, `'scroll_depth'`).
   */
  eventName: string;

  /**
   * Event-specific parameters as key-value pairs.
   */
  params: Record<string, unknown>;

  /**
   * Optional event ID for deduplication with server-side events.
   */
  eventId?: string;

  /**
   * Unix timestamp (milliseconds) when the event was originally created.
   * Preserved so platforms receive accurate timing data on flush.
   */
  timestamp: number;

  /**
   * The type of queued event.
   *
   * - `'pixel'` — a pixel event to be dispatched via PixelManager
   * - `'identity-sync'` — an identity sync request to be POSTed to the backend
   */
  type: "pixel" | "identity-sync";
}
