import type { BaseKey } from '@refinedev/core';
import type { TenantResolver } from '@/interfaces';

/**
 * Creates a resolver chain that executes resolvers in priority order.
 *
 * @description
 * The resolver chain tries each resolver in ascending priority order (lower number = higher priority)
 * until one returns a tenant ID. If a resolver throws an error, it logs a warning and continues
 * to the next resolver. If all resolvers fail or return undefined, the chain returns undefined.
 *
 * This implements a fail-fast (stop at first success) and fail-safe (continue on error) pattern.
 *
 * @param resolvers - Array of tenant resolvers to chain together
 * @returns A function that executes the resolver chain and returns the tenant ID or undefined
 *
 * @example
 * ```typescript
 * import { createResolverChain } from "@stackra-inc/react-multitenancy";
 *
 * const resolvers = [
 *   new SubdomainResolver(config),
 *   new RouterResolver(config),
 *   new HeaderResolver(config),
 * ];
 *
 * const resolverChain = createResolverChain(resolvers);
 *
 * // Execute the chain
 * const tenantId = await resolverChain();
 * console.log("Resolved tenant:", tenantId);
 * ```
 *
 * @example
 * ```typescript
 * // With custom resolvers
 * const customResolver: TenantResolver = {
 *   name: "custom",
 *   priority: 1,
 *   resolve: async () => {
 *     const response = await fetch("/api/current-tenant");
 *     const data = await response.json();
 *     return data.tenantId;
 *   },
 * };
 *
 * const chain = createResolverChain([customResolver, ...builtInResolvers]);
 * const tenantId = await chain();
 * ```
 *
 * @remarks
 * - Resolvers are sorted by priority in ascending order (1, 2, 3, ...)
 * - The chain stops at the first resolver that returns a non-undefined value
 * - Errors are caught and logged, allowing the chain to continue
 * - Both synchronous and asynchronous resolvers are supported
 * - Performance: O(1) best case, O(n) worst case where n is number of resolvers
 *
 * @public
 */
export function createResolverChain(
  resolvers: TenantResolver[]
): () => Promise<BaseKey | undefined> {
  // Sort resolvers by priority (ascending: 1, 2, 3, ...)
  const sortedResolvers = [...resolvers].sort((a, b) => a.priority - b.priority);

  return async (): Promise<BaseKey | undefined> => {
    for (const resolver of sortedResolvers) {
      try {
        // Try to resolve tenant ID
        const result = await resolver.resolve();

        // If resolver returns a value, stop and return it
        if (result !== undefined) {
          return result;
        }
      } catch (error) {
        // Log error but continue to next resolver (fail-safe)
        console.warn(`[MultiTenancy] Resolver "${resolver.name}" failed:`, error);
      }
    }

    // All resolvers failed or returned undefined
    return undefined;
  };
}
