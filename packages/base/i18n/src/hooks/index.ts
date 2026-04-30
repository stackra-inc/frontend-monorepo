/**
 * Hooks Barrel Export
 *
 * React hooks for consuming the i18n context.
 *
 * - {@link useLocale} — Current locale, languages, RTL direction
 * - {@link useTranslation} — Translation functions (`t`, `__`, `trans`)
 * - {@link useChangeLocale} — Locale switching with loading/error state
 *
 * @module hooks
 */

export { useLocale } from './use-locale';
export type { UseLocaleReturn } from './use-locale';

export { useTranslation } from './use-translation';
export type { UseTranslationReturn } from './use-translation';

export { useChangeLocale } from './use-change-locale';
export type { UseChangeLocaleOptions, UseChangeLocaleReturn } from './use-change-locale';
