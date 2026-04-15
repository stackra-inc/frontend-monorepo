/**
 * @abdokouta/react-theming
 *
 * Theme customizer registry, provider, hooks, and UI components.
 *
 * @module @abdokouta/react-theming
 */

// ============================================================================
// Module
// ============================================================================
export { ThemeModule } from './theme.module';

// ============================================================================
// Provider
// ============================================================================
export { ThemeProvider } from './providers';
export type { ThemeProviderProps } from './providers';

// ============================================================================
// Hooks
// ============================================================================
export { useTheme, useColorMode } from './hooks';
export type { UseThemeReturn, UseColorModeReturn } from './hooks';

// ============================================================================
// Components
// ============================================================================
export {
  ThemeCustomizer,
  ModeSwitcher,
  ModeSelector,
  ThemeSwitcher,
  ThemeSelector,
} from './components';
export type {
  ThemeCustomizerProps,
  ModeSwitcherProps,
  ModeSelectorProps,
  ThemeSwitcherProps,
  ThemeSelectorProps,
} from './components';

// ============================================================================
// Registries
// ============================================================================
export { customizerRegistry, CustomizerRegistry, themeRegistry, ThemeRegistry } from './registries';
export type { CustomizerPanel } from './registries';

// ============================================================================
// Contexts
// ============================================================================
export { ThemeContext, useThemeContext } from './contexts';
export type { ThemeContextValue } from './contexts';

// ============================================================================
// Constants
// ============================================================================
export {
  THEME_CONFIG,
  THEME_REGISTRY,
  CUSTOMIZER_REGISTRY,
  BUILT_IN_THEMES,
  THEME_DEFAULT,
  THEME_NETFLIX,
  THEME_OCEAN,
  THEME_ROSE,
  THEME_FOREST,
  THEME_AMBER,
  THEME_VIOLET,
  THEME_SLOTS,
} from './constants';

// ============================================================================
// Utils
// ============================================================================
export { renderSlot } from './utils';

// ============================================================================
// Types
// ============================================================================
export type { ColorMode, ThemeConfig, ThemeModuleOptions } from './types';
