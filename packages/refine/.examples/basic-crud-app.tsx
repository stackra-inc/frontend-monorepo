/**
 * @example Basic CRUD Application
 *
 * Demonstrates the core workflow of @stackra-inc/react-refine:
 * - Module configuration with `forRoot` and `forFeature`
 * - Model definition with `@Resource` decorator
 * - All CRUD hooks: useList, useOne, useShow, useMany, useCreate, useUpdate, useDelete
 * - Batch hooks: useCreateMany, useUpdateMany, useDeleteMany
 * - Filtering, sorting, and pagination
 * - Conditional fetching with `enabled`
 *
 * @module @stackra-inc/react-refine
 * @category Examples
 */

import React from 'react';
import {
  Resource,
  RefineModule,
  FilterOperator,
  useList,
  useOne,
  useShow,
  useMany,
  useCreate,
  useUpdate,
  useDelete,
  useDeleteMany,
  useCreateMany,
  useUpdateMany,
} from '@stackra-inc/react-refine';
import { Module } from '@stackra-inc/ts-container';

// ─── 1. Resource Tokens ──────────────────────────────────────────────

const POST_RESOURCE = 'posts';
const CATEGORY_RESOURCE = 'categories';
const TAG_RESOURCE = 'tags';

// ─── 2. Define Models ────────────────────────────────────────────────

interface IPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  categoryId: string;
  createdAt: string;
}

// Remote-first model — uses HttpRepository by default
@Resource({ name: POST_RESOURCE, endpoint: '/api/posts' })
class Post implements IPost {
  id!: string;
  title!: string;
  content!: string;
  status!: 'draft' | 'published' | 'archived';
  categoryId!: string;
  createdAt!: string;
}

@Resource({ name: CATEGORY_RESOURCE, endpoint: '/api/categories' })
class Category {
  id!: string;
  name!: string;
}

@Resource({ name: TAG_RESOURCE, endpoint: '/api/tags' })
class Tag {
  id!: string;
  label!: string;
}

// ─── 3. Module Configuration ─────────────────────────────────────────

@Module({
  imports: [
    // Root: global services, query client, serializer
    RefineModule.forRoot({ isGlobal: true }),

    // Feature: register resource models
    RefineModule.forFeature([Post, Category, Tag]),
  ],
})
class _AppModule {}

// ─── 4. React Components Using Hooks ─────────────────────────────────

// ── useList: Paginated list with filters and sorters ─────────────────

