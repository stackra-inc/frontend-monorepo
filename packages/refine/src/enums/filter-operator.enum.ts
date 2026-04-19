/**
 * @fileoverview Filter operator enum for query filtering.
 *
 * Defines all supported comparison and logical operators used in
 * {@link FilterDescriptor} objects when building list queries.
 *
 * @module @stackra-inc/react-refine
 * @category Enums
 *
 * @example
 * ```typescript
 * import { FilterOperator } from '@stackra-inc/react-refine';
 *
 * const filter = {
 *   field: 'status',
 *   operator: FilterOperator.Eq,
 *   value: 'published',
 * };
 * ```
 */

/**
 * Enumeration of all supported filter operators.
 *
 * These operators are used in {@link FilterDescriptor} to specify
 * how a field value should be compared against the filter value.
 */
export enum FilterOperator {
  /** Equal — exact match */
  Eq = 'eq',

  /** Not equal */
  Ne = 'ne',

  /** Less than */
  Lt = 'lt',

  /** Greater than */
  Gt = 'gt',

  /** Less than or equal */
  Lte = 'lte',

  /** Greater than or equal */
  Gte = 'gte',

  /** In — value is one of the provided array */
  In = 'in',

  /** Not in — value is not one of the provided array */
  Nin = 'nin',

  /** Contains — case-insensitive substring match */
  Contains = 'contains',

  /** Not contains — case-insensitive substring exclusion */
  Ncontains = 'ncontains',

  /** Contains (case-sensitive) */
  Containss = 'containss',

  /** Not contains (case-sensitive) */
  Ncontainss = 'ncontainss',

  /** Between — value is within a range (inclusive) */
  Between = 'between',

  /** Not between — value is outside a range */
  Nbetween = 'nbetween',

  /** Null — field value is null */
  Null = 'null',

  /** Not null — field value is not null */
  Nnull = 'nnull',

  /** Starts with — case-insensitive prefix match */
  Startswith = 'startswith',

  /** Not starts with — case-insensitive prefix exclusion */
  Nstartswith = 'nstartswith',

  /** Starts with (case-sensitive) */
  Startswiths = 'startswiths',

  /** Not starts with (case-sensitive) */
  Nstartswiths = 'nstartswiths',

  /** Ends with — case-insensitive suffix match */
  Endswith = 'endswith',

  /** Not ends with — case-insensitive suffix exclusion */
  Nendswith = 'nendswith',

  /** Ends with (case-sensitive) */
  Endswiths = 'endswiths',

  /** Not ends with (case-sensitive) */
  Nendswiths = 'nendswiths',

  /** Logical OR — combines multiple filters with OR logic */
  Or = 'or',

  /** Logical AND — combines multiple filters with AND logic */
  And = 'and',
}
