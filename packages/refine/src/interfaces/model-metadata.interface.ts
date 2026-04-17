/**
 * @fileoverview Model metadata interface stored by the @Model decorator.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

/**
 * Metadata stored on a class by the `@Model` decorator.
 *
 * Marks a class as an RxDB/Eloquent database model.
 * When `forFeature` detects this metadata, it auto-creates
 * an `EloquentRepository` instead of `HttpRepository`.
 */
export interface ModelMetadata {
  /** Optional RxDB collection name override. */
  collection?: string;

  /** Optional schema version. */
  version?: number;
}
