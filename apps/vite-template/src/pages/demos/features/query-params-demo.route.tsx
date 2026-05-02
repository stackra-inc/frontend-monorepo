/**
 * @fileoverview Query Parameters Demo Route
 *
 * Route definition for the query parameters demo page.
 * Demonstrates the query parameter management system with Zod validation.
 *
 * @module demos
 * @category Routes
 */

import { Route } from "@stackra/react-router";
import { QueryParamsDemoComponent } from "@/components/pages/demos/features/query-params-demo.component";
import { z } from "zod";

/**
 * Zod schema for the demo route's query parameters.
 *
 * Defines validation rules and defaults for the query parameters.
 * This schema is used by the route to validate incoming query parameters.
 */
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(10).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive", "draft"]).default("all"),
  tags: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string")
      return val
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    return undefined;
  }, z.array(z.string()).optional()),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Query Parameters Demo Route
 *
 * Demonstrates the query parameter management system with:
 * - Type-safe query parameter access
 * - Zod schema validation
 * - Complex type serialization (arrays, objects, dates)
 * - URL synchronization without component remount
 * - Preserve/filter unknown parameters
 *
 * ## Route Configuration
 *
 * - **Path**: `/demos/features/query-params`
 * - **Label**: Query Parameters
 * - **Variant**: main (appears in main navigation)
 * - **Parent**: `/demos` (nested under demos)
 * - **Query Schema**: Validates page, pageSize, search, status, tags, sortBy, sortOrder
 * - **Query Defaults**: Provides fallback values for missing parameters
 *
 * ## Query Parameters
 *
 * - `page` (number, default: 1) — Current page number
 * - `pageSize` (number, default: 20) — Items per page (10-100)
 * - `search` (string, optional) — Search query
 * - `status` (enum, default: 'all') — Filter by status
 * - `tags` (array, optional) — Filter by tags
 * - `sortBy` (enum, default: 'createdAt') — Sort field
 * - `sortOrder` (enum, default: 'desc') — Sort direction
 *
 * @example
 * ```
 * // Navigate with query parameters
 * /demos/features/query-params?page=2&search=react&status=active&tags=typescript,node
 * ```
 */
@Route({
  path: "/demos/features/query-params",
  label: "Query Parameters",
  variant: "main",
  parent: "/demos",
  hideInMenu: false,
  order: 14,
  querySchema,
  queryDefaults: {
    page: 1,
    pageSize: 20,
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
})
export class QueryParamsDemoRoute {
  /**
   * Render the query parameters demo component.
   *
   * @returns {React.ReactElement} The demo component
   */
  render() {
    return <QueryParamsDemoComponent />;
  }
}
