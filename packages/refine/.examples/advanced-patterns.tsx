/**
 * @example Advanced Patterns
 *
 * Demonstrates advanced usage of @stackra-inc/react-refine:
 * - Custom repositories extending BaseRepository
 * - Custom services extending BaseService with business logic
 * - Query string serializers (Laravel, JSON:API)
 * - Infinite scrolling with useInfiniteList
 * - Custom queries with useCustom and useCustomMutation
 * - Composing hooks for complex UI patterns
 * - Registering models with custom service/repository in @Resource
 *
 * @module @stackra-inc/react-refine
 * @category Examples
 */

import React from 'react';
import {
  Resource,
  RefineModule,
  BaseRepository,
  BaseService,
  JsonApiQueryStringSerializer,
  FilterOperator,
  useList,
  useCreate,
  useUpdate,
  useDelete,
  useInfiniteList,
  useCustom,
  useCustomMutation,
  useNotification,
} from '@stackra-inc/react-refine';
import type { GetListParams, GetListResult, CustomParams } from '@stackra-inc/react-refine';
import { Module, Injectable } from '@stackra-inc/ts-container';

// ─── 1. Custom Repository ────────────────────────────────────────────

/**
 * A custom repository that adds authorization headers,
 * response transformation, and error handling on top of fetch.
 */
@Injectable()
class AuthenticatedApiRepository extends BaseRepository<any, string> {
  constructor(private readonly baseEndpoint: string) {
    super();
  }

