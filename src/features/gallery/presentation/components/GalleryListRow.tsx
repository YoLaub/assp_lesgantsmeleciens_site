'use client';

import Image from 'next/image';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { getCategoryLabel } from '@/features/gallery/domain/models/gallery-category.model';

interface GalleryListRowProps {
    image: GalleryImage;
    index: number;
    isSelected: boolean;
    onToggleSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onClick: (e: React.MouseEvent) => void;
}

export function GalleryListRow({
    image,
    index,
    isSelected,
    onToggleSelect,
    onEdit,
    onDelete,
    onClick,
}: GalleryListRowProps) {
    const { ref, handleRef, isDragging } = useSortable({ id: image.id, index });

    return (
        <div
            ref={ref}
            className={`grid grid-cols-[2rem_2.5rem_4rem_1fr_8rem_7rem_7rem_6rem] items-center
                group transition-colors cursor-pointer border-b border-slate-50
                ${isDragging ? 'bg-slate-100 opacity-50 z-50' : ''}
                ${isSelected ? 'bg-red-50' : 'hover:bg-slate-50'}`}
            onClick={onClick}
        >
            {/* Drag handle */}
            <div className="pl-3 py-3">
                <button
                    ref={handleRef}
                    className="p-1 rounded text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Réorganiser"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Checkbox */}
            <div className="py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Thumbnail */}
            <div className="py-2">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image
                        src={image.src}
                        alt={image.alt || image.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Title */}
            <div className="px-3 py-3 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                    {image.title}
                </p>
                {image.alt && (
                    <p className="text-xs text-slate-400 truncate">{image.alt}</p>
                )}
            </div>

            {/* Category */}
            <div className="px-3 py-3">
                {image.category && (
                    <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {getCategoryLabel(image.category)}
                    </span>
                )}
            </div>

            {/* Dimensions */}
            <div className="px-3 py-3 hidden lg:block">
                {image.width && image.height ? (
                    <span className="text-xs text-slate-400">
                        {image.width} × {image.height}
                    </span>
                ) : (
                    <span className="text-xs text-slate-300">—</span>
                )}
            </div>

            {/* Date */}
            <div className="px-3 py-3 hidden md:block">
                {image.createdAt ? (
                    <span className="text-xs text-slate-400">
                        {new Date(image.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                ) : (
                    <span className="text-xs text-slate-300">—</span>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    aria-label={`Modifier ${image.title}`}
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
                    aria-label={`Supprimer ${image.title}`}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
