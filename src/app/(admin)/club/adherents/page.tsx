import { Download } from 'lucide-react';
import { InscriptionsRepositoryImpl } from '@/features/inscriptions/data/repositories/inscriptions.repository.impl';
import { InscriptionsTable } from '@/features/inscriptions/presentation/components/admin/InscriptionsTable';

// Server Component
export default async function AdminAdherentsPage() {
    const repo = new InscriptionsRepositoryImpl();
    const adherents = await repo.getAll();

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Gestion des Adhérents</h1>
                    <p className="text-slate-500 text-sm">Consultez et validez les dossiers d'inscription.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Le composant UI prend le relais */}
            <InscriptionsTable adherents={adherents} />
        </div>
    );
}