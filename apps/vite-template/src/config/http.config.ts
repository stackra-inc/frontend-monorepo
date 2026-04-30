/**
 * HTTP Configuration
 *
 * Configuration for the @stackra/ts-http package.
 * Defines the HTTP client base URL, timeout, default headers,
 * and middleware pipeline settings.
 *
 * ## Environment Variables
 *
 * | Variable                  | Description                          | Default                    |
 * |---------------------------|--------------------------------------|----------------------------|
 * | `VITE_API_URL`            | Base URL for all API requests        | `''`                       |
 * | `VITE_API_TIMEOUT`        | Request timeout in milliseconds      | `30000`                    |
 * | `VITE_API_ACCEPT`         | Default Accept header                | `'application/json'`       |
 * | `VITE_API_CONTENT_TYPE`   | Default Content-Type header          | `'application/json'`       |
 * | `VITE_HTTP_RETRY_ATTEMPTS`| Number of retry attempts             | `3`                        |
 * | `VITE_HTTP_RETRY_DELAY`   | Base delay between retries (ms)      | `1000`                     |
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import httpConfig from '@/config/http.config';
 *
 * @Module({
 *   imports: [HttpModule.forRoot(httpConfig)],
 * })
 * export class AppModule {}
 * ```
 *
 * @module config/http
 */

import type { HttpClientConfig } from "@stackra/ts-http";

/**
 * HTTP client configuration.
 *
 * @example
 * ```typescript
 * import { HttpFacade } from '@stackra/ts-http';
 *
 * const response = await HttpFacade.get('/users');
 * const user = await HttpFacade.post('/users', { name: 'Alice' });
 * ```
 */
const httpConfig: HttpClientConfig = {
  /*
  |--------------------------------------------------------------------------
  | Base URL
  |--------------------------------------------------------------------------
  |
  | The base URL prepended to all relative request URLs. Set this to
  | your API server's root endpoint. All requests made via the HTTP
  | client will use this as the prefix.
  |
  | @example 'https://api.example.com/v1'
  |
  */
  baseURL: env("VITE_API_URL", ""),

  /*
  |--------------------------------------------------------------------------
  | Timeout
  |--------------------------------------------------------------------------
  |
  | Default request timeout in milliseconds. If a request takes longer
  | than this, it will be aborted and an error thrown. Individual
  | requests can override this value.
  |
  | @default 30000 (30 seconds)
  |
  */
  timeout: env("VITE_API_TIMEOUT", 30000),

  /*
  |--------------------------------------------------------------------------
  | Default Headers
  |--------------------------------------------------------------------------
  |
  | Headers applied to every outgoing request. Per-request headers
  | are merged on top of these defaults. Common use cases:
  |
  |   - Accept / Content-Type for JSON APIs
  |   - X-Requested-With for CSRF protection
  |   - Custom app version headers
  |
  */
  headers: {
    Accept: env("VITE_API_ACCEPT", "application/json"),
    "Content-Type": env("VITE_API_CONTENT_TYPE", "application/json"),
  },
};

export default httpConfig;
