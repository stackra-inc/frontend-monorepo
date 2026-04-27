/**
 * @fileoverview UUID generator utility for creating unique component node IDs.
 *
 * Uses the `uuid` package (v4 — random) to produce cryptographically
 * random identifiers for new ComponentNode instances.
 *
 * @module @stackra/react-page-builder
 * @category Utils
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique identifier for a new ComponentNode.
 *
 * Returns a UUID v4 string (e.g. "550e8400-e29b-41d4-a716-446655440000").
 * Used by tree operations when creating or duplicating nodes.
 *
 * @returns A UUID v4 string
 */
export function generateId(): string {
  return uuidv4();
}
