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

    describe('RANGE_SELECT', () => {
        it('selects all images between fromId and toId (inclusive)', () => {
            const images = makeGalleryImageList(5);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'RANGE_SELECT', fromId: 'img-2', toId: 'img-4' }));

            expect(result.current.selectedIds.size).toBe(3);
            expect(result.current.selectedIds.has('img-2')).toBe(true);
            expect(result.current.selectedIds.has('img-3')).toBe(true);
            expect(result.current.selectedIds.has('img-4')).toBe(true);
        });

        it('works when fromId index > toId index (reversed range)', () => {
            const images = makeGalleryImageList(5);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'RANGE_SELECT', fromId: 'img-4', toId: 'img-2' }));

            expect(result.current.selectedIds.size).toBe(3);
            expect(result.current.selectedIds.has('img-2')).toBe(true);
            expect(result.current.selectedIds.has('img-3')).toBe(true);
            expect(result.current.selectedIds.has('img-4')).toBe(true);
        });

        it('adds to existing selection', () => {
            const images = makeGalleryImageList(5);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'TOGGLE_SELECT', id: 'img-1' }));
            act(() => result.current.dispatch({ type: 'RANGE_SELECT', fromId: 'img-3', toId: 'img-4' }));

            expect(result.current.selectedIds.size).toBe(3);
            expect(result.current.selectedIds.has('img-1')).toBe(true);
            expect(result.current.selectedIds.has('img-3')).toBe(true);
            expect(result.current.selectedIds.has('img-4')).toBe(true);
        });

        it('returns unchanged state if fromId not found', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'RANGE_SELECT', fromId: 'nonexistent', toId: 'img-2' }));

            expect(result.current.selectedIds.size).toBe(0);
        });

        it('returns unchanged state if toId not found', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'RANGE_SELECT', fromId: 'img-1', toId: 'nonexistent' }));

            expect(result.current.selectedIds.size).toBe(0);
        });
    });

    describe('REORDER', () => {
        it('moves image from one position to another', () => {
            const images = makeGalleryImageList(4);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'REORDER', fromId: 'img-1', toId: 'img-3' }));

            const ids = result.current.images.map((i) => i.id);
            expect(ids).toEqual(['img-2', 'img-3', 'img-1', 'img-4']);
        });

        it('reindexes all order fields after move', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'REORDER', fromId: 'img-3', toId: 'img-1' }));

            result.current.images.forEach((img, i) => {
                expect(img.order).toBe(i);
            });
        });

        it('returns unchanged state if fromId not found', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'REORDER', fromId: 'nonexistent', toId: 'img-2' }));

            expect(result.current.images.map((i) => i.id)).toEqual(['img-1', 'img-2', 'img-3']);
        });

        it('returns unchanged state if toId not found', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            act(() => result.current.dispatch({ type: 'REORDER', fromId: 'img-1', toId: 'nonexistent' }));

            expect(result.current.images.map((i) => i.id)).toEqual(['img-1', 'img-2', 'img-3']);
        });
    });

    describe('ADD_IMAGES', () => {
        it('appends multiple images to the list', () => {
            const images = makeGalleryImageList(2);
            const { result } = renderHook(() => useImageCollection(images));

            const newImages = [
                makeGalleryImage({ id: 'new-1', title: 'New 1' }),
                makeGalleryImage({ id: 'new-2', title: 'New 2' }),
            ];
            act(() => result.current.dispatch({ type: 'ADD_IMAGES', images: newImages }));

            expect(result.current.images).toHaveLength(4);
            expect(result.current.images[2].id).toBe('new-1');
            expect(result.current.images[3].id).toBe('new-2');
        });

        it('appends to empty list', () => {
            const { result } = renderHook(() => useImageCollection([]));

            const newImages = [makeGalleryImage({ id: 'new-1' })];
            act(() => result.current.dispatch({ type: 'ADD_IMAGES', images: newImages }));

            expect(result.current.images).toHaveLength(1);
        });
    });

    describe('UPDATE_IMAGE', () => {
        it('replaces the image matching by id', () => {
            const images = makeGalleryImageList(3);
            const { result } = renderHook(() => useImageCollection(images));

            const updated = makeGalleryImage({ id: 'img-2', title: 'Updated Title' });
            act(() => result.current.dispatch({ type: 'UPDATE_IMAGE', image: updated }));

            expect(result.current.images[1].title).toBe('Updated Title');
            expect(result.current.images).toHaveLength(3);
        });

        it('does not change images if id not found', () => {
            const images = makeGalleryImageList(2);
            const { result } = renderHook(() => useImageCollection(images));

            const updated = makeGalleryImage({ id: 'nonexistent', title: 'Nope' });
            act(() => result.current.dispatch({ type: 'UPDATE_IMAGE', image: updated }));

            expect(result.current.images).toHaveLength(2);
            expect(result.current.images[0].title).toBe('Image 1');
            expect(result.current.images[1].title).toBe('Image 2');
        });
    });
});
