'use client';

import { type Image } from '@/features/gallery/domain/models/image.model';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';
import { ChevronLeft, ChevronRight, X, Pencil } from 'lucide-react';

interface LightboxProps {
    images: Image[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    onEdit?: (image: Image) => void;
}

export function Lightbox({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNext,
    onPrev,
    onEdit,
}: LightboxProps) {
    if (!isOpen || images.length === 0) return null;

    const image = images[currentIndex];
    if (!image) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
                aria-label="Fermer"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Previous button */}
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                aria-label="Image précédente"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4">
                <CloudImage
                    asset={toCloudinaryAsset(image)}
                    alt={image.alt || image.title}
                    width={image.width || 1200}
                    height={image.height || 800}
                    sizes="90vw"
                    className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg"
                    placeholder="empty"
                    blurDataUrl={image.blurDataUrl}
                />
                <div className="text-center">
                    <p className="text-white text-lg font-semibold">{image.title}</p>
                    {image.category && (
                        <span className="inline-block mt-1 px-3 py-1 bg-white/10 rounded-lg text-white/70 text-xs font-semibold uppercase tracking-wide">
                            {image.category.name}
                        </span>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-2">
                        <p className="text-white/40 text-xs">
                            {currentIndex + 1} / {images.length}
                        </p>
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(image); }}
                                className="text-white/50 hover:text-white transition-colors"
                                aria-label="Modifier cette image"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Next button */}
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                aria-label="Image suivante"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>
    );
}
