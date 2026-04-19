/**
 * @example Authentication, Access Control & Cross-Cutting Concerns
 *
 * Demonstrates all provider services and their hooks:
 * - Built-in defaults: works out of the box with zero config
 * - Custom overrides: replace any service with your own implementation
 * - Auth hooks: useLogin, useLogout, useIsAuthenticated, useGetIdentity, usePermissions
 * - Access control: useCan
 * - Notifications: useNotification
 * - Audit logging: useLog
 * - Realtime subscriptions: useSubscription
 *
 * @module @stackra-inc/react-refine
 * @category Examples
 */

import React from 'react';
import {
  RefineModule,
  useLogin,
  useIsAuthenticated,
  useGetIdentity,
  usePermissions,
  useCan,
  useNotification,
  useLog,
  useSubscription,
  useList,
  useCreate,
} from '@stackra-inc/react-refine';
import type {
  IAuthService,
  INotificationService,
  AuthActionResponse,
  CheckResponse,
  OnErrorResponse,
  OpenNotificationParams,
  LiveEvent,
} from '@stackra-inc/react-refine';
import { Module, Injectable } from '@stackra-inc/ts-container';

// ─── 1. Zero-Config Setup (Built-in Defaults) ───────────────────────
//
// All 5 provider services have built-in implementations:
//   - AuthService        → HTTP-based auth via /api/auth/*
//   - AccessControlService → HTTP-based ACL via /api/acl/can
//   - NotificationService  → Console-based logging
//   - RealtimeService      → No-op (override for WebSocket/SSE)
//   - AuditLogService      → HTTP-based via /api/audit-logs
//
// Just call forRoot() with no args and everything works:

@Module({
  imports: [RefineModule.forRoot()],
})
class _ZeroConfigModule {}

// ─── 2. Custom Service Overrides ─────────────────────────────────────
//
// Override only the services you need to customise.
// The rest keep using built-in defaults.

// ── Custom Auth Service (e.g. OAuth / Firebase) ──────────────────────

@Injectable()
class FirebaseAuthService implements IAuthService {
  async login(params: { idToken: string }): Promise<AuthActionResponse> {
    // Exchange Firebase ID token for your backend session
    const response = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: params.idToken }),
    });

    if (!response.ok) {
      return { success: false, error: new Error('Firebase auth failed') };
    }

    const { token, user } = await response.json();
    localStorage.setItem('refine_auth_token', token);
    localStorage.setItem('refine_auth_user', JSON.stringify(user));

    return { success: true, redirectTo: '/dashboard' };
  }

  async logout(): Promise<AuthActionResponse> {
    localStorage.removeItem('refine_auth_token');
    localStorage.removeItem('refine_auth_user');
    return { success: true, redirectTo: '/login' };
  }

  async check(): Promise<CheckResponse> {
    const token = localStorage.getItem('refine_auth_token');
    return { authenticated: !!token, redirectTo: token ? undefined : '/login' };
  }

  async getIdentity(): Promise<any> {
    const cached = localStorage.getItem('refine_auth_user');
    return cached ? JSON.parse(cached) : null;
  }

  async getPermissions(): Promise<string[]> {
    const cached = localStorage.getItem('refine_auth_user');
    if (!cached) return [];
    return JSON.parse(cached).permissions ?? [];
  }

  async onError(error: any): Promise<OnErrorResponse> {
    if (error?.statusCode === 401) {
      return { logout: true, redirectTo: '/login' };
    }
    return {};
  }
}

// ── Custom Notification Service (e.g. Sonner) ────────────────────────

@Injectable()
class SonnerNotificationService implements INotificationService {
  open(params: OpenNotificationParams): void {
    // In a real app, call sonner's toast() function here
    const desc = params.description ? ` — ${params.description}` : '';
    console.log(`[${params.type}] ${params.message}${desc}`);
  }

  close(key: string): void {
    console.log(`Dismissing: ${key}`);
  }
}

// ── Partial Override: only auth + notifications ──────────────────────

@Module({
  imports: [
    RefineModule.forRoot({
      // Override auth with Firebase, override notifications with Sonner
      // ACL, realtime, and audit log keep using built-in defaults
      authService: new FirebaseAuthService(),
      notificationService: new SonnerNotificationService(),
    }),
  ],
})
class _PartialOverrideModule {}

// ─── 3. React Components Using Auth Hooks ────────────────────────────

// ── Login Page ───────────────────────────────────────────────────────

