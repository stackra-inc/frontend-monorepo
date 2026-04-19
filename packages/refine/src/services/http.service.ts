/**
 * @fileoverview Default concrete service used by forFeature auto-creation.
 *
 * When `@Resource` metadata does not specify a custom service class,
 * `forFeature` creates a `HttpService` instance bound to the
 * auto-created repository.
 *
 * @module @stackra-inc/react-refine
 * @category Services
 */

import { BaseService } from './base.service';

/**
 * Concrete service with no custom logic — pure delegation to repository.
 *
 * @typeParam TData - The entity/model type.
 * @typeParam TId - The identifier type.
 */
export class HttpService<TData, TId = string | number> extends BaseService<TData, TId> {}
