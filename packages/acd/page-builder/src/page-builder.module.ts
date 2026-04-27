/**
 * @fileoverview PageBuilderModule — DI Module for @stackra/react-page-builder
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @stackra/react-page-builder
 * |--------------------------------------------------------------------------
 * |
 * | Registers:
 * |   - `PAGE_BUILDER_CONFIG`              — raw config object
 * |   - `ComponentRegistry`                — DI-managed singleton (useClass)
 * |   - `PAGE_BUILDER_COMPONENT_REGISTRY`  — useExisting alias
 * |   - `TemplateRegistry`                 — DI-managed singleton (useClass)
 * |   - `PAGE_BUILDER_TEMPLATE_REGISTRY`   — useExisting alias
 * |   - `HistoryManager`                   — DI-managed singleton (useClass)
 * |   - `PAGE_BUILDER_HISTORY_MANAGER`     — useExisting alias
 * |   - `PageJsonSerializer`               — DI-managed singleton (useClass)
 * |   - `PAGE_BUILDER_SERIALIZER`          — useExisting alias
 * |   - `PageBuilderManager`               — DI-managed singleton (useClass)
 * |   - `PAGE_BUILDER_MANAGER`             — useExisting alias
 * |
 * | Seeds built-in layout components, content components, and templates
 * | via factory providers during `forRoot()`.
 * |
 * | Follows the same pattern as ThemeModule, CacheModule, SettingsModule.
 * |
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     PageBuilderModule.forRoot({ apiBaseUrl: '/api' }),
 *     PageBuilderModule.forFeature({
 *       components: [customChartMetadata],
 *       templates: [customTemplate],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @module @stackra/react-page-builder
 * @category Module
 */

import "reflect-metadata";
import { Module, type DynamicModule } from "@stackra/ts-container";

