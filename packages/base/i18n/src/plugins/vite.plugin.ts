/**
 * Vite Plugin for @stackra/react-i18n
 *
 * Integrates the i18n pipeline into Vite's build system by:
 * - Scanning for translation files at build start
 * - Generating TypeScript definitions for translation keys (`TranslationKey`)
 * - Supporting HMR when translation files change
 *
 * Translation resources are loaded at runtime via `I18nModule.forRoot()`
 * config — this plugin only handles build-time concerns (type generation,
 * file discovery).
 *
 * @module adapters/vite
 */

import { resolve } from 'path';
import type { Plugin } from 'vite';

import type { I18nPluginOptions } from '@/interfaces';

import { validateConfig } from '@/utils/validate-config.util';
import { buildI18nextConfig } from '@/utils/config-builder.util';
import { scanTranslationFiles } from '@/utils/file-scanner.util';
import { generateTypeDefinitions } from '@/utils/type-generator.util';

/**
 * Create the i18n Vite plugin.
 *
 * Scans translation files, generates `TranslationKey` type definitions,
 * and supports HMR for translation file changes.
 *
 * @param options - Partial plugin configuration (merged with defaults)
 * @returns Configured Vite {@link Plugin} instance
 *
 * @example
 * ```typescript
 * import { defineConfig } from 'vite';
 * import { i18nPlugin } from '@stackra/react-i18n/vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     i18nPlugin({
 *       defaultLanguage: 'en',
 *       languages: ['en', 'ar', 'es', 'fr', 'de'],
 *       typeGeneration: true,
 *     }),
 *   ],
 * });
 * ```
 */
export function i18nPlugin(options?: Partial<I18nPluginOptions>): Plugin {
  const config = validateConfig(options);
  const logger = console;

  /**
   * Cached file map — prevents re-scanning on every HMR update.
   */
  let fileMap: Awaited<ReturnType<typeof scanTranslationFiles>> | null = null;

  return {
    name: '@stackra/react-i18n',

    /**
     * Log resolved configuration when debug mode is active.
     */
    async configResolved() {
      if (config.debug) {
        logger.info('[i18n] Plugin configured with options:', config);
      }
    },

    /**
     * Scan translation files and generate TypeScript definitions.
     */
    async buildStart() {
      try {
        fileMap = await scanTranslationFiles(config);
        const i18nextConfig = await buildI18nextConfig(fileMap, config);

        if (config.typeGeneration && i18nextConfig.resources) {
          const typeOutputPath = resolve(
            config.typeOutputDir || '.stackra/react-i18n',
            'index.d.ts'
          );
          await generateTypeDefinitions(i18nextConfig.resources, typeOutputPath, config.debug);
        }

        if (config.debug) {
          logger.info('[i18n] Build started — scanned files and generated types');
        }
      } catch (error: Error | any) {
        logger.error('[i18n] Error during buildStart:', error);
        throw error;
      }
    },

    /**
     * Handle HMR for translation file changes.
     *
     * When a known translation file is saved, re-scans files and
     * regenerates TypeScript definitions.
     */
    async handleHotUpdate({ file, server }) {
      const isTranslationFile =
        fileMap && Object.values(fileMap).some((langs) => Object.values(langs).includes(file));

      if (isTranslationFile && config.enableHMR) {
        try {
          fileMap = await scanTranslationFiles(config);
          const i18nextConfig = await buildI18nextConfig(fileMap, config);

          if (config.typeGeneration && i18nextConfig.resources) {
            const typeOutputPath = resolve(
              config.typeOutputDir || '.stackra/react-i18n',
              'index.d.ts'
            );
            await generateTypeDefinitions(i18nextConfig.resources, typeOutputPath, config.debug);
          }

          if (config.debug) {
            logger.info(`[i18n] HMR: Updated type definitions from ${file}`);
          }

          // Trigger full reload so the app picks up new translations
          server.ws.send({ type: 'full-reload' });
        } catch (error: Error | any) {
          logger.error('[i18n] Error during HMR:', error);
        }
      }
    },
  };
}
