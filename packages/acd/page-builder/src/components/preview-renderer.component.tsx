/**
 * @fileoverview PreviewRenderer — wraps the @stackra/react-sdui renderer
 * for preview mode.
 *
 * Receives the serialized Page_JSON and renders it in a viewport
 * constrained to the selected device width. Used when the builder
 * is in preview mode to show the page exactly as end users would see it.
 *
 * @module @stackra/react-page-builder
 * @category Components
 */

"use client";

import { SduiRenderer } from "@stackra/react-sdui";
import { usePageBuilder } from "@/hooks/use-page-builder.hook";
import { DeviceWidth } from "@/enums/device-width.enum";

/**
 * Props for the {@link PreviewRenderer} component.
 */
export interface PreviewRendererProps {
  /** The device width to constrain the preview viewport */
  deviceWidth?: DeviceWidth;
}

/**
 * Preview renderer component wrapping the SDUI renderer.
 *
 * Serializes the current page tree and renders it through the
 * `@stackra/react-sdui` renderer in a viewport constrained to
 * the selected device width.
 *
 * @example
 * ```tsx
 * <PreviewRenderer deviceWidth={DeviceWidth.TABLET} />
 * ```
 */
export function PreviewRenderer({ deviceWidth = DeviceWidth.DESKTOP }: PreviewRendererProps) {
  const manager = usePageBuilder();
  const pageJson = manager.serialize();

  return (
    <div
      style={{
        maxWidth: deviceWidth,
        margin: "0 auto",
        border: "1px solid var(--color-divider, #e0e0e0)",
        borderRadius: 8,
        overflow: "auto",
        backgroundColor: "var(--color-background, #ffffff)",
        minHeight: 400,
      }}
      role="region"
      aria-label="Page preview"
    >
      <SduiRenderer pageJson={pageJson} />
    </div>
  );
}
