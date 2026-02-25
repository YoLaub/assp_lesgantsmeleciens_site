import { renderHook, act } from '@testing-library/react';
import { useLightbox } from './useLightbox';

describe('useLightbox', () => {
    it('initializes closed at index 0', () => {
        const { result } = renderHook(() => useLightbox(5));

        expect(result.current.isOpen).toBe(false);
        expect(result.current.currentIndex).toBe(0);
    });

    it('open(3) sets index and opens', () => {
        const { result } = renderHook(() => useLightbox(5));

        act(() => result.current.open(3));

        expect(result.current.isOpen).toBe(true);
        expect(result.current.currentIndex).toBe(3);
    });

    it('close closes', () => {
        const { result } = renderHook(() => useLightbox(5));

        act(() => result.current.open(2));
        act(() => result.current.close());

        expect(result.current.isOpen).toBe(false);
    });

    it('next increments', () => {
        const { result } = renderHook(() => useLightbox(5));

        act(() => result.current.open(1));
        act(() => result.current.next());

        expect(result.current.currentIndex).toBe(2);
    });

    it('next wraps to 0 at end', () => {
        const { result } = renderHook(() => useLightbox(5));

        act(() => result.current.open(4));
        act(() => result.current.next());

        expect(result.current.currentIndex).toBe(0);
    });

    it('prev decrements', () => {
        const { result } = renderHook(() => useLightbox(5));

        act(() => result.current.open(3));
        act(() => result.current.prev());

        expect(result.current.currentIndex).toBe(2);
    });

    it('prev wraps to last at 0', () => {
        const { result } = renderHook(() => useLightbox(5));

        act(() => result.current.open(0));
        act(() => result.current.prev());

        expect(result.current.currentIndex).toBe(4);
    });
});
