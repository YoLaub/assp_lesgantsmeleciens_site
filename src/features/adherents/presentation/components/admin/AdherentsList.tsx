"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type StatutDocument = "non_fourni" | "declare" | "valide";

interface AdherentRow {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    categorie: string;
    montantSnapshot: number | null;
    typePaiement: string | null;
    inscriptionValide: boolean;
    dateInscription: Date;
    reglementSigne: StatutDocument;
    certificatMedical: StatutDocument;
    certificatMedicalReq: boolean;
    autorisationParentale: StatutDocument;
    couponSport: StatutDocument;
    bonCaf: StatutDocument;
    dateDeNaissance: Date;
}

function calcAge(dateDeNaissance: Date): number {
    const today = new Date();
    let age = today.getFullYear() - new Date(dateDeNaissance).getFullYear();
    const m = today.getMonth() - new Date(dateDeNaissance).getMonth();
    if (m < 0 || (m === 0 && today.getDate() < new Date(dateDeNaissance).getDate())) age--;
    return age;
}

function getStatutDossier(adh: AdherentRow): { label: string; color: string } {
    const mineur = calcAge(adh.dateDeNaissance) < 18;
    const documentsRequis: StatutDocument[] = [
        adh.reglementSigne,
        ...(adh.certificatMedicalReq ? [adh.certificatMedical] : []),
        ...(mineur ? [adh.autorisationParentale] : []),
    ];

    if (adh.inscriptionValide) return { label: "Validé", color: "bg-green-100 text-green-700" };
    if (documentsRequis.some((s) => s === "non_fourni")) return { label: "Incomplet", color: "bg-red-100 text-red-700" };
    if (documentsRequis.every((s) => s === "valide")) return { label: "Docs validés", color: "bg-blue-100 text-blue-700" };
    return { label: "En attente", color: "bg-orange-100 text-orange-700" };
}

export function AdherentsList({ adherents }: { adherents: AdherentRow[] }) {
    const [search, setSearch] = useState("");

    const filtered = adherents.filter((a) =>
        `${a.nom} ${a.prenom} ${a.numeroAdherent}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <input
                type="search"
                placeholder="Rechercher par nom, prénom ou numéro…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Adhérent</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Catégorie</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Montant</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Paiement</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Statut</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((adh) => {
                            const statut = getStatutDossier(adh);
                            return (
                                <tr key={adh.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="font-bold text-slate-900">{adh.prenom} {adh.nom}</p>
                                                <p className="text-xs text-slate-400">{adh.numeroAdherent}</p>
                                            </div>
                                            {adh.certificatMedicalReq && adh.certificatMedical !== "valide" && (
                                                <span title="Certificat médical en attente">
                                                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{adh.categorie}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                        {adh.montantSnapshot !== null ? `${Number(adh.montantSnapshot).toFixed(2)} €` : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {adh.typePaiement === "en_ligne" ? "En ligne" : adh.typePaiement === "sur_place" ? "Sur place" : "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statut.color}`}>
                                            {statut.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {new Date(adh.dateInscription).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/club/adherents/${adh.id}`}
                                            className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors"
                                        >
                                            Détails
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                                    Aucun adhérent trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
