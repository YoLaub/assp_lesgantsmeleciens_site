'use client';

import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { Image } from '@/features/gallery/domain/models/image.model';
import { GalleryListRow } from './GalleryListRow';

interface GalleryListViewProps {
    images: Image[];
    selectedIds: Set<string>;
    hasSelection: boolean;
    onCardClick: (id: string, index: number, e: React.MouseEvent) => void;
    onToggleSelect: (id: string) => void;
    onEdit: (image: Image) => void;
    onDelete: (id: string) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
}

export function GalleryListView({
    images,
    selectedIds,
    hasSelection,
    onCardClick,
    onToggleSelect,
    onEdit,
    onDelete,
    onSelectAll,
    onClearSelection,
    onReorder,
}: GalleryListViewProps) {
    if (images.length === 0) {
        return (
            <div className="text-center py-16 px-8 text-slate-400 text-lg">
                Aucune image pour le moment. Cliquez sur &laquo; Ajouter &raquo; pour commencer.
            </div>
        );
    }

    const allSelected = images.length > 0 && images.every((img) => selectedIds.has(img.id));

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[2.5rem_2.5rem_4rem_1fr_8rem_7rem_7rem_6rem] items-center border-b border-slate-100">
                <div className="pl-3 py-3" />
                <div className="py-3">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => allSelected ? onClearSelection() : onSelectAll()}
                        className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                </div>
                <div className="py-3" />
                <div className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Titre
                </div>
                <div className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Catégorie
                </div>
                <div className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:block">
                    Dimensions
                </div>
                <div className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:block">
                    Date
                </div>
                <div className="px-4 py-3" />
            </div>

            {/* Sortable rows */}
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) return;
                    const { source } = event.operation;
                    if (isSortable(source)) {
                        const { initialIndex, index } = source;
                        if (initialIndex !== index) {
                            onReorder(initialIndex, index);
                        }
                    }
                }}
            >
                <div>
                    {images.map((image, index) => (
                        <GalleryListRow
                            key={image.id}
                            image={image}
                            index={index}
                            isSelected={selectedIds.has(image.id)}
                            onToggleSelect={() => onToggleSelect(image.id)}
                            onEdit={() => onEdit(image)}
                            onDelete={() => onDelete(image.id)}
                            onClick={(e) => onCardClick(image.id, index, e)}
                        />
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}