export function PostList() {
  const { data, total, isLoading, isError, error, refetch } = useList<IPost>({
    resource: POST_RESOURCE,
    pagination: { current: 1, pageSize: 10 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
    filters: [{ field: 'status', operator: FilterOperator.Eq, value: 'published' }],
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h1>Posts ({total})</h1>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.map((post: IPost) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

// ── useList with advanced filters ────────────────────────────────────

export function FilteredPostList() {
  const { data, total } = useList<IPost>({
    resource: POST_RESOURCE,
    pagination: { current: 1, pageSize: 25 },
    sorters: [
      { field: 'status', order: 'asc' },
      { field: 'createdAt', order: 'desc' },
    ],
    filters: [
      { field: 'status', operator: FilterOperator.In, value: ['published', 'draft'] },
      { field: 'title', operator: FilterOperator.Contains, value: 'react' },
      { field: 'createdAt', operator: FilterOperator.Gte, value: '2025-01-01' },
    ],
  });

  return (
    <div>
      <p>Found {total} matching posts</p>
      {data?.map((post: IPost) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <span>{post.status}</span>
        </article>
      ))}
    </div>
  );
}

// ── useOne: Fetch a single record by ID ──────────────────────────────

export function PostDetail({ postId }: { postId: string }) {
  const { data, isLoading, isError, error } = useOne<IPost>({
    resource: POST_RESOURCE,
    id: postId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <article>
      <h1>{data?.title}</h1>
      <p>{data?.content}</p>
      <span>Status: {data?.status}</span>
    </article>
  );
}

// ── useShow: Fetch a single record for display ──────────────────────

export function PostShow({ postId }: { postId: string }) {
  const { data, isLoading } = useShow<IPost>({
    resource: POST_RESOURCE,
    id: postId,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data?.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: data?.content ?? '' }} />
    </div>
  );
}

// ── useMany: Fetch multiple records by IDs ───────────────────────────

export function RelatedPosts({ postIds }: { postIds: string[] }) {
  const { data, isLoading } = useMany<IPost>({
    resource: POST_RESOURCE,
    ids: postIds,
  });

  if (isLoading) return <div>Loading related posts...</div>;

  return (
    <aside>
      <h3>Related Posts</h3>
      <ul>
        {data?.map((post: IPost) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </aside>
  );
}

// ── useCreate: Create a new record ───────────────────────────────────

export function CreatePostForm() {
  const { mutate, isLoading, isError, error, isSuccess, data } = useCreate<IPost>({
    resource: POST_RESOURCE,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutate({
      values: {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        status: 'draft',
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Post title" required />
      <textarea name="content" placeholder="Write your post..." required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Post'}
      </button>
      {isError && <p>Error: {error?.message}</p>}
      {isSuccess && <p>Created post: {data?.title}</p>}
    </form>
  );
}

// ── useUpdate: Update an existing record ─────────────────────────────

export function EditPostForm({ post }: { post: IPost }) {
  const { mutate, isLoading, isSuccess } = useUpdate<IPost>({
    resource: POST_RESOURCE,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutate({
      id: post.id,
      values: {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" defaultValue={post.title} required />
      <textarea name="content" defaultValue={post.content} required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
      {isSuccess && <p>Post updated!</p>}
    </form>
  );
}

// ── useDelete: Delete a single record ────────────────────────────────

export function DeletePostButton({ postId }: { postId: string }) {
  const { mutate, isLoading } = useDelete({ resource: POST_RESOURCE });

  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      mutate({ id: postId });
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete Post'}
    </button>
  );
}

// ── useCreateMany: Bulk create records ───────────────────────────────

export function BulkCreatePosts() {
  const { mutate, isLoading, data } = useCreateMany<IPost>({
    resource: POST_RESOURCE,
  });

  const handleBulkCreate = () => {
    mutate({
      values: [
        { title: 'Post 1', content: 'Content 1', status: 'draft' },
        { title: 'Post 2', content: 'Content 2', status: 'draft' },
        { title: 'Post 3', content: 'Content 3', status: 'draft' },
      ],
    });
  };

  return (
    <div>
      <button onClick={handleBulkCreate} disabled={isLoading}>
        Create 3 Draft Posts
      </button>
      {data && <p>Created {data.length} posts</p>}
    </div>
  );
}

// ── useUpdateMany: Bulk update records ───────────────────────────────

export function PublishSelectedPosts({ selectedIds }: { selectedIds: string[] }) {
  const { mutate, isLoading } = useUpdateMany<IPost>({
    resource: POST_RESOURCE,
  });

  const handlePublishAll = () => {
    mutate({
      ids: selectedIds,
      values: { status: 'published' },
    });
  };

  return (
    <button onClick={handlePublishAll} disabled={isLoading}>
      Publish {selectedIds.length} Posts
    </button>
  );
}

// ── useDeleteMany: Bulk delete records ───────────────────────────────

export function DeleteSelectedPosts({ selectedIds }: { selectedIds: string[] }) {
  const { mutate, isLoading } = useDeleteMany({ resource: POST_RESOURCE });

  const handleDeleteAll = () => {
    if (confirm(`Delete ${selectedIds.length} posts?`)) {
      mutate({ ids: selectedIds });
    }
  };

  return (
    <button onClick={handleDeleteAll} disabled={isLoading}>
      Delete {selectedIds.length} Posts
    </button>
  );
}

// ── Conditional fetching with `enabled` ──────────────────────────────

export function ConditionalFetch({ categoryId }: { categoryId: string | null }) {
  const { data, isLoading } = useList<IPost>({
    resource: POST_RESOURCE,
    pagination: { current: 1, pageSize: 10 },
    filters: [{ field: 'categoryId', operator: FilterOperator.Eq, value: categoryId }],
    // Disable the query until categoryId is set
    enabled: !!categoryId,
  });

  if (!categoryId) return <p>Select a category first</p>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map((post: IPost) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
