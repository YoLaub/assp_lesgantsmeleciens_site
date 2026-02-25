'use client';

import { useState, useMemo, useRef } from 'react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { useImageCollection } from '../hooks/useImageCollection';
import { useLightbox } from '../hooks/useLightbox';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { GalleryGrid } from './GalleryGrid';
import { GalleryListView } from './GalleryListView';
import { GalleryToolbar, ViewMode, SortField, SortDirection } from './GalleryToolbar';
import { Lightbox } from './Lightbox';
import { AddImagesDialog } from './AddImagesDialog';
import { EditImageDialog } from './EditImageDialog';
import { SelectionToolbar } from './SelectionToolbar';
import { GalleryEmptyState } from './GalleryEmptyState';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import {
    deleteGalleryImageAction,
    bulkDeleteGalleryImagesAction,
    reorderGalleryImagesAction,
} from '@/app/(admin)/content/actions/gallery.actions';

interface GalleryManagerProps {
    initialImages: GalleryImage[];
}

function sortImages(images: GalleryImage[], field: SortField, direction: SortDirection): GalleryImage[] {
    const sorted = [...images].sort((a, b) => {
        switch (field) {
            case 'date': {
                const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return da - db;
            }
            case 'title':
                return a.title.localeCompare(b.title, 'fr');
            case 'category':
                return a.category.localeCompare(b.category, 'fr');
        }
    });
    return direction === 'desc' ? sorted.reverse() : sorted;
}

export function GalleryManager({ initialImages }: GalleryManagerProps) {
    const { images, selectedIds, selectedCount, hasSelection, selectedIdsArray, dispatch } =
        useImageCollection(initialImages);
    const lightbox = useLightbox(images.length);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('masonry');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const lastSelectedRef = useRef<string | null>(null);
    const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

    const filteredAndSortedImages = useMemo(() => {
        let result = images;
        if (activeCategory) {
            result = result.filter((img) => img.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (img) =>
                    img.title.toLowerCase().includes(q) ||
                    img.category.toLowerCase().includes(q),
            );
        }
        return sortImages(result, sortField, sortDirection);
    }, [images, searchQuery, activeCategory, sortField, sortDirection]);

    useKeyboardNavigation({
        onDelete: () => {
            if (hasSelection) setDeleteConfirmOpen(true);
        },
        onEscape: () => {
            lightbox.close();
            dispatch({ type: 'CLEAR_SELECTION' });
            setSelectionMode(false);
        },
        onSelectAll: (e) => {
            e.preventDefault();
            dispatch({ type: 'SELECT_ALL' });
        },
        onArrowLeft: lightbox.isOpen ? lightbox.prev : undefined,
        onArrowRight: lightbox.isOpen ? lightbox.next : undefined,
    });

    function handleCardClick(id: string, index: number, e: React.MouseEvent) {
        if (selectionMode || hasSelection) {
            if (e.shiftKey && lastSelectedRef.current) {
                dispatch({ type: 'RANGE_SELECT', fromId: lastSelectedRef.current, toId: id });
            } else {
                dispatch({ type: 'TOGGLE_SELECT', id });
            }
            lastSelectedRef.current = id;
        } else {
            lightbox.open(index);
        }
    }

    function handleCardContextMenu(e: React.MouseEvent, id: string) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SELECT', id });
        lastSelectedRef.current = id;
    }

    function handleEdit(image: GalleryImage) {
        lightbox.close();
        setEditingImage(image);
    }

    function handleSortChange(field: SortField, direction: SortDirection) {
        setSortField(field);
        setSortDirection(direction);
    }

    async function handleReorder(fromId: string, toId: string) {
        const snapshot = [...images];
        dispatch({ type: 'REORDER', fromId, toId });

        const reordered = [...images];
        const fromIdx = reordered.findIndex((img) => img.id === fromId);
        const toIdx = reordered.findIndex((img) => img.id === toId);
        if (fromIdx === -1 || toIdx === -1) return;
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        const items = reordered.map((img, i) => ({ id: img.id, order: i }));
        const result = await reorderGalleryImagesAction(items);
        if (!result.success) {
            dispatch({ type: 'SET_IMAGES', images: snapshot });
        }
    }

    async function handleBulkDelete() {
        const ids = selectedIdsArray();
        if (!ids.length) return;

        setDeleteConfirmOpen(false);

        const snapshot = [...images];
        dispatch({ type: 'DELETE_SELECTED' });

        const result = await bulkDeleteGalleryImagesAction(ids);
        if (!result.success) {
            dispatch({ type: 'SET_IMAGES', images: snapshot });
            alert(result.error || 'Erreur lors de la suppression');
        }
    }

    async function handleSingleDelete(id: string) {
        setSingleDeleteId(null);

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
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                selectionMode={selectionMode}
                onSelectionModeChange={setSelectionMode}
                onAdd={() => setAddDialogOpen(true)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
            />

            {images.length === 0 ? (
                <GalleryEmptyState onAdd={() => setAddDialogOpen(true)} />
            ) : viewMode === 'masonry' ? (
                <GalleryGrid
                    images={filteredAndSortedImages}
                    selectedIds={selectedIds}
                    hasSelection={hasSelection}
                    onCardClick={handleCardClick}
                    onCardContextMenu={handleCardContextMenu}
                    onEdit={handleEdit}
                />
            ) : (
                <GalleryListView
                    images={filteredAndSortedImages}
                    selectedIds={selectedIds}
                    hasSelection={hasSelection}
                    onCardClick={handleCardClick}
                    onToggleSelect={(id) => dispatch({ type: 'TOGGLE_SELECT', id })}
                    onEdit={handleEdit}
                    onDelete={(id) => setSingleDeleteId(id)}
                    onSelectAll={() => dispatch({ type: 'SELECT_ALL' })}
                    onReorder={handleReorder}
                />
            )}

            <Lightbox
                images={filteredAndSortedImages}
                currentIndex={lightbox.currentIndex}
                isOpen={lightbox.isOpen}
                onClose={lightbox.close}
                onNext={lightbox.next}
                onPrev={lightbox.prev}
                onEdit={handleEdit}
            />

            <AddImagesDialog
                isOpen={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onImagesAdded={(imgs) => dispatch({ type: 'ADD_IMAGES', images: imgs })}
            />

            <EditImageDialog
                image={editingImage}
                onClose={() => setEditingImage(null)}
                onSaved={(updated) => dispatch({ type: 'UPDATE_IMAGE', image: updated })}
            />

            <SelectionToolbar
                selectedCount={selectedCount}
                onDelete={() => setDeleteConfirmOpen(true)}
                onSelectAll={() => dispatch({ type: 'SELECT_ALL' })}
                onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title="Supprimer les images"
                message={`Supprimer ${selectedCount} image${selectedCount > 1 ? 's' : ''} ? Cette action est irréversible.`}
                confirmLabel="Supprimer"
                variant="danger"
                onConfirm={handleBulkDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
            />

            <ConfirmDialog
                isOpen={singleDeleteId !== null}
                title="Supprimer l'image"
                message="Supprimer cette image ? Cette action est irréversible."
                confirmLabel="Supprimer"
                variant="danger"
                onConfirm={() => singleDeleteId && handleSingleDelete(singleDeleteId)}
                onCancel={() => setSingleDeleteId(null)}
            />
        </div>
    );
}
