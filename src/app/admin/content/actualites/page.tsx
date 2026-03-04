export const dynamic = "force-dynamic";

import React from 'react';
import { Plus } from 'lucide-react';
import { ActualiteManager } from '@/features/actualites/presentation/components/admin/ActualiteManager';
import Link from "next/link";

export default function AdminActualitesPage() {
    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Actualités</h1>
                    <p className="text-slate-500 text-sm">Gérez les articles et actualités du club.</p>
                </div>

                <Link
                    href="/admin/content/actualites/new"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter une actualité
                </Link>
            </div>

            <ActualiteManager />
        </div>
    );
}
