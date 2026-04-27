/**
 * @fileoverview DesignTokens Interface
 *
 * Complete design token schema matching HeroUI v3 / HeroUI Native CSS variables.
 * This interface represents the flat JSON shape returned by the backend
 * `GET /api/v1/settings/theme` endpoint. Token keys use snake_case and map
 * directly to CSS custom properties via the {@link tokenToCssVar} utility
 * (e.g., `surface_secondary` → `--surface-secondary`).
 *
 * Token categories:
 * - **Primitives**: Shared across light/dark — `white`, `black`, `snow`, `eclipse`
 * - **Base Colors**: `background`, `foreground`, `muted`
 * - **Surface Colors**: Cards, accordions, disclosure groups + foregrounds
 * - **Overlay Colors**: Tooltips, popovers, modals, menus + foregrounds
 * - **Accent & Default**: Primary action color and neutral default
 * - **Form Field Colors**: Input backgrounds, foregrounds, placeholders, borders
 * - **Status Colors**: `success`, `warning`, `danger` + foregrounds
 * - **Component Colors**: `segment`, `segment_foreground`, `scrollbar`
 * - **Utility Colors**: `border`, `separator`, `focus`, `link`
 * - **Shadows**: `surface_shadow`, `overlay_shadow`, `field_shadow`
 * - **Radius**: `radius`, `field_radius`
 * - **Typography**: `font_sans`
 * - **Layout**: `border_width`, `field_border_width`, `disabled_opacity`, etc.
 * - **Skeleton**: `skeleton_animation`
 * - **Dark Mode Overrides**: Prefixed with `dark_`, stripped by {@link separateTokensByMode}
 * - **Custom Extensions**: Status workflow colors, severity colors, branding
 *
 * @module @stackra/react-theming
 * @category Interfaces
 *
 * @description
 * The canonical design token schema consumed identically across web (HeroUI v3),
 * desktop (Electron), and mobile (HeroUI Native / Uniwind). The backend
 * `ThemeSettings` Spatie class defines the source of truth; this interface
 * mirrors that schema on the client side.
 */

/**
 * Complete design token schema matching HeroUI v3 / HeroUI Native variables.
 *
 * All properties are optional to support partial updates and incremental
 * token adoption. The index signature allows additional custom tokens
 * without requiring interface changes.
 *
 * @example
 * ```typescript
 * const tokens: DesignTokens = {
 *   accent: 'oklch(0.6204 0.195 253.83)',
 *   background: 'oklch(0.9702 0 0)',
 *   dark_background: 'oklch(0.12 0.005 285.823)',
 *   radius: '0.5rem',
 *   font_sans: 'Inter, sans-serif',
 * };
 * ```
 */
export interface DesignTokens {
  // ---------------------------------------------------------------------------
  // Primitives (shared across light and dark)
  // ---------------------------------------------------------------------------

  /** Pure white — `oklch(100% 0 0)` */
  white?: string;
  /** Pure black — `oklch(0% 0 0)` */
  black?: string;
  /** Near-white — `oklch(0.9911 0 0)` */
  snow?: string;
  /** Near-black — `oklch(0.2103 0.0059 285.89)` */
  eclipse?: string;

  // ---------------------------------------------------------------------------
  // Base Colors (light)
  // ---------------------------------------------------------------------------

  /** Page background */
  background?: string;
  /** Primary text color */
  foreground?: string;
  /** Muted/secondary text color */
  muted?: string;

  // ---------------------------------------------------------------------------
  // Surface Colors
  // ---------------------------------------------------------------------------

  /** Primary surface (cards, accordions) */
  surface?: string;
  /** Primary surface text */
  surface_foreground?: string;
  /** Secondary surface */
  surface_secondary?: string;
  /** Secondary surface text */
  surface_secondary_foreground?: string;
  /** Tertiary surface */
  surface_tertiary?: string;
  /** Tertiary surface text */
  surface_tertiary_foreground?: string;

  // ---------------------------------------------------------------------------
  // Overlay Colors
  // ---------------------------------------------------------------------------

  /** Overlay background (tooltips, popovers, modals) */
  overlay?: string;
  /** Overlay text */
  overlay_foreground?: string;
  /** Backdrop overlay (e.g., `rgba(0, 0, 0, 0.5)`) */
  backdrop?: string;

  // ---------------------------------------------------------------------------
  // Accent & Default
  // ---------------------------------------------------------------------------

  /** Primary accent / brand color */
  accent?: string;
  /** Text on accent background */
  accent_foreground?: string;
  /** Neutral default color */
  default?: string;
  /** Text on default background */
  default_foreground?: string;

  // ---------------------------------------------------------------------------
  // Form Fields
  // ---------------------------------------------------------------------------

  /** Input background */
  field_background?: string;
  /** Input text */
  field_foreground?: string;
  /** Input placeholder text */
  field_placeholder?: string;
  /** Input border color */
  field_border?: string;

  // ---------------------------------------------------------------------------
  // Status Colors
  // ---------------------------------------------------------------------------

  /** Success color */
  success?: string;
  /** Text on success background */
  success_foreground?: string;
  /** Warning color */
  warning?: string;
  /** Text on warning background */
  warning_foreground?: string;
  /** Danger / error color */
  danger?: string;
  /** Text on danger background */
  danger_foreground?: string;

  // ---------------------------------------------------------------------------
  // Component Colors
  // ---------------------------------------------------------------------------

  /** Segmented control background */
  segment?: string;
  /** Segmented control text */
  segment_foreground?: string;
  /** Scrollbar thumb color */
  scrollbar?: string;

  // ---------------------------------------------------------------------------
  // Utility Colors
  // ---------------------------------------------------------------------------

