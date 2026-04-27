/**
 * @stackra/react-page-builder
 *
 * Visual page editor with drag-and-drop canvas, component palette,
 * property editor, undo/redo, preview mode, templates, and version history.
 *
 * @module @stackra/react-page-builder
 */

// ============================================================================
// Module
// ============================================================================
export { PageBuilderModule } from "./page-builder.module";

// ============================================================================
// Services
// ============================================================================
export { PageBuilderManager } from "./services";

// ============================================================================
// Facades
// ============================================================================
export { PageBuilderFacade } from "./facades";

// ============================================================================
// Registries
// ============================================================================
export { ComponentRegistry, TemplateRegistry } from "./registries";

// ============================================================================
// Hooks
// ============================================================================
export { usePageBuilder } from "./hooks";
export { usePageTree } from "./hooks";
export type { UsePageTreeReturn } from "./hooks";
export { useSelectedNode } from "./hooks";
export type { UseSelectedNodeReturn } from "./hooks";
export { useBuilderMode } from "./hooks";
export type { UseBuilderModeReturn } from "./hooks";
export { useHistory } from "./hooks";
export type { UseHistoryReturn } from "./hooks";

// ============================================================================
// Components
// ============================================================================
export {
  PageBuilder,
  Canvas,
  Palette,
  PropertyEditor,
  Toolbar,
  PreviewRenderer,
  TemplateDialog,
  VersionHistory,
  DropZone,
} from "./components";
export type {
  PageBuilderProps,
  CanvasProps,
  PaletteProps,
  PropertyEditorProps,
  ToolbarProps,
  PreviewRendererProps,
  TemplateDialogProps,
  VersionHistoryProps,
  DropZoneProps,
} from "./components";

// ============================================================================
// Providers
// ============================================================================
export { PageBuilderProvider } from "./providers";
export type { PageBuilderProviderProps } from "./providers";

// ============================================================================
// Contexts
// ============================================================================
export { PageBuilderContext, usePageBuilderContext } from "./contexts";
export type { PageBuilderContextValue } from "./contexts";

// ============================================================================
// Constants / Tokens
// ============================================================================
export {
  PAGE_BUILDER_CONFIG,
  PAGE_BUILDER_MANAGER,
  PAGE_BUILDER_COMPONENT_REGISTRY,
  PAGE_BUILDER_TEMPLATE_REGISTRY,
  PAGE_BUILDER_HISTORY_MANAGER,
  PAGE_BUILDER_SERIALIZER,
  PAGE_BUILDER_FEATURE_COMPONENTS,
  PAGE_BUILDER_FEATURE_TEMPLATES,
  BUILT_IN_LAYOUT_COMPONENTS,
  BUILT_IN_CONTENT_COMPONENTS,
  BUILT_IN_TEMPLATES,
} from "./constants";

// ============================================================================
// Enums
// ============================================================================
export { BuilderMode } from "./enums";
export { DeviceWidth } from "./enums";
export { FieldType } from "./enums";

// ============================================================================
// Interfaces
// ============================================================================
export type {
  PropertySchemaField,
  PropertySchemaFieldValidation,
  PropertySchemaFieldOption,
} from "./interfaces";
export type { ComponentMetadata } from "./interfaces";
export type { ComponentNode } from "./interfaces";
export type { PageTree } from "./interfaces";
export type { PageMetadata } from "./interfaces";
export type { PageJson } from "./interfaces";
export type { PageTemplate } from "./interfaces";
export type { PageBuilderConfig } from "./interfaces";
export type { VersionEntry } from "./interfaces";
export type { VersionListResponse } from "./interfaces";

// ============================================================================
// Utils
// ============================================================================
export { prettyPrintPageJson } from "./utils";
