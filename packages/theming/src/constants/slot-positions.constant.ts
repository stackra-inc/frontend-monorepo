/**
 * Theme Customizer Slot Positions
 *
 * |--------------------------------------------------------------------------
 * | Named slot positions for injecting custom content into the
 * | ThemeCustomizer drawer via the SlotRegistry.
 * |--------------------------------------------------------------------------
 * |
 * | Usage:
 * |   import { slotRegistry } from "@abdokouta/ts-ui";
 * |   import { THEME_SLOTS } from "@abdokouta/react-theming";
 * |
 * |   slotRegistry.registerEntry(THEME_SLOTS.CUSTOMIZER.BEFORE_MODE, {
 * |     id: "branding:banner",
 * |     render: () => <BrandingBanner />,
 * |     priority: 100,
 * |   });
 * |
 * @module constants/slot-positions
 */

export const THEME_SLOTS = {
  /** Slots within the ThemeCustomizer drawer. */
  CUSTOMIZER: {
    /** Before the entire drawer body content. */
    BEFORE: 'theme.customizer.before',
    /** After all sections (mode, palette, registered panels). */
    AFTER: 'theme.customizer.after',
    /** Before the color mode section. */
    BEFORE_MODE: 'theme.customizer.before-mode',
    /** After the color mode section, before the palette section. */
    AFTER_MODE: 'theme.customizer.after-mode',
    /** Before the color palette section. */
    BEFORE_PALETTE: 'theme.customizer.before-palette',
    /** After the color palette section, before registered panels. */
    AFTER_PALETTE: 'theme.customizer.after-palette',
    /** After all registered panels, before the drawer footer. */
    AFTER_PANELS: 'theme.customizer.after-panels',
  },
} as const;
