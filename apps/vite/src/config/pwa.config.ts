/**
 * PWA Configuration
 *
 * |--------------------------------------------------------------------------
 * | @abdokouta/ts-pwa — Progressive Web App settings
 * |--------------------------------------------------------------------------
 * |
 * | Unified config for both build-time (vite-plugin-pwa) and runtime
 * | (React components) PWA features.
 * |
 * | Sections:
 * |   vite          — manifest, service worker, workbox caching strategies
 * |   install       — "Add to Home Screen" prompt behavior
 * |   update        — service worker update notification
 * |   splash        — app splash/loading screen
 * |   appShell      — PWA shell layout (status bar, safe area)
 * |   offline       — offline/online status indicator
 * |   pullToRefresh — pull-to-refresh gesture
 * |   onboarding    — first-run onboarding flow
 * |
 * @module config/pwa
 */

import { defineConfig } from "@abdokouta/ts-pwa";

const pwaConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Vite Plugin — Build-Time Options
  |--------------------------------------------------------------------------
  |
  | Passed to vite-plugin-pwa at build time.
  | Controls manifest.json generation, service worker registration,
  | and workbox caching strategies.
  |
  */
  vite: {
    /**
     * Service worker registration type.
     *
     * "autoUpdate" — updates silently in the background (recommended for POS)
     * "prompt"     — shows a prompt to the user when an update is available
     */
    registerType: "autoUpdate",

    /**
     * Strategy for generating the service worker.
     *
     * "generateSW"     — Workbox generates the SW automatically (recommended)
     * "injectManifest" — inject precache manifest into a custom SW file
     */
    strategies: "generateSW",

    /**
     * Static assets to include in the precache manifest.
     */
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "robots.txt"],

    /**
     * Web App Manifest — controls how the app appears when installed.
     */
    manifest: {
      name: "Pixielity POS",
      short_name: "POS",
      description: "Modern point-of-sale system built with React and Electron",
      theme_color: "#000000",
      background_color: "#000000",
      display: "standalone",
      orientation: "any",
      start_url: "/",
      scope: "/",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },

    /**
     * Workbox configuration — controls service worker caching behavior.
     */
    workbox: {
      /** Files to precache (downloaded on install). */
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

      /** Clean up old caches when a new SW activates. */
      cleanupOutdatedCaches: true,

      /** SPA fallback — serve index.html for all navigation requests. */
      navigateFallback: "index.html",

      /** Runtime caching strategies for dynamic content. */
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "gstatic-fonts-cache",
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "images-cache",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/api\..*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            networkTimeoutSeconds: 10,
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },

    /**
     * Development options — enable PWA features in dev mode for testing.
     */
    devOptions: {
      enabled: false,
      type: "module",
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Install Prompt — "Add to Home Screen"
  |--------------------------------------------------------------------------
  |
  | Controls when and how the install prompt appears.
  | Only shown on supported browsers (Chrome, Edge, Samsung Internet).
  |
  */
  install: {
    /** Delay in ms before showing the prompt after page load. */
    delay: 30000,

    /** localStorage key for tracking dismissals. */
    dismissKey: "pwa-install-dismissed",

    /** Max dismissals before the prompt stops appearing. */
    maxDismissals: 3,

    /** Banner title. */
    title: "Install Pixielity",

    /** Banner description. */
    description: "Add to your home screen for offline access and a native experience.",

    /** Install button label. */
    installLabel: "Install",

    /** Dismiss button label. */
    dismissLabel: "Not now",
  },

  /*
  |--------------------------------------------------------------------------
  | Update Prompt — Service Worker Updates
  |--------------------------------------------------------------------------
  |
  | Controls the notification shown when a new version is available.
  | Only relevant when registerType is "prompt".
  |
  */
  update: {
    /** Polling interval in ms to check for SW updates. 0 = browser default. */
    pollingInterval: 60000,

    /** Banner title. */
    title: "Update Available",

    /** Banner description. */
    description: "A new version is available. Refresh to update.",

    /** Update button label. */
    updateLabel: "Refresh",

    /** Dismiss button label. */
    dismissLabel: "Later",
  },

  /*
  |--------------------------------------------------------------------------
  | Splash Screen
  |--------------------------------------------------------------------------
  |
  | Shown during app initialization. Hides automatically when the app
  | is ready or after minDuration elapses.
  |
  */
  splash: {
    /** Minimum display duration in ms. */
    minDuration: 1500,

    /** App name displayed below the logo. */
    appName: "Pixielity",

    /** Tagline or loading message. */
    tagline: "Loading...",

    /** Whether to show a spinner. */
    showSpinner: true,

    /** Whether to show a progress bar. */
    showProgress: false,

    /** Background CSS class. */
    background: "bg-black",
  },

  /*
  |--------------------------------------------------------------------------
  | App Shell
  |--------------------------------------------------------------------------
  |
  | Controls the PWA shell layout — status bar, safe area padding,
  | and overscroll prevention for a native-like feel.
  |
  */
  appShell: {
    /** Status bar style for mobile browsers. */
    statusBarStyle: "black-translucent",

    /** Theme color for the browser chrome. */
    themeColor: "#000000",

    /** Whether to apply safe-area padding (notch, home indicator). */
    safeAreaPadding: true,

    /** Whether to prevent overscroll/bounce on iOS. */
    preventOverscroll: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Offline Indicator
  |--------------------------------------------------------------------------
  |
  | Shows a banner when the device goes offline and a brief
  | "back online" message when connectivity is restored.
  |
  */
  offline: {
    /** Whether to show the offline indicator. */
    enabled: true,

    /** Position of the indicator. */
    position: "bottom",

    /** Message when offline. */
    message: "You are offline",

    /** Message when back online. */
    onlineMessage: "Back online",

    /** Duration in ms to show the "back online" message. */
    onlineDuration: 3000,
  },

  /*
  |--------------------------------------------------------------------------
  | Pull to Refresh
  |--------------------------------------------------------------------------
  |
  | Native-like pull-to-refresh gesture for mobile browsers.
  | The onRefresh callback is set at runtime, not in config.
  |
  */
  pullToRefresh: {
    /** Distance in px the user must pull before triggering refresh. */
    threshold: 80,

    /** Maximum pull distance in px (elastic limit). */
    maxPull: 150,

    /** Whether pull-to-refresh is enabled. */
    enabled: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Onboarding
  |--------------------------------------------------------------------------
  |
  | First-run onboarding flow. Shows once per user (persisted to
  | localStorage). Steps are defined here or passed at runtime.
  |
  */
  onboarding: {
    /** localStorage key for persisting completion state. */
    persistKey: "pos-onboarding-v1",

    /** Accent color for progress bar and CTA buttons. */
    accentColor: "#6366f1",

    /** Final step CTA button label. */
    completeLabel: "Get Started",

    /** Skip button label. */
    skipLabel: "Skip",

    /** Next button label. */
    nextLabel: "Next",

    /** Back button label. */
    backLabel: "Back",

    /** Whether the onboarding can be skipped. */
    dismissible: true,

    /** Whether to show in full-screen mode. */
    fullScreen: true,

    /** Onboarding steps — define here or pass at runtime. */
    steps: [],
  },
});

export default pwaConfig;
