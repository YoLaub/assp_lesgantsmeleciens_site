'use client';

import { useState, useTransition } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { Actualite } from '@/features/actualites/domain/models/actualite.model';
import { ActualiteTableRow } from './ActualiteTableRow';
import { reorderActualitesAction } from '@/app/admin/content/actions/actions';

interface ActualiteTableProps {
    initialActualites: Actualite[];
}

export function ActualiteTable({ initialActualites }: ActualiteTableProps) {
    const [actualites, setActualites] = useState(initialActualites);
    const [, startTransition] = useTransition();

    function handleReorder(fromIndex: number, toIndex: number) {
        const snapshot = [...actualites];

        const reordered = [...actualites];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        setActualites(reordered);

        const items = reordered.map((a, i) => ({ id: a.id, order: i }));

        startTransition(async () => {
            const result = await reorderActualitesAction(items);
            if (!result.success) {
                setActualites(snapshot);
            }
        });
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[3rem_1fr_10rem_6rem_8rem_8rem] items-center bg-slate-50/50 border-b border-slate-100 text-slate-400">
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Ordre</div>
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Titre</div>
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Tags</div>
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">À la une</div>
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Statut</div>
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</div>
            </div>

            {/* Sortable rows */}
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) return;
                    const { source } = event.operation;
                    if (isSortable(source)) {
                        const { initialIndex, index } = source;
                        if (initialIndex !== index) {
                            handleReorder(initialIndex, index);
                        }
                    }
                }}
            >
                <div>
                    {actualites.map((actualite, index) => (
                        <ActualiteTableRow
                            key={actualite.id}
                            actualite={actualite}
                            index={index}
                        />
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}
