/**
 * @fileoverview Barrel export for all PWA components.
 * @module pwa/components
 */

// ─── App Shell ─────────────────────────────────────────────────────
export { AppShell } from './app-shell';
export type { AppShellProps } from './app-shell';

// ─── Install Prompt ────────────────────────────────────────────────
export { InstallPrompt } from './install-prompt';
export { InstallPromptBanner } from './install-prompt-banner';
export type { InstallPromptBannerProps } from './install-prompt-banner';

// ─── Offline Indicator ─────────────────────────────────────────────
export { OfflineIndicator } from './offline-indicator';
export type { OfflineIndicatorProps } from './offline-indicator';

// ─── Splash Screen ─────────────────────────────────────────────────
export { SplashScreen } from './splash-screen';
export type { SplashScreenProps } from './splash-screen';

// ─── Pull to Refresh ───────────────────────────────────────────────
export { PullToRefresh } from './pull-to-refresh';
export type { PullToRefreshProps } from './pull-to-refresh';

// ─── Onboarding ────────────────────────────────────────────────────
export { Onboarding } from './onboarding/onboarding';
export { OnboardingOverlay } from './onboarding/onboarding-overlay';
export type { OnboardingOverlayProps } from './onboarding/onboarding-overlay';
export { OnboardingProgress } from './onboarding/onboarding-progress';
export type { OnboardingProgressProps } from './onboarding/onboarding-progress';
export { OnboardingHeader } from './onboarding/onboarding-header';
export type { OnboardingHeaderProps } from './onboarding/onboarding-header';
export { OnboardingContent } from './onboarding/onboarding-content';
export type { OnboardingContentProps } from './onboarding/onboarding-content';
export { OnboardingDots } from './onboarding/onboarding-dots';
export type { OnboardingDotsProps } from './onboarding/onboarding-dots';
export { OnboardingFooter } from './onboarding/onboarding-footer';
export type { OnboardingFooterProps } from './onboarding/onboarding-footer';
