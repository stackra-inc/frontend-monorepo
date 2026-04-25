/**
 * @fileoverview RefineModule — DI module for CRUD data layer.
 *
 * `forRoot()` configures global services (notification, realtime, audit log),
 * the TanStack QueryClient, ServiceRegistry, and QueryStringSerializer.
 *
 * `forFeature()` accepts Model classes decorated with `@Resource`, reads their
 * metadata, auto-creates Repository + Service pairs, and registers them in
 * the ServiceRegistry.
 *
 * Auth services have been moved to `@stackra/react-auth`.
 *
 * @module @stackra/react-refine
 * @category Module
 */

import { getResourceMetadata } from '@/decorators/resource.decorator';
import { ServiceRegistry } from '@/registries/service.registry';
import { HttpService } from '@/services/http.service';
import { NotificationService } from '@/services/notification.service';
import { RealtimeService } from '@/services/realtime.service';
import { AuditLogService } from '@/services/audit-log.service';
import { HttpRepository } from '@/repositories/http.repository';
import { LaravelQueryStringSerializer } from '@/serializers/laravel.serializer';
import type { RefineRootOptions } from '@/types/refine-root-options.type';
import type { Type } from '@/types/type-constructor.type';
import {
  SERVICE_REGISTRY,
  QUERY_CLIENT,
  REFINE_OPTIONS,
  REALTIME_SERVICE,
  NOTIFICATION_SERVICE,
  AUDIT_LOG_SERVICE,
  QUERY_STRING_SERIALIZER,
} from '@/constants';

/**
 * Core DI module for the refine CRUD data layer.
 *
 * Provides `forRoot()` for global configuration and
 * `forFeature()` for per-module resource registration.
 */
export class RefineModule {
  private static serviceRegistry = new ServiceRegistry();
  private static serializer = new LaravelQueryStringSerializer();

  /**
   * Configure global services and the TanStack QueryClient.
   *
   * @param options - Root configuration options.
   * @returns A DynamicModule-compatible configuration object.
   */
  static forRoot(options: RefineRootOptions = {}) {
    if (options.queryStringSerializer) {
      RefineModule.serializer = options.queryStringSerializer as any;
    }

    const resolveProvider = (token: symbol, userValue: any, defaultClass: Type<any>) =>
      userValue
        ? { provide: token, useValue: userValue }
        : { provide: token, useClass: defaultClass };

    const providers: any[] = [
      { provide: SERVICE_REGISTRY, useValue: RefineModule.serviceRegistry },
      { provide: REFINE_OPTIONS, useValue: options },
      { provide: QUERY_STRING_SERIALIZER, useValue: RefineModule.serializer },
      { provide: ServiceRegistry, useValue: RefineModule.serviceRegistry },

      resolveProvider(NOTIFICATION_SERVICE, options.notificationService, NotificationService),
      resolveProvider(REALTIME_SERVICE, options.realtimeService, RealtimeService),
      resolveProvider(AUDIT_LOG_SERVICE, options.auditLogService, AuditLogService),
    ];

    if (options.queryClient) {
      providers.push({ provide: QUERY_CLIENT, useValue: options.queryClient });
    }

    return {
      module: RefineModule,
      global: options.isGlobal ?? true,
      providers,
      exports: [
        SERVICE_REGISTRY,
        QUERY_CLIENT,
        REFINE_OPTIONS,
        NOTIFICATION_SERVICE,
        REALTIME_SERVICE,
        AUDIT_LOG_SERVICE,
        ServiceRegistry,
      ],
    };
  }

  /**
   * Register resource services from Model classes decorated with `@Resource`.
   */
  static forFeature(models: Type<any>[]) {
    const registry = RefineModule.serviceRegistry;

    for (const modelClass of models) {
      const resourceMeta = getResourceMetadata(modelClass);
      if (!resourceMeta) {
        throw new Error(
          `Class "${modelClass.name}" is missing the @Resource decorator. ` +
            `Add @Resource({ name: ..., endpoint: ... }) to the class.`
        );
      }

      let repository: any;
      if (resourceMeta.repository) {
        repository = new resourceMeta.repository();
      } else if (RefineModule.isEloquentModel(modelClass)) {
        const { Repository } = RefineModule.requireEloquent();
        repository = new Repository(modelClass);
      } else {
        repository = new HttpRepository(
          undefined as any,
          { endpoint: resourceMeta.endpoint },
          RefineModule.serializer
        );
      }

      let service: any;
      if (resourceMeta.service) {
        service = new resourceMeta.service(repository);
      } else {
        service = new HttpService(repository);
      }

      registry.register(resourceMeta.name, service);
    }

    return {
      module: RefineModule,
      providers: [],
    };
  }

  private static isEloquentModel(modelClass: Type<any>): boolean {
    try {
      const { Model } = RefineModule.requireEloquent();
      return Model && modelClass.prototype instanceof Model;
    } catch {
      return false;
    }
  }

  private static requireEloquent(): { Model: any; Repository: any } {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@stackra/ts-eloquent');
  }

  static getServiceRegistry(): ServiceRegistry {
    return RefineModule.serviceRegistry;
  }

  static getSerializer(): any {
    return RefineModule.serializer;
  }
}
