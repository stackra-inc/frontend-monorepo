/**
 * @fileoverview ConsentBanner — AlertDialog-based consent prompt.
 *
 * Uses HeroUI `AlertDialog` with `placement="bottom"` and
 * `isDismissable={false}` to create a GDPR-compliant consent prompt
 * that requires explicit user action. Delegates consent state changes
 * to the {@link ConsentService}.
 *
 * All HeroUI components are imported from `@heroui/react`. The `@stackra/ts-ui`
 * package re-exports these for app-level consumers.
 *
 * @module @stackra/react-tracking
 * @category Components
 */

import React, { useCallback } from "react";
import { AlertDialog, Button } from "@heroui/react";

import { ConsentCategory } from "@/enums/consent-category.enum";
import { useConsent } from "@/hooks/use-consent.hook";
import type { ConsentState } from "@/interfaces/consent-state.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * Props for the {@link ConsentBanner} component.
 */
export interface ConsentBannerProps {
  /**
   * The consent service instance resolved from the DI container.
   */
  consentService: ConsentService;

  /**
   * Whether the consent dialog is open.
   * Use controlled state to show/hide the banner.
   */
  isOpen: boolean;

  /**
   * Callback fired when the dialog open state changes.
   *
   * @param isOpen - The new open state.
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Dialog heading text.
   *
   * @default 'Cookie Preferences'
   */
  title?: string;

  /**
   * Dialog body text explaining why consent is needed.
   *
   * @default 'We use cookies to improve your experience and analyze site traffic. You can choose which categories to allow.'
   */
  description?: string;

  /**
   * Label for the accept-all button.
   *
   * @default 'Accept All'
   */
  acceptLabel?: string;

  /**
   * Label for the reject-all button.
   *
   * @default 'Reject All'
   */
  rejectLabel?: string;

  /**
   * Label for the manage-preferences button. When provided, a third
   * button is rendered that calls `onManage`.
   *
   * @default undefined (no manage button)
   */
  manageLabel?: string;

  /**
   * Callback fired when the user clicks the manage-preferences button.
   * Use this to open a {@link ConsentManager} modal or navigate to a settings page.
   */
  onManage?: () => void;

  /**
   * Callback fired after the user accepts or rejects all categories.
   */
  onComplete?: () => void;
}

/**
 * ConsentBanner — bottom AlertDialog for cookie/tracking consent.
 *
 * Uses HeroUI `AlertDialog` with `placement="bottom"` for a native
 * bottom-sheet feel on mobile and centered on desktop. The dialog is
 * not dismissable by clicking the backdrop or pressing ESC — the user
 * must explicitly accept or reject.
 *
 * @param props - Component props.
 * @returns The consent AlertDialog.
 *
 * @example
 * ```tsx
 * const [showConsent, setShowConsent] = useState(true);
 *
 * <ConsentBanner
 *   consentService={consentSvc}
 *   isOpen={showConsent}
 *   onOpenChange={setShowConsent}
 *   manageLabel="Manage Preferences"
 *   onManage={() => setShowManager(true)}
 * />
 * ```
 */
export function ConsentBanner({
  consentService,
  isOpen,
  onOpenChange,
  title = "Cookie Preferences",
  description = "We use cookies to improve your experience and analyze site traffic. You can choose which categories to allow.",
  acceptLabel = "Accept All",
  rejectLabel = "Reject All",
  manageLabel,
  onManage,
  onComplete,
}: ConsentBannerProps): React.JSX.Element {
  const { updateConsent } = useConsent(consentService);

  const handleAcceptAll = useCallback(() => {
    const allGranted: ConsentState = {
      [ConsentCategory.ANALYTICS]: true,
      [ConsentCategory.MARKETING]: true,
      [ConsentCategory.FUNCTIONAL]: true,
    };
    updateConsent(allGranted);
    onOpenChange(false);
    onComplete?.();
  }, [updateConsent, onOpenChange, onComplete]);

  const handleRejectAll = useCallback(() => {
    const allDenied: ConsentState = {
      [ConsentCategory.ANALYTICS]: false,
      [ConsentCategory.MARKETING]: false,
      [ConsentCategory.FUNCTIONAL]: false,
    };
    updateConsent(allDenied);
    onOpenChange(false);
    onComplete?.();
  }, [updateConsent, onOpenChange, onComplete]);

  return (
    <AlertDialog.Backdrop
      isDismissable={false}
      isKeyboardDismissDisabled
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <AlertDialog.Container placement="bottom" size="sm">
        <AlertDialog.Dialog>
          <AlertDialog.Header>
            <AlertDialog.Icon status="accent" />
            <AlertDialog.Heading>{title}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>{description}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer className="flex-col-reverse sm:flex-row">
            <Button variant="tertiary" onPress={handleRejectAll}>
              {rejectLabel}
            </Button>
            {manageLabel && onManage && (
              <Button variant="ghost" onPress={onManage}>
                {manageLabel}
              </Button>
            )}
            <Button onPress={handleAcceptAll}>{acceptLabel}</Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
