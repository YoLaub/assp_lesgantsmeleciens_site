export const dynamic = "force-dynamic";

import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export default async function AdminEssayantsPage() {
    const rawEssayants = await inscriptionRepository.findAllEssayants();

    const essayants = rawEssayants.map((e) => ({
        id: e.id,
        nom: e.membre.nom,
        prenom: e.membre.prenom,
        numeroAdherent: e.membre.numeroAdherent,
        nombrePresences: e.nombrePresences,
        accesBloque: e.accesBloque,
        dateCreation: e.membre.dateCreation,
        presences: (e as { presences?: { pointeLe: Date }[] }).presences ?? [],
    }));

    const dernierEssaiCount = essayants.filter((e) => e.nombrePresences === 2 && !e.accesBloque).length;
    const aConverterCount = essayants.filter((e) => e.accesBloque).length;

    return (
        <div className="p-8 space-y-8 font-sans">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Essayants</h1>
                <p className="text-slate-500 text-sm">{essayants.length} profil(s) enregistré(s).</p>
            </div>

            {/* Alertes */}
            <div className="flex flex-col sm:flex-row gap-4">
                {dernierEssaiCount > 0 && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl">
                        <span className="text-2xl font-black text-orange-600">{dernierEssaiCount}</span>
                        <div>
                            <p className="text-sm font-bold text-orange-800">Dernier essai en cours</p>
                            <p className="text-xs text-orange-600">
                                {dernierEssaiCount === 1 ? "Cet essayant" : "Ces essayants"} arrive{dernierEssaiCount === 1 ? "" : "nt"} au bout — pensez à les relancer pour l'inscription.
                            </p>
                        </div>
                    </div>
                )}
                {aConverterCount > 0 && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
                        <span className="text-2xl font-black text-red-600">{aConverterCount}</span>
                        <div>
                            <p className="text-sm font-bold text-red-800">À convertir en adhérent</p>
                            <p className="text-xs text-red-600">Essais terminés — accès bloqué jusqu'à inscription.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Essayant</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Présences</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Dernière présence</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Statut</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Inscrit le</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {essayants.map((e) => {
                            const isDernierEssai = e.nombrePresences === 2 && !e.accesBloque;
                            return (
                                <tr key={e.id} className={`hover:bg-slate-50 transition-colors ${isDernierEssai ? "bg-orange-50/40" : ""}`}>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{e.prenom} {e.nom}</p>
                                        <p className="text-xs text-slate-400">{e.numeroAdherent}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <span key={i} className={`text-lg ${i < e.nombrePresences ? "text-[#FF8A00]" : "text-slate-200"}`}>●</span>
                                            ))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {e.presences[0] ? new Date(e.presences[0].pointeLe).toLocaleDateString("fr-FR") : "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {e.accesBloque ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">À convertir</span>
                                        ) : isDernierEssai ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700">⚠ Dernier essai</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">En cours</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {new Date(e.dateCreation).toLocaleDateString("fr-FR")}
                                    </td>
                                </tr>
                            );
                        })}
                        {essayants.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                                    Aucun essayant enregistré.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
