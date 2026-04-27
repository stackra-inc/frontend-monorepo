/**
 * @fileoverview Built-in page templates for the page builder.
 *
 * These templates are registered during `PageBuilderModule.forRoot()` and
 * displayed in the TemplateDialog when a user creates a new page.
 *
 * Templates:
 * - **Blank** — empty page with a single root Container
 * - **Dashboard** — two-column layout with header and content sections
 * - **Landing_Page** — hero section, features grid, and CTA
 * - **Form_Page** — centered container with heading and form placeholder
 *
 * @module @stackra/react-page-builder
 * @category Constants
 */

import type { PageTemplate } from "../interfaces/page-template.interface";

/**
 * Built-in page templates registered during `forRoot()`.
 *
 * Each template provides a complete PageJson that is loaded into the
 * Canvas when the user selects it from the TemplateDialog.
 */
export const BUILT_IN_TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "An empty page with a single root container.",
    pageJson: {
      version: "1.0.0",
      metadata: {
        title: "Untitled Page",
        description: "",
        createdAt: "",
        updatedAt: "",
      },
      tree: {
        id: "root",
        type: "container",
        props: { maxWidth: 1200 },
        styles: {},
        children: [],
      },
    },
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "A dashboard layout with a header section and two-column content area.",
    pageJson: {
      version: "1.0.0",
      metadata: {
        title: "Dashboard",
        description: "Dashboard page template",
        createdAt: "",
        updatedAt: "",
      },
      tree: {
        id: "dashboard-root",
        type: "container",
        props: { maxWidth: 1200 },
        styles: {},
        children: [
          {
            id: "dashboard-header",
            type: "section",
            props: { title: "Dashboard" },
            styles: {},
            children: [
              {
                id: "dashboard-heading",
                type: "heading",
                props: { text: "Dashboard", level: "h1", textAlign: "left" },
                styles: {},
                children: [],
              },
            ],
          },
          {
            id: "dashboard-content",
            type: "row",
            props: { gap: 16 },
            styles: {},
            children: [
              {
                id: "dashboard-col-left",
                type: "column",
                props: {},
                styles: {},
                children: [],
              },
              {
                id: "dashboard-col-right",
                type: "column",
                props: {},
                styles: {},
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description: "A landing page with hero section, features grid, and call-to-action.",
    pageJson: {
      version: "1.0.0",
      metadata: {
        title: "Landing Page",
        description: "Landing page template",
        createdAt: "",
        updatedAt: "",
      },
      tree: {
        id: "landing-root",
        type: "container",
        props: { maxWidth: 1200 },
        styles: {},
        children: [
          {
            id: "landing-hero",
            type: "section",
            props: { title: "" },
            styles: {},
            children: [
              {
                id: "landing-hero-heading",
                type: "heading",
                props: { text: "Welcome to Our Platform", level: "h1", textAlign: "center" },
                styles: {},
                children: [],
              },
              {
                id: "landing-hero-text",
                type: "text",
                props: { content: "Build something amazing with our tools.", textAlign: "center" },
                styles: {},
                children: [],
              },
              {
                id: "landing-hero-cta",
                type: "button",
                props: {
                  label: "Get Started",
                  variant: "solid",
                  color: "primary",
                  size: "lg",
                  href: "",
                },
                styles: {},
                children: [],
              },
            ],
          },
          {
            id: "landing-features",
            type: "section",
            props: { title: "Features" },
            styles: {},
            children: [
              {
                id: "landing-features-grid",
                type: "grid",
                props: { columns: 3, gap: 24 },
                styles: {},
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "form-page",
    name: "Form Page",
    description: "A centered form page with heading and content area for form components.",
    pageJson: {
      version: "1.0.0",
      metadata: {
        title: "Form Page",
        description: "Form page template",
        createdAt: "",
        updatedAt: "",
      },
      tree: {
        id: "form-root",
        type: "container",
        props: { maxWidth: 800 },
        styles: {},
        children: [
          {
            id: "form-header",
            type: "section",
            props: { title: "" },
            styles: {},
            children: [
              {
                id: "form-heading",
                type: "heading",
                props: { text: "Submit Your Information", level: "h2", textAlign: "center" },
                styles: {},
                children: [],
              },
              {
                id: "form-description",
                type: "text",
                props: { content: "Please fill out the form below.", textAlign: "center" },
                styles: {},
                children: [],
              },
            ],
          },
          {
            id: "form-divider",
            type: "divider",
            props: { orientation: "horizontal", margin: 16 },
            styles: {},
            children: [],
          },
          {
            id: "form-content",
            type: "section",
            props: { title: "" },
            styles: {},
            children: [],
          },
        ],
      },
    },
  },
];
