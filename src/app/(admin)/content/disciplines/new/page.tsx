import React from 'react';
import { DisciplineForm } from '@/features/disciplines/presentation/components/DisciplineForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateDisciplinePage() {
    return (
        <div className="p-8 space-y-8 font-sans max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/content/disciplines" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Créer un section discipline</h1>
                    <p className="text-slate-500 text-sm">Ajouter les informations générales et SEO.</p>
                </div>
            </div>

            <DisciplineForm />
        </div>
    );
}