/**
 * Multi-Tenancy Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @stackra/react-multitenancy
 * |--------------------------------------------------------------------------
 * |
 * | Registers:
 * |   - `MULTITENANCY_CONFIG` — the merged config object
 * |   - All 7 tenant resolvers via Symbol tokens
 * |
 * | Follows the same pattern as CacheModule, EventsModule, DesktopModule.
 * |
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     MultiTenancyModule.forRoot({
 *       mode: TenantMode.HEADER,
 *       resolvers: ["subdomain", "router"],
 *       baseDomain: "myapp.com",
 *       fetchTenants: async () => fetch("/api/tenants").then(r => r.json()),
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @module @stackra/react-multitenancy
 */

import { Module, type DynamicModule } from '@stackra/ts-container';

import { TenantMode } from '@/enums';
import type { MultiTenancyOptions } from '@/interfaces/multitenancy-options.interface';
import {
  MULTITENANCY_CONFIG,
  DOMAIN_RESOLVER,
  SUBDOMAIN_RESOLVER,
  ROUTER_RESOLVER,
  HEADER_RESOLVER,
  QUERY_RESOLVER,
  SERVER_DOMAIN_RESOLVER,
  DYNAMIC_DOMAIN_RESOLVER,
} from '@/constants/tokens.constant';
import { DomainResolver } from '@/resolvers/domain.resolver';
import { SubdomainResolver } from '@/resolvers/subdomain.resolver';
import { RouterResolver } from '@/resolvers/router.resolver';
import { HeaderResolver } from '@/resolvers/header.resolver';
import { QueryResolver } from '@/resolvers/query.resolver';
import { ServerDomainResolver } from '@/resolvers/server-domain.resolver';
import { DynamicDomainResolver } from '@/resolvers/dynamic-domain.resolver';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class MultiTenancyModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers the multi-tenancy configuration and all resolver providers.
  | Merges user options with sensible defaults.
  |
  */
  static forRoot(options: Partial<MultiTenancyOptions>): DynamicModule {
    /*
    |--------------------------------------------------------------------------
    | Merge with defaults.
    |--------------------------------------------------------------------------
    */
    const mergedConfig: Partial<MultiTenancyOptions> = {
      mode: TenantMode.FILTER,
      tenantField: 'tenant_id',
      headerName: 'X-Tenant-ID',
      queryParam: 'tenant_id',
      resolvers: ['router'],
      ...options,
    };

    /*
    |--------------------------------------------------------------------------
    | Resolver factory providers.
    |--------------------------------------------------------------------------
    |
    | Each resolver is a plain class that receives config in its constructor.
    | Registered via Symbol tokens for type safety.
    |
    */
    const resolverProviders = [
      {
        provide: DOMAIN_RESOLVER,
        useFactory: (opts: any) => new DomainResolver(opts),
        inject: [MULTITENANCY_CONFIG],
      },
      {
        provide: SUBDOMAIN_RESOLVER,
        useFactory: (opts: any) => new SubdomainResolver(opts),
        inject: [MULTITENANCY_CONFIG],
      },
      {
        provide: ROUTER_RESOLVER,
        useFactory: (opts: any) => new RouterResolver(opts),
        inject: [MULTITENANCY_CONFIG],
      },
      {
        provide: HEADER_RESOLVER,
        useFactory: (opts: any) => new HeaderResolver(opts),
        inject: [MULTITENANCY_CONFIG],
      },
      {
        provide: QUERY_RESOLVER,
        useFactory: (opts: any) => new QueryResolver(opts),
        inject: [MULTITENANCY_CONFIG],
      },
      {
        provide: SERVER_DOMAIN_RESOLVER,
        useFactory: () => new ServerDomainResolver(),
      },
      {
        provide: DYNAMIC_DOMAIN_RESOLVER,
        useFactory: (opts: any) => new DynamicDomainResolver(opts),
        inject: [MULTITENANCY_CONFIG],
      },
    ];

    return {
      module: MultiTenancyModule,
      global: true,
      providers: [{ provide: MULTITENANCY_CONFIG, useValue: mergedConfig }, ...resolverProviders],
      exports: [
        MULTITENANCY_CONFIG,
        DOMAIN_RESOLVER,
        SUBDOMAIN_RESOLVER,
        ROUTER_RESOLVER,
        HEADER_RESOLVER,
        QUERY_RESOLVER,
        SERVER_DOMAIN_RESOLVER,
        DYNAMIC_DOMAIN_RESOLVER,
      ],
    };
  }
}
