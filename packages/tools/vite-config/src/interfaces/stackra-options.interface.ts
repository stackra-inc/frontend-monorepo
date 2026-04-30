/**
 * Stackra Options Interface
 *
 * Extends Vite's `UserConfig` with a flat plugin map.
 * Consumers get full Vite IntelliSense (server, build, css, etc.)
 * plus Stackra's flat plugin system.
 *
 * @module interfaces/stackra-options
 */

import type { UserConfig, Plugin } from 'vite';
import type { DecoratorDiscoveryOptions } from '@/plugins/decorator-discovery';
import type { INgrokPluginOptions } from '@/plugins/ngrok';
import type { IQRCodePluginOptions } from '@/plugins/qrcode';
import type { ISupportEnvPluginOptions } from '@/plugins/env';
import type { ITypeGenPluginOptions } from '@/plugins/type-gen';

/**
 * Flat plugin map — Stackra toggles and raw Vite plugins side by side.
 *
 * **Stackra plugins** — named keys with `true`, `false`, or options:
 * ```typescript
 * { env: true, decoratorDiscovery: true, ngrok: { domain: '...' } }
 * ```
 *
 * **Third-party Vite plugins** — pass the plugin instance under any key:
 * ```typescript
 * { react: react(), tailwindcss: tailwindcss() }
 * ```
 *
 * Any value that is a Vite Plugin (has a `name` property) passes through
 * to Vite as-is. Everything else is treated as a Stackra toggle.
 */
export interface PluginMap {
  /** Bridge import.meta.env into @stackra/ts-support Env class and boot globals */
  env?: boolean | ISupportEnvPluginOptions;
  /** Generate EnvKey union type from .env files for autocomplete */
  typeGen?: boolean | ITypeGenPluginOptions;
  /** Enable build-time decorator discovery and virtual module generation */
  decoratorDiscovery?: boolean | DecoratorDiscoveryOptions;
  /** Enable ngrok tunnel for sharing the dev server */
  ngrok?: boolean | INgrokPluginOptions;
  /** Enable QR code display in terminal for network URLs */
  qrcode?: boolean | IQRCodePluginOptions;

  /** Any additional key can hold a raw Vite Plugin instance */
  [key: string]: boolean | Plugin | Record<string, any> | undefined;
}

/**
 * Stackra configuration options.
 *
 * Extends Vite's `UserConfig` with a flat `plugins` map.
 * All standard Vite options (server, build, css, resolve, etc.)
 * are available with full IntelliSense.
 *
 * @example
 * ```typescript
 * import { defineConfig } from '@stackra/vite-config';
 * import react from '@vitejs/plugin-react-swc';
 *
 * export default defineConfig({
 *   server: { port: 3000 },
 *   plugins: {
 *     env: true,
 *     react: react({ tsDecorators: true }),
 *   },
 * });
 * ```
 */
export interface StackraOptions extends Omit<UserConfig, 'plugins'> {
  /** Flat plugin map — Stackra toggles + raw Vite plugins */
  plugins?: PluginMap;
}
