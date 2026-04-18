/**
 * Example 2: Injecting I18nService in Other Services
 *
 * Demonstrates how to use `@Inject(I18N_SERVICE)` in your own
 * `@Injectable()` services to access translations, locale state,
 * and language switching from the DI container.
 *
 * ## What this example covers:
 * - Injecting `II18nService` via the `I18N_SERVICE` token
 * - Using `t()`, `getLocale()`, `isRTL()` in business logic
 * - Listening for language change events
 * - Adding resources at runtime
 */

import { Injectable, Inject } from '@stackra/ts-container';
import { I18N_SERVICE } from '@stackra/react-i18n';
import type { II18nService } from '@stackra/react-i18n';

// ============================================================================
// Example: Notification Service
// ============================================================================

/**
 * Service that sends translated toast notifications.
 *
 * Injects the i18n service to translate notification messages
 * based on the user's current locale.
 */
@Injectable()
export class NotificationService {
  constructor(@Inject(I18N_SERVICE) private readonly i18n: II18nService) {}

  /**
   * Show a success toast with a translated message.
   *
   * @param key - Translation key for the success message
   * @param params - Optional interpolation values
   *
   * @example
   * ```typescript
   * notificationService.success('order.created', { orderId: '12345' });
   * // Shows: "Order #12345 created successfully" (or Arabic equivalent)
   * ```
   */
  success(key: string, params?: Record<string, any>): void {
    const message = this.i18n.t(key, params);
    // showToast is your UI toast library (e.g. react-hot-toast, sonner)
    showToast({ type: 'success', message });
  }

  /**
   * Show an error toast with a translated message.
   *
   * @param key - Translation key for the error message
   * @param params - Optional interpolation values
   */
  error(key: string, params?: Record<string, any>): void {
    const message = this.i18n.t(key, params);
    showToast({ type: 'error', message });
  }
}

// ============================================================================
// Example: Document Direction Service
// ============================================================================

/**
 * Service that manages document direction (LTR/RTL) based on locale.
 *
 * Listens for language changes and updates the document's `dir` and
 * `lang` attributes automatically.
 */
@Injectable()
export class DocumentDirectionService {
  constructor(@Inject(I18N_SERVICE) private readonly i18n: II18nService) {
    // Set initial direction
    this.updateDirection(this.i18n.getLocale());

    // Listen for language changes and update direction
    this.i18n.onLanguageChanged((lang) => {
      this.updateDirection(lang);
    });
  }

  /**
   * Update the document's direction and language attributes.
   *
   * @param locale - The new locale code
   */
  private updateDirection(locale: string): void {
    const isRTL = this.i18n.isRTL();
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }
}

// ============================================================================
// Example: Dynamic Resource Loader
// ============================================================================

/**
 * Service that lazy-loads translation namespaces from an API.
 *
 * Useful for large applications where loading all translations
 * upfront would be too slow.
 */
@Injectable()
export class TranslationLoaderService {
  constructor(@Inject(I18N_SERVICE) private readonly i18n: II18nService) {}

  /**
   * Load a translation namespace from the API and inject it into i18next.
   *
   * @param namespace - The namespace to load (e.g. 'dashboard', 'settings')
   *
   * @example
   * ```typescript
   * // Load dashboard translations when the user navigates to /dashboard
   * await translationLoader.loadNamespace('dashboard');
   * // Now t('dashboard:widget.title') works
   * ```
   */
  async loadNamespace(namespace: string): Promise<void> {
    const locale = this.i18n.getLocale();

    // Fetch translations from your API
    const response = await fetch(`/api/translations/${locale}/${namespace}`);
    const resources = await response.json();

    // Inject into i18next at runtime
    this.i18n.addResources(locale, namespace, resources);
  }
}

// ============================================================================
// Placeholder for toast function (replace with your UI library)
// ============================================================================

declare function showToast(options: { type: string; message: string }): void;
