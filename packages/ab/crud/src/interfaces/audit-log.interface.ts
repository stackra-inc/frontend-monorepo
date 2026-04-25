/**
 * @fileoverview Audit log service interfaces.
 *
 * Defines the contract for tracking data changes and audit trails.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Parameters for creating an audit log entry.
 */
export interface AuditLogCreateParams {
  /** Resource name the action was performed on. */
  resource: string;

  /** Action performed (e.g. 'create', 'update', 'delete'). */
  action: string;

  /** New data after the action. */
  data?: any;

  /** Previous data before the action. */
  previousData?: any;

  /** Arbitrary metadata. */
  meta?: Record<string, any>;
}

/**
 * Parameters for retrieving audit log entries.
 */
export interface AuditLogGetParams {
  /** Resource name to filter by. */
  resource: string;

  /** Optional action to filter by. */
  action?: string;

  /** Arbitrary metadata for filtering. */
  meta?: Record<string, any>;

  /** Optional author to filter by. */
  author?: any;
}

/**
 * Parameters for updating an audit log entry.
 */
export interface AuditLogUpdateParams {
  /** Audit log entry ID. */
  id: any;

  /** New name/label for the entry. */
  name: string;

  /** Arbitrary metadata. */
  meta?: Record<string, any>;
}

/**
 * Audit log service interface.
 *
 * Implementations handle creating, retrieving, and updating audit trail entries.
 */
export interface IAuditLogService {
  /**
   * Create an audit log entry.
   * @param params - Creation parameters.
   * @returns The created entry.
   */
  create(params: AuditLogCreateParams): Promise<any>;

  /**
   * Retrieve audit log entries.
   * @param params - Query parameters.
   * @returns Matching entries.
   */
  get(params: AuditLogGetParams): Promise<any>;

  /**
   * Update an audit log entry.
   * @param params - Update parameters.
   * @returns The updated entry.
   */
  update(params: AuditLogUpdateParams): Promise<any>;
}
