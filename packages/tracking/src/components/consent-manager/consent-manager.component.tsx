/**
 * @fileoverview ConsentManager — per-category consent toggle UI.
 *
 * Renders a list of consent categories with HeroUI `Switch` compound
 * components inside a `Card`, allowing the user to grant or revoke
 * consent for each category individually.
 *
 * All HeroUI components are imported from `@heroui/react`. The `@stackra/ts-ui`
 * package re-exports these for app-level consumers.
 *
 * @module @stackra/react-tracking
 * @category Components
 */

import React, { useCallback } from "react";
import { Button, Card, Switch, Label, Description, Separator } from "@heroui/react";

import { ConsentCategory } from "@/enums/consent-category.enum";
import { useConsent } from "@/hooks/use-consent.hook";
import type { ConsentState } from "@/interfaces/consent-state.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * Configuration for a single consent category displayed in the manager.
 */
export interface ConsentCategoryConfig {
  /**
   * The consent category enum value.
   */
  category: ConsentCategory;

  /**
   * Human-readable label for the category.
   */
  label: string;

  /**
   * Description explaining what this category covers.
   */
  description: string;

  /**
   * Whether this category can be toggled by the user.
   * Set to `false` for categories that are always required (e.g., functional).
   *
   * @default true
   */
  toggleable?: boolean;
}

/**
 * Props for the {@link ConsentManager} component.
 */
export interface ConsentManagerProps {
  /**
   * The consent service instance resolved from the DI container.
   */
  consentService: ConsentService;

  /**
   * Configuration for each consent category to display.
   * Controls labels, descriptions, and whether each category is toggleable.
   *
   * @default Default categories with standard labels.
   */
  categories?: ConsentCategoryConfig[];

  /**
   * Label for the save button.
   *
   * @default 'Save Preferences'
   */
  saveLabel?: string;

  /**
   * Label for the accept-all button.
   *
   * @default 'Accept All'
   */
  acceptAllLabel?: string;

  /**
   * Callback fired after the user saves their preferences.
   */
  onSave?: () => void;

  /**
   * Additional CSS class name on the outer Card.
   */
  className?: string;
}

/** Default category configurations. */
const DEFAULT_CATEGORIES: ConsentCategoryConfig[] = [
  {
    category: ConsentCategory.FUNCTIONAL,
    label: "Functional",
    description: "Essential cookies required for the site to function properly.",
    toggleable: false,
  },
  {
    category: ConsentCategory.ANALYTICS,
    label: "Analytics",
    description: "Help us understand how visitors interact with our site.",
    toggleable: true,
  },
  {
    category: ConsentCategory.MARKETING,
    label: "Marketing",
    description: "Used to deliver personalized ads and measure campaign performance.",
    toggleable: true,
  },
];

/**
 * ConsentManager — per-category consent toggle UI using HeroUI components.
 *
 * Renders HeroUI `Switch` compound components inside a `Card` for each
 * consent category. Non-toggleable categories (e.g., functional) are shown
 * as always-on and disabled. Changes are applied immediately via the
 * {@link ConsentService}.
 *
 * @param props - Component props.
 * @returns The consent manager Card.
 *
 * @example
 * ```tsx
 * <ConsentManager
 *   consentService={consentSvc}
 *   onSave={() => setShowManager(false)}
 * />
 * ```
 */
export function ConsentManager({
  consentService,
  categories = DEFAULT_CATEGORIES,
  saveLabel = "Save Preferences",
  acceptAllLabel = "Accept All",
  onSave,
  className,
}: ConsentManagerProps): React.JSX.Element {
  const { consentState, grantConsent, revokeConsent, updateConsent } = useConsent(consentService);

  const handleToggle = useCallback(
    (category: ConsentCategory, granted: boolean) => {
      if (granted) {
        grantConsent(category);
      } else {
        revokeConsent(category);
      }
    },
    [grantConsent, revokeConsent],
  );

  const handleAcceptAll = useCallback(() => {
    const allGranted: ConsentState = {
      [ConsentCategory.ANALYTICS]: true,
      [ConsentCategory.MARKETING]: true,
      [ConsentCategory.FUNCTIONAL]: true,
    };
    updateConsent(allGranted);
    onSave?.();
  }, [updateConsent, onSave]);

  const handleSave = useCallback(() => {
    onSave?.();
  }, [onSave]);

  return (
    <Card className={className}>
      <Card.Header>
        <Card.Title>Consent Preferences</Card.Title>
        <Card.Description>
          Choose which categories of cookies and tracking you allow.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-0">
        {categories.map((cat, index) => {
          const isGranted = cat.toggleable === false || consentState[cat.category];

          return (
            <React.Fragment key={cat.category}>
              {index > 0 && <Separator className="my-1" />}
              <Switch
                isSelected={isGranted}
                isDisabled={cat.toggleable === false}
                onChange={(selected: boolean) => handleToggle(cat.category, selected)}
              >
                <Switch.Content>
                  <Label className="text-sm">{cat.label}</Label>
                  <Description>{cat.description}</Description>
                </Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </React.Fragment>
          );
        })}
      </Card.Content>
      <Card.Footer className="flex justify-end gap-2">
        <Button variant="tertiary" onPress={handleSave}>
          {saveLabel}
        </Button>
        <Button onPress={handleAcceptAll}>{acceptAllLabel}</Button>
      </Card.Footer>
    </Card>
  );
}
