/**
 * @fileoverview Built-in component metadata for the page builder.
 *
 * Defines the two groups of components registered during
 * `PageBuilderModule.forRoot()`:
 *
 * - **Layout components** — structural containers (Row, Column, Section,
 *   Container, Grid) that arrange child components spatially.
 * - **Content components** — leaf or near-leaf components (Heading, Text,
 *   Image, Button, Divider, Spacer) that display actual content.
 *
 * Each entry is a complete ComponentMetadata object with propertySchema,
 * allowedChildren, and maxChildren fully specified.
 *
 * @module @stackra/react-page-builder
 * @category Constants
 */

import { FieldType } from "../enums/field-type.enum";
import type { ComponentMetadata } from "../interfaces/component-metadata.interface";

// ─── Layout Components ───────────────────────────────────────────────────────

/**
 * Built-in layout components registered during `forRoot()`.
 *
 * Layout components provide structural arrangement:
 * - Row: horizontal arrangement of Columns
 * - Column: vertical stack accepting any child
 * - Section: visually distinct section with optional title
 * - Container: max-width constrained wrapper
 * - Grid: CSS grid with configurable column count
 */
export const BUILT_IN_LAYOUT_COMPONENTS: ComponentMetadata[] = [
  {
    type: "row",
    displayName: "Row",
    icon: "rows",
    category: "Layout",
    defaultProps: { gap: 16 },
    propertySchema: [
      {
        key: "gap",
        label: "Gap",
        type: FieldType.NUMBER,
        defaultValue: 16,
        validation: { min: 0, max: 100 },
      },
    ],
    allowedChildren: ["column"],
    maxChildren: 12,
  },
  {
    type: "column",
    displayName: "Column",
    icon: "columns",
    category: "Layout",
    defaultProps: {},
    propertySchema: [],
    allowedChildren: ["*"],
    maxChildren: -1,
  },
  {
    type: "section",
    displayName: "Section",
    icon: "layout",
    category: "Layout",
    defaultProps: { title: "" },
    propertySchema: [
      {
        key: "title",
        label: "Section Title",
        type: FieldType.TEXT,
        defaultValue: "",
        validation: { maxLength: 200 },
      },
    ],
    allowedChildren: ["*"],
    maxChildren: -1,
  },
  {
    type: "container",
    displayName: "Container",
    icon: "box",
    category: "Layout",
    defaultProps: { maxWidth: 1200 },
    propertySchema: [
      {
        key: "maxWidth",
        label: "Max Width",
        type: FieldType.NUMBER,
        defaultValue: 1200,
        validation: { min: 200, max: 2400 },
      },
    ],
    allowedChildren: ["*"],
    maxChildren: -1,
  },
  {
    type: "grid",
    displayName: "Grid",
    icon: "grid",
    category: "Layout",
    defaultProps: { columns: 2, gap: 16 },
    propertySchema: [
      {
        key: "columns",
        label: "Columns",
        type: FieldType.NUMBER,
        defaultValue: 2,
        validation: { min: 1, max: 12 },
      },
      {
        key: "gap",
        label: "Gap",
        type: FieldType.NUMBER,
        defaultValue: 16,
        validation: { min: 0, max: 100 },
      },
    ],
    allowedChildren: ["*"],
    maxChildren: -1,
  },
];

// ─── Content Components ──────────────────────────────────────────────────────

/**
 * Built-in content components registered during `forRoot()`.
 *
 * Content components display actual page content:
 * - Heading: text heading with configurable level (h1–h6)
 * - Text: paragraph text with alignment
 * - Image: image with src, alt, dimensions, and object-fit
 * - Button: clickable button with HeroUI variants
 * - Divider: horizontal or vertical separator
 * - Spacer: empty space with configurable height
 */
