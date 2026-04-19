/**
 * @fileoverview Default AuditLogService implementation.
 *
 * Provides a fully functional audit log service that communicates
 * with a backend API via the injected {@link HttpClient} from
 * `@stackra/ts-http`. Handles creating, retrieving, and updating
 * audit trail entries out of the box.
 *
 * Users can override this by passing a custom `auditLogService` to
 * `RefineModule.forRoot()`. The custom service must implement
 * {@link IAuditLogService}.
 *
 * @module @stackra/react-refine
 * @category Services
 *
 * @example
 * ```typescript
 * // Uses the built-in AuditLogService automatically:
 * RefineModule.forRoot();
 *
 * // Or supply your own:
 * RefineModule.forRoot({ auditLogService: new MyCustomAuditLog() });
 * ```
 */

import { Injectable, Inject } from '@stackra/ts-container';
import { HTTP_CLIENT } from '@stackra/ts-http';
import type { HttpClient, HttpResponse } from '@stackra/ts-http';
import type {
  IAuditLogService,
  AuditLogCreateParams,
  AuditLogGetParams,
  AuditLogUpdateParams,
} from '@/interfaces/audit-log.interface';

/**
 * Default audit log service.
 *
 * Communicates with a backend API using the injected {@link HttpClient}.
 * Authentication headers are handled automatically by the HTTP client's
 * middleware pipeline (e.g. `AuthMiddleware` from `@stackra/ts-http`).
 *
 * ### API Contract
 *
 * | Operation | Method | Endpoint              | Body / Query                                         | Response         |
 * |-----------|--------|-----------------------|------------------------------------------------------|------------------|
 * | Create    | POST   | `/api/audit-logs`     | `{ resource, action, data?, previousData?, meta? }`  | Created entry    |
 * | Get       | GET    | `/api/audit-logs`     | `?resource=...&action=...`                           | Array of entries |
 * | Update    | PATCH  | `/api/audit-logs/:id` | `{ name, meta? }`                                    | Updated entry    |
 */
@Injectable()
export class AuditLogService implements IAuditLogService {
  /**
   * Create a new AuditLogService instance.
   *
   * @param http - The {@link HttpClient} instance injected via DI.
   *   Provided by `@stackra/ts-http` through `HttpModule.forRoot()`.
   */
  constructor(@Inject(HTTP_CLIENT) private readonly http: HttpClient) {}

  // ─── IAuditLogService Implementation ─────────────────────────────

  /**
   * Create a new audit log entry.
   *
   * Sends a `POST /api/audit-logs` request with the audit data.
   * The server is expected to persist the entry and return the
   * created record.
   *
   * @param params - Creation parameters including resource name,
   *   action performed, new data, previous data, and metadata.
   * @returns The created audit log entry, or `undefined` on failure.
   */
  async create(params: AuditLogCreateParams): Promise<any> {
    try {
      const response: HttpResponse = await this.http.post('/api/audit-logs', {
        resource: params.resource,
        action: params.action,
        data: params.data,
        previousData: params.previousData,
        meta: params.meta,
      });

      return response.data;
    } catch (error: any) {
      console.warn(
        '[Refine AuditLog] Failed to create entry:',
        error?.response?.data?.message ?? error?.message
      );
      return undefined;
    }
  }

  /**
   * Retrieve audit log entries matching the given criteria.
   *
   * Sends a `GET /api/audit-logs` request with query parameters
   * derived from the provided filter params.
   *
   * @param params - Query parameters including resource name,
   *   optional action filter, metadata, and author filter.
   * @returns An array of matching audit log entries, or an empty
   *   array on failure.
   */
  async get(params: AuditLogGetParams): Promise<any> {
    try {
      /* Build query params from non-undefined fields */
      const queryParams: Record<string, any> = {};
      if (params.resource) queryParams['resource'] = params.resource;
      if (params.action) queryParams['action'] = params.action;
      if (params.author) queryParams['author'] = String(params.author);
      if (params.meta) queryParams['meta'] = JSON.stringify(params.meta);

      const response: HttpResponse = await this.http.get('/api/audit-logs', {
        params: queryParams,
      });

      return response.data;
    } catch (error: any) {
      console.warn(
        '[Refine AuditLog] Failed to fetch entries:',
        error?.response?.data?.message ?? error?.message
      );
      return [];
    }
  }

  /**
   * Update an existing audit log entry.
   *
   * Sends a `PATCH /api/audit-logs/:id` request with the updated
   * name and optional metadata.
   *
   * @param params - Update parameters including the entry ID,
   *   new name, and optional metadata.
   * @returns The updated audit log entry, or `undefined` on failure.
   */
  async update(params: AuditLogUpdateParams): Promise<any> {
    try {
      const response: HttpResponse = await this.http.patch(`/api/audit-logs/${params.id}`, {
        name: params.name,
        meta: params.meta,
      });

      return response.data;
    } catch (error: any) {
      console.warn(
        '[Refine AuditLog] Failed to update entry:',
        error?.response?.data?.message ?? error?.message
      );
      return undefined;
    }
  }
}
