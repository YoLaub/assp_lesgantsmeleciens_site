'use client';

import { forwardRef } from 'react';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { getCategoryLabel } from '@/features/gallery/domain/models/gallery-category.model';

interface GalleryListRowProps {
    image: GalleryImage;
    isSelected: boolean;
    isDragging?: boolean;
    dragHandleProps?: Record<string, unknown>;
    onToggleSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onClick: (e: React.MouseEvent) => void;
    style?: React.CSSProperties;
}

export const GalleryListRow = forwardRef<HTMLTableRowElement, GalleryListRowProps>(
    function GalleryListRow(
        { image, isSelected, isDragging, dragHandleProps, onToggleSelect, onEdit, onDelete, onClick, style },
        ref,
    ) {
        return (
            <tr
                ref={ref}
                style={style}
                className={`group transition-colors cursor-pointer
                    ${isDragging ? 'bg-slate-100 opacity-50' : ''}
                    ${isSelected ? 'bg-red-50' : 'hover:bg-slate-50'}`}
                onClick={onClick}
            >
                {/* Drag handle */}
                <td className="pl-3 pr-0 py-3 w-8">
                    <button
                        {...dragHandleProps}
                        className="p-1 rounded text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Réorganiser"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                </td>

                {/* Checkbox */}
                <td className="pl-1 pr-2 py-3 w-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
                        className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    />
                </td>

                {/* Thumbnail */}
                <td className="px-2 py-3 w-20">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                            src={image.src}
                            alt={image.alt || image.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </td>

                {/* Title */}
                <td className="px-3 py-3">
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                        {image.title}
                    </p>
                    {image.alt && (
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{image.alt}</p>
                    )}
                </td>

                {/* Category */}
                <td className="px-3 py-3">
                    {image.category && (
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600">
                            {getCategoryLabel(image.category)}
                        </span>
                    )}
                </td>

                {/* Dimensions */}
                <td className="px-3 py-3 hidden lg:table-cell">
                    {image.width && image.height ? (
                        <span className="text-xs text-slate-400">
                            {image.width} × {image.height}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-300">—</span>
                    )}
                </td>

                {/* Date */}
                <td className="px-3 py-3 hidden md:table-cell">
                    {image.createdAt ? (
                        <span className="text-xs text-slate-400">
                            {new Date(image.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-300">—</span>
                    )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                            aria-label={`Modifier ${image.title}`}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
                            aria-label={`Supprimer ${image.title}`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    },
);