export const BUILT_IN_CONTENT_COMPONENTS: ComponentMetadata[] = [
  {
    type: "heading",
    displayName: "Heading",
    icon: "heading",
    category: "Content",
    defaultProps: { text: "Heading", level: "h2", textAlign: "left" },
    propertySchema: [
      {
        key: "text",
        label: "Text",
        type: FieldType.TEXT,
        defaultValue: "Heading",
        validation: { required: true, maxLength: 500 },
      },
      {
        key: "level",
        label: "Heading Level",
        type: FieldType.SELECT,
        defaultValue: "h2",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
          { label: "H4", value: "h4" },
          { label: "H5", value: "h5" },
          { label: "H6", value: "h6" },
        ],
      },
      {
        key: "textAlign",
        label: "Text Alignment",
        type: FieldType.SELECT,
        defaultValue: "left",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    allowedChildren: [],
    maxChildren: 0,
  },
  {
    type: "text",
    displayName: "Text",
    icon: "type",
    category: "Content",
    defaultProps: { content: "Enter text here...", textAlign: "left" },
    propertySchema: [
      {
        key: "content",
        label: "Content",
        type: FieldType.TEXTAREA,
        defaultValue: "Enter text here...",
        validation: { required: true },
      },
      {
        key: "textAlign",
        label: "Text Alignment",
        type: FieldType.SELECT,
        defaultValue: "left",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    allowedChildren: [],
    maxChildren: 0,
  },
  {
    type: "image",
    displayName: "Image",
    icon: "image",
    category: "Content",
    defaultProps: { src: "", alt: "", width: 300, height: 200, objectFit: "cover" },
    propertySchema: [
      {
        key: "src",
        label: "Source URL",
        type: FieldType.TEXT,
        defaultValue: "",
        validation: { required: true },
      },
      {
        key: "alt",
        label: "Alt Text",
        type: FieldType.TEXT,
        defaultValue: "",
        validation: { required: true, maxLength: 500 },
      },
      {
        key: "width",
        label: "Width",
        type: FieldType.NUMBER,
        defaultValue: 300,
        validation: { min: 1, max: 4000 },
      },
      {
        key: "height",
        label: "Height",
        type: FieldType.NUMBER,
        defaultValue: 200,
        validation: { min: 1, max: 4000 },
      },
      {
        key: "objectFit",
        label: "Object Fit",
        type: FieldType.SELECT,
        defaultValue: "cover",
        options: [
          { label: "Cover", value: "cover" },
          { label: "Contain", value: "contain" },
          { label: "Fill", value: "fill" },
        ],
      },
    ],
    allowedChildren: [],
    maxChildren: 0,
  },
  {
    type: "button",
    displayName: "Button",
    icon: "mouse-pointer",
    category: "Content",
    defaultProps: { label: "Click me", variant: "solid", color: "primary", size: "md", href: "" },
    propertySchema: [
      {
        key: "label",
        label: "Label",
        type: FieldType.TEXT,
        defaultValue: "Click me",
        validation: { required: true, maxLength: 100 },
      },
      {
        key: "variant",
        label: "Variant",
        type: FieldType.SELECT,
        defaultValue: "solid",
        options: [
          { label: "Solid", value: "solid" },
          { label: "Bordered", value: "bordered" },
          { label: "Light", value: "light" },
          { label: "Flat", value: "flat" },
          { label: "Ghost", value: "ghost" },
          { label: "Shadow", value: "shadow" },
        ],
      },
      {
        key: "color",
        label: "Color",
        type: FieldType.SELECT,
        defaultValue: "primary",
        options: [
          { label: "Default", value: "default" },
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Success", value: "success" },
          { label: "Warning", value: "warning" },
          { label: "Danger", value: "danger" },
        ],
      },
      {
        key: "size",
        label: "Size",
        type: FieldType.SELECT,
        defaultValue: "md",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
      {
        key: "href",
        label: "Link URL",
        type: FieldType.TEXT,
        defaultValue: "",
      },
    ],
    allowedChildren: [],
    maxChildren: 0,
  },
  {
    type: "divider",
    displayName: "Divider",
    icon: "minus",
    category: "Content",
    defaultProps: { orientation: "horizontal", margin: 16 },
    propertySchema: [
      {
        key: "orientation",
        label: "Orientation",
        type: FieldType.SELECT,
        defaultValue: "horizontal",
        options: [
          { label: "Horizontal", value: "horizontal" },
          { label: "Vertical", value: "vertical" },
        ],
      },
      {
        key: "margin",
        label: "Margin",
        type: FieldType.NUMBER,
        defaultValue: 16,
        validation: { min: 0, max: 200 },
      },
    ],
    allowedChildren: [],
    maxChildren: 0,
  },
  {
    type: "spacer",
    displayName: "Spacer",
    icon: "move-vertical",
    category: "Content",
    defaultProps: { height: 16 },
    propertySchema: [
      {
        key: "height",
        label: "Height",
        type: FieldType.NUMBER,
        defaultValue: 16,
        validation: { min: 1, max: 500 },
      },
    ],
    allowedChildren: [],
    maxChildren: 0,
  },
];
