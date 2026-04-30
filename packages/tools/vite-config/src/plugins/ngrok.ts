/**
 * Ngrok Plugin Wrapper
 *
 * Provides the ngrok Vite plugin factory and types.
 * Creates an ngrok tunnel when the dev server starts and tears
 * it down on close.
 *
 * @module plugins/ngrok
 */

import _ngrok from '@ngrok/ngrok';
import type { Plugin } from 'vite';
import type { Config, Listener } from '@ngrok/ngrok';

/**
 * Configuration for the ngrok Vite plugin.
 *
 * Extends the native `@ngrok/ngrok` Config interface, so any
 * property supported by the ngrok SDK can be passed directly.
 */
export interface INgrokPluginOptions extends Config {}

/**
 * Normalize plugin options into a standard ngrok Config object.
 */
function normalizeOptions(options?: INgrokPluginOptions): Config {
  if (options && typeof options === 'object') {
    return options;
  }

  return { authtoken_from_env: true };
}

/**
 * Create the ngrok Vite plugin.
 *
 * Hooks into the Vite dev server lifecycle to create and manage an ngrok
 * tunnel. The tunnel is established when the HTTP server starts listening
 * and is closed when the server shuts down.
 *
 * @param options - Plugin configuration options
 * @returns Configured Vite Plugin instance
 *
 * @example
 * ```typescript
 * import { ngrok } from '@stackra/vite-config';
 *
 * export default defineConfig({
 *   plugins: [ngrok({ domain: 'my-app.ngrok.io' })],
 * });
 * ```
 */
export function ngrok(options?: INgrokPluginOptions): Plugin {
  const logger = console;
  let listener: Listener | undefined;
  const ngrokConfig = normalizeOptions(options);

  return {
    name: '@stackra/ngrok',
    apply: 'serve',

    config() {
      return {
        server: {
          allowedHosts: true,
        },
      };
    },

    configureServer({ httpServer }) {
      httpServer?.on('listening', async () => {
        try {
          const address = httpServer.address();

          if (listener || !address || typeof address === 'string') {
            return;
          }

          listener = await _ngrok.forward({
            addr: address.port,
            ...ngrokConfig,
          });

          const url = listener.url();

          if (!url) {
            logger.warn('Failed to start ngrok tunnel: No URL returned');
            return;
          }

          logger.info(`ngrok tunnel: ${url}`);
        } catch (error) {
          logger.error(
            `Failed to start ngrok tunnel: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      });

      httpServer?.on('close', async () => {
        try {
          if (listener) {
            await listener.close();
            listener = undefined;
          }
        } catch (error) {
          logger.warn(
            `Failed to close ngrok tunnel: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      });
    },
  };
}
