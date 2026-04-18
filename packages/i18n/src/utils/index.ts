/**
 * Utilities Barrel Export
 *
 * Centralized entry point for all utility functions.
 *
 * Standalone helpers (non-DI):
 * - {@link __}, {@link t}, {@link trans} — Translation functions
 * - {@link changeLanguage}, {@link getLanguage}, {@link getLanguages} — Language management
 * - {@link addResources} — Runtime resource injection
 * - {@link setupGlobalI18n}, {@link teardownGlobalI18n} — Global registration
 *
 * Build-time (Vite plugin):
 * - {@link validateConfig} — Plugin configuration validation
 * - {@link mergeDeep}, {@link deepClone} — Deep object manipulation
 * - {@link scanTranslationFiles} — File system scanner
 * - {@link buildI18nextConfig} — i18next configuration builder
 * - {@link generateTypeDefinitions} — TypeScript definition generator
 * - {@link resolvePath}, {@link normalizePaths} — Path resolution
 * - {@link generateVirtualModule} — Vite virtual module code generator
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
  isGlobalI18nSetup,
  setupGlobalI18n,
  teardownGlobalI18n,
} from './global-setup.util';

// ── Build-time utilities (Vite plugin) ─────────────────────────────────────

export { validateConfig } from './validate-config.util';
export { mergeDeep, deepClone } from './merge-deep.util';
export { scanTranslationFiles } from './file-scanner.util';
export { buildI18nextConfig } from './config-builder.util';
export { generateTypeDefinitions } from './type-generator.util';
export { resolvePath, normalizePaths } from './resolve-paths.util';
export { generateVirtualModule } from './virtual-module-generator.util';

// ── Locale resolver chain ──────────────────────────────────────────────────

export { createLocaleResolverChain } from './create-locale-resolver-chain.util';
