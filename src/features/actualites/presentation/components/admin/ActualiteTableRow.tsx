'use client';

import { Edit2, Trash2, Star, MoveVertical } from 'lucide-react';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/react/sortable';
import { Actualite } from '@/features/actualites/domain/models/actualite.model';

interface ActualiteTableRowProps {
    actualite: Actualite;
    index: number;
}

export function ActualiteTableRow({ actualite, index }: ActualiteTableRowProps) {
    const { ref, handleRef, isDragging } = useSortable({ id: actualite.id, index });

    return (
        <div
            ref={ref}
            className={`grid grid-cols-[3rem_1fr_10rem_6rem_8rem_8rem] items-center
                group transition-colors border-b border-slate-50
                ${isDragging ? 'bg-slate-100 opacity-50 z-50' : 'hover:bg-slate-50/50'}`}
        >
            {/* Drag handle */}
            <div className="px-6 py-4">
                <button
                    ref={handleRef}
                    className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Réorganiser"
                >
                    <MoveVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Title */}
            <div className="px-6 py-4">
                <span className="font-bold text-slate-900">{actualite.title}</span>
            </div>

            {/* Tags */}
            <div className="px-6 py-4 text-sm text-slate-600">{actualite.tags.join(', ')}</div>

            {/* Featured */}
            <div className="px-6 py-4">
                {actualite.featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3" /> À la une
                    </span>
                )}
            </div>

            {/* Status */}
            <div className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${actualite.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {actualite.active ? 'En ligne' : 'Brouillon'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        href={`/admin/content/actualites/${actualite.id}`}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