  private get headers(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private get baseUrl(): string {
    return `${process.env.API_BASE_URL}${this.baseEndpoint}`;
  }

  async getOne(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/${id}`, { headers: this.headers });
    if (!res.ok) throw await this.handleError(res);
    const json = await res.json();
    return json.data;
  }

  async getList(params: GetListParams): Promise<GetListResult<any>> {
    const query = new URLSearchParams();

    if (params.pagination) {
      query.set('page', String(params.pagination.current ?? 1));
      query.set('per_page', String(params.pagination.pageSize ?? 10));
    }

    if (params.sorters?.length) {
      const sort = params.sorters
        .map((s) => (s.order === 'desc' ? `-${s.field}` : s.field))
        .join(',');
      query.set('sort', sort);
    }

    if (params.filters?.length) {
      for (const filter of params.filters) {
        query.set(`filter[${filter.field}]`, String(filter.value));
      }
    }

    const res = await fetch(`${this.baseUrl}?${query}`, { headers: this.headers });
    if (!res.ok) throw await this.handleError(res);

    const json = await res.json();
    return { data: json.data, total: json.meta.total };
  }

  async getMany(ids: string[]): Promise<any[]> {
    const query = new URLSearchParams({ 'filter[id]': ids.join(',') });
    const res = await fetch(`${this.baseUrl}?${query}`, { headers: this.headers });
    if (!res.ok) throw await this.handleError(res);
    const json = await res.json();
    return json.data;
  }

  async create(data: Partial<any>): Promise<any> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await this.handleError(res);
    return (await res.json()).data;
  }

  async update(id: string, data: Partial<any>): Promise<any> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await this.handleError(res);
    return (await res.json()).data;
  }

  async deleteOne(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!res.ok) throw await this.handleError(res);
  }

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteOne(id)));
  }

  async createMany(data: Partial<any>[]): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/bulk`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ items: data }),
    });
    if (!res.ok) throw await this.handleError(res);
    return (await res.json()).data;
  }

  async updateMany(ids: string[], data: Partial<any>): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/bulk`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ ids, ...data }),
    });
    if (!res.ok) throw await this.handleError(res);
    return (await res.json()).data;
  }

  async custom(params: CustomParams): Promise<any> {
    const res = await fetch(`${this.baseUrl}/${params.url}`, {
      method: (params.method ?? 'get').toUpperCase(),
      headers: this.headers,
      body: params.payload ? JSON.stringify(params.payload) : undefined,
    });
    if (!res.ok) throw await this.handleError(res);
    return res.json();
  }

  private async handleError(res: Response) {
    const body = await res.json().catch(() => ({}));
    return {
      message: body.message ?? res.statusText,
      statusCode: res.status,
      errors: body.errors,
    };
  }
}

// ─── 2. Custom Service with Business Logic ───────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  sku: string;
}

type ProductStatus = Product['status'];

/**
 * Custom service that adds validation, computed fields,
 * and business rules on top of the base CRUD operations.
 */
@Injectable()
class ProductService extends BaseService<Product, string> {
  /**
   * Override create to add validation and auto-compute status.
   */
  async create(data: Partial<Product>): Promise<Product> {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Product name must be at least 2 characters');
    }
    if (data.price !== undefined && data.price < 0) {
      throw new Error('Price cannot be negative');
    }

    const status: ProductStatus = (data.stock ?? 0) > 0 ? 'active' : 'out_of_stock';
    const enriched: Partial<Product> = {
      ...data,
      status,
      sku: data.sku ?? this.generateSku(data.name!),
    };

    return super.create(enriched);
  }

  /**
   * Override update to re-compute status when stock changes.
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    const updates = { ...data };
    if (updates.stock !== undefined) {
      updates.status = updates.stock > 0 ? 'active' : 'out_of_stock';
    }
    return super.update(id, updates);
  }

  /**
   * Custom method: adjust stock level.
   */
  async adjustStock(id: string, delta: number): Promise<Product> {
    const product = await this.getOne(id);
    const newStock = Math.max(0, product.stock + delta);
    return this.update(id, { stock: newStock });
  }

  private generateSku(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  }
}

// ─── 3. Register Models with Custom Service/Repository ───────────────

const PRODUCT_RESOURCE = 'products';
const ORDER_RESOURCE = 'orders';

@Resource({
  name: PRODUCT_RESOURCE,
  endpoint: '/api/products',
  service: ProductService,
  repository: AuthenticatedApiRepository,
})
class ProductModel implements Product {
  id!: string;
  name!: string;
  price!: number;
  stock!: number;
  status!: 'active' | 'inactive' | 'out_of_stock';
  sku!: string;
}

@Resource({
  name: ORDER_RESOURCE,
  endpoint: '/api/orders',
  repository: AuthenticatedApiRepository,
})
class Order {
  id!: string;
  productId!: string;
  quantity!: number;
  total!: number;
  status!: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

// ─── 4. Module with JSON:API Serializer ──────────────────────────────

// Use LaravelQueryStringSerializer (default) for Laravel backends:
//   ?page=1&per_page=10&sort=-created_at&filter[status]=active

// Use JsonApiQueryStringSerializer for JSON:API backends:
//   ?page[number]=1&page[size]=10&sort=-created_at&filter[status]=active

@Module({
  imports: [
    RefineModule.forRoot({
      queryStringSerializer: new JsonApiQueryStringSerializer(),
      isGlobal: true,
    }),
    RefineModule.forFeature([ProductModel, Order]),
  ],
})
class _AppModule {}

// ─── 5. Infinite Scrolling ───────────────────────────────────────────

export function InfiniteProductList() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError, error } =
    useInfiniteList<Product>({
      resource: PRODUCT_RESOURCE,
      pagination: { current: 1, pageSize: 20 },
      sorters: [{ field: 'name', order: 'asc' }],
      filters: [{ field: 'status', operator: FilterOperator.Ne, value: 'inactive' }],
    });

  if (isLoading) return <div>Loading products...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  // data is TData[][] (array of pages, each page is an array of items)
  const allProducts = data?.flat() ?? [];

  return (
    <div>
      <h1>Products</h1>
      <div>
        {allProducts.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>
              ${product.price.toFixed(2)} — Stock: {product.stock}
            </p>
            <span>{product.status}</span>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// ── Infinite scroll with IntersectionObserver ────────────────────────

export function InfiniteScrollProducts() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteList<Product>({
    resource: PRODUCT_RESOURCE,
    pagination: { current: 1, pageSize: 15 },
  });

  const observerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      {data?.flat().map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
      <div ref={observerRef}>
        {isFetchingNextPage ? 'Loading...' : hasNextPage ? 'Scroll for more' : 'No more products'}
      </div>
    </div>
  );
}

// ─── 6. Custom Queries & Mutations ───────────────────────────────────

// ── useCustom: Ad-hoc read operations ────────────────────────────────

export function ProductStats() {
  const { data, isLoading } = useCustom<{
    totalProducts: number;
    totalRevenue: number;
    outOfStock: number;
  }>({
    resource: PRODUCT_RESOURCE,
    params: { url: 'stats', method: 'get' },
  });

  if (isLoading) return <div>Loading stats...</div>;

  return (
    <div>
      <h2>Product Statistics</h2>
      <p>Total Products: {data?.totalProducts}</p>
      <p>Total Revenue: ${data?.totalRevenue?.toFixed(2)}</p>
      <p>Out of Stock: {data?.outOfStock}</p>
    </div>
  );
}

// ── useCustomMutation: Ad-hoc write operations ───────────────────────

export function BulkPriceUpdate() {
  const { mutate, isLoading } = useCustomMutation<{ updated: number }>({
    resource: PRODUCT_RESOURCE,
  });
  const notification = useNotification();

  const handleBulkDiscount = (percentage: number) => {
    mutate({
      url: 'bulk-discount',
      method: 'post',
      payload: { percentage },
    });

    notification.open({
      type: 'success',
      message: `Applying ${percentage}% discount...`,
    });
  };

  return (
    <div>
      <h3>Bulk Price Adjustment</h3>
      <button onClick={() => handleBulkDiscount(10)} disabled={isLoading}>
        Apply 10% Discount
      </button>
      <button onClick={() => handleBulkDiscount(25)} disabled={isLoading}>
        Apply 25% Discount
      </button>
    </div>
  );
}

// ─── 7. Composing Hooks for Complex UI ───────────────────────────────

/**
 * A complete product management page composing multiple hooks:
 * - useList for the product table
 * - useCreate for the create form
 * - useUpdate for inline editing
 * - useDelete for row deletion
 * - useCustom for dashboard stats
 */
export function ProductManagementPage() {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const notification = useNotification();

  // Fetch product list with dynamic filters
  const {
    data: products,
    total,
    isLoading,
    refetch,
  } = useList<Product>({
    resource: PRODUCT_RESOURCE,
    pagination: { current: page, pageSize: 10 },
    sorters: [{ field: 'name', order: 'asc' }],
    filters:
      statusFilter !== 'all'
        ? [{ field: 'status', operator: FilterOperator.Eq, value: statusFilter }]
        : [],
  });

  // Fetch stats
  const { data: stats } = useCustom<{ totalProducts: number; outOfStock: number }>({
    resource: PRODUCT_RESOURCE,
    params: { url: 'stats', method: 'get' },
  });

  // Mutations
  const { mutate: createProduct } = useCreate<Product>({ resource: PRODUCT_RESOURCE });
  const { mutate: updateProduct } = useUpdate<Product>({ resource: PRODUCT_RESOURCE });
  const { mutate: deleteProduct } = useDelete({ resource: PRODUCT_RESOURCE });

  const handleCreate = () => {
    createProduct({ values: { name: 'New Product', price: 0, stock: 0 } });
    notification.open({ type: 'success', message: 'Product created' });
    refetch();
  };

  const handleUpdate = (id: string, values: Partial<Product>) => {
    updateProduct({ id, values });
    notification.open({ type: 'success', message: 'Product updated' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return;
    deleteProduct({ id });
    notification.open({ type: 'success', message: 'Product deleted' });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Stats Bar */}
      <div>
        <span>Total: {stats?.totalProducts ?? 0}</span>
        <span>Out of Stock: {stats?.outOfStock ?? 0}</span>
      </div>

      {/* Create */}
      <button onClick={handleCreate}>+ New Product</button>

      {/* Filter */}
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="out_of_stock">Out of Stock</option>
      </select>

      {/* Product Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>{product.status}</td>
              <td>
                <button onClick={() => handleUpdate(product.id, { name: product.name })}>
                  Edit
                </button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(total / 10)}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= total}>
          Next
        </button>
      </div>
    </div>
  );
}
