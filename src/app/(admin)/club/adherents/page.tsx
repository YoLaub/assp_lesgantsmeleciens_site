import React from 'react';
import { Users, Filter, Download } from 'lucide-react';
import { InscriptionsRepositoryImpl } from '@/features/inscriptions/data/repositories/inscriptions.repository.impl';

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

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Adhérent</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Paiement</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {adherents.map((adh) => (
                        <tr key={adh.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                                <p className="font-bold text-slate-900">{adh.firstName} {adh.lastName}</p>
                                <p className="text-xs text-slate-500">{adh.email}</p>
                            </td>
                            <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        adh.status === 'VALIDATED' ? 'bg-emerald-50 text-emerald-600' :
                                            adh.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {adh.status}
                                    </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                {adh.paymentMethod}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                                {new Date().toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest">
                                    Détails
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}