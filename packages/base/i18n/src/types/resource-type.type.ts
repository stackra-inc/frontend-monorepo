/**
 * Resource Type Definitions
 *
 * Recursive types representing the shape of translation values, from
 * simple strings to deeply nested objects.
 *
 * @module types/resource-type
 */

/**
 * Translation resource type
 * Represents a single translation value that can be a string or an object with nested translations
 * Used to define the structure of translation data at runtime
 *
 * @example
 * ```typescript
 * const resource: ResourceType = 'Hello World';
 * const resource: ResourceType = { greeting: 'Hello', farewell: 'Goodbye' };
 * const resource: ResourceType = {
 *   button: { save: 'Save', cancel: 'Cancel' },
 *   message: 'Welcome!'
 * };
 * ```
 */
export type ResourceType = string | number | boolean | ResourceObject | ResourceType[];

/**
 * Represents a nested object of translation resources
 * Allows for deeply nested translation structures
 *
 * @example
 * ```typescript
 * const resources: ResourceObject = {
 *   'greeting': 'Hello',
 *   'auth': {
 *     'login': 'Login',
 *     'logout': 'Logout',
 *     'errors': {
 *       'invalid_email': 'Invalid email',
 *       'weak_password': 'Password too weak'
 *     }
 *   }
 * };
 * ```
 */
export type ResourceObject = {
  /**
   * Nested resource values using string keys
   * Can contain strings, numbers, booleans, arrays, or nested objects
   */
  [key: string]: ResourceType;
};
