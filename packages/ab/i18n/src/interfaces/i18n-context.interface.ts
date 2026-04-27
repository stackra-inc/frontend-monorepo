/**
 * i18n Context Interface
 *
 * Shape of the React context value provided by `<I18nProvider>`.
 * Consumed via {@link useI18nContext}, {@link useLocale},
 * {@link useTranslation}, and {@link useChangeLocale} hooks.
 *
 * Mirrors the `IMultiTenancyContext` pattern from
 * `@stackra/react-multitenancy`.
 *
 * @module interfaces/i18n-context
 *
 * @example
 * ```typescript
 * import { useI18nContext } from '@stackra/react-i18n';
 *
 * const MyComponent = () => {
 *   const ctx = useI18nContext();
 *
 *   if (ctx.isLoading) return <Spinner />;
 *   if (ctx.error) return <Alert>{ctx.error.message}</Alert>;
 *
 *   return <h1>{ctx.t('greeting')}</h1>;
 * };
 * ```
 */

import type { II18nService } from "./i18n-service.interface";

/**
 * Context value provided by the `<I18nProvider>` component.
 *
 * Contains the i18n service instance, current locale state,
 * translation functions, and loading/error state.
 */
export interface II18nContext {
  /*
  |--------------------------------------------------------------------------
  | Service
  |--------------------------------------------------------------------------
  */

  /**
   * The underlying i18n service instance.
   *
   * Provides full access to the service API for advanced usage.
   * Prefer using the convenience properties below for common operations.
   */
  service: II18nService;

  /*
  |--------------------------------------------------------------------------
  | Locale State
  |--------------------------------------------------------------------------
  */

  /**
   * Currently active locale code.
   *
   * @example `'en'`, `'ar'`, `'es'`
   */
  locale: string;

  /**
   * All supported language codes.
   *
   * @example `['en', 'ar', 'es']`
   */
  languages: string[];

  /**
   * Whether the current locale is a right-to-left language.
   *
   * @example `true` for Arabic, Hebrew; `false` for English, Spanish
   */
  isRTL: boolean;

  /*
  |--------------------------------------------------------------------------
  | Translation Functions
  |--------------------------------------------------------------------------
  */

  /**
   * Translate a key with optional interpolation.
   *
   * @param key - Translation key
   * @param options - Optional i18next options
   * @returns Translated string
   *
   * @example
   * ```typescript
   * ctx.t('greeting', { name: 'John' }) // "Welcome, John!"
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

  /*
  |--------------------------------------------------------------------------
  | Locale Switching
  |--------------------------------------------------------------------------
  */

  /**
   * Change the active locale.
   *
   * @param language - Language code to switch to
   * @returns Resolves when the language change is complete
   *
   * @example
   * ```typescript
   * await ctx.changeLocale('ar');
   * ```
   */
  changeLocale(language: string): Promise<void>;

  /*
  |--------------------------------------------------------------------------
  | Loading & Error State
  |--------------------------------------------------------------------------
  */

  /**
   * Whether the i18n system is currently initializing.
   *
   * `true` during initial locale resolution and i18next setup.
   */
  isLoading: boolean;

  /**
   * Error that occurred during initialization or locale change.
   *
   * `null` when no error has occurred.
   */
  error: Error | null;
}
