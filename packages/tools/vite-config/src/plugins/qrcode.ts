/**
 * QR Code Plugin Wrapper
 *
 * Provides the QR code Vite plugin factory and types.
 * Generates and displays QR codes in the terminal for network URLs
 * served by Vite's dev and preview servers.
 *
 * @module plugins/qrcode
 */

import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import qr from 'qrcode-terminal';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the QR code Vite plugin.
 */
export interface IQRCodePluginOptions {
  /** Optional filter to select which network URLs should display QR codes */
  filter?: (url: string) => boolean;
  /** Use compact QR code output for smaller terminal display (default: true) */
  small?: boolean;
  /** Custom message displayed above QR codes (default: "Visit page on mobile:") */
  message?: string;
  /** Whether to generate QR codes for localhost URLs (default: false) */
  showLocal?: boolean;
  /** Enable or disable colored terminal output for URLs (default: true) */
  colored?: boolean;
  /** Suppress all QR code output (default: false) */
  quiet?: boolean;
}

// ============================================================================
// Internal Utilities
// ============================================================================

const DEFAULT_OPTIONS = {
  small: true,
  message: 'Visit page on mobile:',
  showLocal: false,
  colored: true,
  quiet: false,
} as const;

function isLocalhost(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '::1' ||
      hostname.startsWith('127.') ||
      hostname === '0.0.0.0'
    );
  } catch {
    return false;
  }
}

function filterNetworkUrls(
  urls: string[],
  options: { filter?: (url: string) => boolean; showLocal?: boolean }
): string[] {
  let filtered = urls;

  if (!options.showLocal) {
    filtered = filtered.filter((url) => !isLocalhost(url));
  }

  if (options.filter) {
    filtered = filtered.filter(options.filter);
  }

  return filtered;
}

function generateQRCode(
  url: string,
  options: { small?: boolean; colored?: boolean }
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const small = options.small ?? DEFAULT_OPTIONS.small;
      const colored = options.colored ?? DEFAULT_OPTIONS.colored;

      qr.generate(url, { small }, (qrString: string) => {
        const formattedUrl = colored ? `\x1b[36m${url}\x1b[0m` : url;
        const indentedQR = qrString
          .split('\n')
          .map((line: string) => `  ${line}`)
          .join('\n');

        resolve(`  ${formattedUrl}\n${indentedQR}`);
      });
    } catch (error) {
      reject(
        new Error(
          `Failed to generate QR code for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  });
}

async function displayQRCodes(
  server: ViteDevServer | PreviewServer,
  options: ReturnType<typeof validateQROptions>,
  logger: Console
): Promise<void> {
  try {
    if (options.quiet) return;

    const networkUrls = server.resolvedUrls?.network;
    if (!networkUrls || networkUrls.length === 0) return;

    const filteredUrls = filterNetworkUrls(networkUrls, {
      filter: options.filter,
      showLocal: options.showLocal,
    });

    if (filteredUrls.length === 0) return;

    const qrCodes = await Promise.all(
      filteredUrls.map((url) =>
        generateQRCode(url, { small: options.small, colored: options.colored })
      )
    );

    const lines = ['', `  ${options.message}`, '', ...qrCodes];
    logger.info(lines.join('\n'));
  } catch (error) {
    logger.error(
      `Failed to generate QR codes: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function validateQROptions(options: IQRCodePluginOptions = {}) {
  return {
    small: options.small ?? DEFAULT_OPTIONS.small,
    message: options.message ?? DEFAULT_OPTIONS.message,
    showLocal: options.showLocal ?? DEFAULT_OPTIONS.showLocal,
    colored: options.colored ?? DEFAULT_OPTIONS.colored,
    quiet: options.quiet ?? DEFAULT_OPTIONS.quiet,
    filter: options.filter,
  };
}

// ============================================================================
// Vite Plugin Factory
// ============================================================================

/**
 * Create the QR code Vite plugin.
 *
 * Hooks into both `configureServer` (dev) and `configurePreviewServer`
 * (preview) to display QR codes once the server is listening.
 *
 * @param options - Plugin configuration options (all optional)
 * @returns Configured Vite Plugin instance
 *
 * @example
 * ```typescript
 * import { qrcode } from '@stackra/vite-config';
 *
 * export default defineConfig({
 *   plugins: [qrcode({ small: true })],
 * });
 * ```
 */
export function qrcode(options: IQRCodePluginOptions = {}): Plugin {
  const logger = console;
  const validatedOptions = validateQROptions(options);

  return {
    name: 'vite-plugin-qrcode',
    apply: 'serve',

    configureServer(server: ViteDevServer) {
      const originalListen = server.listen;

      server.listen = function listen(...args: unknown[]) {
        const isRestart = args[1] === true;

        if (!isRestart && server.httpServer) {
          server.httpServer.on('listening', () => {
            setTimeout(() => {
              void displayQRCodes(server, validatedOptions, logger);
            }, 0);
          });
        }

        return originalListen.apply(this, args as Parameters<typeof originalListen>);
      };
    },

    configurePreviewServer(server: PreviewServer) {
      if ('resolvedUrls' in server && server.httpServer) {
        server.httpServer.on('listening', () => {
          setTimeout(() => {
            void displayQRCodes(server, validatedOptions, logger);
          }, 0);
        });
      }
    },
  };
}
