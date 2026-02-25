import { useReducer, useCallback } from 'react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';

type Action =
    | { type: 'SET_IMAGES'; images: GalleryImage[] }
    | { type: 'ADD_IMAGE'; image: GalleryImage }
    | { type: 'REMOVE_IMAGE'; id: string }
    | { type: 'TOGGLE_SELECT'; id: string }
    | { type: 'SELECT_ALL' }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'DELETE_SELECTED' };

interface State {
    images: GalleryImage[];
    selectedIds: Set<string>;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_IMAGES':
            return { ...state, images: action.images, selectedIds: new Set() };

        case 'ADD_IMAGE':
            return { ...state, images: [...state.images, action.image] };

        case 'REMOVE_IMAGE': {
            const nextSelected = new Set(state.selectedIds);
            nextSelected.delete(action.id);
            return {
                images: state.images.filter((img) => img.id !== action.id),
                selectedIds: nextSelected,
            };
        }

        case 'TOGGLE_SELECT': {
            const nextSelected = new Set(state.selectedIds);
            if (nextSelected.has(action.id)) {
                nextSelected.delete(action.id);
            } else {
                nextSelected.add(action.id);
            }
            return { ...state, selectedIds: nextSelected };
        }

        case 'SELECT_ALL':
            return {
                ...state,
                selectedIds: new Set(state.images.map((img) => img.id)),
            };

        case 'CLEAR_SELECTION':
            return { ...state, selectedIds: new Set() };

        case 'DELETE_SELECTED':
            return {
                images: state.images.filter((img) => !state.selectedIds.has(img.id)),
                selectedIds: new Set(),
            };

        default:
            return state;
    }
}

export function useImageCollection(initialImages: GalleryImage[] = []) {
    const [state, dispatch] = useReducer(reducer, {
        images: initialImages,
        selectedIds: new Set<string>(),
    });

    const selectedCount = state.selectedIds.size;
    const hasSelection = selectedCount > 0;
    const selectedIdsArray = useCallback(
        () => Array.from(state.selectedIds),
        [state.selectedIds],
    );

    return {
        images: state.images,
        selectedIds: state.selectedIds,
        selectedCount,
        hasSelection,
        selectedIdsArray,
        dispatch,
    };
}
