/**
 * @fileoverview Query Parameters Demo Component
 *
 * This component demonstrates the query parameter management system, showing how to:
 * - Use the useQueryParams hook for type-safe query parameters
 * - Validate query parameters with Zod schemas
 * - Serialize complex types (arrays, objects, dates)
 * - Update query parameters without remounting the component
 * - Preserve or filter unknown query parameters
 *
 * The demo provides an interactive interface to test different query parameter
 * configurations and see how they affect the URL and component state.
 *
 * @module demos
 * @category Components
 */

import { useState, type ReactElement } from "react";
import { Button, Card, Input, Chip } from "@heroui/react";
import { useQueryParams, type QueryConfig } from "@stackra/react-router";
import { z } from "zod";

/**
 * Zod schema for post filters.
 *
 * Defines the structure and validation rules for query parameters.
 * Uses defaults for missing values and optional fields for nullable values.
 */
const postFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(10).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive", "draft"]).default("all"),
  tags: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string")
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return undefined;
  }, z.array(z.string()).optional()),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Type for post filters derived from the Zod schema.
 */
type PostFilters = z.infer<typeof postFiltersSchema>;

/**
 * Demo component for query parameter management.
 *
 * Provides an interactive interface to test query parameter features:
 * - Type-safe parameter access
 * - Zod schema validation
 * - Complex type serialization (arrays, objects, dates)
 * - URL synchronization
 * - Preserve/filter unknown parameters
 *
 * @component
 * @returns {React.ReactElement} The query params demo UI
 */
export function QueryParamsDemoComponent(): ReactElement {
  // Configuration for query parameter management
  const config: QueryConfig<PostFilters> = {
    schema: postFiltersSchema,
    defaults: {
      page: 1,
      pageSize: 20,
      status: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    preserveOthers: true,
    replace: false,
  };

  // Use the query params hook
  const [filters, setFilters] = useQueryParams<PostFilters>(config);

  // Local state for tag input
  const [tagInput, setTagInput] = useState("");

  /**
   * Handle page change.
   */
  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  /**
   * Handle search input change.
   */
  const handleSearchChange = (value: string) => {
    setFilters({ search: value || undefined, page: 1 });
  };

  /**
   * Handle status change.
   */
  const handleStatusChange = (status: PostFilters["status"]) => {
    setFilters({ status, page: 1 });
  };

  /**
   * Handle page size change.
   */
  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ pageSize, page: 1 });
  };

  /**
   * Handle sort change.
   */
  const handleSortChange = (sortBy: PostFilters["sortBy"], sortOrder: PostFilters["sortOrder"]) => {
    setFilters({ sortBy, sortOrder });
  };

  /**
   * Add a tag to the filters.
   */
  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const currentTags = filters.tags ?? [];
    const newTags = [...currentTags, tagInput.trim()];
    setFilters({ tags: newTags, page: 1 });
    setTagInput("");
  };

  /**
   * Remove a tag from the filters.
   */
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = filters.tags ?? [];
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    setFilters({ tags: newTags.length > 0 ? newTags : undefined, page: 1 });
  };

  /**
   * Reset all filters to defaults.
   */
  const handleReset = () => {
    setFilters({
      page: 1,
      pageSize: 20,
      search: undefined,
      status: "all",
      tags: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Query Parameters Demo</h1>
        <p className="text-gray-600">
          Test type-safe query parameter management with Zod validation. All changes are
          synchronized with the URL without remounting the component.
        </p>
      </div>

      {/* Current URL */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-3">Current URL</h2>
        <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
          {window.location.pathname}
          {window.location.search}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              value={filters.search ?? ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search posts..."
              className="max-w-md"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "inactive", "draft"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filters.status === status ? "primary" : "outline"}
                  onPress={() => handleStatusChange(status)}
                  size="sm"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                className="max-w-md"
              />
              <Button onPress={handleAddTag} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.tags?.map((tag) => (
                <Chip key={tag}>
                  <Chip.Label>{tag}</Chip.Label>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-xs opacity-70 hover:opacity-100"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </Chip>
              ))}
              {(!filters.tags || filters.tags.length === 0) && (
                <span className="text-sm text-gray-500">No tags selected</span>
              )}
            </div>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Page Size</label>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 50, 100].map((size) => (
                <Button
                  key={size}
                  variant={filters.pageSize === size ? "primary" : "outline"}
                  onPress={() => handlePageSizeChange(size)}
                  size="sm"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(["createdAt", "updatedAt", "title", "views"] as const).map((sortBy) => (
                <Button
                  key={sortBy}
                  variant={filters.sortBy === sortBy ? "primary" : "outline"}
                  onPress={() => handleSortChange(sortBy, filters.sortOrder)}
                  size="sm"
                >
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant={filters.sortOrder === "asc" ? "primary" : "outline"}
                onPress={() => handleSortChange(filters.sortBy, "asc")}
                size="sm"
              >
                Ascending
              </Button>
              <Button
                variant={filters.sortOrder === "desc" ? "primary" : "outline"}
                onPress={() => handleSortChange(filters.sortBy, "desc")}
                size="sm"
              >
                Descending
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Pagination */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Pagination</h2>
        <div className="flex items-center gap-3">
          <Button
            onPress={() => handlePageChange(filters.page - 1)}
            isDisabled={filters.page <= 1}
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page <strong>{filters.page}</strong>
          </span>
          <Button onPress={() => handlePageChange(filters.page + 1)} size="sm">
            Next
          </Button>
        </div>
      </Card>

      {/* Current Filters State */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-3">Current Filters State</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{JSON.stringify(filters, null, 2)}</code>
        </pre>
        <Button onPress={handleReset} variant="outline" className="mt-3">
          Reset to Defaults
        </Button>
      </Card>

      {/* Code Example */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Code Example</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`import { useQueryParams } from '@stackra/react-router';
import { z } from 'zod';

// Define schema
const filtersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(10).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all')
});

type Filters = z.infer<typeof filtersSchema>;

// Use hook
function MyComponent() {
  const [filters, setFilters] = useQueryParams<Filters>({
    schema: filtersSchema,
    defaults: { page: 1, pageSize: 20, status: 'all' },
    preserveOthers: true,
    replace: false
  });

  // Read params
  console.log(filters.page, filters.search);

  // Update params
  setFilters({ page: 2 });
  setFilters({ search: 'react' });

  return <div>Page: {filters.page}</div>;
}`}</code>
        </pre>
      </Card>

      {/* Features */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-blue-600">Type Safety</h3>
            <p className="text-sm text-gray-600">
              Query parameters are fully typed with TypeScript. The hook returns a typed object
              based on your Zod schema.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-purple-600">Zod Validation</h3>
            <p className="text-sm text-gray-600">
              Invalid parameters are validated against the schema and fall back to defaults. Ensures
              data integrity.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-green-600">Complex Types</h3>
            <p className="text-sm text-gray-600">
              Supports arrays, objects, dates, and primitives. Automatically serializes and
              deserializes complex types.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600">No Remount</h3>
            <p className="text-sm text-gray-600">
              Query parameter updates don't remount the component. State is preserved and only the
              URL changes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-red-600">Preserve Others</h3>
            <p className="text-sm text-gray-600">
              Optionally preserve unknown query parameters (like UTM params) when updating filters.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
