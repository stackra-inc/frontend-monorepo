/**
 * Example 3: Custom Locale Resolvers
 *
 * Demonstrates how to create custom locale resolvers and register
 * them in the module configuration. Custom resolvers let you detect
 * the user's locale from any source: JWT tokens, cookies, API
 * responses, meta tags, etc.
 *
 * ## What this example covers:
 * - Implementing the `ILocaleResolver` interface
 * - Using `LocaleResolverPriority` for ordering
 * - Registering custom resolvers via `customResolvers` in module config
 * - Mixing custom and built-in resolvers in the chain
 */

import { Module } from '@stackra/ts-container';
import { I18nModule, LocaleResolverPriority } from '@stackra/react-i18n';
import type { ILocaleResolver } from '@stackra/react-i18n';

// ============================================================================
// Custom Resolver 1: JWT Token
// ============================================================================

/**
 * Resolves locale from the user's JWT access token.
 *
 * Reads the `locale` claim from the decoded JWT payload.
 * Useful when the backend sets the user's preferred language
 * in the authentication token.
 *
 * Priority: HIGHEST (1) — JWT is the most authoritative source
 * since it comes from the authenticated user's profile.
 */
class JwtLocaleResolver implements ILocaleResolver {
  /** Unique identifier for logging and debugging. */
  name = 'jwt';

  /** Highest priority — checked before all other resolvers. */
  priority = LocaleResolverPriority.HIGHEST;

  /**
   * Extract locale from the JWT access token.
   *
   * @returns Locale code from the JWT, or `undefined` if no token or no locale claim
   */
  resolve(): string | undefined {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return undefined;

      // Decode the JWT payload (base64url → JSON)
      const parts = token.split('.');
      if (!parts[1]) return undefined;

      const payload = JSON.parse(atob(parts[1]));
      return payload.locale || undefined;
    } catch {
      // Invalid token format — skip to next resolver
      return undefined;
    }
  }
}

// ============================================================================
// Custom Resolver 2: Cookie
// ============================================================================

/**
 * Resolves locale from a browser cookie.
 *
 * Reads the `lang` cookie (or a custom cookie name).
 * Useful when the locale is set by server-side rendering
 * or a load balancer.
 *
 * Priority: HIGH (2) — cookies are set by the server,
 * so they're more authoritative than localStorage.
 */
class CookieLocaleResolver implements ILocaleResolver {
  name = 'cookie';
  priority = LocaleResolverPriority.HIGH;

  /** Cookie name to read the locale from. */
  private readonly cookieName: string;

  /**
   * @param cookieName - Name of the cookie containing the locale
   */
  constructor(cookieName: string = 'lang') {
    this.cookieName = cookieName;
  }

  /**
   * Extract locale from the cookie.
   *
   * @returns Locale code from the cookie, or `undefined` if not found
   */
  resolve(): string | undefined {
    if (typeof document === 'undefined') return undefined;

    // Parse cookies and find the one matching our cookie name
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${this.cookieName}=([^;]+)`));

    return match?.[1] || undefined;
  }
}

// ============================================================================
// Custom Resolver 3: Server Meta Tag
// ============================================================================

/**
 * Resolves locale from a `<meta>` tag injected by the server.
 *
 * The server can inject `<meta name="locale" content="ar">` during
 * SSR or in the HTML template. This resolver reads that value.
 *
 * Priority: HIGHEST (1) — server-injected values are the most
 * authoritative since they come from the backend.
 */
class MetaTagLocaleResolver implements ILocaleResolver {
  name = 'meta-tag';
  priority = LocaleResolverPriority.HIGHEST;

  /**
   * Read locale from a meta tag.
   *
   * @returns Locale code from the meta tag, or `undefined` if not found
   */
  resolve(): string | undefined {
    if (typeof document === 'undefined') return undefined;

    const meta = document.querySelector('meta[name="locale"]');
    return meta?.getAttribute('content') || undefined;
  }
}

// ============================================================================
// Custom Resolver 4: Async API Resolver
// ============================================================================

/**
 * Resolves locale from a backend API endpoint.
 *
 * Calls `/api/user/preferences` to get the user's saved locale.
 * This is an async resolver — the chain awaits its result.
 *
 * Priority: HIGH (2) — API-based resolution is authoritative
 * but slower than local sources.
 */
class ApiLocaleResolver implements ILocaleResolver {
  name = 'api';
  priority = LocaleResolverPriority.HIGH;

  /**
   * Fetch locale from the user preferences API.
   *
   * @returns Locale code from the API, or `undefined` on failure
   */
  async resolve(): Promise<string | undefined> {
    try {
      const response = await fetch('/api/user/preferences');

      if (!response.ok) return undefined;

      const data = await response.json();
      return data.locale || undefined;
    } catch {
      // Network error — skip to next resolver
      return undefined;
    }
  }
}

// ============================================================================
// Registering Custom Resolvers in the Module
// ============================================================================

/**
 * Application module with custom resolvers.
 *
 * The `resolvers` array defines the order in which resolvers are tried.
 * The `customResolvers` map provides the resolver instances keyed by name.
 *
 * Resolution order for this config:
 * 1. `jwt` (HIGHEST) — check JWT token
 * 2. `cookie` (HIGH) — check browser cookie
 * 3. `url-path` (HIGHEST) — check URL path segment
 * 4. `storage` (NORMAL) — check localStorage
 * 5. `navigator` (LOWEST) — check browser language
 *
 * Note: even though `jwt` and `url-path` both have HIGHEST priority,
 * the `resolvers` array order determines which is tried first.
 */
@Module({
  imports: [
    I18nModule.forRoot({
      defaultLanguage: 'en',
      languages: ['en', 'ar', 'es', 'fr'],

      // Resolver names in the order they should be tried
      resolvers: ['jwt', 'cookie', 'meta-tag', 'api', 'url-path', 'storage', 'navigator'],

      // Custom resolver instances mapped by name
      customResolvers: {
        jwt: new JwtLocaleResolver(),
        cookie: new CookieLocaleResolver('app_lang'),
        'meta-tag': new MetaTagLocaleResolver(),
        api: new ApiLocaleResolver(),
      },
    }),
  ],
})
export class AppModule {}
