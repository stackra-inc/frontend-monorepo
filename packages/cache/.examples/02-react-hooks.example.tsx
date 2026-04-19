/**
 * @fileoverview React Hooks — useCache & useCachedQuery
 *
 * Demonstrates using the cache system in React components via hooks.
 * Covers the `useCache` hook for direct cache access and the
 * `useCachedQuery` hook for React Query-like data fetching with caching.
 *
 * @module examples/react-hooks
 *
 * Prerequisites:
 * - @stackra-inc/ts-cache installed and CacheModule.forRoot() configured
 * - @stackra-inc/ts-container installed
 * - React 18 or 19
 */

import React, { useEffect, useState } from 'react';
import { useCache, useCachedQuery } from '@/index';

// ============================================================================
// 1. useCache — Direct Cache Access in Components
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

/**
 * Basic component using `useCache` with the remember pattern.
 *
 * The `remember` method checks the cache first, and only calls the
 * callback on a cache miss. This is the most common caching pattern.
 */
function UserProfile({ userId }: { userId: string }) {
  const cache = useCache();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      // Cache the API response for 1 hour
      const cached = await cache.remember<User>(`user:${userId}`, 3600, async () => {
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
      });

      setUser(cached);
      setLoading(false);
    }

    loadUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// ============================================================================
// 2. useCache — Using Different Stores
// ============================================================================

/**
 * Component that uses multiple cache stores for different purposes.
 *
 * - Memory store for UI state (fast, ephemeral)
 * - Redis store for persistent data (survives page refresh)
 */
function Dashboard() {
  const redisCache = useCache('redis');
  const memoryCache = useCache('memory');

  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [preferences, setPreferences] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    async function load() {
      // Fast, ephemeral cache for dashboard stats (5 min TTL)
      const dashStats = await memoryCache.remember('dashboard:stats', 300, async () => {
        const response = await fetch('/api/dashboard/stats');
        return response.json();
      });
      setStats(dashStats);

      // Persistent cache for user preferences (24 hour TTL)
      const prefs = await redisCache.remember('user:preferences', 86400, async () => {
        const response = await fetch('/api/user/preferences');
        return response.json();
      });
      setPreferences(prefs);
    }

    load();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {stats && <StatsPanel stats={stats} />}
      {preferences && <PreferencesPanel preferences={preferences} />}
    </div>
  );
}

function StatsPanel({ stats }: { stats: Record<string, number> }) {
  return <pre>{JSON.stringify(stats, null, 2)}</pre>;
}

function PreferencesPanel({ preferences }: { preferences: Record<string, string> }) {
  return <pre>{JSON.stringify(preferences, null, 2)}</pre>;
}

// ============================================================================
// 3. useCache — Cache Invalidation After Mutations
// ============================================================================

/**
 * Demonstrates invalidating cache entries after data mutations.
 *
 * When a user updates their profile, we clear the cached data
 * so the next read fetches fresh data from the API.
 */
function EditableProfile({ userId }: { userId: string }) {
  const cache = useCache();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);

  const loadUser = async () => {
    const cached = await cache.remember<User>(`user:${userId}`, 3600, async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    });
    setUser(cached);
  };

  const saveUser = async (updates: Partial<User>) => {
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    // Invalidate the cached user data
    await cache.forget(`user:${userId}`);

    // Reload fresh data
    await loadUser();
    setEditing(false);
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => setEditing(!editing)}>Edit</button>
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            saveUser({ name: formData.get('name') as string });
          }}
        >
          <input name="name" defaultValue={user.name} />
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
}

// ============================================================================
// 4. useCachedQuery — Basic Usage
// ============================================================================

interface Post {
  id: string;
  title: string;
  body: string;
  authorId: string;
}

/**
 * Basic `useCachedQuery` usage — similar to React Query but backed
 * by the cache system.
 *
 * Automatically handles loading states, error states, caching,
 * and provides refetch/invalidate controls.
 */
function PostList() {
  const {
    data: posts,
    isLoading,
    error,
    refetch,
    invalidate,
  } = useCachedQuery<Post[]>({
    key: 'posts:list',
    queryFn: async () => {
      const response = await fetch('/api/posts');
      return response.json();
    },
    ttl: 600, // Cache for 10 minutes
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Posts</h1>
      <div>
        <button onClick={refetch}>Refresh (cache-first)</button>
        <button onClick={invalidate}>Force Refresh (bypass cache)</button>
      </div>
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body.substring(0, 100)}...</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// 5. useCachedQuery — Conditional Fetching & Specific Store
// ============================================================================

/**
 * Conditional query that only fetches when a condition is met.
 *
 * The `enabled` option prevents the query from executing until
 * the user selects a post. The `storeName` option routes this
 * query to a specific cache store.
 */
function PostDetail({ postId }: { postId: string | null }) {
  const {
    data: post,
    isLoading,
    error,
  } = useCachedQuery<Post>({
    key: `post:${postId}`,
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}`);
      return response.json();
    },
    ttl: 1800, // 30 minutes
    storeName: 'redis', // Use Redis store for persistence
    enabled: postId !== null, // Only fetch when a post is selected
  });

  if (!postId) return <div>Select a post to view details</div>;
  if (isLoading) return <div>Loading post...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <article>
      <h1>{post?.title}</h1>
      <p>{post?.body}</p>
    </article>
  );
}

// ============================================================================
// 6. useCachedQuery — Auto-Refetch with Polling
// ============================================================================

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Auto-refreshing query using `refetchInterval`.
 *
 * Polls the API every 30 seconds for new notifications,
 * with results cached between polls.
 */
function NotificationBell() {
  const { data: notifications, isLoading } = useCachedQuery<Notification[]>({
    key: 'notifications:unread',
    queryFn: async () => {
      const response = await fetch('/api/notifications?unread=true');
      return response.json();
    },
    ttl: 60, // Short TTL since we're polling
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnMount: true, // Always fetch fresh on mount
  });

  const unreadCount = notifications?.length ?? 0;

  return (
    <div>
      <span>🔔</span>
      {!isLoading && unreadCount > 0 && <span>{unreadCount}</span>}
    </div>
  );
}

// ============================================================================
// 7. useCachedQuery — Invalidation After Mutation
// ============================================================================

/**
 * Demonstrates cache invalidation after a mutation.
 *
 * When a new post is created, we invalidate the posts list cache
 * so it refetches with the new data included.
 */
function CreatePostForm() {
  const { invalidate: invalidatePostList } = useCachedQuery<Post[]>({
    key: 'posts:list',
    queryFn: async () => {
      const response = await fetch('/api/posts');
      return response.json();
    },
    ttl: 600,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: formData.get('title'),
        body: formData.get('body'),
      }),
    });

    // Clear the posts list cache and refetch
    await invalidatePostList();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Post title" required />
      <textarea name="body" placeholder="Post body" required />
      <button type="submit">Create Post</button>
    </form>
  );
}

// ============================================================================
// Exports (for reference)
// ============================================================================

export {
  UserProfile,
  Dashboard,
  EditableProfile,
  PostList,
  PostDetail,
  NotificationBell,
  CreatePostForm,
};
