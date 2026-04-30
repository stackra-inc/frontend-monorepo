/**
 * @stackra/vite-config
 *
 * Production-ready Vite configuration with sensible defaults and
 * a flat plugin system for the Stackra ecosystem.
 *
 * Ships a complete config (server, build, CSS, esbuild, optimizeDeps,
 * logging) — consumers only override what they need.
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { defineConfig } from '@stackra/vite-config';
 * import react from '@vitejs/plugin-react-swc';
 * import tsconfigPaths from 'vite-tsconfig-paths';
 * import tailwindcss from '@tailwindcss/vite';
 *
 * export default defineConfig({
 *   plugins: {
 *     env: true,
 *     typeGen: true,
 *     decoratorDiscovery: true,
 *     react: react({ tsDecorators: true }),
 *     tsconfigPaths: tsconfigPaths(),
 *     tailwindcss: tailwindcss(),
 *   },
 * });
 * ```
 */

// ============================================================================
// Core
// ============================================================================

export { defineConfig } from './define-config';
export { createDefaults } from './defaults';

// ============================================================================
// Interfaces
// ============================================================================

export type { StackraOptions, PluginMap } from './interfaces';

// ============================================================================
// Plugin Factories (standalone usage)
// ============================================================================

export { decoratorDiscovery, ngrok, qrcode, env, typeGen } from './plugins';
export type {
  DecoratorDiscoveryOptions,
  INgrokPluginOptions,
  IQRCodePluginOptions,
  ISupportEnvPluginOptions,
  ITypeGenPluginOptions,
} from './plugins';
