/**
 * @fileoverview ServerTokenState Interface
 *
 * Represents the state of server-driven design tokens received from the
 * `SettingsSyncService`. This state is consumed by the `ThemeContext` and
 * exposed to platform-specific providers (`WebThemeProvider`, `NativeThemeProvider`)
 * for applying tokens to the DOM or Uniwind respectively.
 *
 * @module @stackra/react-theming
 * @category Interfaces
 */

import type { DesignTokens } from './design-tokens.interface';

/**
 * State of server-driven design tokens within the theme context.
 *
 * @example
 * ```typescript
 * const initialState: ServerTokenState = {
 *   tokens: null,
 *   loaded: false,
 *   connected: false,
 * };
 * ```
 */
export interface ServerTokenState {
  /** Server-driven tokens (from SettingsSyncService). `null` before initial fetch. */
  tokens: DesignTokens | null;
  /** Whether the initial fetch has completed. */
  loaded: boolean;
  /** Whether the real-time connection is active. */
  connected: boolean;
}
