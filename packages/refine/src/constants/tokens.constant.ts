/**
 * @fileoverview DI tokens for the refine CRUD package.
 *
 * Auth tokens (AUTH_SERVICE, SESSION_SERVICE, SECURITY_SERVICE,
 * ACCESS_CONTROL_SERVICE) have been moved to @stackra-inc/react-auth.
 *
 * @module @stackra-inc/react-refine
 * @category Constants
 */

// ─── Core Tokens ─────────────────────────────────────────────────────

/** DI token for the global {@link ServiceRegistry} singleton. */
export const SERVICE_REGISTRY = Symbol.for('SERVICE_REGISTRY');

/** DI token for the TanStack QueryClient instance. */
export const QUERY_CLIENT = Symbol.for('QUERY_CLIENT');

/** DI token for the global {@link RefineRootOptions} configuration. */
export const REFINE_OPTIONS = Symbol.for('REFINE_OPTIONS');

// ─── Decorator Metadata Keys ─────────────────────────────────────────

/** Metadata key used by the `@Resource` decorator. */
export const RESOURCE_METADATA_KEY = Symbol.for('RESOURCE_METADATA');

// ─── Provider Service Tokens ─────────────────────────────────────────

/** DI token for the {@link IRealtimeService} implementation. */
export const REALTIME_SERVICE = Symbol.for('REALTIME_SERVICE');

/** DI token for the {@link INotificationService} implementation. */
export const NOTIFICATION_SERVICE = Symbol.for('NOTIFICATION_SERVICE');

/** DI token for the {@link IAuditLogService} implementation. */
export const AUDIT_LOG_SERVICE = Symbol.for('AUDIT_LOG_SERVICE');

// ─── Repository Tokens ───────────────────────────────────────────────

/** DI token for the HTTP client (fetch/axios wrapper). */
export const HTTP_CLIENT = Symbol.for('HTTP_CLIENT');

/** DI token for {@link HttpRepositoryConfig}. */
export const HTTP_REPOSITORY_CONFIG = Symbol.for('HTTP_REPOSITORY_CONFIG');

/** DI token for the base repository in constructor injection. */
export const BASE_REPOSITORY = Symbol.for('BASE_REPOSITORY');

/** DI token for the global {@link QueryStringSerializer}. */
export const QUERY_STRING_SERIALIZER = Symbol.for('QUERY_STRING_SERIALIZER');
