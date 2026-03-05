"use client";

import { useState } from "react";
import { Inscription } from "@/features/inscriptions/domain/models/inscriptions.model";
import { StatusBadge } from "./StatusBadge";
import { InscriptionDetailDrawer } from "./InscriptionDetailDrawer";

interface InscriptionsTableProps {
    adherents: Inscription[];
}

export function InscriptionsTable({ adherents }: InscriptionsTableProps) {
    // État pour stocker l'adhérent dont on veut voir les détails
    const [selectedAdherent, setSelectedAdherent] = useState<Inscription | null>(null);

    return (
        <>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Adhérent</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Paiement</th>
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
                                <StatusBadge status={adh.status} />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                {adh.paymentMethod}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {/* Le bouton déclenche l'ouverture du tiroir */}
                                <button
                                    onClick={() => setSelectedAdherent(adh)}
                                    className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors"
                                >
                                    Détails
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Si un adhérent est sélectionné, on affiche le composant tiroir */}
            {selectedAdherent && (
                <InscriptionDetailDrawer
                    adherent={selectedAdherent}
                    onClose={() => setSelectedAdherent(null)}
                />
            )}
        </>
    );
}