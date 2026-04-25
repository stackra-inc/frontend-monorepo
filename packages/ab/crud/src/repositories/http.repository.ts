/**
 * @fileoverview HTTP repository implementing BaseRepository via fetch calls.
 *
 * Translates the standard CRUD interface into HTTP requests.
 * Uses an injected {@link QueryStringSerializer} to convert
 * `GetListParams` into URL query strings.
 *
 * @module @stackra/react-refine
 * @category Repositories
 */

import { Str } from '@stackra/ts-support';
import { Injectable, Inject } from '@stackra/ts-container';
import { BaseRepository } from './base.repository';
import type { GetListParams } from '@/interfaces/get-list-params.interface';
import type { GetListResult } from '@/interfaces/get-list-result.interface';
import type { CustomParams } from '@/interfaces/custom-params.interface';
import type { HttpError } from '@/interfaces/http-error.interface';
import type { HttpRepositoryConfig } from '@/types/http-repository-config.type';
import type { QueryStringSerializer } from '@/interfaces/query-string-serializer.interface';
import { HTTP_CLIENT, HTTP_REPOSITORY_CONFIG, QUERY_STRING_SERIALIZER } from '@/constants';

/**
 * Repository that implements CRUD operations via HTTP requests.
 *
 * @typeParam TData - The entity/model type.
 * @typeParam TId - The identifier type.
 */
@Injectable()
export class HttpRepository<TData, TId = string | number> extends BaseRepository<TData, TId> {
  /**
   * @param httpClient - HTTP client (fetch wrapper or axios instance).
   * @param config - Repository configuration (endpoint, headers, baseUrl).
   * @param serializer - Query string serializer for list requests.
   */
  constructor(
    @Inject(HTTP_CLIENT) private readonly httpClient: any,
    @Inject(HTTP_REPOSITORY_CONFIG) private readonly config: HttpRepositoryConfig,
    @Inject(QUERY_STRING_SERIALIZER) private readonly serializer: QueryStringSerializer
  ) {
    super();
  }

  /** Full URL for the resource endpoint. */
  private get baseUrl(): string {
    const prefix = this.config.baseUrl ?? '';
    return `${prefix}${this.config.endpoint}`;
  }

  /** @inheritdoc */
  async getOne(id: TId): Promise<TData> {
    // GET /api/{resource}/{id}
    const response = await this.request<{ data: TData }>(`${this.baseUrl}/${id}`, {
      method: 'GET',
    });
    return response.data;
  }

  /** @inheritdoc */
  async getList(params: GetListParams): Promise<GetListResult<TData>> {
    // Serialize params to query string using the injected serializer
    const qs = this.serializer.serialize(params);
    const response = await this.request<{ data: TData[]; total: number }>(`${this.baseUrl}${qs}`, {
      method: 'GET',
    });
    return { data: response.data, total: response.total };
  }

  /** @inheritdoc */
  async getMany(ids: TId[]): Promise<TData[]> {
    // GET /api/{resource}?ids[]=1&ids[]=2
    const qs = ids.map((id) => `ids[]=${encodeURIComponent(String(id))}`).join('&');
    const response = await this.request<{ data: TData[] }>(`${this.baseUrl}?${qs}`, {
      method: 'GET',
    });
    return response.data;
  }

  /** @inheritdoc */
  async create(data: Partial<TData>): Promise<TData> {
    // POST /api/{resource}
    const response = await this.request<{ data: TData }>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /** @inheritdoc */
  async update(id: TId, data: Partial<TData>): Promise<TData> {
    // PUT /api/{resource}/{id}
    const response = await this.request<{ data: TData }>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /** @inheritdoc */
  async deleteOne(id: TId): Promise<void> {
    // DELETE /api/{resource}/{id}
    await this.request(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }

  /** @inheritdoc */
  async deleteMany(ids: TId[]): Promise<void> {
    // DELETE /api/{resource} with body { ids }
    await this.request(this.baseUrl, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  /** @inheritdoc */
  async createMany(data: Partial<TData>[]): Promise<TData[]> {
    // POST /api/{resource}/bulk
    const response = await this.request<{ data: TData[] }>(`${this.baseUrl}/bulk`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /** @inheritdoc */
  async updateMany(ids: TId[], data: Partial<TData>): Promise<TData[]> {
    // PUT /api/{resource}/bulk
    const response = await this.request<{ data: TData[] }>(`${this.baseUrl}/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ ids, ...data }),
    });
    return response.data;
  }

  /** @inheritdoc */
  async custom(params: CustomParams): Promise<any> {
    const url = params.url ?? this.baseUrl;
    const method = Str.upper(params.method ?? 'get');
    const response = await this.request(url, {
      method,
      body: params.payload ? JSON.stringify(params.payload) : undefined,
      headers: params.headers,
    });
    return response;
  }

  /**
   * Internal request helper that wraps errors into {@link HttpError}.
   *
   * @param url - Request URL.
   * @param init - Fetch init options.
   * @returns Parsed JSON response.
   * @throws {HttpError} On non-2xx responses.
   */
  private async request<T = any>(
    url: string,
    init: RequestInit & { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(this.config.headers as Record<string, string> | undefined),
        ...(init.headers as Record<string, string> | undefined),
      };

      const response = await this.httpClient(url, { ...init, headers });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const error: HttpError = {
          message: body.message ?? `HTTP ${response.status}`,
          statusCode: response.status,
          errors: body.errors,
        };
        throw error;
      }

      return response.json();
    } catch (err: any) {
      // Re-throw if already an HttpError
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }
      // Wrap unexpected errors
      const httpError: HttpError = {
        message: err?.message ?? 'Network error',
        statusCode: 0,
      };
      throw httpError;
    }
  }
}
