/**
 * @fileoverview Query parameter management service.
 *
 * Provides methods for parsing and stringifying query parameters with
 * Zod schema validation support.
 *
 * ## Features
 *
 * - Parse URL search strings to typed objects
 * - Stringify typed objects to URL search strings
 * - Zod schema validation with defaults
 * - Custom serialization/deserialization per parameter
 * - Preserve or filter unknown parameters
 *
 * ## Usage
 *
 * ```typescript
 * const queryService = useInject(QueryService);
 *
 * // Parse query params
 * const params = queryService.parseQuery<{ page: number }>(
 *   location.search,
 *   { schema, defaults: { page: 1 } }
 * );
 *
 * // Stringify query params
 * const search = queryService.stringifyQuery({ page: 2, search: 'react' });
 * ```
 *
 * @module @stackra/react-router/query
 * @category Services
 */

import { Injectable } from '@stackra/ts-container';
import type { z } from 'zod';
import { QuerySerializer } from './query-serializer';
import type { QueryConfig } from './interfaces/query-config.interface';

/**
 * Query parameter management service.
 *
 * Handles parsing and stringifying query parameters with validation
 * and type conversion support.
 *
 * Registered as a singleton in the DI container via `@Injectable()`.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class PostsService {
 *   constructor(private queryService: QueryService) {}
 *
 *   getFilters() {
 *     return this.queryService.parseQuery<PostFilters>(
 *       window.location.search,
 *       { schema: postFiltersSchema, defaults: { page: 1 } }
 *     );
 *   }
 * }
 * ```
 */
@Injectable()
export class QueryService {
  /**
   * Parse a URL search string to a typed object.
   *
   * Deserializes query parameters from the URL and optionally validates
   * them against a Zod schema. Falls back to defaults for missing or
   * invalid parameters.
   *
   * ## Process
   *
   * 1. Deserialize URL search string to object
   * 2. Merge with defaults
   * 3. Validate with Zod schema (if provided)
   * 4. Return typed object
   *
   * @template T - Type of the query parameters object
   * @param search - URL search string (with or without leading `?`)
   * @param config - Optional configuration for parsing
   * @returns Typed and validated query parameters object
   *
   * @example
   * ```typescript
   * // Without schema
   * const params = queryService.parseQuery('?page=1&search=react');
   * // { page: '1', search: 'react' }
   *
   * // With schema and defaults
   * const schema = z.object({
   *   page: z.number().min(1).default(1),
   *   search: z.string().optional()
   * });
   *
   * const params = queryService.parseQuery<{ page: number; search?: string }>(
   *   '?page=2&search=react',
   *   { schema, defaults: { page: 1 } }
   * );
   * // { page: 2, search: 'react' }
   * ```
   */
  parseQuery<T = Record<string, any>>(search: string, config?: QueryConfig<T>): T {
    // Deserialize URL search string
    const rawParams = QuerySerializer.deserializeParams(search, config?.paramOptions);

    // Merge with defaults
    const paramsWithDefaults = {
      ...config?.defaults,
      ...rawParams,
    };

    // Validate with Zod schema if provided
    if (config?.schema) {
      try {
        // Pre-coerce raw string values to match schema expectations.
        // URL query params are always strings, but Zod schemas often
        // expect numbers/booleans. We coerce before validation so that
        // z.number() works without requiring z.coerce.number().
        const coerced = this.coerceToSchemaTypes(paramsWithDefaults, config.schema);

        // Parse with schema — applies defaults and validation
        const validated = config.schema.parse(coerced);
        return validated as T;
      } catch (error) {
        console.warn('[QueryService] Validation failed, using defaults:', error);
        // Return defaults on validation failure
        return (config.defaults ?? {}) as T;
      }
    }

    // Return merged params without validation
    return paramsWithDefaults as T;
  }

