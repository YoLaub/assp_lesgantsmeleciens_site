import { useReducer, useCallback } from 'react';
import { Image } from '@/features/gallery/domain/models/image.model';

type Action =
    | { type: 'SET_IMAGES'; images: Image[] }
    | { type: 'ADD_IMAGE'; image: Image }
    | { type: 'ADD_IMAGES'; images: Image[] }
    | { type: 'UPDATE_IMAGE'; image: Image }
    | { type: 'REMOVE_IMAGE'; id: string }
    | { type: 'TOGGLE_SELECT'; id: string }
    | { type: 'RANGE_SELECT'; fromId: string; toId: string }
    | { type: 'SELECT_ALL' }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'DELETE_SELECTED' }
    | { type: 'REORDER'; fromId: string; toId: string };

interface State {
    images: Image[];
    selectedIds: Set<string>;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_IMAGES':
            return { ...state, images: action.images, selectedIds: new Set() };

        case 'ADD_IMAGE':
            return { ...state, images: [...state.images, action.image] };

        case 'ADD_IMAGES':
            return { ...state, images: [...state.images, ...action.images] };

        case 'UPDATE_IMAGE':
            return {
                ...state,
                images: state.images.map((img) =>
                    img.id === action.image.id ? action.image : img
                ),
            };

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

        case 'RANGE_SELECT': {
            const fromIdx = state.images.findIndex((img) => img.id === action.fromId);
            const toIdx = state.images.findIndex((img) => img.id === action.toId);
            if (fromIdx === -1 || toIdx === -1) return state;
            const start = Math.min(fromIdx, toIdx);
            const end = Math.max(fromIdx, toIdx);
            const nextSelected = new Set(state.selectedIds);
            for (let i = start; i <= end; i++) {
                nextSelected.add(state.images[i].id);
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

        case 'REORDER': {
            const imgs = [...state.images];
            const fromIdx = imgs.findIndex((img) => img.id === action.fromId);
            const toIdx = imgs.findIndex((img) => img.id === action.toId);
            if (fromIdx === -1 || toIdx === -1) return state;
            const [moved] = imgs.splice(fromIdx, 1);
            imgs.splice(toIdx, 0, moved);
            return {
                ...state,
                images: imgs.map((img, i) => ({ ...img, order: i })),
            };
        }

        default:
            return state;
    }
}

export function useImageCollection(initialImages: Image[] = []) {
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
