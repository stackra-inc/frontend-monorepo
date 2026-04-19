/**
 * Protocol Service
 *
 * |--------------------------------------------------------------------------
 * | Custom URL protocol registration and handling.
 * |--------------------------------------------------------------------------
 * |
 * | Registers a custom URL scheme (e.g. stackra-inc://open?order=123)
 * | so external applications can deep-link into the app.
 * |
 * | In Electron: registers the protocol via IPC and listens for
 * | incoming URLs from the main process.
 * | In browser: logs a warning, resolves without error.
 * |
 * | Usage:
 * |   const protocol = container.get(ProtocolService);
 * |   await protocol.registerProtocol('stackra-inc');
 * |   const unsub = protocol.onProtocolUrl((parsed) => {
 * |     console.log(parsed.pathSegments, parsed.query);
 * |   });
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import type { ParsedProtocolUrl } from '@/interfaces/system.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class ProtocolService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | registerProtocol
  |--------------------------------------------------------------------------
  */
  async registerProtocol(scheme: string): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[ProtocolService] Custom protocol registration not available in browser.');
      return;
    }
    await this.desktop.bridge.invoke('protocol:register', scheme);
  }

  /*
  |--------------------------------------------------------------------------
  | onProtocolUrl
  |--------------------------------------------------------------------------
  |
  | Listens for incoming protocol URLs from the main process.
  | Parses the raw URL string into scheme, path segments, and query params.
  | Returns an unsubscribe function.
  |
  */
  onProtocolUrl(callback: (url: ParsedProtocolUrl) => void): () => void {
    if (!this.desktop.isDesktop) return () => {};

    return this.desktop.bridge.onMenuAction('protocol:url', (...args: unknown[]) => {
      const rawUrl = args[0] as string;
      const parsed = ProtocolService.parseProtocolUrl(rawUrl);
      callback(parsed);
    });
  }

  /*
  |--------------------------------------------------------------------------
  | parseProtocolUrl (static, testable)
  |--------------------------------------------------------------------------
  |
  | Parses a protocol URL string into its components.
  |
  | Input:  "stackra-inc://open/order?id=123&status=paid"
  | Output: {
  |   raw: "stackra-inc://open/order?id=123&status=paid",
  |   scheme: "stackra-inc",
  |   pathSegments: ["open", "order"],
  |   query: { id: "123", status: "paid" },
  | }
  |
  */
  static parseProtocolUrl(rawUrl: string): ParsedProtocolUrl {
    const result: ParsedProtocolUrl = {
      raw: rawUrl,
      scheme: '',
      pathSegments: [],
      query: {},
    };

    /*
    |--------------------------------------------------------------------------
    | Extract scheme — everything before "://"
    |--------------------------------------------------------------------------
    */
    const schemeEnd = rawUrl.indexOf('://');
    if (schemeEnd === -1) {
      result.scheme = rawUrl;
      return result;
    }

    result.scheme = rawUrl.slice(0, schemeEnd);
    const rest = rawUrl.slice(schemeEnd + 3);

    /*
    |--------------------------------------------------------------------------
    | Split path and query string.
    |--------------------------------------------------------------------------
    */
    const queryStart = rest.indexOf('?');
    const pathPart = queryStart === -1 ? rest : rest.slice(0, queryStart);
    const queryPart = queryStart === -1 ? '' : rest.slice(queryStart + 1);

    /*
    |--------------------------------------------------------------------------
    | Parse path segments — filter out empty strings from leading/trailing slashes.
    |--------------------------------------------------------------------------
    */
    result.pathSegments = pathPart.split('/').filter((s) => s.length > 0);

    /*
    |--------------------------------------------------------------------------
    | Parse query parameters.
    |--------------------------------------------------------------------------
    */
    if (queryPart) {
      for (const pair of queryPart.split('&')) {
        const eqIdx = pair.indexOf('=');
        if (eqIdx === -1) {
          result.query[decodeURIComponent(pair)] = '';
        } else {
          const key = decodeURIComponent(pair.slice(0, eqIdx));
          const value = decodeURIComponent(pair.slice(eqIdx + 1));
          result.query[key] = value;
        }
      }
    }

    return result;
  }
}