  /**
   * Coerce raw string values from URL params to match Zod schema types.
   *
   * URL query parameters are always strings. This method inspects the
   * Zod schema shape and converts string values to the expected types
   * (number, boolean, array) before validation.
   *
   * @param params - Raw parameters (may contain strings from URL)
   * @param schema - Zod schema to inspect for expected types
   * @returns Parameters with coerced types
   *
   * @internal
   */
  private coerceToSchemaTypes(params: Record<string, any>, schema: any): Record<string, any> {
    const coerced = { ...params };

    // Try to extract the shape from the Zod schema.
    // ZodObject has a .shape property; ZodEffects (from .default()/.transform())
    // wraps an inner schema accessible via ._def.schema or ._def.innerType.
    const shape = this.extractZodShape(schema);
    if (!shape) return coerced;

    for (const [key, value] of Object.entries(coerced)) {
      if (value === undefined || value === null) continue;

      const fieldSchema = shape[key];
      if (!fieldSchema) continue;

      const baseType = this.getZodBaseType(fieldSchema);

      if (baseType === 'ZodNumber' && typeof value === 'string') {
        const num = Number(value);
        if (!Number.isNaN(num)) {
          coerced[key] = num;
        }
      } else if (baseType === 'ZodBoolean' && typeof value === 'string') {
        if (value === 'true') coerced[key] = true;
        else if (value === 'false') coerced[key] = false;
      } else if (baseType === 'ZodArray' && typeof value === 'string') {
        coerced[key] = value.split(',').map((s: string) => s.trim());
      }
    }

    return coerced;
  }

  /**
   * Extract the shape object from a Zod schema, unwrapping wrappers
   * like ZodDefault, ZodOptional, ZodEffects, etc.
   *
   * @internal
   */
  private extractZodShape(schema: any): Record<string, any> | null {
    if (!schema?._def) return null;

    // ZodObject — has shape directly
    if (schema._def.shape) {
      return typeof schema._def.shape === 'function' ? schema._def.shape() : schema._def.shape;
    }

    // ZodEffects, ZodDefault, ZodOptional — unwrap inner schema
    if (schema._def.schema) {
      return this.extractZodShape(schema._def.schema);
    }
    if (schema._def.innerType) {
      return this.extractZodShape(schema._def.innerType);
    }

    return null;
  }

  /**
   * Get the base Zod type name for a field schema, unwrapping
   * wrappers like ZodDefault, ZodOptional, ZodNullable, etc.
   *
   * @internal
   */
  private getZodBaseType(schema: any): string | null {
    if (!schema?._def) return null;

    const typeName = schema._def.typeName;

    // Unwrap wrapper types to find the base type
    if (typeName === 'ZodDefault' || typeName === 'ZodOptional' || typeName === 'ZodNullable') {
      return this.getZodBaseType(schema._def.innerType);
    }

    if (typeName === 'ZodEffects') {
      return this.getZodBaseType(schema._def.schema);
    }

    return typeName ?? null;
  }

