/**
 * @fileoverview Parameters for publishing a real-time event.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * Parameters for publishing a real-time event.
 */
export interface PublishParams {
  /** Channel name to publish to. */
  channel: string;

  /** Event type identifier. */
  type: string;

  /** Event payload. */
  payload: any;

  /** Optional event timestamp (defaults to now). */
  date?: Date;
}
