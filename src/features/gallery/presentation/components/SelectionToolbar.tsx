'use client';

import { Trash2, CheckSquare, XSquare } from 'lucide-react';

interface SelectionToolbarProps {
    selectedCount: number;
    onDelete: () => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
}

export function SelectionToolbar({
    selectedCount,
    onDelete,
    onSelectAll,
    onClearSelection,
}: SelectionToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white
                        rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl
                        animate-[fadeSlideUp_0.3s_ease-out]"
        >
            <span className="text-sm font-semibold">
                {selectedCount} image{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
            </span>

            <div className="h-5 w-px bg-slate-700" />

            <button
                onClick={onSelectAll}
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                aria-label="Tout sélectionner"
            >
                <CheckSquare className="w-4 h-4" />
                Tout
            </button>

            <button
                onClick={onClearSelection}
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                aria-label="Annuler la sélection"
            >
                <XSquare className="w-4 h-4" />
                Annuler
            </button>

            <div className="h-5 w-px bg-slate-700" />

            <button
                onClick={onDelete}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white
                           px-4 py-1.5 rounded-xl text-sm font-bold transition-colors"
                aria-label="Supprimer la sélection"
            >
                <Trash2 className="w-4 h-4" />
                Supprimer
            </button>
        </div>
    );
}
