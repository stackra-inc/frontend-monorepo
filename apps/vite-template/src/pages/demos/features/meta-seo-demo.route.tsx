/**
 * @fileoverview Meta & SEO Demo Route
 *
 * This route demonstrates the meta tag and SEO management system with an
 * interactive demo that allows testing different meta configurations. The
 * route itself includes comprehensive meta configuration as an example.
 *
 * ## Features Demonstrated
 *
 * - Meta configuration via @Route decorator
 * - Document title, description, and keywords
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URLs
 * - Template interpolation with route parameters
 * - Dynamic meta updates using useRouteMeta hook
 *
 * @module routes/demos
 * @category Routes
 */

import { Route } from "@stackra/react-router";
import { MetaSeoComponent } from "@/components/pages/demos/features/meta-seo-demo.component";

/**
 * Route class for the meta & SEO demo.
 *
 * Configured with comprehensive meta tags to demonstrate all available
 * features including standard meta tags, Open Graph, Twitter Cards,
 * and canonical URLs.
 *
 * @class MetaSeoRoute
 *
 * @example
 * ```typescript
 * // This route is automatically registered via decorator discovery
 * // Access it at: /demos/features/meta-seo
 * ```
 */
@Route({
  /**
   * Route path.
   * Accessible at /demos/features/meta-seo
   */
  path: "/demos/features/meta-seo",

  /**
   * Display label for navigation menus.
   */
  label: "Meta & SEO",

  /**
   * Navigation variant for menu grouping.
   * Groups this route with other main navigation items.
   */
  variant: "main",

  /**
   * Parent route for hierarchical navigation.
   * Makes this a child of the Demos route.
   */
  parent: "/demos",

  /**
   * Sort order in navigation menus.
   * Lower numbers appear first.
   */
  order: 110,

  /**
   * Comprehensive meta configuration for SEO and social sharing.
   *
   * This demonstrates all available meta tag options:
   * - Standard meta tags (title, description, keywords)
   * - Open Graph tags for Facebook, LinkedIn, etc.
   * - Twitter Card tags for Twitter sharing
   * - Canonical URL for SEO
   *
   * All string properties support template interpolation using {param}
   * syntax, which will be replaced with actual route parameters.
   */
  meta: {
    /**
     * Document title.
     * Appears in browser tab and search results.
     */
    title: "Meta & SEO Demo - Stackra Router",

    /**
     * Meta description.
     * Shown in search results below the title.
     * Recommended length: 150-160 characters.
     */
    description:
      "Learn how to manage document metadata, SEO tags, Open Graph tags, and Twitter Cards in your React application using Stackra Router.",

    /**
     * Meta keywords.
     * Used by some search engines for content categorization.
     */
    keywords: [
      "react",
      "seo",
      "meta tags",
      "open graph",
      "twitter card",
      "social sharing",
      "stackra",
      "router",
    ],

    /**
     * Canonical URL.
     * Tells search engines the preferred URL for this content.
     * Helps avoid duplicate content issues.
     */
    canonical: "https://stackra.dev/demos/features/meta-seo",

    // ========================================================================
    // Open Graph Tags
    // ========================================================================

    /**
     * Open Graph title.
     * Title shown when shared on Facebook, LinkedIn, etc.
     */
    ogTitle: "Meta & SEO Management Demo | Stackra Router",

    /**
     * Open Graph description.
     * Description shown when shared on social media.
     */
    ogDescription:
      "Interactive demo showing how to manage document metadata and SEO tags in React applications.",

    /**
     * Open Graph image.
     * Image shown when shared on social media.
     * Recommended size: 1200x630 pixels.
     */
    ogImage: "https://stackra.dev/images/demos/meta-seo-og.jpg",

    /**
     * Open Graph URL.
     * Canonical URL for social sharing.
     */
    ogUrl: "https://stackra.dev/demos/features/meta-seo",

    /**
     * Open Graph type.
     * Type of content being shared.
     * Common values: 'website', 'article', 'product'
     */
    ogType: "website",

    // ========================================================================
    // Twitter Card Tags
    // ========================================================================

    /**
     * Twitter Card type.
     * Controls how content appears on Twitter.
     * - 'summary': Small card with thumbnail
     * - 'summary_large_image': Large card with prominent image
     */
    twitterCard: "summary_large_image",

    /**
     * Twitter Card title.
     * Title shown when shared on Twitter.
     */
    twitterTitle: "Meta & SEO Demo - Stackra Router",

    /**
     * Twitter Card description.
     * Description shown when shared on Twitter.
     */
    twitterDescription:
      "Learn how to manage document metadata and SEO tags in your React application.",

    /**
     * Twitter Card image.
     * Image shown when shared on Twitter.
     * Recommended size: 1200x628 pixels for large image card.
     */
    twitterImage: "https://stackra.dev/images/demos/meta-seo-twitter.jpg",

    // ========================================================================
    // Custom Meta Tags
    // ========================================================================

    /**
     * Additional custom meta tags.
     * Use for any meta tags not covered by standard properties.
     */
    customTags: [
      {
        name: "author",
        content: "Stackra Team",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "theme-color",
        content: "#3b82f6",
      },
    ],
  },

  /**
   * Transition configuration for this route.
   * Uses a fade transition for smooth navigation.
   */
  transition: {
    type: "fade",
    duration: 300,
    easing: "ease-in-out",
  },
})
export class MetaSeoRoute {
  /**
   * Renders the meta & SEO demo component.
   *
   * @returns The demo component
   */
  render() {
    return <MetaSeoComponent />;
  }
}
