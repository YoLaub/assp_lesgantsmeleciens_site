import React from 'react';
import { Edit2, Trash2, Star } from 'lucide-react';
import Link from "next/link";
import { getAllActualitesAction } from "@/app/admin/content/actions/actions";

export const ActualiteManager = async () => {
    const result = await getAllActualitesAction();

    if (!result.success || !result.actualites) {
        return <div>Erreur lors du chargement des actualités</div>;
    }

    const actualites = result.actualites;
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Titre</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Tags</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">À la une</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {actualites.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-900">{item.title}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{item.tags.join(', ')}</td>
                            <td className="px-6 py-4">
                                {item.featured && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                        <Star className="w-3 h-3" /> À la une
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                                        {item.active ? 'En ligne' : 'Brouillon'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/admin/content/actualites/${item.id}`}
                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
