/**
 * Default Configuration Constants
 *
 * Provides production-ready default values for both the Vite plugin
 * options and the underlying i18next initialization configuration.
 *
 * ## Environment Variables
 *
 * | Variable         | Description                          | Default       |
 * |------------------|--------------------------------------|---------------|
 * | `NODE_ENV`       | Controls HMR default (`production` disables it) | — |
 *
 * @module constants/default-config
 */

import type { I18nextConfig } from '@/interfaces';

/**
 * Default plugin configuration values.
 *
 * Used as the base when the consumer does not provide specific options.
 * Every field is populated so downstream code can rely on
 * `Required<I18nPluginOptions>` after validation.
 *
 * @example
 * ```typescript
 * import { DEFAULT_PLUGIN_OPTIONS } from '@stackra/react-i18n';
 *
 * const merged = { ...DEFAULT_PLUGIN_OPTIONS, ...userOptions };
 * ```
 */
// SWC workaround: `include` and `exclude` as property names trigger a parser bug.
// Extract to variables first, then assign.
const defaultInclude = ['**/i18n/**/*.{json,js,ts}'];
const defaultExclude = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/build/**',
  '**/.turbo/**',
];

export const DEFAULT_PLUGIN_OPTIONS = {
  /** @default 'en' */
  defaultLanguage: 'en',

  /** @default ['en'] */
  languages: ['en'],

  /** Searches relative to project root by default. */
  resourcesPath: process.cwd(),

  /** Glob patterns targeting i18n directories. */
  include: defaultInclude,

  /** Skips node_modules, dist, .next, build, and .turbo. */
  exclude: defaultExclude,

  /** Enabled in non-production environments. */
  enableHMR: typeof process !== 'undefined' ? process.env?.NODE_ENV !== 'production' : true,

  /** Generates `.d.ts` files for translation key autocomplete. */
  typeGeneration: true,

  /** @default '.stackra-inc/react-i18n/types' */
  typeOutputDir: '.stackra-inc/react-i18n/types',

  /** @default false */
  debug: false,

  /** @default 'translation' */
  defaultNamespace: 'translation',

  /** @default false */
  useHttpBackend: false,

  /** Must be provided when `useHttpBackend` is `true`. */
  backendUrl: '',

  /** Auto-detects language from browser / localStorage. */
  useBrowserLanguageDetector: true,

  /** Pass-through for any additional i18next init options. */
  i18nextOptions: {},
};

/**
 * Default i18next initialization configuration.
 *
 * Serves as the base before user options are merged in by
 * {@link buildI18nextConfig}. Values follow i18next conventions and
 * are safe for React projects (e.g. `escapeValue: false`).
 *
 * @example
 * ```typescript
 * import { DEFAULT_I18NEXT_CONFIG } from '@stackra/react-i18n';
 *
 * const config = { ...DEFAULT_I18NEXT_CONFIG, lng: 'ar' };
 * ```
 */
export const DEFAULT_I18NEXT_CONFIG: I18nextConfig = {
  /** @default 'en' */
  lng: 'en',

  /** @default 'en' */
  fallbackLng: 'en',

  /** @default ['translation'] */
  ns: ['translation'],

  /** @default 'translation' */
  defaultNS: 'translation',

  /** @default false */
  debug: false,

  /** @default true */
  initImmediate: true,

  /**
   * Interpolation settings.
   * `escapeValue` is `false` because React already escapes by default.
   */
  interpolation: {
    escapeValue: false,
    prefix: '{{',
    suffix: '}}',
    formatSeparator: ',',
  },

  /** Dot-notation separator for nested keys. */
  keySeparator: '.',

  /** Colon separator between namespace and key. */
  nsSeparator: ':',

  /** React-i18next integration defaults. */
  react: {
    useSuspense: true,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added removed',
  },
};
