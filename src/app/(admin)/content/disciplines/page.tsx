import React from 'react';
import {Plus, Search, Filter} from 'lucide-react';
import { DisciplineManager } from '@/features/disciplines/presentation/components/DisciplineManager';
import Link from "next/link";

export default function AdminDisciplinesPage() {
    return (
        <div className="p-8 space-y-8 font-sans">
            {/* En-tête de la section CMS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Catalogue Disciplines</h1>
                    <p className="text-slate-500 text-sm">Gérez les descriptions, tarifs et visuels affichés sur le site.</p>
                </div>

                <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95">
                    <Plus className="w-5 h-5" />
                    <Link
                        href={`/content/disciplines/new`}
                    >
                        Ajouter une discipline
                    </Link>

                </button>
            </div>

            {/* Barre d'outils CMS (Recherche et Filtres) */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une discipline..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                </div>
                <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filtrer
                </button>
            </div>

            {/* Le Gestionnaire de contenu (Composant de Feature) */}
            <DisciplineManager />
        </div>
    );
}