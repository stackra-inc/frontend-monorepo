/**
 * @fileoverview InstallPromptBanner — bottom banner prompting PWA installation.
 *
 * Uses HeroUI Alert (compound pattern) and Button for consistent styling.
 * Renders a fixed-bottom banner with icon, title, description,
 * install button, and dismiss button. Only visible when `install.isVisible`.
 *
 * @module pwa/components/install-prompt-banner
 */

import React from 'react';
import { Button, Alert } from '@heroui/react';
import { Download } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { INSTALL_PROMPT_DEFAULTS } from '@/constants';
import type { InstallPromptConfig } from '@/interfaces';

/** Props for the InstallPromptBanner. */
export interface InstallPromptBannerProps {
  /** Override config values for labels/text. */
  config?: Pick<
    InstallPromptConfig,
    'title' | 'description' | 'icon' | 'installLabel' | 'dismissLabel'
  >;
  /** Additional CSS class names on the outer wrapper. */
  className?: string;
}

/**
 * Fixed-bottom banner prompting the user to install the PWA.
 *
 * @example
 * ```tsx
 * <PwaProvider>
 *   <App />
 *   <InstallPromptBanner />
 * </PwaProvider>
 * ```
 */
export function InstallPromptBanner({
  config,
  className,
}: InstallPromptBannerProps): React.JSX.Element | null {
  const { isVisible, prompt, dismiss } = useInstallPrompt();

  if (!isVisible) return null;

  const title = config?.title ?? INSTALL_PROMPT_DEFAULTS.TITLE;
  const description = config?.description ?? INSTALL_PROMPT_DEFAULTS.DESCRIPTION;
  const icon = config?.icon ?? <Download size={20} />;
  const installLabel = config?.installLabel ?? INSTALL_PROMPT_DEFAULTS.INSTALL_LABEL;
  const dismissLabel = config?.dismissLabel ?? INSTALL_PROMPT_DEFAULTS.DISMISS_LABEL;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] ${className ?? ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-lg mx-auto">
        <Alert status="accent">
          <Alert.Indicator>{icon}</Alert.Indicator>
          <Alert.Content>
            <Alert.Title>{title}</Alert.Title>
            <Alert.Description>{description}</Alert.Description>
          </Alert.Content>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onPress={dismiss}>
              {dismissLabel}
            </Button>
            <Button size="sm" variant="primary" onPress={prompt}>
              {installLabel}
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
}
