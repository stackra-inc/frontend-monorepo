/**
 * @fileoverview Resource metadata interface stored by the @Resource decorator.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Metadata stored on a Model class by the `@Resource` decorator.
 *
 * Read by `forFeature()` to auto-create Repository + Service pairs.
 */
export interface ResourceMetadata {
  /** Resource name string (use a token constant, e.g. `POST_RESOURCE`). */
  name: string;

  /** API endpoint for HttpRepository (e.g. `'/api/posts'`). */
  endpoint: string;

  /** Optional custom service class extending BaseService. */
  service?: any;

  /** Optional custom repository class extending BaseRepository. */
  repository?: any;
}
