/**
 * Vite Configuration
 *
 * Configuration for the @stackra/vite-config package.
 * Defines plugin toggles and plugin-specific options.
 * Pure data config — plugins are instantiated at build time by defineConfig.
 *
 * ## Environment Variables
 *
 * | Variable                              | Description                              | Default              |
 * |---------------------------------------|------------------------------------------|----------------------|
 * | `VITE_DECORATOR_DISCOVERY`            | Enable decorator discovery plugin        | `true`               |
 * | `VITE_DECORATOR_DISCOVERY_DEBUG`      | Enable decorator scanner debug logging   | `false`              |
 * | `VITE_NGROK`                          | Enable ngrok tunnel plugin               | `false`              |
 * | `VITE_NGROK_DOMAIN`                   | Custom ngrok domain                      | —                    |
 * | `VITE_QRCODE`                         | Enable QR code terminal plugin           | `false`              |
 * | `VITE_QRCODE_SMALL`                   | Use compact QR code output               | `true`               |
 * | `VITE_QRCODE_MESSAGE`                 | Custom message above QR codes            | `'Visit on mobile:'` |
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from '@stackra/vite-config';
 * import viteConfig from './config/vite.config';
 *
 * export default defineConfig(viteConfig);
 * ```
 *
 * @module config/vite
 */

import type { StackraOptions } from '@stackra/vite-config';

const viteConfig: StackraOptions = {
  /*
  |--------------------------------------------------------------------------
  | Plugins
  |--------------------------------------------------------------------------
  |
  | Pass `true` for defaults, an options object for customization,
  | or `false` to disable.
  |
  | Order: env → typeGen → decoratorDiscovery → extra → ngrok → qrcode
  |
  */
  plugins: {
    /** Bridges import.meta.env → Env class and boots global helpers. */
    env: true,

    /** Generates EnvKey union type from .env files for autocomplete. */
    typeGen: true,

    /** Scans TypeScript files for decorator usage at build time. */
    decoratorDiscovery: env('VITE_DECORATOR_DISCOVERY', true),

    /** Creates an ngrok tunnel when the dev server starts. */
    ngrok: env('VITE_NGROK', false),

    /** Displays QR codes in the terminal for network URLs. */
    qrcode: env('VITE_QRCODE', false),
  },
};

export default viteConfig;
