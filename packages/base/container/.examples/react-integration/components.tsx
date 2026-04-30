/**
 * React components demonstrating DI hooks.
 *
 * - useInject()         — resolve a required provider
 * - useOptionalInject() — resolve an optional provider (returns undefined if missing)
 * - useContainer()      — access the raw container for has()/get()
 */

import { useInject, useOptionalInject, useContainer } from '@stackra/ts-container';
import {
  AuthService,
  UserService,
  AnalyticsService,
  THEME_CONFIG,
  type ThemeConfig,
} from './services';

// ── useInject — required providers ─────────────────────────────────────────

export function UserProfile() {
  const auth = useInject(AuthService);
  const user = auth.getUser();

  if (!user) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

export function UserList() {
  const userService = useInject(UserService);
  const users = userService.getUsers();

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>
          {u.name} — {u.email}
        </li>
      ))}
    </ul>
  );
}

// ── useInject with symbol token ────────────────────────────────────────────

export function ThemeBadge() {
  const theme = useInject<ThemeConfig>(THEME_CONFIG);

  return <span style={{ color: theme.primary }}>Theme: {theme.mode}</span>;
}

// ── useOptionalInject — gracefully handle missing providers ────────────────

export function AnalyticsStatus() {
  // AnalyticsService is NOT provided (AnalyticsModule not imported)
  const analytics = useOptionalInject(AnalyticsService);

  if (!analytics) {
    return <p>Analytics: not configured</p>;
  }

  analytics.track('page_view');
  return <p>Analytics: active</p>;
}

// ── useContainer — direct container access ─────────────────────────────────

export function DebugPanel() {
  const container = useContainer();

  const hasAuth = container.has(AuthService);
  const hasAnalytics = container.has(AnalyticsService);

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
      <p>AuthService: {hasAuth ? '✅' : '❌'}</p>
      <p>AnalyticsService: {hasAnalytics ? '✅' : '❌'}</p>
    </div>
  );
}

// ── Composed App ───────────────────────────────────────────────────────────

export function App() {
  return (
    <div>
      <h1>React + DI Container</h1>
      <ThemeBadge />

      <section>
        <h3>Current User</h3>
        <UserProfile />
      </section>

      <section>
        <h3>All Users</h3>
        <UserList />
      </section>

      <section>
        <h3>Analytics</h3>
        <AnalyticsStatus />
      </section>

      <section>
        <h3>Debug</h3>
        <DebugPanel />
      </section>
    </div>
  );
}
