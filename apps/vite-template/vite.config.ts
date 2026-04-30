/**
 * @file vite.config.ts
 * @description Production-ready Vite configuration for a Stackra application.
 *
 * This file is intentionally minimal. All sensible defaults — build targets,
 * source maps, dev server, esbuild decorators, CSS source maps, dependency
 * pre-bundling, and logging — are shipped by `@stackra/vite-config` via the
 * `'app'` preset. You only override what your project needs.
 *
 * ## What the preset provides (you get this for free):
 *
 * | Setting                    | Default                                    |
 * |----------------------------|--------------------------------------------|
 * | `build.target`             | `'es2020'` (prod) / `'esnext'` (dev)       |
 * | `build.sourcemap`          | `'hidden'` (prod) / `true` (dev)           |
 * | `build.minify`             | `'esbuild'`                                |
 * | `build.outDir`             | `'dist'`                                   |
 * | `build.chunkSizeWarningLimit` | `500`                                   |
 * | `server.port`              | `env('VITE_PORT', 5173)`                   |
 * | `server.cors`              | `true`                                     |
 * | `resolve.alias.@`          | `./src`                                    |
 * | `css.devSourcemap`         | `true` in dev                              |
 * | `esbuild.tsconfigRaw`      | decorators enabled                         |
 * | `optimizeDeps.include`     | `['react', 'react-dom']`                   |
 * | `envPrefix`                | `'VITE_'`                                  |
 * | `logLevel`                 | `'info'` (dev) / `'warn'` (prod)           |
 *
 * ## Plugin pipeline (order handled automatically):
 *
 * 1. `env`               — bridges `import.meta.env` → `Env` class, boots globals
 * 2. `typeGen`            — generates `EnvKey` union type from `.env` files
 * 3. `decoratorDiscovery` — scans `@Module`, `@Injectable`, etc. at build time
 * 4. Third-party plugins  — react, tsconfigPaths, tailwindcss, i18n, etc.
 * 5. `ngrok`              — dev-only tunnel (when enabled via env)
 * 6. `qrcode`             — dev-only QR code in terminal (when enabled via env)
 *
 * @see https://vitejs.dev/config/
 * @see https://github.com/stackra-inc/vite-config
 *
 * @example
 * ```bash
 * # Development
 * pnpm dev
 *
 * # Production build
 * pnpm build
 *
 * # Preview production build locally
 * pnpm preview
 * ```
 */

import { defineConfig } from "@stackra/vite-config";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { i18nPlugin } from "@stackra/react-i18n";

// =============================================================================
// Configuration
// =============================================================================

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Preset
  |--------------------------------------------------------------------------
  |
  | 'app'     — optimized for application builds (default)
  | 'library' — enables build.lib mode with dual ESM/CJS output
  |
  | The preset provides all base config. Override individual settings
  | below — your values always win over preset defaults.
  |
  */
  // preset: 'app',

  /*
  |--------------------------------------------------------------------------
  | Plugins
  |--------------------------------------------------------------------------
  |
  | Flat plugin map. Stackra plugins use named keys with `true` or options.
  | Third-party Vite plugins are passed as instances under any key name.
  |
  | Stackra plugins are resolved first (in a fixed order), then
  | third-party plugins are appended in the order listed here.
  |
  */
  plugins: {
    // ── Stackra Plugins ───────────────────────────────────────────────────

    /**
     * Bridges `import.meta.env` into `@stackra/ts-support`'s `Env` class
     * and calls `bootGlobals()` so `env()`, `collect()`, `tap()`, `filled()`,
     * `blank()`, `retry()`, `sleep()` are available globally without imports.
     *
     * Must be enabled for `env()` to work in your application code.
     */
    env: true,

    /**
     * Scans `.env` files and generates an `EnvKey` union type at
     * `.stackra/type-gen/index.d.ts`. Gives you autocomplete and
     * compile-time warnings when calling `env('...')`.
     *
     * Regenerates automatically when `.env` files change during dev.
     */
    typeGen: true,

    /**
     * Scans TypeScript source files at build time for decorator usage
     * (`@Module`, `@Injectable`, `@Subscribe`, etc.) and generates
     * virtual modules containing decorator registries.
     *
     * Required for DI container auto-discovery.
     */
    decoratorDiscovery: true,

    /**
     * Creates an ngrok tunnel when the dev server starts.
     * Disabled by default — set `VITE_NGROK=true` in `.env.local` to enable.
     * Optionally set `VITE_NGROK_DOMAIN` for a custom domain.
     */
    ngrok: env("VITE_NGROK", false),

    /**
     * Displays QR codes in the terminal for network URLs.
     * Disabled by default — set `VITE_QRCODE=true` in `.env.local` to enable.
     * Scan with your phone for instant mobile testing.
     */
    qrcode: env("VITE_QRCODE", false),

    // ── Third-Party Plugins ───────────────────────────────────────────────

    /**
     * React with SWC — fast JSX transform, Fast Refresh in dev,
     * and native TypeScript decorator support via SWC.
     *
     * @see https://github.com/vitejs/vite-plugin-react-swc
     */
    react: react({
      tsDecorators: true,
    }),

    /**
     * Resolves TypeScript path aliases defined in `tsconfig.json`.
     * e.g. `import Foo from '@/components/Foo'` → `src/components/Foo`
     *
     * @see https://github.com/aleclarson/vite-tsconfig-paths
     */
    tsconfigPaths: tsconfigPaths(),

    /**
     * Tailwind CSS v4 Vite plugin.
     * Replaces the PostCSS-based approach for better HMR performance.
     *
     * @see https://tailwindcss.com/docs/installation/vite
     */
    tailwindcss: tailwindcss(),

    /**
     * Stackra i18n plugin — scans translation files, generates virtual
     * modules, and optionally emits TypeScript definitions for
     * translation key autocomplete.
     *
     * @see https://github.com/stackra-inc/react-i18n
     */
    i18n: i18nPlugin({
      localesDir: "src/locales",
      defaultLocale: "en",
      supportedLocales: ["en", "ar", "es", "fr", "de"],
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Server Overrides (optional)
  |--------------------------------------------------------------------------
  |
  | Uncomment to override preset defaults. The preset already provides:
  |   port: env('VITE_PORT', 5173)
  |   cors: true
  |   hmr.overlay: true
  |
  */
  // server: {
  //   port: 3000,
  //   open: true,
  //   proxy: {
  //     '/api': {
  //       target: env('VITE_API_URL', 'http://localhost:8000'),
  //       changeOrigin: true,
  //     },
  //   },
  // },

  /*
  |--------------------------------------------------------------------------
  | Build Overrides (optional)
  |--------------------------------------------------------------------------
  |
  | Uncomment to override preset defaults. The preset already provides:
  |   target: 'es2020' (prod) / 'esnext' (dev)
  |   sourcemap: 'hidden' (prod) / true (dev)
  |   minify: 'esbuild'
  |   outDir: 'dist'
  |   chunkSizeWarningLimit: 500
  |
  */
  // build: {
  //   rollupOptions: {
  //     output: {
  //       chunkFileNames: 'assets/js/[name]-[hash].js',
  //       entryFileNames: 'assets/js/[name]-[hash].js',
  //       assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
  //       manualChunks(id: string): string | undefined {
  //         if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
  //           return 'vendor-react';
  //         }
  //         if (id.includes('node_modules/@heroui/react')) {
  //           return 'vendor-heroui';
  //         }
  //         return undefined;
  //       },
  //     },
  //   },
  // },
});
