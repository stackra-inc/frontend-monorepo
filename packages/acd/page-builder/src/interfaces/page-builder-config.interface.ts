/**
 * @fileoverview PageBuilderConfig interface — configuration object passed
 * to `PageBuilderModule.forRoot(config)`.
 *
 * Controls the backend API base URL, undo history depth, and schema
 * version for serialization.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

/**
 * Configuration for the page builder module.
 *
 * Passed to `PageBuilderModule.forRoot(config)` and injected into
 * services via the `PAGE_BUILDER_CONFIG` DI token.
 */
export interface PageBuilderConfig {
  /** Base URL for the page builder backend API (e.g. "/api/v1/pages") */
  apiBaseUrl: string;

  /**
   * Maximum undo stack depth.
   * When exceeded, the oldest snapshot is discarded.
   * @default 50
   */
  maxHistoryDepth?: number;

  /**
   * Current schema version string used for serialization.
   * Compared during deserialization to detect version mismatches.
   * @default "1.0.0"
   */
  schemaVersion?: string;
}
