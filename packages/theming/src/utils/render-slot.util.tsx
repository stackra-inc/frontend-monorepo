/**
 * renderSlot Utility
 *
 * |--------------------------------------------------------------------------
 * | Renders a named slot if @abdokouta/ts-ui is available.
 * |--------------------------------------------------------------------------
 * |
 * | Tries to import the slotRegistry from ts-ui and render entries.
 * | Returns null if ts-ui is not installed (optional peer dependency).
 * |
 * @module utils/render-slot
 */

import React, { Fragment, createElement } from 'react';

/** Cached reference to the slotRegistry. */
let _registry: any = null;
let _resolved = false;

function getRegistry(): any {
  if (_resolved) return _registry;
  _resolved = true;
  try {
    const mod = Function('return require("@abdokouta/ts-ui")')();
    _registry = mod?.slotRegistry ?? null;
  } catch {
    _registry = null;
  }
  return _registry;
}

/**
 * Renders all entries registered at the given slot name.
 * Returns null if ts-ui is not available or no entries exist.
 */
export function renderSlot(name: string): React.ReactNode {
  const registry = getRegistry();
  if (!registry) return null;

  const entries = registry.getEntries(name);
  if (!entries || entries.length === 0) return null;

  return createElement(
    Fragment,
    null,
    ...entries.map((entry: any) => createElement(Fragment, { key: entry.id }, entry.render()))
  );
}