export function LoginPage() {
  const { mutate: login, isLoading, isError, error } = useLogin();
  const notification = useNotification();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    login({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    notification.open({
      type: 'info',
      message: 'Signing in...',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign In</h1>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      {isError && <p>Error: {error?.message}</p>}
    </form>
  );
}

// ── Auth Guard Component ─────────────────────────────────────────────

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useIsAuthenticated();

  if (isLoading) return <div>Checking authentication...</div>;

  if (!data?.authenticated) {
    window.location.href = data?.redirectTo ?? '/login';
    return null;
  }

  return <>{children}</>;
}

// ── User Profile (Identity) ──────────────────────────────────────────

interface UserIdentity {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export function UserProfile() {
  const { data: user, isLoading } = useGetIdentity<UserIdentity>();

  if (isLoading) return <div>Loading profile...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <span>Role: {user.role}</span>
    </div>
  );
}

// ── Permission-Based UI ──────────────────────────────────────────────

export function AdminPanel() {
  const { data: permissions, isLoading } = usePermissions<string[]>();

  if (isLoading) return <div>Loading permissions...</div>;

  const isAdmin = permissions?.includes('admin');
  const canManageUsers = permissions?.includes('users:manage');

  return (
    <div>
      <h1>Dashboard</h1>
      {isAdmin && (
        <section>
          <h2>Admin Settings</h2>
          <p>Full system configuration</p>
        </section>
      )}
      {canManageUsers && (
        <section>
          <h2>User Management</h2>
          <p>Manage user accounts</p>
        </section>
      )}
    </div>
  );
}

// ─── 4. Access Control with useCan ───────────────────────────────────

export function PostActions() {
  const { data: canEdit } = useCan({
    resource: 'posts',
    action: 'edit',
  });

  const { data: canDelete } = useCan({
    resource: 'posts',
    action: 'delete',
  });

  return (
    <div>
      {canEdit?.can && <button>Edit Post</button>}
      {canDelete?.can ? (
        <button>Delete Post</button>
      ) : (
        canDelete?.reason && <p>{canDelete.reason}</p>
      )}
    </div>
  );
}

// ── ACL-Gated Create Form ────────────────────────────────────────────

export function CreatePostGated() {
  const { data: canCreate, isLoading: checkingAccess } = useCan({
    resource: 'posts',
    action: 'create',
  });

  const { mutate, isLoading } = useCreate({ resource: 'posts' });
  const notification = useNotification();
  const { log } = useLog();

  if (checkingAccess) return <div>Checking permissions...</div>;
  if (!canCreate?.can) return <p>You do not have permission to create posts.</p>;

  const handleCreate = async () => {
    mutate({ values: { title: 'New Post', content: 'Hello world', status: 'draft' } });

    // Log the action for audit trail
    await log({
      resource: 'posts',
      action: 'create',
      data: { title: 'New Post' },
      meta: { source: 'CreatePostGated component' },
    });

    notification.open({ type: 'success', message: 'Post created' });
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      Create Post
    </button>
  );
}

// ─── 5. Audit Log Viewer ─────────────────────────────────────────────

export function AuditLogViewer() {
  const { getLogs } = useLog();
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    getLogs({ resource: 'posts' }).then(setLogs);
  }, [getLogs]);

  return (
    <table>
      <thead>
        <tr>
          <th>Action</th>
          <th>Resource</th>
          <th>Timestamp</th>
          <th>User</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((entry: any) => (
          <tr key={entry.id}>
            <td>{entry.action}</td>
            <td>{entry.resource}</td>
            <td>{entry.timestamp}</td>
            <td>{entry.userId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── 6. Realtime Subscriptions ───────────────────────────────────────
//
// The built-in RealtimeService is a no-op. Override it with your
// WebSocket/SSE/Pusher implementation to enable live updates.

export function RealtimePostList() {
  const { data, refetch } = useList({
    resource: 'posts',
    pagination: { current: 1, pageSize: 20 },
  });

  // Subscribe to realtime events and auto-refresh
  useSubscription({
    channel: 'resources/posts',
    types: ['created', 'updated', 'deleted'],
    onLiveEvent: (event: LiveEvent) => {
      console.log('Realtime event:', event.type, event.payload);
      refetch();
    },
  });

  return (
    <div>
      <h1>Live Posts</h1>
      <p>This list updates in real-time</p>
      <ul>
        {data?.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Conditional subscription (only when authenticated) ───────────────

export function ConditionalRealtimeUpdates() {
  const { data: authCheck } = useIsAuthenticated();

  useSubscription({
    channel: 'notifications',
    types: ['new'],
    onLiveEvent: (event: LiveEvent) => {
      console.log('New notification:', event.payload);
    },
    // Only subscribe when the user is authenticated
    enabled: authCheck?.authenticated ?? false,
  });

  return <div>Listening for notifications...</div>;
}
