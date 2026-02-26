'use client';

import { ImagePlus } from 'lucide-react';

interface GalleryEmptyStateProps {
    onAdd: () => void;
}

export function GalleryEmptyState({ onAdd }: GalleryEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <ImagePlus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
                Aucune image
            </h3>
            <p className="text-sm text-slate-400 mb-6 text-center max-w-sm">
                Votre galerie est vide. Ajoutez vos premières photos pour commencer.
            </p>
            <button
                onClick={onAdd}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl
                           font-bold text-sm transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
                Ajouter des images
            </button>
        </div>
    );
}
