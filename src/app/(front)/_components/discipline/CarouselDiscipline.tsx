'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DisciplineCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Remplace ces images par tes vraies photos de kick boxing
    const images = [
        {
            src: '/1.webp',
            alt: 'Kick Boxing - Photo 1'
        },
        {
            src: '/2.jpg',
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
        <div className="border-4 border-brand-red rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg h-[500px] flex items-center justify-center relative overflow-hidden">
            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
                {/* Image principale */}
                <div className="relative w-full aspect-video"> {/* Utilise aspect-ratio pour être sûr */}
                    <img src={images[currentIndex].src} alt={images[currentIndex].alt} className="w-full h-full object-cover" />
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
                    {images.map((_, index) => (
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