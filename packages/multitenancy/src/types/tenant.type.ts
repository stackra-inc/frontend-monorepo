import type { BaseKey } from '@refinedev/core';

/**
 * Tenant entity representing a single tenant in the multi-tenancy system.
 *
 * @description
 * A tenant is an isolated customer/organization in your SaaS application.
 * Each tenant has their own data, users, and optionally custom domains.
 *
 * @example
 * ```typescript
 * const tenant: Tenant = {
 *   id: "tenant-123",
 *   name: "Acme Corporation",
 *   slug: "acme",
 *   subdomain: "acme",
 *   customDomain: "acme.com",
 *   settings: {
 *     theme: "dark",
 *     features: ["analytics", "api-access"]
 *   }
 * };
 * ```
 *
 * @property {BaseKey} id - Unique identifier for the tenant
 * @property {string} name - Display name of the tenant
 * @property {string} [slug] - URL-friendly identifier (optional)
 * @property {string} [subdomain] - Subdomain for the tenant (optional)
 * @property {string} [customDomain] - Custom domain for the tenant (optional)
 *
 * @public
 */
export type Tenant = {
  /**
   * Unique identifier for the tenant.
   * Can be a string or number depending on your database schema.
   *
   * @example "tenant-123" or "org-456" or 123
   */
  id: BaseKey;

  /**
   * Human-readable name of the tenant.
   * Displayed in UI elements like tenant selectors.
   *
   * @example "Acme Corporation" or "Globex Inc"
   */
  name: string;

  /**
   * Additional tenant properties.
   * Use this to store custom tenant data like settings, features, etc.
   *
   * @example
   * ```typescript
   * {
   *   slug: "acme",
   *   subdomain: "acme",
   *   customDomain: "acme.com",
   *   settings: { theme: "dark" },
   *   features: ["analytics"],
   *   createdAt: "2024-01-01T00:00:00Z"
   * }
   * ```
   */
  [key: string]: any;
};
