/**
 * Tests for RefineKbd component
 *
 * @category Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RefineKbd } from '@/src';

describe('RefineKbd', () => {
  it('should render keyboard shortcut with single key', () => {
    const { container } = render(<RefineKbd keys={['K']} />);
    expect(container).toBeInTheDocument();
  });

  it('should render keyboard shortcut with modifier keys', () => {
    const { container } = render(<RefineKbd keys={['command', 'K']} />);
    expect(container).toBeInTheDocument();
  });

  it('should render keyboard shortcut with multiple keys', () => {
    const { container } = render(<RefineKbd keys={['ctrl', 'shift', 'P']} />);
    expect(container).toBeInTheDocument();
  });

  it('should render with custom separator', () => {
    const { container } = render(<RefineKbd keys={['command', 'K']} separator=" + " />);
    expect(container.textContent).toContain('+');
  });

  it('should render with light variant', () => {
    const { container } = render(<RefineKbd keys={['command', 'K']} variant="light" />);
    expect(container).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<RefineKbd keys={['command', 'K']} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should return null when no keys provided', () => {
    const { container } = render(<RefineKbd keys={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render navigation keys', () => {
    const { container } = render(<RefineKbd keys={['up', 'down']} />);
    expect(container).toBeInTheDocument();
  });

  it('should render special keys', () => {
    const { container } = render(<RefineKbd keys={['enter', 'escape']} />);
    expect(container).toBeInTheDocument();
  });

  it('should handle mixed modifier and regular keys', () => {
    const { container } = render(<RefineKbd keys={['command', 'shift', 'P']} />);
    expect(container).toBeInTheDocument();
  });
});
