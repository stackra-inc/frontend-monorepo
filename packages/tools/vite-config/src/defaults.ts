/**
 * Default Configuration
 *
 * Ships a complete, production-ready Vite configuration. Consumers
 * only override what their project needs — everything else just works.
 *
 * This is a **factory function** because it needs the resolved `mode`
 * to make mode-aware decisions (sourcemaps, log level, build target).
 * It's called by `defineConfig` after `loadEnv` has populated the
 * env repository, so `env()` reads `.env` file values correctly.
 *
 * @module defaults
 */

import { resolve } from 'path';
import type { UserConfig } from 'vite';

/**
 * Create the default Vite configuration for the given mode.
 *
 * @param mode - The current Vite mode ('development' | 'production' | 'test')
 * @returns Complete UserConfig with sensible defaults
 */
export function createDefaults(mode: string): UserConfig {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    // ── Path Resolution ───────────────────────────────────────────────────

    resolve: {
      alias: {
        /** @/ maps to src/ — matches tsconfig paths */
        '@': resolve(process.cwd(), 'src'),
      },
    },

    // ── Development Server ────────────────────────────────────────────────

    server: {
      /** Override with VITE_PORT in .env */
      port: env('VITE_PORT', 5173),
      open: env('VITE_SERVER_OPEN', false),
      cors: true,
      hmr: { overlay: true },
    },

    // ── Preview Server (vite preview) ─────────────────────────────────────

    preview: {
      port: env('VITE_PREVIEW_PORT', 4173),
      open: false,
    },

    // ── Build ─────────────────────────────────────────────────────────────

    build: {
      outDir: env('VITE_OUT_DIR', 'dist'),
      emptyOutDir: true,

      /**
       * ES2020 in production for broad browser support.
       * ESNext in development for fastest rebuilds.
       */
      target: isProd ? 'es2020' : 'esnext',

      /** esbuild for fast minification */
      minify: 'esbuild',

      /**
       * 'hidden' in production — maps generated but not referenced in
       * the bundle (useful for Sentry / error tracking).
       * true in development — full inline source maps for debugging.
       */
      sourcemap: isProd ? 'hidden' : true,

      /** Files smaller than 4KB are inlined as base64 */
      assetsInlineLimit: 4096,

      /** Warn when a chunk exceeds 500KB */
      chunkSizeWarningLimit: 500,

      /** Asset file naming with content hashes for long-term caching */
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

    // ── CSS ───────────────────────────────────────────────────────────────

    css: {
      /** Source maps in development for easier debugging */
      devSourcemap: isDev,
    },

    // ── Environment Variables ─────────────────────────────────────────────

    /** Only VITE_ prefixed variables are exposed to the client */
    envPrefix: 'VITE_',

    // ── esbuild ───────────────────────────────────────────────────────────

    esbuild: {
      /**
       * Enable TS decorator support in esbuild.
       * SWC (via @vitejs/plugin-react-swc) handles the actual transform —
       * this prevents esbuild from conflicting with it.
       */
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      } as any,
    },

    // ── Dependency Pre-bundling ───────────────────────────────────────────

    optimizeDeps: {
      /** Force-include deps that Vite might miss during pre-bundling */
      include: ['react', 'react-dom'],
      exclude: [],
    },

    // ── Logging ───────────────────────────────────────────────────────────

    /** 'info' in dev for visibility, 'warn' in prod for clean CI output */
    logLevel: isDev ? 'info' : 'warn',
  };
}
