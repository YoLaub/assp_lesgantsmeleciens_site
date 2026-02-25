'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { GalleryListRow } from './GalleryListRow';

interface GalleryListViewProps {
    images: GalleryImage[];
    selectedIds: Set<string>;
    hasSelection: boolean;
    onCardClick: (id: string, index: number, e: React.MouseEvent) => void;
    onToggleSelect: (id: string) => void;
    onEdit: (image: GalleryImage) => void;
    onDelete: (id: string) => void;
    onSelectAll: () => void;
    onReorder: (fromId: string, toId: string) => void;
}

function SortableRow({
    image,
    index,
    isSelected,
    onCardClick,
    onToggleSelect,
    onEdit,
    onDelete,
}: {
    image: GalleryImage;
    index: number;
    isSelected: boolean;
    onCardClick: (id: string, index: number, e: React.MouseEvent) => void;
    onToggleSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <GalleryListRow
            ref={setNodeRef}
            style={style}
            image={image}
            isSelected={isSelected}
            isDragging={isDragging}
            dragHandleProps={{ ...attributes, ...listeners }}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={(e) => onCardClick(image.id, index, e)}
        />
    );
}

export function GalleryListView({
    images,
    selectedIds,
    hasSelection,
    onCardClick,
    onToggleSelect,
    onEdit,
    onDelete,
    onSelectAll,
    onReorder,
}: GalleryListViewProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor),
    );

    if (images.length === 0) {
        return (
            <div className="text-center py-16 px-8 text-slate-400 text-lg">
                Aucune image pour le moment. Cliquez sur &laquo; Ajouter &raquo; pour commencer.
            </div>
        );
    }

    const allSelected = images.length > 0 && images.every((img) => selectedIds.has(img.id));

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            onReorder(active.id as string, over.id as string);
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="pl-3 pr-0 py-3 w-8" />
                            <th className="pl-1 pr-2 py-3 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                            </th>
                            <th className="px-2 py-3 w-20" />
                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Titre
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Catégorie
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                                Dimensions
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                                Date
                            </th>
                            <th className="px-4 py-3 w-24" />
                        </tr>
                    </thead>
                    <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
                        <tbody className="divide-y divide-slate-50">
                            {images.map((image, index) => (
                                <SortableRow
                                    key={image.id}
                                    image={image}
                                    index={index}
                                    isSelected={selectedIds.has(image.id)}
                                    onCardClick={onCardClick}
                                    onToggleSelect={() => onToggleSelect(image.id)}
                                    onEdit={() => onEdit(image)}
                                    onDelete={() => onDelete(image.id)}
                                />
                            ))}
                        </tbody>
                    </SortableContext>
                </table>
            </DndContext>
        </div>
    );
}
