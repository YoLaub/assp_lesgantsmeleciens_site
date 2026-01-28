import React from 'react';
import { Edit2, Trash2, Eye, MoveVertical } from 'lucide-react';

/**
 * Données simulées (Mock)
 * Ces données seront injectées via les Use Cases dans l'étape suivante.
 */
const disciplinesMock = [
    { id: '1', title: 'Boxe Anglaise', coach: 'Sara', category: 'Tous niveaux', active: true },
    { id: '2', title: 'Muay Thaï', coach: 'Tony', category: 'Ados/Adultes', active: true },
    { id: '3', title: 'Kickboxing', coach: 'Tony', category: 'Ados/Adultes', active: false },
];

export const DisciplineManager: React.FC = () => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Ordre</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Discipline</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Coach</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {disciplinesMock.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                                    <MoveVertical className="w-4 h-4" />
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-900">{item.title}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{item.coach}</td>
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
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
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