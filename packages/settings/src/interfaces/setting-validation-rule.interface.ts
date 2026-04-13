/**
 * @fileoverview Validation rule interface for setting fields.
 *
 * Defines the shape of validation rules that can be attached
 * to individual setting fields (required, min, max, pattern, etc.).
 *
 * @module interfaces/setting-validation-rule
 */

/**
 * Validation rule for a setting field.
 */
export interface SettingValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  /**
   * Rule parameter (min value, regex string, etc.)
   */
  value?: unknown;
  /**
   * i18n key for error message
   */
  message?: string;
  /**
   * Custom validator (for type: 'custom')
   */
  validator?: (value: unknown) => true | string;
}
