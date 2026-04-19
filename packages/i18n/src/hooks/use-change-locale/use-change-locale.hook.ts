/**
 * useChangeLocale Hook
 *
 * Provides locale switching functionality with loading and error state.
 * Mirrors the `useTenantSwitch` hook pattern from
 * `@stackra/react-multitenancy`.
 *
 * @module hooks/use-change-locale
 *
 * @example
 * ```tsx
 * import { useChangeLocale } from '@stackra/react-i18n';
 *
 * const LanguageSwitcher = () => {
 *   const { changeLocale, isChanging } = useChangeLocale();
 *
 *   return (
 *     <button
 *       onClick={() => changeLocale('ar')}
 *       disabled={isChanging}
 *     >
 *       {isChanging ? 'Switching...' : 'العربية'}
 *     </button>
 *   );
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import { useI18nContext } from '@/contexts';

/**
 * Options for the {@link useChangeLocale} hook.
 */
export interface UseChangeLocaleOptions {
  /**
   * Callback invoked after a successful locale change.
   *
   * @param language - The new active language code
   *
   * @example
   * ```typescript
   * onSuccess: (lang) => {
   *   toast.success(`Switched to ${lang}`);
   *   document.documentElement.lang = lang;
   * }
   * ```
   */
  onSuccess?: (language: string) => void;

  /**
   * Callback invoked if the locale change fails.
   *
   * @param error - The error that occurred
   *
   * @example
   * ```typescript
   * onError: (error) => {
   *   toast.error(error.message);
   * }
   * ```
   */
  onError?: (error: Error) => void;
}

/**
 * Return type for the {@link useChangeLocale} hook.
 */
export interface UseChangeLocaleReturn {
  /**
   * Function to switch to a different locale.
   *
   * @param language - Language code to switch to
   * @returns Resolves when the switch is complete
   * @throws {Error} If the locale change fails
   *
   * @example
   * ```typescript
   * await changeLocale('ar');
   * ```
   */
  changeLocale(language: string): Promise<void>;

  /**
   * Whether a locale change is currently in progress.
   */
  isChanging: boolean;

  /**
   * Error that occurred during the last locale change attempt.
   *
   * `undefined` when no error has occurred.
   */
  error: Error | undefined;
}

/**
 * Hook to switch locales with loading and error state.
 *
 * Wraps the context's `changeLocale` with `useState` for `isChanging`
 * and `error` tracking, plus optional `onSuccess`/`onError` callbacks.
 *
 * @param options - Optional callbacks for success and error
 * @returns Locale switching function and state
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { changeLocale, isChanging } = useChangeLocale();
 *
 * <button onClick={() => changeLocale('ar')} disabled={isChanging}>
 *   {isChanging ? 'Switching...' : 'العربية'}
 * </button>
 * ```
 *
 * @example
 * ```tsx
 * // With callbacks
 * const { changeLocale, error } = useChangeLocale({
 *   onSuccess: (lang) => toast.success(`Language: ${lang}`),
 *   onError: (err) => toast.error(err.message),
 * });
 *
 * {error && <Alert>{error.message}</Alert>}
 * ```
 *
 * @example
 * ```tsx
 * // Language selector with useLocale
 * const { locale, languages } = useLocale();
 * const { changeLocale, isChanging } = useChangeLocale();
 *
 * <select
 *   value={locale}
 *   onChange={(e) => changeLocale(e.target.value)}
 *   disabled={isChanging}
 * >
 *   {languages.map((lang) => (
 *     <option key={lang} value={lang}>{lang}</option>
 *   ))}
 * </select>
 * ```
 */
export const useChangeLocale = (options: UseChangeLocaleOptions = {}): UseChangeLocaleReturn => {
  const { onSuccess, onError } = options;

  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  let contextChangeLocale: ((language: string) => Promise<void>) | undefined;

  try {
    const ctx = useI18nContext();
    contextChangeLocale = ctx.changeLocale;
  } catch {
    // Used outside I18nProvider — changeLocale will throw
    console.warn('[useChangeLocale] Used outside I18nProvider');
  }

  /**
   * Switch to a different locale with loading/error tracking.
   */
  const changeLocale = useCallback(
    async (language: string): Promise<void> => {
      if (!contextChangeLocale) {
        throw new Error('[i18n] useChangeLocale must be used within <I18nProvider>');
      }

      try {
        setIsChanging(true);
        setError(undefined);

        await contextChangeLocale(language);

        onSuccess?.(language);
      } catch (err) {
        const changeError = err instanceof Error ? err : new Error(String(err));
        setError(changeError);
        console.error('[useChangeLocale] Error:', changeError);

        onError?.(changeError);
        throw changeError;
      } finally {
        setIsChanging(false);
      }
    },
    [contextChangeLocale, onSuccess, onError]
  );

  return {
    changeLocale,
    isChanging,
    error,
  };
};
