/**
 * Locale Resolver Chain Factory
 *
 * Creates a function that executes locale resolvers in priority order
 * (ascending — lower number = higher priority) and returns the first
 * successfully resolved locale.
 *
 * Implements a fail-fast (stop at first success) and fail-safe
 * (continue on error) pattern, mirroring `createResolverChain` from
 * `@stackra/react-multitenancy`.
 *
 * @module utils/create-locale-resolver-chain
 */

import type { ILocaleResolver } from '@/resolvers/locale-resolver.interface';

/**
 * Create a locale resolver chain from an array of resolvers.
 *
 * The returned function tries each resolver in ascending priority order.
 * The first resolver that returns a non-`undefined` value wins. If a
 * resolver throws, the error is logged and the chain continues to the
 * next resolver. If all resolvers fail or return `undefined`, the chain
 * returns `undefined`.
 *
 * @param resolvers - Array of locale resolvers to chain together
 * @returns An async function that executes the chain and returns the resolved locale or `undefined`
 *
 * @example
 * ```typescript
 * import {
 *   createLocaleResolverChain,
 *   UrlPathLocaleResolver,
 *   StorageLocaleResolver,
 *   NavigatorLocaleResolver,
 * } from '@stackra/react-i18n';
 *
 * const resolveLocale = createLocaleResolverChain([
 *   new UrlPathLocaleResolver(),
 *   new StorageLocaleResolver(),
 *   new NavigatorLocaleResolver(),
 * ]);
 *
 * const locale = await resolveLocale(); // e.g. 'ar'
 * ```
 *
 * @example
 * ```typescript
 * // With custom resolvers mixed in
 * const chain = createLocaleResolverChain([
 *   { name: 'jwt', priority: 0, resolve: () => decodeJwt(token).locale },
 *   new UrlPathLocaleResolver(),
 *   new NavigatorLocaleResolver(),
 * ]);
 *
 * const locale = await chain();
 * ```
 */
export function createLocaleResolverChain(
  resolvers: ILocaleResolver[]
): () => Promise<string | undefined> {
  // Sort resolvers by priority ascending (1, 2, 3, ...)
  const sortedResolvers = [...resolvers].sort((a, b) => a.priority - b.priority);

  return async (): Promise<string | undefined> => {
    for (const resolver of sortedResolvers) {
      try {
        const result = await resolver.resolve();

        // First resolver that returns a value wins
        if (result !== undefined) {
          return result;
        }
      } catch (error) {
        // Log error but continue to next resolver (fail-safe)
        console.warn(`[i18n] Locale resolver "${resolver.name}" failed:`, error);
      }
    }

    // All resolvers failed or returned undefined
    return undefined;
  };
}
