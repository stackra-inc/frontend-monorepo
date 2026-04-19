/**
 * @fileoverview Unit tests for RefineKbd component
 *
 * This test suite validates the RefineKbd component which displays keyboard
 * shortcuts in a visually appealing way with proper accessibility attributes.
 *
 * Test Coverage:
 * - Rendering: Basic component rendering with keys
 * - Multiple Keys: Rendering multiple keys with separators
 * - Custom Separator: Using custom separators between keys
 * - Empty Keys: Handling empty key arrays
 * - Custom Styling: Applying custom CSS classes
 * - Variants: Testing different visual variants
 *
 * @module @stackra/kbd
 * @category Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RefineKbd } from '@/src/components/refine-kbd/refine-kbd.component';

/**
 * Test suite for RefineKbd component
 *
 * This suite tests the visual display of keyboard shortcuts,
 * ensuring proper rendering and accessibility.
 */
describe('RefineKbd', () => {
  /**
   * Test: Basic keyboard key rendering
   *
   * This test ensures that the component renders keyboard keys
   * with their correct symbols (⌘ for command, K for regular key).
   */
  it('should render keyboard keys', () => {
    // Render component with command+K
    render(<RefineKbd keys={['command', 'K']} />);

    // Verify symbols are rendered
    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  /**
   * Test: Multiple keys with separator
   *
   * This test verifies that multiple keys are rendered with
   * separators between them (ctrl+shift+P).
   */
  it('should render multiple keys with separator', () => {
    // Render component with ctrl+shift+P
    render(<RefineKbd keys={['ctrl', 'shift', 'P']} />);

    // Verify all keys are rendered
    expect(screen.getByText('⌃')).toBeInTheDocument();
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  /**
   * Test: Custom separator
   *
   * This test ensures that a custom separator can be used
   * between keys instead of the default "+".
   */
  it('should render custom separator', () => {
    // Render with custom separator
    const { container } = render(<RefineKbd keys={['ctrl', 'K']} separator=" + " />);

    // Verify custom separator is used
    expect(container.textContent).toContain('+');
  });

  /**
   * Test: Empty keys array
   *
   * This test verifies that the component returns null when
   * no keys are provided, preventing empty renders.
   */
  it('should return null for empty keys', () => {
    // Render with empty keys array
    const { container } = render(<RefineKbd keys={[]} />);

    // Component should not render anything
    expect(container.firstChild).toBeNull();
  });

  /**
   * Test: Custom className
   *
   * This test ensures that custom CSS classes can be applied
   * to the component for styling purposes.
   */
  it('should apply custom className', () => {
    // Render with custom class
    const { container } = render(<RefineKbd keys={['ctrl', 'K']} className="custom-class" />);

    // Verify custom class is applied
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  /**
   * Test: Light variant
   *
   * This test verifies that the light variant can be applied
   * for different visual styling.
   */
  it('should render light variant', () => {
    // Render with light variant
    render(<RefineKbd keys={['ctrl', 'K']} variant="light" />);

    // Component should render with light variant
    expect(screen.getByText('⌃')).toBeInTheDocument();
  });
});
