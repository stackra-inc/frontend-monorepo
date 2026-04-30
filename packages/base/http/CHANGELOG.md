# Changelog

All notable changes to `@stackra/ts-http` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0

### Changed

- Promoted to stable v1.0.0
- All CI/CD workflows verified and passing

## 0.1.1

### Fixed

- Add `@vivtel/metadata` as direct dependency (was transitive only)
- Add `jiti` and `eslint-plugin-turbo` for CI lint compatibility
- Fix ESLint config with targeted rule overrides for HTTP interfaces/services
- Add `.prettierignore` for lockfiles and generated files
- Fix repository URLs in package.json (was pointing to frontend-monorepo)

### Added

- CHANGELOG.md with release notes
- `.gitignore` for proper git tracking
- Banner PNG for Slack notifications

## 0.1.0

### Added

- Middleware-driven HTTP client built on top of Axios
- `HttpFacade` — high-level API for GET, POST, PUT, PATCH, DELETE requests
- `HttpClientService` — core HTTP client with middleware pipeline integration
- `MiddlewarePipelineService` — composable middleware execution engine
- `MiddlewareRegistry` — priority-sorted middleware registration and discovery
- `@HttpMiddleware()` decorator for declarative middleware registration with
  priority ordering
- Built-in middleware:
  - `AuthMiddleware` — automatic bearer token injection via `TokenProvider`
  - `RetryMiddleware` — configurable retry with exponential backoff
  - `LoggingMiddleware` — request/response lifecycle logging
  - `ErrorNormalizerMiddleware` — consistent error shape normalization
- `HttpModule` — DI module for `@stackra/ts-container` integration
- Full TypeScript support with strict types and declaration files
- ESM + CJS dual-format output
