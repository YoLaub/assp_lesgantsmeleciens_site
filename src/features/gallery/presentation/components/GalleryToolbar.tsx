'use client';

import { Search, MousePointer2, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { IMAGE_CATEGORIES } from '@/features/gallery/domain/models/gallery-category.model';

export type ViewMode = 'masonry' | 'list';
export type SortField = 'date' | 'title' | 'category';
export type SortDirection = 'asc' | 'desc';

const SORT_OPTIONS: { label: string; field: SortField; direction: SortDirection }[] = [
    { label: 'Date (récent)', field: 'date', direction: 'desc' },
    { label: 'Date (ancien)', field: 'date', direction: 'asc' },
    { label: 'Titre A→Z', field: 'title', direction: 'asc' },
    { label: 'Titre Z→A', field: 'title', direction: 'desc' },
    { label: 'Catégorie', field: 'category', direction: 'asc' },
];

interface GalleryToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    selectionMode: boolean;
    onSelectionModeChange: (mode: boolean) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    sortField: SortField;
    sortDirection: SortDirection;
    onSortChange: (field: SortField, direction: SortDirection) => void;
}

export function GalleryToolbar({
    searchQuery,
    onSearchChange,
    activeCategory,
    onCategoryChange,
    selectionMode,
    onSelectionModeChange,
    viewMode,
    onViewModeChange,
    sortField,
    sortDirection,
    onSortChange,
}: GalleryToolbarProps) {
    const currentSortKey = `${sortField}-${sortDirection}`;

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
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
                <div className="flex flex-wrap gap-2">
                    {/* Sort dropdown */}
                    <div className="relative">
                        <select
                            value={currentSortKey}
                            onChange={(e) => {
                                const opt = SORT_OPTIONS.find(
                                    (o) => `${o.field}-${o.direction}` === e.target.value,
                                );
                                if (opt) onSortChange(opt.field, opt.direction);
                            }}
                            className="appearance-none pl-8 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-semibold
                                       text-slate-600 hover:bg-slate-200 transition-all cursor-pointer
                                       focus:ring-2 focus:ring-red-500 outline-none"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={`${opt.field}-${opt.direction}`} value={`${opt.field}-${opt.direction}`}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* View mode toggle */}
                    <div className="flex bg-slate-100 rounded-xl p-0.5">
                        <button
                            onClick={() => onViewModeChange('masonry')}
                            className={`p-2 rounded-lg transition-all
                                ${viewMode === 'masonry'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            aria-label="Vue grille"
                            title="Vue grille"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`p-2 rounded-lg transition-all
                                ${viewMode === 'list'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            aria-label="Vue liste"
                            title="Vue liste"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => onSelectionModeChange(!selectionMode)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all
                            ${selectionMode
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        aria-label="Mode sélection"
                        title="Mode sélection"
                    >
                        <MousePointer2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Sélection</span>
                    </button>
                </div>
            </div>

            {/* Category filter chips */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onCategoryChange(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${activeCategory === null
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                >
                    Tout
                </button>
                {IMAGE_CATEGORIES.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => onCategoryChange(
                            activeCategory === cat.slug ? null : cat.slug
                        )}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${activeCategory === cat.slug
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
