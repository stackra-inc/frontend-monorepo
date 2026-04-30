/**
 * Vite Configuration
 *
 * Configuration for the @stackra/vite-config package.
 * Defines preset selection, plugin toggles, and plugin-specific options.
 * Pure data config — plugins are instantiated at build time by defineConfig.
 *
 * ## Environment Variables
 *
 * | Variable                              | Description                              | Default                |
 * |---------------------------------------|------------------------------------------|------------------------|
 * | `VITE_STACKRA_PRESET`                 | Preset name (`app` or `library`)         | `'app'`                |
 * | `VITE_DECORATOR_DISCOVERY`            | Enable decorator discovery plugin        | `'true'`               |
 * | `VITE_DECORATOR_DISCOVERY_ROOT`       | Root directory to scan for decorators    | `process.cwd()`        |
 * | `VITE_DECORATOR_DISCOVERY_DEBUG`      | Enable decorator scanner debug logging   | `'false'`              |
 * | `VITE_NGROK`                          | Enable ngrok tunnel plugin               | `'false'`              |
 * | `VITE_NGROK_DOMAIN`                   | Custom ngrok domain                      | `undefined`            |
 * | `VITE_NGROK_AUTHTOKEN`                | Ngrok auth token (or use NGROK_AUTHTOKEN)| `undefined`            |
 * | `VITE_QRCODE`                         | Enable QR code terminal plugin           | `'false'`              |
 * | `VITE_QRCODE_SMALL`                   | Use compact QR code output               | `'true'`               |
 * | `VITE_QRCODE_MESSAGE`                 | Custom message above QR codes            | `'Visit on mobile:'`   |
 * | `VITE_QRCODE_SHOW_LOCAL`              | Show QR codes for localhost URLs         | `'false'`              |
 * | `VITE_QRCODE_COLORED`                 | Enable colored terminal output           | `'true'`               |
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

import type { StackraOptions, PresetName } from "@stackra/vite-config";

/**
 * Vite configuration.
 *
 * @example
 * ```typescript
 * // Minimal — uses app preset with decorator discovery enabled
 * import viteConfig from '@/config/vite.config';
 * import { defineConfig } from '@stackra/vite-config';
 *
 * export default defineConfig(viteConfig);
 * ```
 *
 * @example
 * ```typescript
 * // With overrides
 * import viteConfig from '@/config/vite.config';
 * import { defineConfig } from '@stackra/vite-config';
 *
 * export default defineConfig({
 *   ...viteConfig,
 *   server: { port: 4000 },
 * });
 * ```
 */
const viteConfig: StackraOptions = {
  /*
  |--------------------------------------------------------------------------
  | Preset
  |--------------------------------------------------------------------------
  |
  | The base configuration preset. 'app' is optimized for application
  | builds with code splitting. 'library' enables build.lib mode with
  | dual ESM/CJS output and preserved modules.
  |
  */
  preset: env("VITE_STACKRA_PRESET", "app") as PresetName,

  /*
  |--------------------------------------------------------------------------
  | Plugins
  |--------------------------------------------------------------------------
  |
  | Toggle built-in plugins. Pass `true` for defaults, an options object
  | for customization, or `false` / omit to disable.
  |
  | Plugin order: decoratorDiscovery → extra → ngrok → qrcode
  |
  */
  plugins: {
    decoratorDiscovery: env("VITE_DECORATOR_DISCOVERY", true)
      ? {
          root: env("VITE_DECORATOR_DISCOVERY_ROOT") || undefined,
          include: ["src/**/*.ts", "src/**/*.tsx"],
          exclude: ["**/*.test.ts", "**/*.spec.ts", "**/node_modules/**"],
          debug: env("VITE_DECORATOR_DISCOVERY_DEBUG", false),
          customDecorators: [] as string[],
        }
      : false,
    ngrok: env("VITE_NGROK", false)
      ? {
          ...(env("VITE_NGROK_DOMAIN") ? { domain: env("VITE_NGROK_DOMAIN") } : {}),
          ...(env("VITE_NGROK_AUTHTOKEN")
            ? { authtoken: env("VITE_NGROK_AUTHTOKEN") }
            : { authtoken_from_env: true }),
        }
      : false,
    qrcode: env("VITE_QRCODE", false)
      ? {
          small: env("VITE_QRCODE_SMALL", true),
          message: env("VITE_QRCODE_MESSAGE", "Visit on mobile:"),
          showLocal: env("VITE_QRCODE_SHOW_LOCAL", false),
          colored: env("VITE_QRCODE_COLORED", true),
          quiet: false,
        }
      : false,
  },
};

export default viteConfig;
