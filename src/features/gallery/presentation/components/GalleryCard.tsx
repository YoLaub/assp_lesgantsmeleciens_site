'use client';

import { Pencil } from 'lucide-react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { getCategoryLabel } from '@/features/gallery/domain/models/gallery-category.model';

interface GalleryCardProps {
    image: GalleryImage;
    index: number;
    isSelected: boolean;
    isDimmed: boolean;
    onClick: (e: React.MouseEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onEdit?: () => void;
}

export function GalleryCard({
    image,
    index,
    isSelected,
    isDimmed,
    onClick,
    onContextMenu,
    onEdit,
}: GalleryCardProps) {
    return (
        <div
            className={`
                break-inside-avoid mb-4 rounded-xl overflow-hidden shadow-sm
                relative cursor-pointer group
                transition-all duration-300 ease-out
                hover:scale-[1.03] hover:shadow-lg
                ${isSelected ? 'ring-2 ring-red-500 shadow-lg' : ''}
                ${isDimmed ? 'opacity-65 grayscale-[30%] hover:opacity-80 hover:grayscale-0' : ''}
            `}
            style={{
                animation: 'fadeSlideUp 0.5s ease-out both',
                animationDelay: `${index * 60}ms`,
            }}
            onClick={(e) => onClick(e)}
            onContextMenu={onContextMenu}
            role="button"
            tabIndex={0}
            aria-label={image.alt || image.title}
            aria-pressed={isSelected}
        >
            <img
                className="block w-full h-auto pointer-events-none"
                src={image.src}
                alt={image.alt || image.title}
                width={image.width || undefined}
                height={image.height || undefined}
            />

            {/* Edit button on hover */}
            {onEdit && (
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80
                               flex items-center justify-center z-10
                               opacity-0 group-hover:opacity-100 scale-[0.6] group-hover:scale-100
                               hover:!scale-110 hover:bg-white hover:shadow-md hover:ring-2 hover:ring-slate-300
                               active:!scale-95
                               transition-all duration-200 ease-out shadow-sm"
                    aria-label={`Modifier ${image.title}`}
                >
                    <Pencil className="w-3.5 h-3.5 text-slate-700" />
                </button>
            )}

            {/* Title overlay on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-semibold truncate">{image.title}</p>
                {image.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-md text-white text-[10px] font-bold uppercase tracking-wide">
                        {getCategoryLabel(image.category)}
                    </span>
                )}
            </div>

            {/* Selection checkmark */}
            <div
                className={`
                    absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500
                    flex items-center justify-center pointer-events-none z-10
                    transition-all duration-200 ease-out
                    ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.6]'}
                `}
                aria-hidden="true"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        </div>
    );
}
