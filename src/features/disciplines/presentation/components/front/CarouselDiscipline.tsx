'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Image } from '@/features/gallery/domain/models/image.model';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';

interface DisciplineCarouselProps {
    images: Image[];
    imageOrder: string[];
    disciplineName: string;
}

export default function DisciplineCarousel({ images, imageOrder, disciplineName }: DisciplineCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const sortedImages = [...images].sort((a, b) => {
        const aIdx = imageOrder.indexOf(a.id);
        const bIdx = imageOrder.indexOf(b.id);
        return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
    });

    if (sortedImages.length === 0) {
        return null;
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const currentImage = sortedImages[currentIndex];

    return (
        <div className="w-full border-4 border-brand-red rounded-3xl p-3 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg h-95 sm:h-125 flex items-center justify-center relative overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Image principale */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    <CloudImage
                        asset={toCloudinaryAsset(currentImage)}
                        alt={currentImage.alt || `Photo de ${disciplineName}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-cover"
                        blurDataUrl={currentImage.blurDataUrl}
                    />
                </div>

                {/* Bouton Précédent */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
                    aria-label="Image précédente"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Bouton Suivant */}
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
                    aria-label="Image suivante"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Indicateurs de pagination (dots) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {sortedImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-brand-red w-8'
                                    : 'bg-white/60 hover:bg-white/80'
                            }`}
                            aria-label={`Aller à l'image ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Numéro en arrière-plan */}
                <div className="absolute right-4 bottom-4 text-9xl font-bold text-gray-200 opacity-30 pointer-events-none">
                    {currentIndex + 1}
                </div>
            </div>
        </div>
    );
}
