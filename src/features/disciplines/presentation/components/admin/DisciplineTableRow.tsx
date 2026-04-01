'use client';

import { Edit2, Trash2, Eye, MoveVertical } from 'lucide-react';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/react/sortable';
import { Discipline } from '@/features/disciplines/domain/models/discipline.model';

interface DisciplineTableRowProps {
    discipline: Discipline;
    index: number;
}

export function DisciplineTableRow({ discipline, index }: DisciplineTableRowProps) {
    const { ref, handleRef, isDragging } = useSortable({ id: discipline.id, index });

    return (
        <div
            ref={ref}
            className={`grid grid-cols-[3rem_1fr_10rem_8rem_8rem] items-center
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
                <span className="font-bold text-slate-900">{discipline.title}</span>
            </div>

            {/* Coach */}
            <div className="px-6 py-4 text-sm text-slate-600">{discipline.coach}</div>

            {/* Status */}
            <div className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${discipline.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {discipline.active ? 'En ligne' : 'Brouillon'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                    </button>
                    <Link
                        href={`/admin/content/disciplines/${discipline.id}`}
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
