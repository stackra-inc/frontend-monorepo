/**
 * @stackra/react-theming
 *
 * Theme customizer registry, provider, hooks, and UI components.
 *
 * @module @stackra/react-theming
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
export { CustomizerRegistry, ThemeRegistry } from './registries';

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
  THEME_FEATURE_CONFIGS,
  CUSTOMIZER_FEATURE_PANELS,
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
export { tokenToCssVar, separateTokensByMode, mapTokensToVars } from './utils';

// ============================================================================
// Interfaces
// ============================================================================
export type { CustomizerPanel } from './interfaces';
export type { ThemeVars } from './interfaces';
export type { ThemeConfig } from './interfaces';
export type { ThemeModuleOptions } from './interfaces';
export type { DesignTokens } from './interfaces';
export type { ServerTokenState } from './interfaces';

// ============================================================================
// Types
// ============================================================================
export type { ColorMode } from './types';

// ============================================================================
// Facades
// ============================================================================
export { ThemeFacade } from './facades';
