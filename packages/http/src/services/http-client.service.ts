/**
 * HTTP Client Service
 *
 * The main HTTP client — the public API consumers interact with.
 * Uses axios under the hood and runs every request through the
 * middleware pipeline before hitting the network.
 *
 * Injected via the `HTTP_CLIENT` token after configuring
 * `HttpModule.forRoot()`.
 *
 * ## Architecture
 *
 * ```
 * HttpClient.get('/users')
 *   → buildContext()
 *   → MiddlewarePipeline.execute(context, axiosHandler)
 *     → ErrorNormalizer → Auth → Retry → Logging → axiosHandler
 *   → HttpResponse
 * ```
 *
 * @module @stackra/ts-http
 * @category Services
 *
 * @example
 * ```typescript
 * import { Inject, Injectable } from '@stackra/ts-container';
 * import { HTTP_CLIENT } from '@stackra/ts-http';
 * import type { HttpClient, HttpResponse } from '@stackra/ts-http';
 *
 * @Injectable()
 * class UserService {
 *   constructor(@Inject(HTTP_CLIENT) private http: HttpClient) {}
 *
 *   async getUsers(): Promise<HttpResponse<User[]>> {
 *     return this.http.get<User[]>('/api/users');
 *   }
 *
 *   async createUser(data: CreateUserDto): Promise<HttpResponse<User>> {
 *     return this.http.post<User>('/api/users', data);
 *   }
 * }
 * ```
 */

import axios from 'axios';
import { Injectable, Inject } from '@stackra/ts-container';
import { Str } from '@stackra/ts-support';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import { HTTP_CONFIG, MIDDLEWARE_PIPELINE } from '@/constants';
import { HttpMethod } from '@/enums/http-method.enum';
import { MiddlewarePipeline } from './middleware-pipeline.service';
import type { HttpContext } from '@/interfaces/http-context.interface';
import type { HttpResponse } from '@/interfaces/http-response.interface';
import type { HttpClientConfig } from '@/interfaces/http-config.interface';
import type { HttpRequestConfig } from '@/interfaces/http-request.interface';

/**
 * HTTP Client
 *
 * Provides convenience methods for all standard HTTP verbs.
 * Each method builds a request config, wraps it in an {@link HttpContext},
 * and runs it through the {@link MiddlewarePipeline}.
 */
@Injectable()
export class HttpClient {
  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  constructor(
    @Inject(HTTP_CONFIG) private readonly config: HttpClientConfig,
    @Inject(MIDDLEWARE_PIPELINE) private readonly pipeline: MiddlewarePipeline
  ) {}

  /*
  |--------------------------------------------------------------------------
  | GET
  |--------------------------------------------------------------------------
  */

  /**
   * Send a GET request.
   *
   * @typeParam T - Expected response body type.
   * @param url    - Request URL (relative to baseURL).
   * @param config - Optional per-request configuration overrides.
   * @returns The HTTP response.
   *
   * @example
   * ```typescript
   * const response = await http.get<User[]>('/api/users', {
   *   params: { page: 1, limit: 20 },
   * });
   * ```
   */
  async get<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: HttpMethod.GET,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | POST
  |--------------------------------------------------------------------------
  */

  /**
   * Send a POST request.
   *
   * @typeParam T - Expected response body type.
   * @param url    - Request URL (relative to baseURL).
   * @param data   - Request body data.
   * @param config - Optional per-request configuration overrides.
   * @returns The HTTP response.
   *
   * @example
   * ```typescript
   * const response = await http.post<User>('/api/users', {
   *   name: 'John',
   *   email: 'john@example.com',
   * });
   * ```
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: HttpMethod.POST,
      data,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PUT
  |--------------------------------------------------------------------------
  */

