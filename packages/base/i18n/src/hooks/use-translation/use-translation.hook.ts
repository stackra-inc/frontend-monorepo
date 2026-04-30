/**
 * useTranslation Hook
 *
 * Provides access to translation functions from the i18n context.
 * Returns `t()`, `__()`, and `trans()` bound to the current i18next
 * instance and locale.
 *
 * @module hooks/use-translation
 *
 * @example
 * ```tsx
 * import { useTranslation } from '@stackra/react-i18n';
 *
 * const Greeting = () => {
 *   const { t } = useTranslation();
 *
 *   return <h1>{t('greeting', { name: 'John' })}</h1>;
 * };
 * ```
 */

import { useI18nContext } from '@/contexts';

/**
 * Return type for the {@link useTranslation} hook.
 */
export interface UseTranslationReturn {
  /**
   * Translate a key with optional interpolation.
   *
   * @param key - Translation key
   * @param options - Optional i18next options
   * @returns Translated string
   *
   * @example
   * ```typescript
   * t('greeting');                   // "Hello"
   * t('welcome', { name: 'John' }); // "Welcome, John!"
   * ```
   */
  t(key: string, options?: Record<string, any>): string;

  /**
   * Simple translation function (alias for {@link t}).
   *
   * @param key - Translation key
   * @returns Translated string
   */
  __(key: string): string;

  /**
   * Translation function (alias for {@link t}).
   *
   * @param key - Translation key
   * @param options - Optional i18next options
   * @returns Translated string
   */
  trans(key: string, options?: Record<string, any>): string;

  /**
   * Whether the i18n system is currently initializing.
   *
   * When `true`, translation functions may return raw keys.
   */
  isLoading: boolean;
}

/**
 * Hook to access translation functions.
 *
 * Returns `t()`, `__()`, and `trans()` that are bound to the current
 * i18next instance. Re-renders when the locale changes so translations
 * are always up-to-date.
 *
 * @returns Translation functions and loading state
 *
 * @example
 * ```tsx
 * const { t, isLoading } = useTranslation();
 *
 * if (isLoading) return <Skeleton />;
 *
 * return (
 *   <div>
 *     <h1>{t('page.title')}</h1>
 *     <p>{t('page.description', { count: 5 })}</p>
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Using the __ shorthand
 * const { __ } = useTranslation();
 *
 * return <button>{__('common.save')}</button>;
 * ```
 *
 * @example
 * ```tsx
 * // With namespace override
 * const { t } = useTranslation();
 *
 * return <p>{t('auth:login.title')}</p>;
 * ```
 */
export const useTranslation = (): UseTranslationReturn => {
  try {
    const ctx = useI18nContext();

    return {
      t: ctx.t,
      __: ctx.__,
      trans: ctx.trans,
      isLoading: ctx.isLoading,
    };
  } catch (_error) {
    // Return safe defaults when used outside I18nProvider
    console.warn('[useTranslation] Used outside I18nProvider, returning safe defaults');

    // Identity function — returns the key as-is
    const identity = (key: string) => key;

    return {
      t: identity,
      __: identity,
      trans: identity,
      isLoading: false,
    };
  }
};
