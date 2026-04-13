/**
 * @fileoverview Configuration interface for the attachment control type.
 *
 * Defines accepted file types, size limits, multi-file support,
 * and preview mode for file-upload setting fields.
 *
 * @module interfaces/attachment-config
 */

/**
 * Config for 'attachment' control
 */
export interface AttachmentConfig {
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  preview?: 'image' | 'file' | 'none';
}
