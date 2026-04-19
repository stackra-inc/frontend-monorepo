# Changelog

All notable changes to `@stackra/react-i18n` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-17

### Added

- **DI Module** — `I18nModule.forRoot()` following the `HttpModule` /
  `MultiTenancyModule` pattern from `@stackra/ts-container`
- **I18nService** — `@Injectable()` high-level service with `t()`, `__()`,
  `trans()`, `changeLocale()`, `resolveLocale()`, `isRTL()`,
  `onLanguageChanged()`
- **I18nextService** — low-level i18next singleton wrapper (owns initialization
  lifecycle)
- **React Context** — `<I18nProvider service={...}>` component with locale
  resolution on mount
- **Hooks** — `useLocale()`, `useTranslation()`, `useChangeLocale()` mirroring
  the `useTenant` / `useTenantSwitch` patterns
- **Locale Resolver System** — `ILocaleResolver` interface,
  `LocaleResolverPriority` enum, `createLocaleResolverChain()` utility
- **Built-in Resolvers** — `UrlPathLocaleResolver`, `QueryParamLocaleResolver`,
  `StorageLocaleResolver`, `NavigatorLocaleResolver`,
  `AcceptLanguageLocaleResolver`
- **HTTP Middleware** — `LocaleMiddleware` with
  `@HttpMiddleware({ priority: 15 })` decorator, injects `Accept-Language`,
  syncs `Content-Language`
- **DI Tokens** — `I18N_CONFIG`, `I18N_SERVICE`, `I18NEXT_SERVICE`,
  `LOCALE_RESOLVER_CHAIN`, and individual resolver tokens
- **Interfaces** — `II18nService`, `II18nextService`, `II18nContext`,
  `ILocaleResolver`, `IHttpMiddleware`, `I18nModuleOptions`

### Changed

- **Consolidated translation functions** — `__()`, `t()`, `trans()` now have a
  single implementation via `safeTranslate()` in `global-setup.util.ts` (removed
  duplicate `translator.util.ts`)
- **Consolidated i18next initialization** — single initialization path in
  `I18nextService` (removed duplicate `i18n-instance.util.ts`)
- **Interface naming convention** — standardized on `I` prefix (`II18nService`,
  `II18nextService`, `ILocaleResolver`, `IHttpMiddleware`) matching
  `@stackra/react-multitenancy` patterns
- **Provider → Service** — renamed `I18nProvider` class to `I18nextService`,
  moved from `providers/` to `services/`
- **File renamed** — `i18n-provider.interface.ts` →
  `i18next-service.interface.ts`

### Removed

- `translator.util.ts` — redundant, functions consolidated into
  `global-setup.util.ts`
- `i18n-instance.util.ts` — redundant, initialization consolidated into
  `I18nextService`
- `providers/` folder — `I18nextService` now lives in `services/`
- `locale-middleware-options.interface.ts` — dead code, middleware reads config
  from `I18nModuleOptions` via DI
- `factories/` folder — factory logic moved into the module and standalone utils
- `i18next-browser-languagedetector` dependency (conceptually) — replaced by the
  locale resolver chain system

## [1.0.0] - 2026-04-16

### Added

- Initial release
- Vite plugin with auto-discovery, type generation, HMR
- Virtual module (`virtual:@stackra/react-i18n`)
- Global translation helpers (`__`, `t`, `trans`)
- Framework-agnostic i18n provider
- i18next integration with HTTP backend and language detector support
