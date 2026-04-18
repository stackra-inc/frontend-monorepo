/**
 * i18n React Context
 *
 * Defines the React context and the `useI18nContext` hook.
 * The actual provider component lives in `providers/i18n.provider.tsx`.
 *
 * @module contexts/i18n
 */

import { createContext, useContext } from 'react';

import type { II18nContext } from '@/interfaces/i18n-context.interface';

// ── Context ────────────────────────────────────────────────────────────────

/**
 * React context holding the i18n state.
 *
 * `undefined` when accessed outside of `<I18nProvider>`.
 */
export const I18nContext = createContext<II18nContext | undefined>(undefined);

// ── Context Hook ───────────────────────────────────────────────────────────

/**
 * Hook to access the raw i18n context.
 *
 * Prefer the convenience hooks ({@link useLocale}, {@link useTranslation},
 * {@link useChangeLocale}) for most use cases.
 *
 * @returns The full i18n context value
 * @throws {Error} If used outside of `<I18nProvider>`
 *
 * @example
 * ```tsx
 * const ctx = useI18nContext();
 * return <h1>{ctx.t('greeting')}</h1>;
 * ```
 */
export const useI18nContext = (): II18nContext => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      '[i18n] useI18nContext must be used within <I18nProvider>. ' +
        'Wrap your component tree with <I18nProvider>.'
    );
  }

  return context;
};
