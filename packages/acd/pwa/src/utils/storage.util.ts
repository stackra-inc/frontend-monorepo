/**
 * @fileoverview Onboarding storage utilities.
 *
 * Handles persistence of onboarding completion state
 * via localStorage. PWA-ready — works offline.
 *
 * @module onboarding/utils/storage
 */

/**
 * Check if onboarding has been completed for the given key.
 *
 * @param key - LocalStorage key.
 * @returns Whether the onboarding was previously completed.
 */
export function isOnboardingCompleted(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'completed';
  } catch {
    return false;
  }
}

/**
 * Mark onboarding as completed.
 *
 * @param key - LocalStorage key.
 */
export function markOnboardingCompleted(key: string): void {
  try {
    localStorage.setItem(key, 'completed');
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Reset onboarding completion state (show again).
 *
 * @param key - LocalStorage key.
 */
export function resetOnboarding(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
