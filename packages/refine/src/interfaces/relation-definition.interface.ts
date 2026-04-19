/**
 * @fileoverview A relation definition between resources.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * A relation definition between resources.
 */
export interface RelationDefinition {
  /** Relation name. */
  name: string;

  /** Related resource name. */
  resource: string;

  /** Relation type. */
  type: 'belongsTo' | 'hasMany' | 'hasOne' | 'belongsToMany';

  /** Foreign key field. */
  foreignKey: string;

  /** Optional display field for the related resource. */
  displayField?: string;
}
