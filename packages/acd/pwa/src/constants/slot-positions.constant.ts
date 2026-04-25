/**
 * @fileoverview Onboarding slot position constants.
 *
 * Named slot positions for injecting custom content into onboarding components.
 *
 * @module onboarding/constants/slot-positions
 *
 * @example
 * ```ts
 * slotRegistry.registerEntry(ONBOARDING_SLOTS.HEADER.AFTER, {
 *   render: () => <LanguageSwitcher />,
 *   priority: 10,
 * });
 * ```
 */

export const ONBOARDING_SLOTS = {
  /** Slots around the OnboardingOverlay. */
  OVERLAY: {
    BEFORE: 'onboarding.overlay.before',
    AFTER: 'onboarding.overlay.after',
  },

  /** Slots around the OnboardingProgress bar. */
  PROGRESS: {
    BEFORE: 'onboarding.progress.before',
    AFTER: 'onboarding.progress.after',
  },

  /** Slots around the OnboardingHeader. */
  HEADER: {
    BEFORE: 'onboarding.header.before',
    AFTER: 'onboarding.header.after',
    /** After the logo, before the skip button. */
    AFTER_LOGO: 'onboarding.header.after-logo',
  },

  /** Slots around the OnboardingContent. */
  CONTENT: {
    BEFORE: 'onboarding.content.before',
    AFTER: 'onboarding.content.after',
    /** Before the illustration. */
    BEFORE_ILLUSTRATION: 'onboarding.content.before-illustration',
    /** After the illustration, before the title. */
    AFTER_ILLUSTRATION: 'onboarding.content.after-illustration',
    /** After the title, before the description. */
    AFTER_TITLE: 'onboarding.content.after-title',
  },

  /** Slots around the OnboardingFooter. */
  FOOTER: {
    BEFORE: 'onboarding.footer.before',
    AFTER: 'onboarding.footer.after',
    /** Before the dots indicator. */
    BEFORE_DOTS: 'onboarding.footer.before-dots',
    /** After the dots, before the navigation buttons. */
    AFTER_DOTS: 'onboarding.footer.after-dots',
    /** After the navigation buttons. */
    AFTER_ACTIONS: 'onboarding.footer.after-actions',
  },
} as const;
