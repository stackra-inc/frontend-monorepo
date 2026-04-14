/**
 * Tests for useKeyboardShortcut hook
 *
 * @category Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcut } from '@/src';

describe('useKeyboardShortcut', () => {
  it('should register keyboard shortcut', () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        keys: ['command', 'K'],
        callback,
      })
    );

    // Simulate keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not trigger when disabled', () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        keys: ['command', 'K'],
        callback,
        enabled: false,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle multiple modifier keys', () => {
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({
        keys: ['ctrl', 'shift', 'P'],
        callback,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cleanup event listener on unmount', () => {
    const callback = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyboardShortcut({
        keys: ['command', 'K'],
        callback,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
