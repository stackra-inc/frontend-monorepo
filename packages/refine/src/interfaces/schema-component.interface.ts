/**
 * @fileoverview A component node in the SDUI schema tree.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * A component node in the SDUI schema tree.
 */
export interface SchemaComponent {
  /** Component type identifier (resolved via ComponentRegistry). */
  type: string;

  /** Optional field name this component binds to. */
  name?: string;

  /** Optional label. */
  label?: string;

  /** Optional component props. */
  props?: Record<string, any>;

  /** Optional nested children. */
  children?: SchemaComponent[];

  /** Optional validation rules. */
  validation?: string[];

  /** Optional visibility scopes. */
  visibility?: ('list' | 'create' | 'edit' | 'show')[];
}
