/**
 * @fileoverview Abstract base repository defining the standard CRUD contract.
 *
 * All resource repositories (HttpRepository, custom)
 * extend this class to ensure a consistent data-access interface.
 *
 * @module @stackra/react-refine
 * @category Repositories
 *
 * @example
 * ```typescript
 * import { BaseRepository } from '@stackra/react-refine';
 * import type { GetListParams, GetListResult, CustomParams } from '@stackra/react-refine';
 *
 * class MyRepository extends BaseRepository<Post, string> {
 *   async getOne(id: string) { ... }
 *   async getList(params: GetListParams) { ... }
 *   // ... implement all abstract methods
 * }
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import type { GetListParams } from '@/interfaces/get-list-params.interface';
import type { GetListResult } from '@/interfaces/get-list-result.interface';
import type { CustomParams } from '@/interfaces/custom-params.interface';

/**
 * Abstract base repository with a standard CRUD interface.
 *
 * @typeParam TData - The entity/model type.
 * @typeParam TId - The identifier type (defaults to `string | number`).
 */
@Injectable()
export abstract class BaseRepository<TData, TId = string | number> {
  /**
   * Fetch a single record by ID.
   * @param id - The record identifier.
   * @returns The matching record.
   */
  abstract getOne(id: TId): Promise<TData>;

  /**
   * Fetch a paginated, sorted, filtered list of records.
   * @param params - Pagination, sorting, and filtering parameters.
   * @returns The matching records and total count.
   */
  abstract getList(params: GetListParams): Promise<GetListResult<TData>>;

  /**
   * Fetch multiple records by their IDs.
   * @param ids - Array of record identifiers.
   * @returns The matching records.
   */
  abstract getMany(ids: TId[]): Promise<TData[]>;

  /**
   * Create a new record.
   * @param data - Partial data for the new record.
   * @returns The created record.
   */
  abstract create(data: Partial<TData>): Promise<TData>;

  /**
   * Update an existing record.
   * @param id - The record identifier.
   * @param data - Partial data to update.
   * @returns The updated record.
   */
  abstract update(id: TId, data: Partial<TData>): Promise<TData>;

  /**
   * Delete a single record.
   * @param id - The record identifier.
   */
  abstract deleteOne(id: TId): Promise<void>;

  /**
   * Delete multiple records.
   * @param ids - Array of record identifiers.
   */
  abstract deleteMany(ids: TId[]): Promise<void>;

  /**
   * Create multiple records in bulk.
   * @param data - Array of partial data for new records.
   * @returns The created records.
   */
  abstract createMany(data: Partial<TData>[]): Promise<TData[]>;

  /**
   * Update multiple records with the same data.
   * @param ids - Array of record identifiers.
   * @param data - Partial data to apply to all records.
   * @returns The updated records.
   */
  abstract updateMany(ids: TId[], data: Partial<TData>): Promise<TData[]>;

  /**
   * Execute a custom/ad-hoc operation.
   * @param params - Custom operation parameters.
   * @returns The operation result.
   */
  abstract custom(params: CustomParams): Promise<any>;
}
