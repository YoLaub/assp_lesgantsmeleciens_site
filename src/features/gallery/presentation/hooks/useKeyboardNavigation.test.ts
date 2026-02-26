import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useKeyboardNavigation } from './useKeyboardNavigation';

function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}, target?: HTMLElement) {
    const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...opts,
    });
    (target ?? document.body).dispatchEvent(event);
}

describe('useKeyboardNavigation', () => {
    it('Delete calls onDelete', () => {
        const onDelete = vi.fn();
        renderHook(() => useKeyboardNavigation({ onDelete }));

        fireKey('Delete');

        expect(onDelete).toHaveBeenCalledOnce();
    });

    it('Escape calls onEscape', () => {
        const onEscape = vi.fn();
        renderHook(() => useKeyboardNavigation({ onEscape }));

        fireKey('Escape');

        expect(onEscape).toHaveBeenCalledOnce();
    });

    it('Ctrl+A calls onSelectAll', () => {
        const onSelectAll = vi.fn();
        renderHook(() => useKeyboardNavigation({ onSelectAll }));

        fireKey('a', { ctrlKey: true });

        expect(onSelectAll).toHaveBeenCalledOnce();
    });

    it('Meta+A calls onSelectAll', () => {
        const onSelectAll = vi.fn();
        renderHook(() => useKeyboardNavigation({ onSelectAll }));

        fireKey('a', { metaKey: true });

        expect(onSelectAll).toHaveBeenCalledOnce();
    });

    it('ArrowLeft calls onArrowLeft', () => {
        const onArrowLeft = vi.fn();
        renderHook(() => useKeyboardNavigation({ onArrowLeft }));

        fireKey('ArrowLeft');

        expect(onArrowLeft).toHaveBeenCalledOnce();
    });

    it('ArrowRight calls onArrowRight', () => {
        const onArrowRight = vi.fn();
        renderHook(() => useKeyboardNavigation({ onArrowRight }));

        fireKey('ArrowRight');

        expect(onArrowRight).toHaveBeenCalledOnce();
    });

    it('ignores when target is input', () => {
        const onDelete = vi.fn();
        renderHook(() => useKeyboardNavigation({ onDelete }));

        const input = document.createElement('input');
        document.body.appendChild(input);
        fireKey('Delete', {}, input);
        document.body.removeChild(input);

        expect(onDelete).not.toHaveBeenCalled();
    });

    it('ignores when target is textarea', () => {
        const onEscape = vi.fn();
        renderHook(() => useKeyboardNavigation({ onEscape }));

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        fireKey('Escape', {}, textarea);
        document.body.removeChild(textarea);

        expect(onEscape).not.toHaveBeenCalled();
    });

    it('cleans up on unmount', () => {
        const onDelete = vi.fn();
        const { unmount } = renderHook(() => useKeyboardNavigation({ onDelete }));

        unmount();
        fireKey('Delete');

        expect(onDelete).not.toHaveBeenCalled();
    });

    it("plain 'a' without modifier is ignored", () => {
        const onSelectAll = vi.fn();
        renderHook(() => useKeyboardNavigation({ onSelectAll }));

        fireKey('a');

        expect(onSelectAll).not.toHaveBeenCalled();
    });
});
