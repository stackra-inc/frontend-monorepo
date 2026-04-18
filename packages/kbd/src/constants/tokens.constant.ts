/**
 * DI Tokens for @stackra/kbd
 *
 * |--------------------------------------------------------------------------
 * | Injection tokens for the KbdModule DI integration.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra/kbd
 */

/** Injection token for the KbdModule configuration. */
export const KBD_CONFIG = Symbol.for('KBD_CONFIG');

/** Injection token for the ShortcutRegistry singleton. */
export const SHORTCUT_REGISTRY = Symbol.for('SHORTCUT_REGISTRY');
