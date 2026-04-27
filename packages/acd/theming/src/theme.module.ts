/**
 * Theme Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @stackra/react-theming
 * |--------------------------------------------------------------------------
 * |
 * | Registers:
 * |   - `THEME_CONFIG`          — raw config object
 * |   - `ThemeRegistry`         — DI-managed singleton (useClass)
 * |   - `THEME_REGISTRY`        — useExisting alias
 * |   - `CustomizerRegistry`    — DI-managed singleton (useClass)
 * |   - `CUSTOMIZER_REGISTRY`   — useExisting alias
 * |
 * | Follows the same pattern as CacheModule, SettingsModule, DesktopModule.
 * |
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     ThemeModule.forRoot({ defaultTheme: 'ocean', defaultMode: 'dark' }),
 *     ThemeModule.forFeature([
 *       { id: 'custom', label: 'Custom', color: '#ff6600' },
 *     ]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @module @stackra/react-theming
 */

import 'reflect-metadata';
import { Module, type DynamicModule } from '@stackra/ts-container';

import type { ThemeConfig } from '@/interfaces/theme-config.interface';
import type { ThemeModuleOptions } from '@/interfaces/theme-module-options.interface';
import { ThemeRegistry } from '@/registries/theme.registry';
import { CustomizerRegistry } from '@/registries/customizer.registry';
import type { CustomizerPanel } from '@/interfaces/customizer-panel.interface';
import {
  THEME_CONFIG,
  THEME_REGISTRY,
  CUSTOMIZER_REGISTRY,
  THEME_FEATURE_CONFIGS,
  CUSTOMIZER_FEATURE_PANELS,
} from '@/constants/tokens.constant';
import { BUILT_IN_THEMES } from '@/constants/themes.constant';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class ThemeModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers the ThemeRegistry and CustomizerRegistry as DI-managed
  | singletons. Seeds the ThemeRegistry with built-in themes + any
  | extra themes from config via a factory provider.
  |
  */
  static forRoot(config: ThemeModuleOptions = {}): DynamicModule {
    return {
      module: ThemeModule,
      global: true,
      providers: [
        { provide: THEME_CONFIG, useValue: config },
        // Registry — DI-managed singletons (no module-level globals)
        { provide: ThemeRegistry, useClass: ThemeRegistry },
        { provide: THEME_REGISTRY, useExisting: ThemeRegistry },
        { provide: CustomizerRegistry, useClass: CustomizerRegistry },
        { provide: CUSTOMIZER_REGISTRY, useExisting: CustomizerRegistry },
        // Seed built-in themes + config themes via factory
        {
          provide: 'THEME_BUILTIN_INIT',
          useFactory: (registry: ThemeRegistry) => {
            for (const theme of BUILT_IN_THEMES) {
              if (!registry.has(theme.id)) {
                registry.register(theme.id, theme);
              }
            }
            if (config.themes) {
              for (const theme of config.themes) {
                registry.register(theme.id, theme);
              }
            }
            return true;
          },
          inject: [ThemeRegistry],
        },
      ],
      exports: [
        THEME_CONFIG,
        ThemeRegistry,
        THEME_REGISTRY,
        CustomizerRegistry,
        CUSTOMIZER_REGISTRY,
      ],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | forFeature
  |--------------------------------------------------------------------------
  |
  | Register additional themes from a feature module.
  | Uses a factory provider that injects the DI-managed ThemeRegistry.
  |
  */
  static forFeature(themes: ThemeConfig[]): DynamicModule {
    return {
      module: ThemeModule,
      providers: [
        { provide: THEME_FEATURE_CONFIGS, useValue: themes },
        {
          provide: `THEME_FEATURE_INIT_${Date.now()}`,
          useFactory: (registry: ThemeRegistry, configs: ThemeConfig[]) => {
            for (const theme of configs) {
              registry.register(theme.id, theme);
            }
            return true;
          },
          inject: [ThemeRegistry, THEME_FEATURE_CONFIGS],
        },
      ],
      exports: [],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | registerTheme
  |--------------------------------------------------------------------------
  |
  | Register a single custom theme via a factory provider.
  |
  */
  static registerTheme(theme: ThemeConfig): DynamicModule {
    return ThemeModule.forFeature([theme]);
  }

  /*
  |--------------------------------------------------------------------------
  | registerCustomizer
  |--------------------------------------------------------------------------
  |
  | Register a single customizer panel via a factory provider.
  |
  */
  static registerCustomizer(panel: CustomizerPanel): DynamicModule {
    return ThemeModule.registerCustomizers([panel]);
  }

  /*
  |--------------------------------------------------------------------------
  | registerCustomizers
  |--------------------------------------------------------------------------
  |
  | Register multiple customizer panels via a factory provider.
  |
  */
  static registerCustomizers(panels: CustomizerPanel[]): DynamicModule {
    return {
      module: ThemeModule,
      providers: [
        { provide: CUSTOMIZER_FEATURE_PANELS, useValue: panels },
        {
          provide: `CUSTOMIZER_FEATURE_INIT_${Date.now()}`,
          useFactory: (registry: CustomizerRegistry, items: CustomizerPanel[]) => {
            for (const panel of items) {
              registry.register(panel.id, panel);
            }
            return true;
          },
          inject: [CustomizerRegistry, CUSTOMIZER_FEATURE_PANELS],
        },
      ],
      exports: [],
    };
  }
}