  /**
   * Stringify a typed object to a URL search string.
   *
   * Serializes query parameters to a URL search string.
   * Skips `null`, `undefined`, and empty string values.
   *
   * @param params - Object of query parameters
   * @param config - Optional configuration for stringifying
   * @returns URL search string (without leading `?`)
   *
   * @example
   * ```typescript
   * queryService.stringifyQuery({ page: 1, search: 'react' });
   * // 'page=1&search=react'
   *
   * queryService.stringifyQuery({ page: 1, search: null });
   * // 'page=1'
   *
   * queryService.stringifyQuery({ tags: ['react', 'typescript'] });
   * // 'tags=react,typescript'
   * ```
   */
  stringifyQuery(params: Record<string, any>, _config?: QueryConfig): string {
    // Filter out null/undefined values
    const filteredParams: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        filteredParams[key] = value;
      }
    }

    // Serialize to URL search string
    return QuerySerializer.serializeParams(filteredParams);
  }

  /**
   * Merge new query parameters with existing ones.
   *
   * Combines new parameters with existing parameters from the URL.
   * Optionally preserves unknown parameters not in the schema.
   *
   * @param currentSearch - Current URL search string
   * @param newParams - New parameters to merge
   * @param config - Optional configuration for merging
   * @returns Merged URL search string
   *
   * @example
   * ```typescript
   * // Current URL: /posts?page=1&utm_source=email
   * queryService.mergeQuery(
   *   '?page=1&utm_source=email',
   *   { page: 2 },
   *   { preserveOthers: true }
   * );
   * // 'page=2&utm_source=email'
   *
   * queryService.mergeQuery(
   *   '?page=1&utm_source=email',
   *   { page: 2 },
   *   { preserveOthers: false }
   * );
   * // 'page=2'
   * ```
   */
  mergeQuery(currentSearch: string, newParams: Record<string, any>, config?: QueryConfig): string {
    // Parse current query params
    const currentParams = QuerySerializer.deserializeParams(currentSearch);

    // Determine which params to preserve
    let mergedParams: Record<string, any>;

    if (config?.preserveOthers === false) {
      // Only keep new params
      mergedParams = { ...newParams };
    } else {
      // Merge current and new params (new params override)
      mergedParams = { ...currentParams, ...newParams };
    }

    // Stringify merged params
    return this.stringifyQuery(mergedParams, config);
  }

  /**
   * Validate query parameters against a Zod schema.
   *
   * Checks if the given parameters are valid according to the schema.
   * Returns validation result with success flag and data/error.
   *
   * @template T - Type of the query parameters object
   * @param params - Query parameters to validate
   * @param schema - Zod schema for validation
   * @returns Validation result with success flag and data/error
   *
   * @example
   * ```typescript
   * const schema = z.object({
   *   page: z.number().min(1),
   *   search: z.string().optional()
   * });
   *
   * const result = queryService.validateQuery({ page: 1 }, schema);
   * if (result.success) {
   *   console.log('Valid:', result.data);
   * } else {
   *   console.error('Invalid:', result.error);
   * }
   * ```
   */
  validateQuery<T>(
    params: Record<string, any>,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; error: z.ZodError } {
    try {
      const data = schema.parse(params);
      return { success: true, data };
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return { success: false, error: error as z.ZodError };
      }
      throw error;
    }
  }

  /**
   * Extract specific query parameters from a URL search string.
   *
   * Parses the search string and returns only the specified parameters.
   * Useful for extracting a subset of parameters.
   *
   * @param search - URL search string
   * @param keys - Array of parameter keys to extract
   * @returns Object with only the specified parameters
   *
   * @example
   * ```typescript
   * // URL: /posts?page=1&search=react&utm_source=email
   * queryService.extractParams('?page=1&search=react&utm_source=email', ['page', 'search']);
   * // { page: '1', search: 'react' }
   * ```
   */
  extractParams(search: string, keys: string[]): Record<string, any> {
    const allParams = QuerySerializer.deserializeParams(search);
    const extracted: Record<string, any> = {};

    for (const key of keys) {
      if (key in allParams) {
        extracted[key] = allParams[key];
      }
    }

    return extracted;
  }

  /**
   * Remove specific query parameters from a URL search string.
   *
   * Parses the search string and removes the specified parameters.
   * Returns a new search string without those parameters.
   *
   * @param search - URL search string
   * @param keys - Array of parameter keys to remove
   * @returns URL search string without the specified parameters
   *
   * @example
   * ```typescript
   * // URL: /posts?page=1&search=react&utm_source=email
   * queryService.removeParams('?page=1&search=react&utm_source=email', ['utm_source']);
   * // 'page=1&search=react'
   * ```
   */
  removeParams(search: string, keys: string[]): string {
    const allParams = QuerySerializer.deserializeParams(search);
    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(allParams)) {
      if (!keys.includes(key)) {
        filtered[key] = value;
      }
    }

    return this.stringifyQuery(filtered);
  }
}