import type { PageBuilderConfig } from "@/interfaces/page-builder-config.interface";
import type { ComponentMetadata } from "@/interfaces/component-metadata.interface";
import type { PageTemplate } from "@/interfaces/page-template.interface";
import { ComponentRegistry } from "@/registries/component.registry";
import { TemplateRegistry } from "@/registries/template.registry";
import { HistoryManager } from "@/services/history-manager.service";
import { PageJsonSerializer } from "@/services/page-json-serializer.service";
import { PageBuilderManager } from "@/services/page-builder-manager.service";
import {
  PAGE_BUILDER_CONFIG,
  PAGE_BUILDER_MANAGER,
  PAGE_BUILDER_COMPONENT_REGISTRY,
  PAGE_BUILDER_TEMPLATE_REGISTRY,
  PAGE_BUILDER_HISTORY_MANAGER,
  PAGE_BUILDER_SERIALIZER,
  PAGE_BUILDER_FEATURE_COMPONENTS,
  PAGE_BUILDER_FEATURE_TEMPLATES,
} from "@/constants/tokens.constant";
import {
  BUILT_IN_LAYOUT_COMPONENTS,
  BUILT_IN_CONTENT_COMPONENTS,
} from "@/constants/built-in-components.constant";
import { BUILT_IN_TEMPLATES } from "@/constants/built-in-templates.constant";

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class PageBuilderModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers all services as DI-managed singletons. Seeds the
  | ComponentRegistry with built-in layout and content components,
  | and the TemplateRegistry with built-in templates via factory providers.
  |
  */

  /**
   * Register the page builder module globally with the provided configuration.
   *
   * Registers all core services (`ComponentRegistry`, `TemplateRegistry`,
   * `HistoryManager`, `PageJsonSerializer`, `PageBuilderManager`) as
   * DI-managed singletons and seeds built-in components and templates.
   *
   * @param config - Page builder configuration with `apiBaseUrl` and optional settings
   * @returns A global {@link DynamicModule} with all providers and exports
   */
  static forRoot(config: PageBuilderConfig): DynamicModule {
    return {
      module: PageBuilderModule,
      global: true,
      providers: [
        { provide: PAGE_BUILDER_CONFIG, useValue: config },

        // Registries — DI-managed singletons (no module-level globals)
        { provide: ComponentRegistry, useClass: ComponentRegistry },
        { provide: PAGE_BUILDER_COMPONENT_REGISTRY, useExisting: ComponentRegistry },
        { provide: TemplateRegistry, useClass: TemplateRegistry },
        { provide: PAGE_BUILDER_TEMPLATE_REGISTRY, useExisting: TemplateRegistry },

        // Services — DI-managed singletons
        { provide: HistoryManager, useClass: HistoryManager },
        { provide: PAGE_BUILDER_HISTORY_MANAGER, useExisting: HistoryManager },
        { provide: PageJsonSerializer, useClass: PageJsonSerializer },
        { provide: PAGE_BUILDER_SERIALIZER, useExisting: PageJsonSerializer },
        { provide: PageBuilderManager, useClass: PageBuilderManager },
        { provide: PAGE_BUILDER_MANAGER, useExisting: PageBuilderManager },

        // Seed built-in layout components
        {
          provide: "PAGE_BUILDER_LAYOUT_INIT",
          useFactory: (registry: ComponentRegistry) => {
            for (const meta of BUILT_IN_LAYOUT_COMPONENTS) {
              registry.register(meta.type, meta);
            }
            return true;
          },
          inject: [ComponentRegistry],
        },

        // Seed built-in content components
        {
          provide: "PAGE_BUILDER_CONTENT_INIT",
          useFactory: (registry: ComponentRegistry) => {
            for (const meta of BUILT_IN_CONTENT_COMPONENTS) {
              registry.register(meta.type, meta);
            }
            return true;
          },
          inject: [ComponentRegistry],
        },

        // Seed built-in templates
        {
          provide: "PAGE_BUILDER_TEMPLATE_INIT",
          useFactory: (registry: TemplateRegistry) => {
            for (const tmpl of BUILT_IN_TEMPLATES) {
              registry.register(tmpl.id, tmpl);
            }
            return true;
          },
          inject: [TemplateRegistry],
        },
      ],
      exports: [
        PAGE_BUILDER_CONFIG,
        ComponentRegistry,
        PAGE_BUILDER_COMPONENT_REGISTRY,
        TemplateRegistry,
        PAGE_BUILDER_TEMPLATE_REGISTRY,
        HistoryManager,
        PAGE_BUILDER_HISTORY_MANAGER,
        PageJsonSerializer,
        PAGE_BUILDER_SERIALIZER,
        PageBuilderManager,
        PAGE_BUILDER_MANAGER,
      ],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | forFeature
  |--------------------------------------------------------------------------
  |
  | Register additional components and/or templates from a feature module.
  | Uses factory providers that inject the DI-managed registries.
  |
  */

  /**
   * Register additional components and templates from a feature module.
   *
   * @param opts - Optional arrays of custom components and templates to register
   * @returns A {@link DynamicModule} with factory providers for registration
   */
  static forFeature(opts: {
    components?: ComponentMetadata[];
    templates?: PageTemplate[];
  }): DynamicModule {
    const providers: any[] = [];

    if (opts.components?.length) {
      providers.push(
        { provide: PAGE_BUILDER_FEATURE_COMPONENTS, useValue: opts.components },
        {
          provide: `PAGE_BUILDER_FEATURE_COMP_INIT_${Date.now()}`,
          useFactory: (registry: ComponentRegistry, items: ComponentMetadata[]) => {
            for (const meta of items) {
              registry.register(meta.type, meta);
            }
            return true;
          },
          inject: [ComponentRegistry, PAGE_BUILDER_FEATURE_COMPONENTS],
        },
      );
    }

    if (opts.templates?.length) {
      providers.push(
        { provide: PAGE_BUILDER_FEATURE_TEMPLATES, useValue: opts.templates },
        {
          provide: `PAGE_BUILDER_FEATURE_TMPL_INIT_${Date.now()}`,
          useFactory: (registry: TemplateRegistry, items: PageTemplate[]) => {
            for (const tmpl of items) {
              registry.register(tmpl.id, tmpl);
            }
            return true;
          },
          inject: [TemplateRegistry, PAGE_BUILDER_FEATURE_TEMPLATES],
        },
      );
    }

    return {
      module: PageBuilderModule,
      providers,
      exports: [],
    };
  }
}
