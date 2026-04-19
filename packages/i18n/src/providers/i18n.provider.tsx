/**
 * i18n React Provider Component
 *
 * Wraps the React component tree with i18n state. Uses `useInject(I18N_SERVICE)`
 * from `@stackra/ts-container` to resolve the service from the DI container
 * automatically.
 *
 * On mount:
 * 1. Resolves the initial locale via the resolver chain
 * 2. Switches i18next to the resolved locale
 * 3. Sets `document.dir` and `document.documentElement.lang` automatically
 * 4. Listens for language change events to keep state and document in sync
 *
 * RTL languages (Arabic, Hebrew, Farsi, Urdu, etc.) are detected automatically
 * and the document direction is updated without any manual callback.
 *
 * @module providers/i18n
 *
 * @example
 * ```tsx
 * import { I18nProvider } from '@stackra/react-i18n';
 *
 * // Inside <ContainerProvider> — service is resolved automatically
 * <ContainerProvider context={app}>
 *   <I18nProvider>
 *     <App />
 *   </I18nProvider>
 * </ContainerProvider>
 * ```
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useInject } from '@stackra/ts-container';

import { I18N_SERVICE } from '@/constants';
import { I18nContext } from '@/contexts/i18n.context';
import type { II18nService } from '@/interfaces/i18n-service.interface';
import type { II18nContext } from '@/interfaces/i18n-context.interface';

// ── Provider Props ─────────────────────────────────────────────────────────

/**
 * Props for the `<I18nProvider>` component.
 */
export interface I18nProviderProps {
  /**
   * Optional: pass the i18n service explicitly instead of resolving via DI.
   *
   * When omitted (recommended), the service is resolved automatically
   * from the DI container using `useInject(I18N_SERVICE)`.
   *
   * Only use this prop for testing or when running outside `<ContainerProvider>`.
   */
  service?: II18nService;

  /**
   * Child components that will have access to the i18n context.
   */
  children: React.ReactNode;
}

// ── Document Direction Helper ──────────────────────────────────────────────

/**
 * Update the document's `dir` and `lang` attributes.
 *
 * Called automatically on initialization and on every language change.
 * Sets `dir="rtl"` for RTL languages, `dir="ltr"` otherwise.
 *
 * @param locale - The active locale code
 * @param isRTL - Whether the locale is a right-to-left language
 *
 * @internal
 */
function updateDocumentDirection(locale: string, isRTL: boolean): void {
  if (typeof document === 'undefined') return;

  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
}

// ── Provider Component ─────────────────────────────────────────────────────

/**
 * i18n Context Provider
 *
 * Resolves the `I18nService` from the DI container via `useInject()`,
 * initializes the locale, and provides context to all children.
 *
 * RTL direction is handled automatically — no manual `onSuccess` callback
 * needed. The provider sets `document.dir` and `document.documentElement.lang`
 * on initialization and on every language change.
 *
 * @param props - Provider props (children required, service optional)
 *
 * @example
 * ```tsx
 * // Typical usage — inside ContainerProvider, service auto-resolved
 * <ContainerProvider context={app}>
 *   <I18nProvider>
 *     <App />
 *   </I18nProvider>
 * </ContainerProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Testing — pass a mock service directly
 * <I18nProvider service={mockI18nService}>
 *   <ComponentUnderTest />
 * </I18nProvider>
 * ```
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ service: serviceProp, children }) => {
  // Resolve the service from the DI container, or use the prop if provided
  const injectedService = useInject<II18nService>(I18N_SERVICE);
  const service = serviceProp ?? injectedService;

  const [locale, setLocale] = useState<string>(service.getLocale());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Initialization
  |--------------------------------------------------------------------------
  |
  | On mount: resolve locale via the chain, switch i18next, set document
  | direction, update state.
  |
  */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Resolve locale from configured resolvers (URL, storage, navigator, etc.)
        const resolvedLocale = await service.resolveLocale();

        // Switch i18next to the resolved locale if different from current
        if (resolvedLocale !== service.getLocale()) {
          await service.changeLocale(resolvedLocale);
        }

        setLocale(resolvedLocale);

        // Auto-set document direction and lang attribute
        updateDocumentDirection(resolvedLocale, service.isRTL());
      } catch (err) {
        const initError = err instanceof Error ? err : new Error(String(err));
        setError(initError);
        console.error('[I18nProvider] Initialization error:', initError);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [service]);

  /*
  |--------------------------------------------------------------------------
  | Language Change Listener
  |--------------------------------------------------------------------------
  |
  | Keep React state and document direction in sync when i18next language
  | changes (e.g. from middleware response sync or direct API call).
  |
  */
  useEffect(() => {
    service.onLanguageChanged((newLocale) => {
      setLocale(newLocale);

      // Auto-update document direction on every language change
      updateDocumentDirection(newLocale, service.isRTL());
    });
  }, [service]);

  /*
  |--------------------------------------------------------------------------
  | changeLocale callback
  |--------------------------------------------------------------------------
  */
  const changeLocale = useCallback(
    async (language: string): Promise<void> => {
      try {
        setError(null);
        await service.changeLocale(language);
        setLocale(language);

        // Auto-update document direction
        updateDocumentDirection(language, service.isRTL());
      } catch (err) {
        const changeError = err instanceof Error ? err : new Error(String(err));
        setError(changeError);
        console.error('[I18nProvider] Change locale error:', changeError);
        throw changeError;
      }
    },
    [service]
  );

  /*
  |--------------------------------------------------------------------------
  | Memoized context value
  |--------------------------------------------------------------------------
  */
  const value = useMemo<II18nContext>(
    () => ({
      service,
      locale,
      languages: service.getLanguages(),
      isRTL: service.isRTL(),
      t: (key: string, options?: Record<string, any>) => service.t(key, options),
      __: (key: string) => service.__(key),
      trans: (key: string, options?: Record<string, any>) => service.trans(key, options),
      changeLocale,
      isLoading,
      error,
    }),
    [service, locale, changeLocale, isLoading, error]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default I18nProvider;
