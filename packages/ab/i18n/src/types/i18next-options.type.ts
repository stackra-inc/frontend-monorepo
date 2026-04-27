/**
 * i18next Options Type
 *
 * Comprehensive type definition covering all available i18next
 * initialization options. Based on the official i18next documentation.
 *
 * @see https://www.i18next.com/overview/configuration-options
 * @module types/i18next-options
 */

/**
 * Comprehensive i18next configuration options type
 * Includes all available i18next initialization options
 * Based on official i18next documentation
 * @see https://www.i18next.com/overview/configuration-options
 *
 * @example
 * ```typescript
 * const options: I18nextOptions = {
 *   lng: 'en',
 *   fallbackLng: 'en',
 *   ns: ['translation', 'common'],
 *   defaultNS: 'translation',
 *   debug: false,
 *   interpolation: { escapeValue: false },
 *   backend: {
 *     loadPath: '/locales/{{lng}}/{{ns}}.json'
 *   }
 * };
 * ```
 */
export type I18nextOptions = {
  /**
   * The language to initialize i18next with
   * @default 'en'
   */
  lng?: string;

  /**
   * Language to use if detected language is not available
   * @default 'en'
   */
  fallbackLng?: string | string[] | Record<string, string[]>;

  /**
   * Array of namespaces to load
   * @default ['translation']
   */
  ns?: string[];

  /**
   * Default namespace to use if not specified
   * @default 'translation'
   */
  defaultNS?: string;

  /**
   * Enable debugging output to console
   * @default false
   */
  debug?: boolean;

  /**
   * Load resources immediately on init
   * @default false
   */
  initImmediate?: boolean;

  /**
   * Type of backend to use ('xhr' | 'fetch' | 'backend' | ...)
   * @default undefined
   */
  backend?: any;

  /**
   * Language detector configuration
   * @default undefined
   */
  detection?: any;

  /**
   * Cache user language selection
   * @default true
   */
  cache?: {
    enabled?: boolean;
  };

  /**
   * Interpolation options for dynamic values
   * @example { prefix: '{{', suffix: '}}', escapeValue: true }
   */
  interpolation?: {
    /**
     * Escape values by default
     * @default true
     */
    escapeValue?: boolean;
    /**
     * Prefix for interpolation
     * @default '{{'
     */
    prefix?: string;
    /**
     * Suffix for interpolation
     * @default '}}'
     */
    suffix?: string;
    /**
     * Suffix for format function
     * @default ', '
     */
    formatSeparator?: string;
    /**
     * Unescaped suffix for raw HTML
     * @default '-'
     */
    unescapeSuffix?: string;
    /**
     * Unescaped prefix for raw HTML
     * @default '-'
     */
    unescapePrefix?: string;
    [key: string]: any;
  };

  /**
   * Pluralization rules
   * @default undefined
   */
  pluralSeparator?: string;

  /**
   * Context separator
   * @default '_'
   */
  contextSeparator?: string;

  /**
   * Array of languages not to bundle
   * @default []
   */
  preload?: string[];

  /**
   * Additional ns-based fallback structure
   * @default false
   */
  nonExplicitSupportedLngs?: boolean;

  /**
   * Language detection order
   */
  load?: "all" | "currentOnly" | "languageOnly";

  /**
   * Key separator for nested keys
   * @default '.'
   */
  keySeparator?: string | false;

  /**
   * Namespace separator
   * @default ':'
   */
  nsSeparator?: string | false;

  /**
   * Parse keys or keep them as strings
   * @default true
   */
  parseMissingKeyHandler?: (key: string) => string;

  /**
   * Append namespace to missing keys
   * @default false
   */
  appendNamespaceToCIMode?: boolean;

  /**
   * Safe mode - don't throw errors
   * @default false
   */
  safeMode?: boolean;

  /**
   * Resources to load on initialization
   */
  resources?: any;

  /**
   * Storage backend for detected language
   */
  cacheUserLanguage?: boolean;

  /**
   * React-i18next config
   */
  react?: {
    /**
     * Wait for i18next to finish initialization before rendering
     * @default true
     */
    useSuspense?: boolean;
    /**
     * Use binding in HOC
     * @default true
     */
    bindI18n?: string;
    /**
     * Event to watch for i18nStore changes
     * @default 'languageChanged'
     */
    bindI18nStore?: string;
    /**
     * Bind translation store to the component
     * @default 'translation'
     */
    transEmitter?: any;
    /**
     * How to handle translation event binding
     * @default false
     */
    transSupportBasicHtmlNodes?: boolean;
    /**
     * Array of HTML tags to use when translating trans component
     * @default []
     */
    transKeepBasicHtmlNodesFor?: string[];
  };

  /**
   * Additional custom options
   */
  [key: string]: any;
};
