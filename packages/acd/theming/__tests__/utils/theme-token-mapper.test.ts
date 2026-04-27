/**
 * @fileoverview Unit tests for ThemeTokenMapper utility functions.
 *
 * Tests the pure logic of converting backend snake_case design tokens
 * to CSS custom property names, separating light/dark tokens, and
 * mapping flat token objects to CSS variable entries.
 *
 * @module @stackra/react-theming
 * @category Tests
 */

import { describe, it, expect } from 'vitest';
import { tokenToCssVar, separateTokensByMode, mapTokensToVars } from '@/utils/theme-token-mapper';

// ============================================================================
// tokenToCssVar
// ============================================================================

describe('tokenToCssVar', () => {
  it('converts a simple token to a CSS variable', () => {
    expect(tokenToCssVar('accent')).toBe('--accent');
  });

  it('converts underscores to hyphens', () => {
    expect(tokenToCssVar('surface_secondary')).toBe('--surface-secondary');
  });

  it('handles multiple underscores', () => {
    expect(tokenToCssVar('surface_secondary_foreground')).toBe('--surface-secondary-foreground');
  });

  it('handles field tokens', () => {
    expect(tokenToCssVar('field_background')).toBe('--field-background');
  });

  it('handles non-color tokens', () => {
    expect(tokenToCssVar('radius')).toBe('--radius');
    expect(tokenToCssVar('font_sans')).toBe('--font-sans');
    expect(tokenToCssVar('surface_shadow')).toBe('--surface-shadow');
    expect(tokenToCssVar('border_width')).toBe('--border-width');
    expect(tokenToCssVar('disabled_opacity')).toBe('--disabled-opacity');
    expect(tokenToCssVar('skeleton_animation')).toBe('--skeleton-animation');
  });

  it('handles custom extension tokens', () => {
    expect(tokenToCssVar('status_submitted')).toBe('--status-submitted');
    expect(tokenToCssVar('severity_critical')).toBe('--severity-critical');
  });

  it('handles an empty string', () => {
    expect(tokenToCssVar('')).toBe('--');
  });
});

// ============================================================================
// separateTokensByMode
// ============================================================================

describe('separateTokensByMode', () => {
  it('separates light and dark tokens', () => {
    const result = separateTokensByMode({
      accent: 'oklch(0.62 0.19 253)',
      dark_background: 'oklch(0.12 0.005 285)',
      background: 'oklch(0.97 0 0)',
    });

    expect(result.light).toEqual({
      accent: 'oklch(0.62 0.19 253)',
      background: 'oklch(0.97 0 0)',
    });
    expect(result.dark).toEqual({
      background: 'oklch(0.12 0.005 285)',
    });
  });

  it('strips the dark_ prefix from dark tokens', () => {
    const result = separateTokensByMode({
      dark_surface_secondary: 'oklch(0.257 0.0037 286.14)',
    });

    expect(result.dark).toEqual({
      surface_secondary: 'oklch(0.257 0.0037 286.14)',
    });
  });

  it('skips null values', () => {
    const result = separateTokensByMode({
      accent: 'oklch(0.62 0.19 253)',
      background: null as unknown as string,
      dark_surface: undefined as unknown as string,
    });

    expect(result.light).toEqual({ accent: 'oklch(0.62 0.19 253)' });
    expect(result.dark).toEqual({});
  });

  it('converts non-string values to strings', () => {
    const result = separateTokensByMode({
      disabled_opacity: 0.5 as unknown as string,
    });

    expect(result.light).toEqual({ disabled_opacity: '0.5' });
  });

  it('returns empty groups for empty input', () => {
    const result = separateTokensByMode({});
    expect(result.light).toEqual({});
    expect(result.dark).toEqual({});
  });

  it('handles tokens that are only dark', () => {
    const result = separateTokensByMode({
      dark_accent: 'oklch(0.62 0.19 253)',
      dark_foreground: 'oklch(0.99 0 0)',
    });

    expect(result.light).toEqual({});
    expect(result.dark).toEqual({
      accent: 'oklch(0.62 0.19 253)',
      foreground: 'oklch(0.99 0 0)',
    });
  });
});

// ============================================================================
// mapTokensToVars
// ============================================================================

describe('mapTokensToVars', () => {
  it('maps a single token to a CSS variable entry', () => {
    const result = mapTokensToVars({ accent: 'oklch(0.62 0.19 253)' });

    expect(result).toEqual([{ variable: '--accent', value: 'oklch(0.62 0.19 253)' }]);
  });

  it('maps multiple tokens', () => {
    const result = mapTokensToVars({
      surface_secondary: '#f4f4f5',
      radius: '0.5rem',
    });

    expect(result).toEqual([
      { variable: '--surface-secondary', value: '#f4f4f5' },
      { variable: '--radius', value: '0.5rem' },
    ]);
  });

  it('skips null and undefined values', () => {
    const result = mapTokensToVars({
      accent: 'oklch(0.62 0.19 253)',
      background: null as unknown as string,
      surface: undefined as unknown as string,
    });

    expect(result).toEqual([{ variable: '--accent', value: 'oklch(0.62 0.19 253)' }]);
  });

  it('converts non-string values to strings', () => {
    const result = mapTokensToVars({
      disabled_opacity: 0.5 as unknown as string,
    });

    expect(result).toEqual([{ variable: '--disabled-opacity', value: '0.5' }]);
  });

  it('returns empty array for empty input', () => {
    expect(mapTokensToVars({})).toEqual([]);
  });
});
