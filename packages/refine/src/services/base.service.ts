/**
 * @fileoverview Abstract base service with default CRUD delegation to repository.
 *
 * All resource services extend this class. Default implementations
 * delegate directly to the injected repository. Subclasses override
 * methods to add validation, transformation, or business rules.
 *
 * @module @stackra-inc/react-refine
 * @category Services
 *
 * @example
 * ```typescript
 * import { BaseService } from '@stackra-inc/react-refine';
 *
 * class PostService extends BaseService<Post, string> {
 *   async create(data: Partial<Post>): Promise<Post> {
 *     if (!data.title || data.title.trim().length < 3) {
 *       throw new Error('Title must be at least 3 characters');
 *     }
 *     return super.create(data);
 *   }
 * }
 * ```
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';
import type { BaseRepository } from '@/repositories/base.repository';
import type { GetListParams } from '@/interfaces/get-list-params.interface';
import type { GetListResult } from '@/interfaces/get-list-result.interface';
import type { CustomParams } from '@/interfaces/custom-params.interface';
import { BASE_REPOSITORY } from '@/constants';

/**
 * Abstract base service that delegates all CRUD operations to a repository.
 *
 * Auto-created by `forFeature` when no custom service is specified
 * in `@Resource` metadata.
 *
 * @typeParam TData - The entity/model type.
 * @typeParam TId - The identifier type (defaults to `string | number`).
 */
@Injectable()
export abstract class BaseService<TData, TId = string | number> {
  /**
   * @param repository - The repository to delegate data access to.
   */
  constructor(@Inject(BASE_REPOSITORY) protected readonly repository: BaseRepository<TData, TId>) {}

  /**
   * Fetch a single record by ID.
   * @param id - The record identifier.
   * @returns The matching record.
   */
  async getOne(id: TId): Promise<TData> {
    return this.repository.getOne(id);
  }

  /**
   * Fetch a paginated, sorted, filtered list of records.
   * @param params - Query parameters.
   * @returns The matching records and total count.
   */
  async getList(params: GetListParams): Promise<GetListResult<TData>> {
    return this.repository.getList(params);
  }

  /**
   * Fetch multiple records by their IDs.
   * @param ids - Array of record identifiers.
   * @returns The matching records.
   */
  async getMany(ids: TId[]): Promise<TData[]> {
    return this.repository.getMany(ids);
  }

  /**
   * Create a new record.
   * @param data - Partial data for the new record.
   * @returns The created record.
   */
  async create(data: Partial<TData>): Promise<TData> {
    return this.repository.create(data);
  }

  /**
   * Update an existing record.
   * @param id - The record identifier.
   * @param data - Partial data to update.
   * @returns The updated record.
   */
  async update(id: TId, data: Partial<TData>): Promise<TData> {
    return this.repository.update(id, data);
  }

  /**
   * Delete a single record.
   * @param id - The record identifier.
   */
  async deleteOne(id: TId): Promise<void> {
    return this.repository.deleteOne(id);
  }

  /**
   * Delete multiple records.
   * @param ids - Array of record identifiers.
   */
  async deleteMany(ids: TId[]): Promise<void> {
    return this.repository.deleteMany(ids);
  }

  /**
   * Create multiple records in bulk.
   * @param data - Array of partial data for new records.
   * @returns The created records.
   */
  async createMany(data: Partial<TData>[]): Promise<TData[]> {
    return this.repository.createMany(data);
  }

  /**
   * Update multiple records with the same data.
   * @param ids - Array of record identifiers.
   * @param data - Partial data to apply to all records.
   * @returns The updated records.
   */
  async updateMany(ids: TId[], data: Partial<TData>): Promise<TData[]> {
    return this.repository.updateMany(ids, data);
  }

  /**
   * Execute a custom/ad-hoc operation.
   * @param params - Custom operation parameters.
   * @returns The operation result.
   */
  async custom(params: CustomParams): Promise<any> {
    return this.repository.custom(params);
  }
}
