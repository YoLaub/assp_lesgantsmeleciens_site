'use client';

import { useState, useMemo } from 'react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { useImageCollection } from '../hooks/useImageCollection';
import { useLightbox } from '../hooks/useLightbox';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { GalleryGrid } from './GalleryGrid';
import { GalleryToolbar } from './GalleryToolbar';
import { Lightbox } from './Lightbox';
import { AddImageDialog } from './AddImageDialog';
import { SelectionToolbar } from './SelectionToolbar';
import {
    deleteGalleryImageAction,
    bulkDeleteGalleryImagesAction,
} from '@/app/(admin)/content/actions/gallery.actions';

interface GalleryManagerProps {
    initialImages: GalleryImage[];
}

export function GalleryManager({ initialImages }: GalleryManagerProps) {
    const { images, selectedIds, selectedCount, hasSelection, selectedIdsArray, dispatch } =
        useImageCollection(initialImages);
    const lightbox = useLightbox(images.length);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredImages = useMemo(() => {
        if (!searchQuery.trim()) return images;
        const q = searchQuery.toLowerCase();
        return images.filter(
            (img) =>
                img.title.toLowerCase().includes(q) ||
                img.category.toLowerCase().includes(q),
        );
    }, [images, searchQuery]);

    useKeyboardNavigation({
        onDelete: () => {
            if (hasSelection) handleBulkDelete();
        },
        onEscape: () => {
            lightbox.close();
            dispatch({ type: 'CLEAR_SELECTION' });
        },
        onSelectAll: (e) => {
            e.preventDefault();
            dispatch({ type: 'SELECT_ALL' });
        },
        onArrowLeft: lightbox.isOpen ? lightbox.prev : undefined,
        onArrowRight: lightbox.isOpen ? lightbox.next : undefined,
    });

    function handleCardClick(id: string, index: number) {
        if (hasSelection) {
            dispatch({ type: 'TOGGLE_SELECT', id });
        } else {
            lightbox.open(index);
        }
    }

    function handleCardContextMenu(e: React.MouseEvent, id: string) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SELECT', id });
    }

    async function handleBulkDelete() {
        const ids = selectedIdsArray();
        const count = ids.length;
        if (!count) return;

        const confirmed = window.confirm(
            `Supprimer ${count} image${count > 1 ? 's' : ''} ? Cette action est irréversible.`,
        );
        if (!confirmed) return;

        const snapshot = [...images];
        dispatch({ type: 'DELETE_SELECTED' });

        const result = await bulkDeleteGalleryImagesAction(ids);
        if (!result.success) {
            dispatch({ type: 'SET_IMAGES', images: snapshot });
            alert(result.error || 'Erreur lors de la suppression');
        }
    }

    async function handleSingleDelete(id: string) {
        const snapshot = [...images];
        dispatch({ type: 'REMOVE_IMAGE', id });

        const result = await deleteGalleryImageAction(id);
        if (!result.success) {
            dispatch({ type: 'SET_IMAGES', images: snapshot });
            alert(result.error || 'Erreur lors de la suppression');
        }
    }

    return (
        <div className="space-y-6">
            <GalleryToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAdd={() => setAddDialogOpen(true)}
            />

            <GalleryGrid
                images={filteredImages}
                selectedIds={selectedIds}
                hasSelection={hasSelection}
                onCardClick={handleCardClick}
                onCardContextMenu={handleCardContextMenu}
            />

            <Lightbox
                images={filteredImages}
                currentIndex={lightbox.currentIndex}
                isOpen={lightbox.isOpen}
                onClose={lightbox.close}
                onNext={lightbox.next}
                onPrev={lightbox.prev}
            />

            <AddImageDialog
                isOpen={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onImageAdded={(img) => dispatch({ type: 'ADD_IMAGE', image: img })}
            />

            <SelectionToolbar
                selectedCount={selectedCount}
                onDelete={handleBulkDelete}
                onSelectAll={() => dispatch({ type: 'SELECT_ALL' })}
                onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
            />
        </div>
    );
}
