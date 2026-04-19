/**
 * Tenant mode enum defining how tenant ID is passed to the backend API.
 *
 * @description
 * This enum determines how the tenant context is communicated between
 * the frontend and backend. Choose the mode that best fits your API design.
 *
 * @example
 * ```typescript
 * import { TenantMode } from "@stackra-inc/react-multitenancy";
 *
 * const config = {
 *   mode: TenantMode.HEADER, // Use HTTP header
 *   headerName: "X-Tenant-ID"
 * };
 * ```
 *
 * @public
 */
export enum TenantMode {
  /**
   * Pass tenant ID as a filter in the request.
   *
   * @description
   * Adds tenant_id as a filter to data provider methods.
   * The data provider will include it in the query.
   *
   * @example
   * ```typescript
   * // Frontend adds filter
   * filters: [
   *   { field: "tenant_id", operator: "eq", value: "tenant-123" }
   * ]
   *
   * // Backend receives
   * GET /api/products?filters[0][field]=tenant_id&filters[0][value]=tenant-123
   * ```
   *
   * @remarks
   * Best for: REST APIs with filter support
   */
  FILTER = 'filter',

  /**
   * Pass tenant ID as an HTTP header.
   *
   * @description
   * Adds tenant ID to request headers. Backend reads from header.
   *
   * @example
   * ```typescript
   * // Frontend adds header
   * headers: {
   *   "X-Tenant-ID": "tenant-123"
   * }
   *
   * // Backend reads
   * const tenantId = req.headers['x-tenant-id'];
   * ```
   *
   * @remarks
   * Best for: Clean API design, works with any endpoint
   * Most common in SaaS applications
   */
  HEADER = 'header',

  /**
   * Pass tenant ID in the URL path.
   *
   * @description
   * Includes tenant ID as part of the URL path.
   *
   * @example
   * ```typescript
   * // Frontend calls
   * GET /api/tenant-123/products
   *
   * // Backend route
   * app.get('/api/:tenantId/products', handler);
   * ```
   *
   * @remarks
   * Best for: Explicit tenant scoping in URLs
   * Good for debugging and logging
   */
  URL = 'url',

  /**
   * Pass tenant ID as a query parameter.
   *
   * @description
   * Adds tenant ID as a query string parameter.
   *
   * @example
   * ```typescript
   * // Frontend calls
   * GET /api/products?tenant_id=tenant-123
   *
   * // Backend reads
   * const tenantId = req.query.tenant_id;
   * ```
   *
   * @remarks
   * Best for: Simple APIs, easy debugging
   * Visible in browser network tab
   */
  QUERY = 'query',
}
