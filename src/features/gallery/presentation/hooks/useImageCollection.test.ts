import { renderHook, act } from '@testing-library/react';
import { useImageCollection } from './useImageCollection';
import { makeGalleryImage, makeGalleryImageList } from '../../__tests__/fixtures';

describe('useImageCollection', () => {
    it('initializes with empty images and no selection by default', () => {
        const { result } = renderHook(() => useImageCollection());

        expect(result.current.images).toEqual([]);
        expect(result.current.selectedIds.size).toBe(0);
        expect(result.current.selectedCount).toBe(0);
        expect(result.current.hasSelection).toBe(false);
    });

    it('accepts initial images', () => {
        const images = makeGalleryImageList(3);
        const { result } = renderHook(() => useImageCollection(images));

        expect(result.current.images).toEqual(images);
        expect(result.current.selectedIds.size).toBe(0);
    });

    describe('SET_IMAGES', () => {
        it('replaces images and clears selection', () => {
            const initial = makeGalleryImageList(2);
            const { result } = renderHook(() => useImageCollection(initial));

            // Select one first
            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-1' }));
            expect(result.current.hasSelection).toBe(true);

            // Replace images
            const newImages = makeGalleryImageList(3);
            act(() => result.current.dispatch({ type: 'SET_IMAGES', images: newImages }));

            expect(result.current.images).toEqual(newImages);
            expect(result.current.selectedIds.size).toBe(0);
        });
    });

    describe('ADD_IMAGE', () => {
        it('appends image', () => {
            const { result } = renderHook(() => useImageCollection([]));
            const newImage = makeGalleryImage({ id: 'new-1' });

            act(() => result.current.dispatch({ type: 'ADD_IMAGE', image: newImage }));

            expect(result.current.images).toHaveLength(1);
            expect(result.current.images[0].id).toBe('new-1');
        });
    });

    describe('REMOVE_IMAGE', () => {
        it('removes image and removes from selection', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            // Select image then remove it
            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-2' }));
            expect(result.current.selectedIds.has('img-2')).toBe(true);

            act(() => result.current.dispatch({ type: 'REMOVE_IMAGE', id: 'img-2' }));

            expect(result.current.images).toHaveLength(2);
            expect(result.current.selectedIds.has('img-2')).toBe(false);
        });
    });

    describe('TOGGLE_SELECT', () => {
        it('adds to selection', () => {
            const images = makeGalleryImageList(2);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-1' }));

            expect(result.current.selectedIds.has('img-1')).toBe(true);
            expect(result.current.selectedCount).toBe(1);
        });

        it('toggles off on second call', () => {
            const images = makeGalleryImageList(2);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-1' }));
            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-1' }));

            expect(result.current.selectedIds.has('img-1')).toBe(false);
            expect(result.current.selectedCount).toBe(0);
        });
    });

    describe('SELECT_ALL', () => {
        it('selects all image ids', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'SELECT_ALL' }));

            expect(result.current.selectedIds.size).toBe(3);
            expect(result.current.selectedIds.has('img-1')).toBe(true);
            expect(result.current.selectedIds.has('img-2')).toBe(true);
            expect(result.current.selectedIds.has('img-3')).toBe(true);
        });
    });

    describe('CLEAR_SELECTION', () => {
        it('empties selection', () => {
            const images = makeGalleryImageList(2);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'SELECT_ALL' }));
            act(() => result.current.dispatch({ type: 'CLEAR_SELECTION' }));

            expect(result.current.selectedIds.size).toBe(0);
            expect(result.current.hasSelection).toBe(false);
        });
    });

    describe('DELETE_SELECTED', () => {
        it('removes selected images and clears selection', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-1' }));
            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-3' }));
            act(() => result.current.dispatch({ type: 'DELETE_SELECTED' }));

            expect(result.current.images).toHaveLength(1);
            expect(result.current.images[0].id).toBe('img-2');
            expect(result.current.selectedIds.size).toBe(0);
        });
    });

    describe('derived values', () => {
        it('selectedCount, hasSelection, selectedIdsArray are correct', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-1' }));
            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-2' }));

            expect(result.current.selectedCount).toBe(2);
            expect(result.current.hasSelection).toBe(true);
            expect(result.current.selectedIdsArray()).toEqual(
                expect.arrayContaining(['img-1', 'img-2']),
            );
            expect(result.current.selectedIdsArray()).toHaveLength(2);
        });
    });
});
