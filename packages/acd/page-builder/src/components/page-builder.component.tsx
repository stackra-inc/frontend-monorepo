/**
 * @fileoverview PageBuilder — top-level component composing all page builder UI.
 *
 * Composes Canvas, Palette, PropertyEditor, Toolbar, VersionHistory,
 * TemplateDialog, and PreviewRenderer. Manages edit/preview mode state.
 * In preview mode, hides Palette, PropertyEditor, and edit overlays.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import React, { useState, useCallback } from "react";
import { useBuilderMode } from "@/hooks/use-builder-mode.hook";
import { usePageBuilder } from "@/hooks/use-page-builder.hook";
import { usePageBuilderContext } from "@/contexts/page-builder.context";
import { BuilderMode } from "@/enums/builder-mode.enum";
import { DeviceWidth } from "@/enums/device-width.enum";
import type { PageTemplate } from "@/interfaces/page-template.interface";
import { Canvas } from "./canvas.component";
import { Palette } from "./palette.component";
import { PropertyEditor } from "./property-editor.component";
import { Toolbar } from "./toolbar.component";
import { PreviewRenderer } from "./preview-renderer.component";
import { TemplateDialog } from "./template-dialog.component";
import { VersionHistory } from "./version-history.component";

/**
 * Props for the {@link PageBuilder} component.
 */
export interface PageBuilderProps {
  /** The page ID for save/load operations */
  pageId: string;
  /** Whether to show the template dialog on mount */
  showTemplateDialog?: boolean;
}

/**
 * Top-level page builder component.
 *
 * Composes all page builder sub-components into a complete editing
 * interface. Manages device width, template dialog, and version history
 * panel visibility. In preview mode, hides the Palette, PropertyEditor,
 * and edit overlays, showing only the PreviewRenderer.
 *
 * Must be rendered within a `<PageBuilderProvider>`.
 *
 * @example
 * ```tsx
 * <PageBuilderProvider>
 *   <PageBuilder pageId="page-1" />
 * </PageBuilderProvider>
 * ```
 */
export function PageBuilder({ pageId, showTemplateDialog = false }: PageBuilderProps) {
  const { mode } = useBuilderMode();
  const manager = usePageBuilder();
  const { setPageTree } = usePageBuilderContext();

  const [deviceWidth, setDeviceWidth] = useState<DeviceWidth>(DeviceWidth.DESKTOP);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(showTemplateDialog);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const isPreview = mode === BuilderMode.PREVIEW;

  const handleSave = useCallback(async () => {
    try {
      await manager.savePage(pageId);
    } catch (error) {
      console.error("[PageBuilder] Failed to save page:", error);
    }
  }, [manager, pageId]);

  const handleTemplateSelect = useCallback(
    (template: PageTemplate) => {
      manager.loadTemplate(template.id);
      setPageTree(manager.getTree());
      setIsTemplateDialogOpen(false);
    },
    [manager, setPageTree],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--color-background, #ffffff)",
      }}
      role="application"
      aria-label="Page builder"
    >
      <Toolbar
        onSave={handleSave}
        onVersionHistory={() => setIsVersionHistoryOpen(true)}
        deviceWidth={deviceWidth}
        onDeviceWidthChange={setDeviceWidth}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left sidebar — Palette (hidden in preview mode) */}
        {!isPreview && <Palette />}

        {/* Main content area */}
        {isPreview ? (
          <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
            <PreviewRenderer deviceWidth={deviceWidth} />
          </div>
        ) : (
          <Canvas />
        )}

        {/* Right sidebar — PropertyEditor (hidden in preview mode) */}
        {!isPreview && (
          <div
            style={{
              width: 280,
              borderLeft: "1px solid var(--color-divider, #e0e0e0)",
              backgroundColor: "var(--color-content1, #ffffff)",
              overflow: "auto",
            }}
          >
            <PropertyEditor />
          </div>
        )}

        {/* Version History panel */}
        <VersionHistory
          pageId={pageId}
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
        />
      </div>

      {/* Template Dialog */}
      <TemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
