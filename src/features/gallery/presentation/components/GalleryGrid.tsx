'use client';

import { Image } from '@/features/gallery/domain/models/image.model';
import { GalleryCard } from './GalleryCard';

interface GalleryGridProps {
    images: Image[];
    selectedIds: Set<string>;
    hasSelection: boolean;
    onCardClick: (id: string, index: number, e: React.MouseEvent) => void;
    onCardContextMenu: (e: React.MouseEvent, id: string) => void;
    onEdit?: (image: Image) => void;
}

export function GalleryGrid({
    images,
    selectedIds,
    hasSelection,
    onCardClick,
    onCardContextMenu,
    onEdit,
}: GalleryGridProps) {
    if (images.length === 0) {
        return (
            <div className="text-center py-16 px-8 text-slate-400 text-lg">
                Aucune image pour le moment. Cliquez sur &laquo; Ajouter &raquo; pour commencer.
            </div>
        );
    }

    return (
        <div className="[columns:4_280px] gap-4">
            {images.map((image, index) => (
                <GalleryCard
                    key={image.id}
                    image={image}
                    index={index}
                    isSelected={selectedIds.has(image.id)}
                    isDimmed={hasSelection && !selectedIds.has(image.id)}
                    onClick={(e) => onCardClick(image.id, index, e)}
                    onContextMenu={(e) => onCardContextMenu(e, image.id)}
                    onEdit={onEdit ? () => onEdit(image) : undefined}
                />
            ))}
        </div>
    );
}
