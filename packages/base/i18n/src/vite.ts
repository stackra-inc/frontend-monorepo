/**
 * Vite Plugin Entry Point
 *
 * Separate entry point for the i18n Vite plugin, consumed as:
 * `import { i18nPlugin } from '@stackra/react-i18n/vite'`
 *
 * Re-exports the plugin factory, its options type, and default options
 * so consumers don't need to reach into internal paths.
 *
 * @module vite
 */

export { i18nPlugin } from './adapters/vite.adapter';
export type { I18nPluginOptions } from './interfaces/i18n-plugin-options.interface';
export { DEFAULT_PLUGIN_OPTIONS } from './constants/default-config.constant';