  /** Border color */
  border?: string;
  /** Separator / divider color */
  separator?: string;
  /** Focus ring color */
  focus?: string;
  /** Link text color */
  link?: string;

  // ---------------------------------------------------------------------------
  // Shadows
  // ---------------------------------------------------------------------------

  /** Surface shadow (cards, accordions) */
  surface_shadow?: string;
  /** Overlay shadow (modals, popovers) */
  overlay_shadow?: string;
  /** Form field shadow */
  field_shadow?: string;

  // ---------------------------------------------------------------------------
  // Radius
  // ---------------------------------------------------------------------------

  /** Base border radius (e.g., `0.5rem`) */
  radius?: string;
  /** Form field border radius */
  field_radius?: string;

  // ---------------------------------------------------------------------------
  // Typography
  // ---------------------------------------------------------------------------

  /** Sans-serif font family */
  font_sans?: string;

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  /** Default border width (e.g., `1px`) */
  border_width?: string;
  /** Form field border width */
  field_border_width?: string;
  /** Disabled element opacity (e.g., `0.5`) */
  disabled_opacity?: string;
  /** Focus ring offset width */
  ring_offset_width?: string;
  /** Base spacing unit (e.g., `0.25rem`) */
  spacing?: string;

  // ---------------------------------------------------------------------------
  // Skeleton
  // ---------------------------------------------------------------------------

  /** Skeleton loading animation type (`shimmer`, `pulse`, `none`) */
  skeleton_animation?: string;

  // ---------------------------------------------------------------------------
  // Dark Mode Overrides (prefixed with `dark_`)
  // ---------------------------------------------------------------------------

  /** Dark mode: page background */
  dark_background?: string;
  /** Dark mode: primary text */
  dark_foreground?: string;
  /** Dark mode: muted text */
  dark_muted?: string;
  /** Dark mode: primary surface */
  dark_surface?: string;
  /** Dark mode: primary surface text */
  dark_surface_foreground?: string;
  /** Dark mode: secondary surface */
  dark_surface_secondary?: string;
  /** Dark mode: secondary surface text */
  dark_surface_secondary_foreground?: string;
  /** Dark mode: tertiary surface */
  dark_surface_tertiary?: string;
  /** Dark mode: tertiary surface text */
  dark_surface_tertiary_foreground?: string;
  /** Dark mode: overlay background */
  dark_overlay?: string;
  /** Dark mode: overlay text */
  dark_overlay_foreground?: string;
  /** Dark mode: backdrop */
  dark_backdrop?: string;
  /** Dark mode: accent color */
  dark_accent?: string;
  /** Dark mode: accent text */
  dark_accent_foreground?: string;
  /** Dark mode: default color */
  dark_default?: string;
  /** Dark mode: default text */
  dark_default_foreground?: string;
  /** Dark mode: field background */
  dark_field_background?: string;
  /** Dark mode: field text */
  dark_field_foreground?: string;
  /** Dark mode: field placeholder */
  dark_field_placeholder?: string;
  /** Dark mode: field border */
  dark_field_border?: string;
  /** Dark mode: success color */
  dark_success?: string;
  /** Dark mode: success text */
  dark_success_foreground?: string;
  /** Dark mode: warning color */
  dark_warning?: string;
  /** Dark mode: warning text */
  dark_warning_foreground?: string;
  /** Dark mode: danger color */
  dark_danger?: string;
  /** Dark mode: danger text */
  dark_danger_foreground?: string;
  /** Dark mode: segment background */
  dark_segment?: string;
  /** Dark mode: segment text */
  dark_segment_foreground?: string;
  /** Dark mode: scrollbar */
  dark_scrollbar?: string;
  /** Dark mode: border */
  dark_border?: string;
  /** Dark mode: separator */
  dark_separator?: string;
  /** Dark mode: focus ring */
  dark_focus?: string;
  /** Dark mode: link */
  dark_link?: string;
  /** Dark mode: surface shadow */
  dark_surface_shadow?: string;
  /** Dark mode: overlay shadow */
  dark_overlay_shadow?: string;
  /** Dark mode: field shadow */
  dark_field_shadow?: string;

  // ---------------------------------------------------------------------------
  // Custom Extensions — Status Workflow Colors
  // ---------------------------------------------------------------------------

  /** Status: submitted */
  status_submitted?: string;
  /** Status: under review */
  status_under_review?: string;
  /** Status: under approval */
  status_under_approval?: string;
  /** Status: approved */
  status_approved?: string;
  /** Status: in progress */
  status_in_progress?: string;
  /** Status: assigned */
  status_assigned?: string;
  /** Status: on hold */
  status_on_hold?: string;
  /** Status: cancelled */
  status_cancelled?: string;
  /** Status: default / fallback */
  status_default?: string;

  // ---------------------------------------------------------------------------
  // Custom Extensions — Severity Colors
  // ---------------------------------------------------------------------------

  /** Severity: critical */
  severity_critical?: string;
  /** Severity: high */
  severity_high?: string;
  /** Severity: medium */
  severity_medium?: string;
  /** Severity: low */
  severity_low?: string;

  // ---------------------------------------------------------------------------
  // Custom Extensions — Branding
  // ---------------------------------------------------------------------------

  /** Application display name */
  app_name?: string;
  /** Logo URL (light mode) */
  logo_url?: string;
  /** Logo URL (dark mode) */
  logo_dark_url?: string;

  // ---------------------------------------------------------------------------
  // Index Signature — Allow Additional Custom Tokens
  // ---------------------------------------------------------------------------

  /** Allow additional custom tokens without interface changes */
  [key: string]: string | undefined;
}
