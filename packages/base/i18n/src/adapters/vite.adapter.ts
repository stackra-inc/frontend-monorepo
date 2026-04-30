/**
 * Vite Plugin Adapter for @stackra/react-i18n
 *
 * Integrates the i18n pipeline into Vite's build system by:
 * - Scanning for translation files at build start
 * - Building i18next configuration from discovered files
 * - Serving a virtual module (`virtual:@stackra/react-i18n`)
 * - Generating TypeScript definitions for translation keys
 * - Supporting HMR when translation files change
 *
 * @module adapters/vite
 */

import { resolve } from 'path';
import type { Plugin } from 'vite';

import {
  validateConfig,
  buildI18nextConfig,
  scanTranslationFiles,
  generateVirtualModule,
  generateTypeDefinitions,
} from '@/utils';
import type { I18nPluginOptions } from '@/interfaces';

/**
 * Virtual module ID that consumers import from.
 *
 * @example
 * ```typescript
 * import { t } from 'virtual:@stackra/react-i18n';
 * ```
 */
const VIRTUAL_MODULE_ID = 'virtual:@stackra/react-i18n';

/**
 * Vite-internal resolved ID (prefixed with `\0` to mark as virtual).
 */
const RESOLVED_VIRTUAL_MODULE_ID = `\\0${VIRTUAL_MODULE_ID}`;

/**
 * Create the i18n Vite plugin.
 *
 * Validates options, scans for translation files, builds the i18next
 * config, and exposes it through a virtual module. Optionally generates
 * TypeScript definitions and supports HMR for translation file changes.
 *
 * @param options - Partial plugin configuration (merged with defaults)
 * @returns Configured Vite {@link Plugin} instance
 *
 * @example
 * ```typescript
 * import { defineConfig } from 'vite';
 * import react from '@vitejs/plugin-react';
 * import { i18nPlugin } from '@stackra/react-i18n';
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     i18nPlugin({
 *       defaultLanguage: 'en',
 *       languages: ['en', 'ar', 'es'],
 *     }),
 *   ],
 * });
 * ```
 */
export function i18nPlugin(options?: Partial<I18nPluginOptions>): Plugin {
  const config = validateConfig(options);
  const logger = console;

  /**
   * Cached build artifacts — prevents re-scanning on every module request.
   */
  let virtualModuleCode: string | null = null;
  let fileMap: Awaited<ReturnType<typeof scanTranslationFiles>> | null = null;
  let i18nextConfig: Awaited<ReturnType<typeof buildI18nextConfig>> | null = null;

  return {
    name: '@stackra/react-i18n',
    apply: 'serve',
    enforce: 'pre',

    /**
     * Log resolved configuration when debug mode is active.
     */
    async configResolved() {
      if (config.debug) {
        logger.info('Plugin configured with options:', config);
      }
    },

    /**
     * Scan translation files, build config, generate virtual module code,
     * and optionally emit TypeScript definitions.
     *
     * @throws {Error} If scanning or config building fails
     */
    async buildStart() {
      try {
        fileMap = await scanTranslationFiles(config);
        i18nextConfig = await buildI18nextConfig(fileMap, config);
        virtualModuleCode = generateVirtualModule(i18nextConfig);

        if (config.typeGeneration && i18nextConfig.resources) {
          const typeOutputPath = resolve(
            config.typeOutputDir || '.stackra-inc/react-i18n/types',
            'index.d.ts'
          );
          await generateTypeDefinitions(i18nextConfig.resources, typeOutputPath, config.debug);
        }

        if (config.debug) {
          logger.info('Build started successfully');
        }
      } catch (error: Error | any) {
        logger.error('Error during buildStart:', error);
        throw error;
      }
    },

    /**
     * Resolve the virtual module ID so Vite knows it is ours.
     *
     * @param id - Module specifier requested by an import statement
     * @returns Resolved virtual ID, or `null` for unrelated modules
     */
    resolveId(id: string): string | null {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },

    /**
     * Serve the generated virtual module code.
     *
     * @param id - Resolved module ID
     * @returns Generated TypeScript source, or `null` for unrelated modules
     * @throws {Error} If the virtual module has not been initialized yet
     */
    load(id: string): string | null {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        if (!virtualModuleCode) {
          throw new Error(
            '[i18n] Virtual module not initialized. Make sure buildStart was called.'
          );
        }
        return virtualModuleCode;
      }
      return null;
    },

    /**
     * Handle HMR for translation file changes.
     *
     * When a known translation file is saved and `enableHMR` is active,
     * re-scans files, rebuilds config, regenerates the virtual module,
     * and invalidates Vite's module graph so consumers receive the update.
     */
    async handleHotUpdate({ file, server }) {
      const isTranslationFile =
        fileMap && Object.values(fileMap).some((langs) => Object.values(langs).includes(file));

      if (isTranslationFile && config.enableHMR) {
        try {
          fileMap = await scanTranslationFiles(config);
          i18nextConfig = await buildI18nextConfig(fileMap, config);
          virtualModuleCode = generateVirtualModule(i18nextConfig);

          if (config.typeGeneration && i18nextConfig.resources) {
            const typeOutputPath = resolve(
              config.typeOutputDir || '.stackra-inc/react-i18n/types',
              'index.d.ts'
            );
            await generateTypeDefinitions(i18nextConfig.resources, typeOutputPath, config.debug);
          }

          if (config.debug) {
            logger.info(`HMR: Updated translations from ${file}`);
          }

          const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
        } catch (error: Error | any) {
          logger.error('Error during HMR:', error);
        }
      }
    },
  };
}
