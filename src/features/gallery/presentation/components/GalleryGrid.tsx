'use client';

import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { GalleryCard } from './GalleryCard';

interface GalleryGridProps {
    images: GalleryImage[];
    selectedIds: Set<string>;
    hasSelection: boolean;
    onCardClick: (id: string, index: number) => void;
    onCardContextMenu: (e: React.MouseEvent, id: string) => void;
}

export function GalleryGrid({
    images,
    selectedIds,
    hasSelection,
    onCardClick,
    onCardContextMenu,
}: GalleryGridProps) {
    if (images.length === 0) {
        return (
            <div className="text-center py-16 px-8 text-slate-400 text-lg">
                Aucune image pour le moment. Cliquez sur &laquo; Ajouter une image &raquo; pour commencer.
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
                    onClick={() => onCardClick(image.id, index)}
                    onContextMenu={(e) => onCardContextMenu(e, image.id)}
                />
            ))}
        </div>
    );
}
