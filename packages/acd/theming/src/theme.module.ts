/**
 * Theme Module
 *
 * |--------------------------------------------------------------------------
 * | DI Module for @stackra/react-theming
 * |--------------------------------------------------------------------------
 * |
 * | Registers:
 * |   - `THEME_CONFIG`          — raw config object
 * |   - `ThemeRegistry`         — the global theme registry singleton
 * |   - `THEME_REGISTRY`        — useValue alias to the same singleton
 * |   - `CustomizerRegistry`    — the global customizer registry singleton
 * |   - `CUSTOMIZER_REGISTRY`   — useValue alias to the same singleton
 * |
 * | Follows the same pattern as CacheModule, EventsModule, DesktopModule.
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
import { ThemeRegistry, themeRegistry } from '@/registries/theme.registry';
import { CustomizerRegistry, customizerRegistry } from '@/registries/customizer.registry';
import type { CustomizerPanel } from '@/interfaces/customizer-panel.interface';
import { THEME_CONFIG, THEME_REGISTRY, CUSTOMIZER_REGISTRY } from '@/constants/tokens.constant';
import { BUILT_IN_THEMES } from '@/constants/themes.constant';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern
export class ThemeModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Registers the ThemeRegistry and CustomizerRegistry as global DI singletons.
  | Seeds the ThemeRegistry with built-in themes + any extra themes from config.
  |
  */
  static forRoot(config: ThemeModuleOptions = {}): DynamicModule {
    /*
    |--------------------------------------------------------------------------
    | Register built-in themes (idempotent — skip if already registered).
    |--------------------------------------------------------------------------
    */
    for (const theme of BUILT_IN_THEMES) {
      if (!themeRegistry.has(theme.id)) {
        themeRegistry.register(theme.id, theme);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Register extra themes from config.
    |--------------------------------------------------------------------------
    */
    if (config.themes) {
      for (const theme of config.themes) {
        themeRegistry.register(theme.id, theme);
      }
    }

    return {
      module: ThemeModule,
      global: true,
      providers: [
        { provide: THEME_CONFIG, useValue: config },
        { provide: ThemeRegistry, useValue: themeRegistry },
        { provide: THEME_REGISTRY, useValue: themeRegistry },
        { provide: CustomizerRegistry, useValue: customizerRegistry },
        { provide: CUSTOMIZER_REGISTRY, useValue: customizerRegistry },
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
  | Themes are added to the global ThemeRegistry singleton.
  |
  */
  static forFeature(themes: ThemeConfig[]): DynamicModule {
    for (const theme of themes) {
      themeRegistry.register(theme.id, theme);
    }
    return { module: ThemeModule, providers: [], exports: [] };
  }

  /*
  |--------------------------------------------------------------------------
  | registerTheme
  |--------------------------------------------------------------------------
  |
  | Register a single custom theme.
  |
  */
  static registerTheme(theme: ThemeConfig): DynamicModule {
    themeRegistry.register(theme.id, theme);
    return { module: ThemeModule, providers: [], exports: [] };
  }

  /*
  |--------------------------------------------------------------------------
  | registerCustomizer
  |--------------------------------------------------------------------------
  |
  | Register a single customizer panel.
  |
  */
  static registerCustomizer(panel: CustomizerPanel): DynamicModule {
    customizerRegistry.register(panel.id, panel);
    return { module: ThemeModule, providers: [], exports: [] };
  }

  /*
  |--------------------------------------------------------------------------
  | registerCustomizers
  |--------------------------------------------------------------------------
  |
  | Register multiple customizer panels at once.
  |
  */
  static registerCustomizers(panels: CustomizerPanel[]): DynamicModule {
    for (const panel of panels) {
      customizerRegistry.register(panel.id, panel);
    }
    return { module: ThemeModule, providers: [], exports: [] };
  }
}
