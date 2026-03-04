import React from 'react';
import { ActualiteForm } from '@/features/actualites/presentation/components/admin/ActualiteForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateActualitePage() {
    return (
        <div className="p-8 space-y-8 font-sans max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/content/actualites" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Créer une actualité</h1>
                    <p className="text-slate-500 text-sm">Ajouter le contenu, les images et le SEO.</p>
                </div>
            </div>

            <ActualiteForm />
        </div>
    );
}
