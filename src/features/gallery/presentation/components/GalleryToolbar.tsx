'use client';

import { Search, Plus } from 'lucide-react';

interface GalleryToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAdd: () => void;
}

export function GalleryToolbar({ searchQuery, onSearchChange, onAdd }: GalleryToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher une image..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm
                               focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
            </div>
            <button
                onClick={onAdd}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl
                           font-bold text-sm flex items-center gap-2 transition-all
                           shadow-lg shadow-red-600/20 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                Ajouter une image
            </button>
        </div>
    );
}
