'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DisciplineCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const images = [
        {
            src: '/1.webp',
            alt: 'Kick Boxing - Photo 1'
        },
        {
            src: '/2.webp',
            alt: 'Kick Boxing - Photo 2'
        },
        {
            src: '/3.avif',
            alt: 'Kick Boxing - Photo 3'
        }
    ];

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="border-2 md:border-6 border-brand-red rounded-2xl md:rounded-3xl  bg-linear-to-br from-gray-50 to-gray-100 shadow-lg md:h-125 flex items-center justify-center relative overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Image principale */}
                <div className="relative w-full">
                    <img
                        src={images[currentIndex].src}
                        alt={images[currentIndex].alt}
                        className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                    />
                </div>

                {/* Bouton Précédent */}
                <button
                    onClick={goToPrevious}
                    className="hidden md:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 active:scale-95"
                    aria-label="Image précédente"
                >
                    <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                </button>

                {/* Bouton Suivant */}
                <button
                    onClick={goToNext}
                    className="hidden md:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 active:scale-95"
                    aria-label="Image suivante"
                >
                    <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                </button>

                {/* Indicateurs de pagination (dots) */}
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-brand-red w-6 md:w-8'
                                    : 'bg-white/60 hover:bg-white/80 w-2 md:w-3'
                            }`}
                            aria-label={`Aller à l'image ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Numéro en arrière-plan - masqué sur mobile */}
                <div className="hidden md:block absolute right-4 bottom-4 text-9xl font-bold text-gray-200 opacity-30 pointer-events-none">
                    {currentIndex + 1}
                </div>

                {/* Numéro en arrière-plan version mobile - plus petit */}
                <div className="block md:hidden absolute right-2 bottom-2 text-5xl font-bold text-gray-200 opacity-20 pointer-events-none">
                    {currentIndex + 1}
                </div>
            </div>
        </div>
    );
}