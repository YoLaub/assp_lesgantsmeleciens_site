'use client';

import { useState, useTransition } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { Discipline } from '@/features/disciplines/domain/models/discipline.model';
import { DisciplineTableRow } from './DisciplineTableRow';
import { reorderDisciplinesAction } from '@/app/admin/content/actions/actions';

interface DisciplineTableProps {
    initialDisciplines: Discipline[];
}

export function DisciplineTable({ initialDisciplines }: DisciplineTableProps) {
    const [disciplines, setDisciplines] = useState(initialDisciplines);
    const [, startTransition] = useTransition();

    function handleReorder(fromIndex: number, toIndex: number) {
        const snapshot = [...disciplines];

        const reordered = [...disciplines];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        setDisciplines(reordered);

        const items = reordered.map((d, i) => ({ id: d.id, order: i }));

        startTransition(async () => {
            const result = await reorderDisciplinesAction(items);
            if (!result.success) {
                setDisciplines(snapshot);
            }
        });
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[3rem_1fr_10rem_8rem_8rem] items-center bg-slate-50/50 border-b border-slate-100 text-slate-400">
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Ordre</div>
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Discipline</div>
                <div className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Coach</div>
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
                    {disciplines.map((discipline, index) => (
                        <DisciplineTableRow
                            key={discipline.id}
                            discipline={discipline}
                            index={index}
                        />
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}
