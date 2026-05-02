/**
 * Utilities Barrel Export
 *
 * Centralized entry point for all utility functions.
 *
 * Standalone helpers (non-DI):
 * - {@link __}, {@link t}, {@link trans} — Translation functions
 * - {@link changeLanguage}, {@link getLanguage}, {@link getLanguages} — Language management
 * - {@link addResources} — Runtime resource injection
 * - {@link bootI18nGlobals} — Register globals via GlobalRegistry
 *
 * Build-time (Vite plugin):
 * - {@link validateConfig} — Plugin configuration validation
 * - {@link mergeDeep}, {@link deepClone} — Deep object manipulation
 * - {@link scanTranslationFiles} — File system scanner
 * - {@link buildI18nextConfig} — i18next configuration builder
 * - {@link generateTypeDefinitions} — TypeScript definition generator
 * - {@link resolvePath}, {@link normalizePaths} — Path resolution
 *
 * Resolver:
 * - {@link createLocaleResolverChain} — Locale resolver chain factory
 *
 * @module utils
 */

// ── Standalone i18n helpers (non-DI) ───────────────────────────────────────

export {
  __,
  t,
  trans,
  i18next,
  changeLanguage,
  getLanguage,
  getLanguages,
  addResources,
  bootI18nGlobals,
} from './global-setup.util';

// ── Build-time utilities (Vite plugin) ─────────────────────────────────────

export { validateConfig } from './validate-config.util';
export { mergeDeep, deepClone } from './merge-deep.util';
export { scanTranslationFiles } from './file-scanner.util';
export { buildI18nextConfig } from './config-builder.util';
export { generateTypeDefinitions } from './type-generator.util';
export { resolvePath, normalizePaths } from './resolve-paths.util';

// ── Locale resolver chain ──────────────────────────────────────────────────

export { createLocaleResolverChain } from './create-locale-resolver-chain.util';

// ── Config helper ──────────────────────────────────────────────────────────

export { defineConfig } from './define-config.util';
