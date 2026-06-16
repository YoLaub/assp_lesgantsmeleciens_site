'use client';

import { X, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/react/sortable';
import { type Image } from '@/features/gallery/domain/models/image.model';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';

interface ImageSlotProps {
    image: Image | null;
    index: number;
    onClickEmpty: () => void;
    onRemove: () => void;
    draggable: boolean;
    aspectRatio?: string;
    rounded?: string;
}

function DraggableSlot({ image, index, onRemove, aspectRatio = 'aspect-square', rounded = 'rounded-xl' }: { image: Image; index: number; onRemove: () => void; aspectRatio?: string; rounded?: string }) {
    const { ref, handleRef, isDragging } = useSortable({ id: image.id, index });

    return (
        <div
            ref={ref}
            className={`relative ${rounded} ${aspectRatio} overflow-hidden ring-1 ring-slate-200
                group transition-all
                ${isDragging ? 'opacity-50 ring-2 ring-red-400 z-50' : 'hover:ring-red-300'}`}
        >
            <div ref={handleRef} className="absolute inset-0 cursor-grab active:cursor-grabbing">
                <CloudImage
                    asset={toCloudinaryAsset(image)}
                    alt={image.alt || image.title}
                    fill
                    sizes="120px"
                    crop="fill"
                    className="object-cover"
                    placeholder="empty"
                    blurDataUrl={image.blurDataUrl}
                />
            </div>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X className="w-3.5 h-3.5 text-white" />
            </button>
        </div>
    );
}

function StaticFilledSlot({ image, onRemove, aspectRatio = 'aspect-square', rounded = 'rounded-xl' }: { image: Image; onRemove: () => void; aspectRatio?: string; rounded?: string }) {
    return (
        <div className={`relative ${rounded} ${aspectRatio} overflow-hidden ring-1 ring-slate-200 group transition-all hover:ring-red-300`}>
            <CloudImage
                asset={toCloudinaryAsset(image)}
                alt={image.alt || image.title}
                fill
                sizes="120px"
                crop="fill"
                className="object-cover"
                placeholder="empty"
                blurDataUrl={image.blurDataUrl}
            />
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X className="w-3.5 h-3.5 text-white" />
            </button>
        </div>
    );
}

function EmptySlot({ onClick, aspectRatio = 'aspect-square', rounded = 'rounded-xl' }: { onClick: () => void; aspectRatio?: string; rounded?: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full ${aspectRatio} ${rounded} border-2 border-dashed border-slate-200
                hover:border-red-400 hover:bg-red-50 transition-all
                flex flex-col items-center justify-center gap-1 cursor-pointer`}
        >
            <Plus className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-medium">Ajouter</span>
        </button>
    );
}

export function ImageSlot({ image, index, onClickEmpty, onRemove, draggable, aspectRatio, rounded }: ImageSlotProps) {
    if (!image) {
        return <EmptySlot onClick={onClickEmpty} aspectRatio={aspectRatio} rounded={rounded} />;
    }
    if (draggable) {
        return <DraggableSlot image={image} index={index} onRemove={onRemove} aspectRatio={aspectRatio} rounded={rounded} />;
    }
    return <StaticFilledSlot image={image} onRemove={onRemove} aspectRatio={aspectRatio} rounded={rounded} />;
}
