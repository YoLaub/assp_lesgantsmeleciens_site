'use client';

import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';

interface GalleryCardProps {
    image: GalleryImage;
    index: number;
    isSelected: boolean;
    isDimmed: boolean;
    onClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

export function GalleryCard({
    image,
    index,
    isSelected,
    isDimmed,
    onClick,
    onContextMenu,
}: GalleryCardProps) {
    return (
        <div
            className={`
                break-inside-avoid mb-4 rounded-xl overflow-hidden shadow-sm
                relative cursor-pointer group
                transition-all duration-300 ease-out
                hover:scale-[1.03] hover:shadow-lg
                ${isSelected ? 'ring-2 ring-red-500 shadow-lg' : ''}
                ${isDimmed ? 'opacity-55 hover:opacity-80' : ''}
            `}
            style={{
                animation: 'fadeSlideUp 0.5s ease-out both',
                animationDelay: `${index * 60}ms`,
            }}
            onClick={onClick}
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

            {/* Title overlay on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-semibold truncate">{image.title}</p>
                {image.category && (
                    <p className="text-white/70 text-xs">{image.category}</p>
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