  /**
   * Send a PUT request.
   *
   * @typeParam T - Expected response body type.
   * @param url    - Request URL (relative to baseURL).
   * @param data   - Request body data.
   * @param config - Optional per-request configuration overrides.
   * @returns The HTTP response.
   *
   * @example
   * ```typescript
   * const response = await http.put<User>('/api/users/1', {
   *   name: 'John Updated',
   * });
   * ```
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: HttpMethod.PUT,
      data,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PATCH
  |--------------------------------------------------------------------------
  */

  /**
   * Send a PATCH request.
   *
   * @typeParam T - Expected response body type.
   * @param url    - Request URL (relative to baseURL).
   * @param data   - Partial update data.
   * @param config - Optional per-request configuration overrides.
   * @returns The HTTP response.
   *
   * @example
   * ```typescript
   * const response = await http.patch<User>('/api/users/1', {
   *   name: 'Jane',
   * });
   * ```
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: HttpMethod.PATCH,
      data,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  /**
   * Send a DELETE request.
   *
   * @typeParam T - Expected response body type.
   * @param url    - Request URL (relative to baseURL).
   * @param config - Optional per-request configuration overrides.
   * @returns The HTTP response.
   *
   * @example
   * ```typescript
   * await http.delete('/api/users/1');
   * ```
   */
  async delete<T = any>(
    url: string,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.executeRequest<T>({
      ...config,
      url,
      method: HttpMethod.DELETE,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | request
  |--------------------------------------------------------------------------
  */

  /**
   * Send a request with a full configuration object.
   *
   * Use this for non-standard methods or when you need full control
   * over the request configuration.
   *
   * @typeParam T - Expected response body type.
   * @param config - Complete request configuration.
   * @returns The HTTP response.
   *
   * @example
   * ```typescript
   * const response = await http.request<User>({
   *   url: '/api/users',
   *   method: HttpMethod.POST,
   *   data: { name: 'John' },
   *   headers: { 'X-Custom': 'value' },
   * });
   * ```
   */
  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.executeRequest<T>(config);
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — executeRequest
  |--------------------------------------------------------------------------
  |
  | Merges per-request config with global defaults, builds the context,
  | and runs it through the middleware pipeline.
  |
  */

  /**
   * Build the context and execute the request through the pipeline.
   *
   * @param config - The merged request configuration.
   * @returns The HTTP response.
   */
  private async executeRequest<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    // Merge global config defaults with per-request overrides.
    const mergedConfig: HttpRequestConfig = {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout ?? 30000,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers,
      },
    };

    // Build the context object that flows through the pipeline.
    const context: HttpContext = {
      request: mergedConfig,
      metadata: new Map<string, any>(),
    };

    // Run through the middleware pipeline with axios as the final handler.
    return this.pipeline.execute(context, (ctx) => this.axiosHandler(ctx)) as Promise<
      HttpResponse<T>
    >;
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — axiosHandler
  |--------------------------------------------------------------------------
  |
  | The terminal handler in the pipeline. Translates the HttpContext
  | into an axios request and normalizes the response.
  |
  */

  /**
   * The final handler that actually calls axios.
   *
   * @param context - The HTTP context after all middleware have processed it.
   * @returns The normalized HTTP response.
   */
  private async axiosHandler(context: HttpContext): Promise<HttpResponse> {
    const { request } = context;

    // Build the axios config from our normalized request config.
    const axiosConfig: AxiosRequestConfig = {
      url: request.url,
      method: Str.lower(request.method ?? 'get'),
      baseURL: request.baseURL,
      headers: request.headers,
      params: request.params,
      data: request.data,
      timeout: request.timeout,
      signal: request.signal,
      responseType: request.responseType,
      onUploadProgress: request.onUploadProgress,
      onDownloadProgress: request.onDownloadProgress,
    };

    // Execute the axios request.
    const axiosResponse: AxiosResponse = await axios.request(axiosConfig);

    // Normalize the axios response into our HttpResponse shape.
    return {
      data: axiosResponse.data,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers as Record<string, string>,
      config: request,
    };
  }
}
