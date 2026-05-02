/**
 * Vite Configuration
 *
 * Production-ready Vite configuration for a Stackra application.
 * Exports a `StackraOptions` object consumed by `defineConfig()` in the
 * root `vite.config.ts`.
 *
 * All sensible defaults (build targets, source maps, dev server, decorators,
 * CSS, pre-bundling, logging) are shipped by `@stackra/vite-config` — only
 * override what your project needs. Your values always win via deep merge.
 *
 * ## Defaults provided by `@stackra/vite-config` (no config needed):
 *
 * | Setting                       | Default                                    |
 * |-------------------------------|--------------------------------------------|
 * | `build.target`                | `'es2020'` (prod) / `'esnext'` (dev)       |
 * | `build.sourcemap`             | `'hidden'` (prod) / `true` (dev)           |
 * | `build.minify`                | `'esbuild'`                                |
 * | `build.outDir`                | `'dist'`                                   |
 * | `build.chunkSizeWarningLimit` | `500`                                      |
 * | `build.assetsInlineLimit`     | `4096` (4KB)                               |
 * | `server.port`                 | `env('VITE_PORT', 5173)`                   |
 * | `server.cors`                 | `true`                                     |
 * | `server.hmr.overlay`          | `true`                                     |
 * | `resolve.alias.@`             | `./src`                                    |
 * | `css.devSourcemap`            | `true` in dev                              |
 * | `esbuild.tsconfigRaw`         | decorators + emitDecoratorMetadata enabled |
 * | `optimizeDeps.include`        | `['react', 'react-dom']`                   |
 * | `envPrefix`                   | `'VITE_'`                                  |
 * | `logLevel`                    | `'info'` (dev) / `'warn'` (prod)           |
 *
 * ## Plugin pipeline (order handled automatically by `defineConfig`):
 *
 * 1. `env`               — bridges `import.meta.env` → `Env` class, boots globals
 * 2. `typeGen`            — generates `EnvKey` union type from `.env` files
 * 3. `decoratorDiscovery` — scans `@Module`, `@Injectable`, etc. at build time
 * 4. Third-party plugins  — react, tsconfigPaths, tailwindcss, i18n, config, pwa
 * 5. `ngrok`              — dev-only tunnel (when enabled via env)
 * 6. `qrcode`             — dev-only QR code in terminal (when enabled via env)
 *
 * @see https://vitejs.dev/config/
 * @see https://github.com/stackra-inc/vite-config
 *
 * @module config/vite
 */

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { pwaPlugin } from "@stackra/ts-pwa/vite";
import { i18nPlugin } from "@stackra/react-i18n/vite";
import { configPlugin } from "@stackra/ts-config/vite";
import { defineConfig } from "@stackra/vite-config/vite";
import { loadEnv } from "vite";

import { pwaConfig } from "./src/config/pwa.config";

// =============================================================================
// Pre-load env vars so they're available in the config object below.
// Vite normally loads .env files after config resolution, but we need
// env values for plugin toggles (ngrok, qrcode, ssg).
// =============================================================================
const preloaded = loadEnv("development", "enviroments", "");
const cfgEnv = (key: string, fallback?: any) => {
  const val = preloaded[key];
  if (val === undefined) return fallback;
  if (typeof fallback === "boolean") return val === "true";
  if (typeof fallback === "number") return Number(val);
  return val;
};

// =============================================================================
// Configuration
// =============================================================================

