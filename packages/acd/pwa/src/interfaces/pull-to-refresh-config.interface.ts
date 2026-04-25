/**
 * @fileoverview PullToRefreshConfig — configuration for the pull-to-refresh gesture.
 * @module pwa/pull-to-refresh/interfaces/pull-to-refresh-config
 */

/**
 * Configuration for the pull-to-refresh component.
 */
export interface PullToRefreshConfig {
  /** Distance in px the user must pull before triggering refresh. @default 80 */
  threshold?: number;

  /** Maximum pull distance in px (elastic limit). @default 150 */
  maxPull?: number;

  /** Callback invoked when the user pulls past the threshold and releases. */
  onRefresh: () => Promise<void>;

  /** Whether pull-to-refresh is enabled. @default true */
  enabled?: boolean;

  /** Custom loading indicator element. */
  indicator?: React.ReactNode;
}
