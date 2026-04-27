/**
 * @fileoverview Barrel export for all interfaces in the page builder package.
 *
 * Uses `export type` for all interfaces to ensure they are erased at
 * compile time and do not contribute to the runtime bundle.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

export type {
  PropertySchemaField,
  PropertySchemaFieldValidation,
  PropertySchemaFieldOption,
} from "./property-schema-field.interface";
export type { ComponentMetadata } from "./component-metadata.interface";
export type { ComponentNode } from "./component-node.interface";
export type { PageTree } from "./page-tree.interface";
export type { PageMetadata } from "./page-metadata.interface";
export type { PageJson } from "./page-json.interface";
export type { PageTemplate } from "./page-template.interface";
export type { PageBuilderConfig } from "./page-builder-config.interface";
export type { VersionEntry } from "./version-entry.interface";
export type { VersionListResponse } from "./version-list-response.interface";
