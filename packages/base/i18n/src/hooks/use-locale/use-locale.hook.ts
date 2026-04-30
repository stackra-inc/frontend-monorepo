/**
 * useLocale Hook
 *
 * Provides access to the current locale state: active locale code,
 * available languages, and RTL direction.
 *
 * Mirrors the `useTenant` hook pattern from `@stackra/react-multitenancy`.
 *
 * @module hooks/use-locale
 *
 * @example
 * ```tsx
 * import { useLocale } from '@stackra/react-i18n';
 *
 * const LanguageSwitcher = () => {
 *   const { locale, languages, isRTL } = useLocale();
 *
 *   return (
 *     <div dir={isRTL ? 'rtl' : 'ltr'}>
 *       <p>Current: {locale}</p>
 *       <ul>
 *         {languages.map((lang) => (
 *           <li key={lang}>{lang}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * };
 * ```
 */

import { useI18nContext } from '@/contexts';

/**
 * Return type for the {@link useLocale} hook.
 */
export interface UseLocaleReturn {
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
   */
  isRTL: boolean;

  /**
   * Whether the i18n system is currently initializing.
   */
  isLoading: boolean;

  /**
   * Error that occurred during initialization.
   */
  error: Error | null;
}

/**
 * Hook to access the current locale state.
 *
 * Provides the active locale, available languages, RTL direction,
 * and loading/error state. Does not provide translation functions
 * or locale switching — use {@link useTranslation} and
 * {@link useChangeLocale} for those.
 *
 * @returns Locale state object
 *
 * @example
 * ```tsx
 * const { locale, languages, isRTL, isLoading } = useLocale();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <div dir={isRTL ? 'rtl' : 'ltr'}>
 *     <p>Language: {locale}</p>
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Set document direction based on locale
 * const { isRTL } = useLocale();
 *
 * useEffect(() => {
 *   document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
 * }, [isRTL]);
 * ```
 *
 * @example
 * ```tsx
 * // Language selector dropdown
 * const { locale, languages } = useLocale();
 * const { changeLocale } = useChangeLocale();
 *
 * return (
 *   <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
 *     {languages.map((lang) => (
 *       <option key={lang} value={lang}>{lang}</option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export const useLocale = (): UseLocaleReturn => {
  try {
    const ctx = useI18nContext();

    return {
      locale: ctx.locale,
      languages: ctx.languages,
      isRTL: ctx.isRTL,
      isLoading: ctx.isLoading,
      error: ctx.error,
    };
  } catch (_error) {
    // Return safe defaults when used outside I18nProvider
    console.warn('[useLocale] Used outside I18nProvider, returning safe defaults');

    return {
      locale: 'en',
      languages: ['en'],
      isRTL: false,
      isLoading: false,
      error: null,
    };
  }
};
