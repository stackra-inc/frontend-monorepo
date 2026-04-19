/**
 * @fileoverview Registered listener interface.
 *
 * A registered listener with its priority, once flag, and source info.
 *
 * @module @stackra-inc/ts-events
 * @category Interfaces
 */

import type { EventListener } from './dispatcher.interface';

/**
 * A registered listener with its priority, once flag, and source info.
 */
export interface RegisteredListener {
  /** The listener callback. */
  handler: EventListener;
  /** Execution priority (higher = earlier). */
  priority: number;
  /** If true, remove after first invocation. */
  once: boolean;
  /** Whether this listener was registered via a wildcard pattern. */
  isWildcard: boolean;
}
