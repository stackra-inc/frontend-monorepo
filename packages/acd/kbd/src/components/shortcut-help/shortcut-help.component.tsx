/**
 * @fileoverview Component for displaying a keyboard shortcuts help modal/dialog.
 *
 * This component renders a modal or dialog with a searchable list of all
 * available keyboard shortcuts, typically triggered by a help shortcut.
 *
 * @module @stackra/kbd
 * @category Components
 */

import React, { useState, useEffect } from 'react';
import { ShortcutList } from '@/components/shortcut-list';
import { useShortcut } from '@/hooks/use-shortcut';

/**
 * Props for the ShortcutHelp component.
 *
 * @category Props
 * @public
 */
export interface ShortcutHelpProps {
  /**
   * Whether the help modal is open.
   */
  isOpen?: boolean;

  /**
   * Callback when the modal should close.
   */
  onClose?: () => void;

  /**
   * Whether to register the help shortcut (? or Ctrl+/).
   *
   * @defaultValue true
   */
  registerShortcut?: boolean;

  /**
   * Title for the help modal.
   *
   * @defaultValue "Keyboard Shortcuts"
   */
  title?: string;

  /**
   * Whether to group shortcuts by category.
   *
   * @defaultValue true
   */
  groupByCategory?: boolean;

  /**
   * Additional CSS classes for the modal container.
   */
  className?: string;

  /**
   * Additional CSS classes for the modal overlay.
   */
  overlayClassName?: string;
}

/**
 * Component for displaying a keyboard shortcuts help modal.
 *
 * This component provides a modal/dialog with a searchable list of all
 * keyboard shortcuts, with automatic registration of the help shortcut.
 *
 * @example
 * Controlled usage:
 * ```tsx
 * function App() {
 *   const [helpOpen, setHelpOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setHelpOpen(true)}>
 *         Show Shortcuts
 *       </button>
 *       <ShortcutHelp
 *         isOpen={helpOpen}
 *         onClose={() => setHelpOpen(false)}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * Uncontrolled with auto shortcut:
 * ```tsx
 * function App() {
 *   return <ShortcutHelp registerShortcut />;
 * }
 * ```
 *
 * @param props - Component props
 * @returns A rendered help modal with keyboard shortcuts
 *
 * @category Components
 * @public
 */
export const ShortcutHelp: React.FC<ShortcutHelpProps> = ({
  isOpen: controlledIsOpen,
  onClose,
  registerShortcut = true,
  title = 'Keyboard Shortcuts',
  groupByCategory = true,
  className,
  overlayClassName,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onClose ? (open: boolean) => !open && onClose() : setInternalIsOpen;

  // Register help shortcut
  useShortcut({
    id: 'help.show-shortcuts',
    callback: () => setIsOpen(true),
    enabled: registerShortcut,
  });

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={overlayClassName}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className={className}
        style={{
          backgroundColor: 'var(--color-background, white)',
          borderRadius: '0.5rem',
          maxWidth: '48rem',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-border, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{title}</h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--color-foreground-secondary, #6b7280)',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <ShortcutList groupByCategory={groupByCategory} showSearch />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            fontSize: '0.875rem',
            color: 'var(--color-foreground-secondary, #6b7280)',
            textAlign: 'center',
          }}
        >
          Press{' '}
          <kbd
            style={{
              padding: '0.125rem 0.375rem',
              border: '1px solid currentColor',
              borderRadius: '0.25rem',
            }}
          >
            esc
          </kbd>{' '}
          to close
        </div>
      </div>
    </div>
  );
};

ShortcutHelp.displayName = 'ShortcutHelp';
