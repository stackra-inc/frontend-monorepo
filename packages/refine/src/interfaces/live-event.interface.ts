/**
 * @fileoverview A live event received from a real-time channel.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * A live event received from a real-time channel.
 */
export interface LiveEvent {
  /** Channel the event was received on. */
  channel: string;

  /** Event type identifier. */
  type: string;

  /** Event payload. */
  payload: any;

  /** Timestamp of the event. */
  date: Date;
}
