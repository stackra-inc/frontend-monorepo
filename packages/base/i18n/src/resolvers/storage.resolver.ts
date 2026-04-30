/**
 * Storage Locale Resolver
 *
 * Reads the locale from a persistent storage mechanism (localStorage
 * by default). The storage key is configurable.
 *
 * This is the resolver that picks up the locale persisted by
 * `i18next-browser-languagedetector` or by the provider's
 * `changeLocale({ persist: true })` method.
 *
 * SSR-safe: returns `undefined` when storage is not available.
 *
 * @module resolvers/storage
 *
 * @example
 * ```typescript
 * import { StorageLocaleResolver } from '@stackra/react-i18n';
 *
 * // Default key ('i18nextLng') and localStorage
 * const resolver = new StorageLocaleResolver();
 *
 * // Custom key
 * const resolver = new StorageLocaleResolver({ storageKey: 'app_locale' });
 *
 * // Custom storage implementation (e.g. sessionStorage)
 * const resolver = new StorageLocaleResolver({
 *   storageKey: 'app_locale',
 *   storage: sessionStorage,
 * });
 * ```
 *
 * @remarks
 * - Priority: NORMAL (3)
 * - Performance: ~0ms (localStorage read)
 * - SSR-safe: returns `undefined` when storage is not available
 * - Default storage key: `'i18nextLng'` (matches i18next convention)
 */

import { LocaleResolverPriority } from '@/enums';
import type { ILocaleResolver } from './locale-resolver.interface';

/**
 * Configuration options for {@link StorageLocaleResolver}.
 */
export interface StorageLocaleResolverOptions {
  /**
   * Key used to read/write the locale in storage.
   *
   * @default 'i18nextLng'
   */
  storageKey?: string;

  /**
   * Storage implementation to use.
   *
   * Defaults to `window.localStorage` when available.
   * Pass `sessionStorage` or a custom `Storage`-compatible object
   * for alternative persistence strategies.
   *
   * @default localStorage
   */
  storage?: Storage;
}

/**
 * Resolver that reads locale from persistent storage.
 *
 * @example
 * ```typescript
 * const resolver = new StorageLocaleResolver({ storageKey: 'app_locale' });
 * // localStorage.getItem('app_locale') === 'ar' → 'ar'
 * // localStorage.getItem('app_locale') === null  → undefined
 * ```
 */
export class StorageLocaleResolver implements ILocaleResolver {
  /** @inheritdoc */
  public readonly name = 'storage';

  /** @inheritdoc */
  public readonly priority = LocaleResolverPriority.NORMAL;

  /**
   * Storage key for the locale value.
   *
   * @internal
   */
  private readonly storageKey: string;

  /**
   * Storage implementation (defaults to localStorage).
   *
   * @internal
   */
  private readonly storage: Storage | undefined;

  /**
   * Create a new storage locale resolver.
   *
   * @param options - Optional configuration for storage key and implementation
   */
  constructor(options?: StorageLocaleResolverOptions) {
    this.storageKey = options?.storageKey ?? 'i18nextLng';
    this.storage =
      options?.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  }

  /**
   * Resolve locale from storage.
   *
   * @returns Locale code from storage, or `undefined` if not found or storage unavailable
   */
  public resolve(): string | undefined {
    if (!this.storage) {
      return undefined;
    }

    try {
      const value = this.storage.getItem(this.storageKey);
      return value || undefined;
    } catch (error) {
      // Storage access can fail in private browsing mode or restrictive environments
      console.warn('[i18n] Failed to read locale from storage:', error);
      return undefined;
    }
  }
}
