/**
 * @fileoverview Main entry point for @stackra-inc/ts-pwa.
 *
 * PWA toolkit — install prompt, update prompt, offline indicator,
 * splash screen, pull-to-refresh, app shell, onboarding components,
 * hooks, providers, constants, and interfaces.
 *
 * @module @stackra-inc/ts-pwa
 */

// ─── Module ────────────────────────────────────────────────────────
export { PwaModule } from './pwa.module';

// ─── Providers ─────────────────────────────────────────────────────
export { PwaProvider } from './providers';
export type { PwaProviderProps } from './providers';
export { OnboardingProvider } from './providers';
export type { OnboardingProviderProps } from './providers';

// ─── Hooks ─────────────────────────────────────────────────────────
export {
  usePwa,
  usePwaConfig,
  useInstallPrompt,
  useUpdatePrompt,
  useNetworkStatus,
  useStandaloneMode,
  useSplashScreen,
  usePullToRefresh,
  useOnboarding,
} from './hooks';
export type { UsePullToRefreshReturn } from './hooks';

// ─── Components ────────────────────────────────────────────────────
export {
  AppShell,
  InstallPrompt,
  InstallPromptBanner,
  OfflineIndicator,
  SplashScreen,
  PullToRefresh,
  Onboarding,
  OnboardingOverlay,
  OnboardingProgress,
  OnboardingHeader,
  OnboardingContent,
  OnboardingDots,
  OnboardingFooter,
} from './components';
export type {
  AppShellProps,
  InstallPromptBannerProps,
  OfflineIndicatorProps,
  SplashScreenProps,
  PullToRefreshProps,
  OnboardingOverlayProps,
  OnboardingProgressProps,
  OnboardingHeaderProps,
  OnboardingContentProps,
  OnboardingDotsProps,
  OnboardingFooterProps,
} from './components';

// ─── Interfaces ────────────────────────────────────────────────────
export type {
  PwaConfig,
  PwaContextValue,
  PwaModuleOptions,
  OfflineIndicatorConfig,
  AppShellConfig,
  InstallPromptConfig,
  InstallPromptContextValue,
  UpdatePromptConfig,
  UpdatePromptContextValue,
  NetworkStatus,
  SplashScreenConfig,
  PullToRefreshConfig,
  OnboardingConfig,
  OnboardingContextValue,
  OnboardingStepConfig,
  ManifestIcon,
  ManifestOptions,
  RuntimeCachingEntry,
  VitePwaPluginOptions,
} from './interfaces';

// ─── Constants ─────────────────────────────────────────────────────
export {
  APP_SHELL_DEFAULTS,
  INSTALL_PROMPT_DEFAULTS,
  OFFLINE_DEFAULTS,
  ONBOARDING_DEFAULTS,
  ONBOARDING_SLOTS,
  PULL_TO_REFRESH_DEFAULTS,
  SPLASH_DEFAULTS,
  UPDATE_PROMPT_DEFAULTS,
  PWA_CONFIG,
} from './constants';

// ─── Utils ─────────────────────────────────────────────────────────
export { defineConfig } from './utils';
export { isOnboardingCompleted, markOnboardingCompleted, resetOnboarding } from './utils';

// ─── Contexts (advanced usage) ─────────────────────────────────────
export { PwaContext, OnboardingContext } from './contexts';