export default defineConfig({
  /**
   * Enable debug logging for env loading and plugin resolution.
   */
  debug: false,

  /**
   * Directory where `.env` files are located.
   * Vite loads `.env`, `.env.local`, `.env.[mode]` from this path.
   */
  envDir: "enviroments",

  /*
  |--------------------------------------------------------------------------
  | Plugins
  |--------------------------------------------------------------------------
  |
  | Flat plugin map — Stackra's alternative to Vite's plugin array.
  |
  | Stackra plugins use named keys with `true` (defaults), an options
  | object (customized), or `false` (disabled). Third-party Vite plugins
  | are passed as instantiated plugin objects under any key name.
  |
  | Resolution order:
  |   1. Stackra plugins in a fixed order (env → typeGen → decoratorDiscovery → ngrok → qrcode)
  |   2. Third-party plugins in the order listed here
  |
  */
  plugins: {
    // ── Stackra Built-in Plugins ────────────────────────────────────────

    /**
     * Environment bridge plugin.
     *
     * Bridges `import.meta.env` into `@stackra/ts-support`'s `Env` class
     * and calls `bootGlobals()` so `env()`, `collect()`, `tap()`, `filled()`,
     * `blank()`, `retry()`, `sleep()` are available globally without imports.
     *
     * Must be enabled for `env()` to work in your application code.
     * Injects a virtual module before the app entry point to ensure
     * the Env repository is configured before any application code runs.
     */
    env: true,

    /**
     * Env type generation plugin.
     *
     * Scans `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local` files
     * and generates an `EnvKey` union type at `.stackra/env/index.d.ts`.
     * Gives you autocomplete and compile-time warnings when calling `env('...')`.
     *
     * Regenerates automatically when `.env` files change during dev via HMR.
     */
    typeGen: { debug: false },

    /**
     * Decorator discovery plugin.
     *
     * Scans TypeScript source files at build time for decorator usage
     * (`@Module`, `@Injectable`, `@Subscribe`, etc.) and generates
     * virtual modules (`virtual:decorator-registry/*`) containing
     * decorator registries.
     *
     * Required for DI container auto-discovery. Supports HMR — when a
     * decorated file changes, the registry is rebuilt and a full reload
     * is triggered.
     */
    decoratorDiscovery: {
      debug: false,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      decorators: [
        {
          name: "Route",
          virtualModule: "virtual:decorator-registry/routes",
          output: "imports",
          exportName: "ROUTE_CLASSES",
        },
      ],
    },

    /**
     * Ngrok tunnel plugin (dev-only).
     *
     * Creates an ngrok tunnel when the dev server starts, exposing your
     * local server to the internet. Useful for mobile testing, webhook
     * development, and sharing work-in-progress.
     *
     * Disabled by default — set `VITE_NGROK=true` in `.env.local` to enable.
     * Optionally set `VITE_NGROK_DOMAIN` for a custom subdomain.
     */
    ngrok: cfgEnv("VITE_NGROK", false),

    /**
     * QR code terminal plugin (dev-only).
     *
     * Displays QR codes in the terminal for network URLs when the dev
     * server starts. Scan with your phone for instant mobile testing
     * without typing the URL.
     *
     * Disabled by default — set `VITE_QRCODE=true` in `.env.local` to enable.
     */
    qrcode: cfgEnv("VITE_QRCODE", false),

    // ── Third-Party Plugins ─────────────────────────────────────────────

    /**
     * React plugin — JSX transform and Fast Refresh.
     *
     * Uses Oxc for JSX transformation by default in Vite 8.
     * Provides instant feedback during development through Fast Refresh
     * and supports modern React features including the React Compiler.
     *
     * @see https://github.com/vitejs/vite-plugin-react
     */
    react: react({ jsxRuntime: "automatic" }),

    /**
     * Tailwind CSS v4 plugin.
     *
     * Native Vite integration that replaces the PostCSS-based approach.
     * Provides faster HMR and build performance by processing Tailwind
     * directly in the Vite pipeline.
     *
     * @see https://tailwindcss.com/docs/installation/vite
     */
    tailwindcss: tailwindcss(),

    /**
     * Stackra i18n plugin.
     *
     * Scans translation files (`*.translation.json`) in the source tree,
     * generates virtual modules with merged translations, and optionally
     * emits TypeScript definitions for translation key autocomplete.
     *
     * Supports HMR — translation file changes are reflected instantly
     * without a full page reload.
     *
     * @see https://github.com/stackra-inc/react-i18n
     */
    i18n: i18nPlugin({
      defaultLanguage: "en",
      languages: ["en", "ar", "es", "fr", "de"],
      typeGeneration: true,
    }),

    /**
     * Stackra SSG (Static Site Generation) plugin.
     *
     * Pre-renders React routes to static HTML files at build time for
     * perfect SEO and AEO (Answer Engine Optimization). Automatically
     * discovers routes from @stackra/react-router's RouteRegistry.
     *
     * Features:
     * - Automatic route discovery from RouteRegistry
     * - Meta tag injection from MetaService
     * - Sitemap.xml generation
     * - robots.txt generation
     * - 404.html pre-rendering
     * - Structured data (JSON-LD) for AEO
     *
     * @see https://github.com/stackra-inc/vite-config
     */
    ssg: {
      enabled: false, // Requires Puppeteer + Chrome: npx puppeteer browsers install chrome
      autoDiscovery: true,
      sitemap: {
        enabled: true,
        hostname: cfgEnv("VITE_APP_URL", "https://example.com"),
        changefreq: "weekly",
        priority: 0.8,
        routes: {
          "/": { priority: 1.0, changefreq: "daily" },
          "/about": { priority: 0.9, changefreq: "monthly" },
        },
      },
      robots: true,
      render404: true,
      debug: cfgEnv("VITE_SSG_DEBUG", false),
    },

    /**
     * Stackra config plugin.
     *
     * Scans `.config.ts` files in `src/` and `config/` directories, loads
     * their exports, and serves the merged result via a virtual module
     * (`virtual:@stackra/ts-config`). Also injects `window.__APP_CONFIG__`
     * into the HTML for backward compatibility.
     *
     * Supports HMR — config file changes trigger a rebuild and full reload.
     *
     * @see https://github.com/stackra-inc/ts-config
     */
    config: configPlugin({
      scanConfigFiles: true,
      debug: false, // Only enable in development when debugging config issues
    }),

    /**
     * Stackra PWA plugin.
     *
     * Wraps `vite-plugin-pwa` with production-ready defaults for manifest
     * generation, service worker registration (Workbox), and runtime
     * caching strategies. Options are sourced from `src/config/pwa.config.ts`
     * which contains both build-time (manifest, workbox) and runtime
     * (install prompt, splash screen, offline indicator) settings.
     *
     * The plugin only consumes the build-time keys; runtime keys pass
     * through harmlessly and are used by `<PwaProvider>` at runtime.
     *
     * @see https://github.com/stackra-inc/ts-pwa
     * @see src/config/pwa.config.ts
     */
    pwa: pwaPlugin(pwaConfig),
  },

  /*
  |--------------------------------------------------------------------------
  | Server Overrides
  |--------------------------------------------------------------------------
  |
  | Dev server customizations. Most settings are handled by defaults:
  |   - port: env('VITE_PORT', 5173)
  |   - cors: true
  |   - hmr.overlay: true
  |
  | Only override what differs from the defaults.
  |
  */
  server: {
    /** Auto-open the browser when the dev server starts. */
    open: true,

    /** Expose to network so QR code plugin can generate network URLs. */
    host: true,

    /**
     * Ignore workspace package dist directories from file watching.
     *
     * When running `pnpm dev` at the monorepo root, tsup --watch rebuilds
     * package dist files. Without this ignore, Vite detects those changes
     * and triggers full page reloads that can race with each other,
     * causing duplicate `__vite__injectQuery` declarations.
     */
    watch: {
      ignored: ["**/packages/**/dist/**"],
    },

    // ── API Proxy (uncomment when backend is available) ───────────────
    // proxy: {
    //   '/api': {
    //     target: env('VITE_API_URL', 'http://localhost:8000'),
    //     changeOrigin: true,
    //   },
    // },
  },

  /*
  |--------------------------------------------------------------------------
  | Build Overrides
  |--------------------------------------------------------------------------
  |
  | Production build customizations. Most settings are mode-aware defaults:
  |   - target: 'es2020' (prod) / 'esnext' (dev)
  |   - sourcemap: 'hidden' (prod) / true (dev)
  |   - minify: 'esbuild'
  |   - outDir: 'dist'
  |   - chunkSizeWarningLimit: 500
  |   - assetsInlineLimit: 4096
  |   - Asset naming: assets/[ext]/[name]-[hash].[ext]
  |
  | Only override what your project specifically needs.
  |
  */
  build: {
    /**
     * Chunk size warning limit.
     *
     * Set to Infinity to disable warnings. We've implemented proper
     * code splitting via manualChunks, so large vendor bundles are
     * intentional and optimized for caching.
     */
    chunkSizeWarningLimit: Infinity,

    rollupOptions: {
      /**
       * Suppress warnings for Vite's internal bundled code.
       *
       * Vite 8.0.10's distributed code contains URL constructions that
       * reference source files (src/node/constants.ts) which don't exist
       * at build time. This is harmless - the code works correctly at runtime.
       */
      onwarn(warning, warn) {
        // Suppress the specific warning about Vite's internal constants.ts
        if (
          warning.code === "UNRESOLVED_IMPORT" &&
          warning.message.includes("src/node/constants.ts")
        ) {
          return;
        }

        // Suppress "Module has been externalized" warnings
        // These are informational - Node.js modules are correctly excluded from browser bundle
        if (
          warning.message &&
          warning.message.includes("has been externalized for browser compatibility")
        ) {
          return;
        }

        // Pass through all other warnings
        warn(warning);
      },
      /**
       * External modules — prevent Rollup from bundling virtual modules and native binaries.
       *
       * The decorator discovery plugin generates virtual modules at
       * `virtual:decorator-registry/*`. These must be marked external
       * so Rollup doesn't try to resolve them as real files during build.
       *
       * Native binaries like fsevents.node must also be externalized.
       */
      external: [
        "virtual:decorator-registry/modules",
        "virtual:decorator-registry/providers",
        "fsevents",
      ],

      output: {
        /**
         * Vendor chunk splitting strategy.
         *
         * Splits node_modules into separate chunks by library for
         * optimal long-term caching. When you deploy a new version,
         * only the chunks that actually changed need to be re-downloaded.
         *
         * Chunks:
         *   - vendor-react       — react, react-dom, react-router
         *   - vendor-heroui      — @heroui/* UI components
         *   - vendor-stackra     — other @stackra/* framework packages
         *   - vendor             — everything else from node_modules
         */
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React ecosystem - frequently updated
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react";
            }

            // Everything else
            return "vendor";
          }
        },
      },
    },
  },
});
