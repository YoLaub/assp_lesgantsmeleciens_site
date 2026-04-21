"use client";

import { useEffect, useState, useTransition } from "react";
import { getEssayantsForCoachAction, pointerPresenceAction } from "@/features/essayants/actions/essayants.actions";

interface EssayantCoach {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    nombrePresences: number;
    accesBloque: boolean;
    presences: { pointeLe: Date }[];
}

function PresenceDots({ n }: { n: number }) {
    return (
        <span className="inline-flex gap-1">
            {[0, 1, 2].map((i) => (
                <span key={i} className={`text-lg ${i < n ? "text-[#FF8A00]" : "text-slate-600"}`}>●</span>
            ))}
        </span>
    );
}

export default function CoachDashboard({ coachToken }: { coachToken: string }) {
    const [essayants, setEssayants] = useState<EssayantCoach[]>([]);
    const [loading, setLoading] = useState(true);
    const [tokenInvalid, setTokenInvalid] = useState(false);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [nomCoach, setNomCoach] = useState("");
    const [nomCoachSet, setNomCoachSet] = useState(false);

    useEffect(() => {
        getEssayantsForCoachAction(coachToken).then((result) => {
            setLoading(false);
            if (result.success && result.essayants) {
                setEssayants(result.essayants as EssayantCoach[]);
            } else {
                setTokenInvalid(true);
            }
        });
    }, [coachToken]);

    const handlePointer = (id: number) => {
        if (!nomCoachSet || !nomCoach.trim()) return;
        setPendingId(id);
        startTransition(async () => {
            const result = await pointerPresenceAction(id, coachToken, nomCoach.trim());
            if (result.success) {
                setEssayants((prev) =>
                    prev.map((e) =>
                        e.id === id
                            ? { ...e, nombrePresences: result.nombrePresences ?? e.nombrePresences, accesBloque: (result.nombrePresences ?? e.nombrePresences) >= 3 }
                            : e
                    )
                );
            }
            setPendingId(null);
        });
    };

    if (tokenInvalid) {
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                <p className="text-white font-medium text-center">Ce lien n'est plus valide. Contactez l'administrateur.</p>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                <p className="text-slate-400">Chargement…</p>
            </main>
        );
    }

    const filtered = essayants.filter((e) =>
        `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">Tableau de bord coach</h1>
                <p className="text-slate-400 text-sm">Pointez les présences des essayants.</p>
            </div>

            {/* Nom du coach */}
            {!nomCoachSet ? (
                <div className="bg-slate-800 rounded-xl p-4 space-y-3 max-w-sm">
                    <label className="block text-sm font-medium text-slate-300">Votre nom (pour traçabilité)</label>
                    <input
                        value={nomCoach}
                        onChange={(e) => setNomCoach(e.target.value)}
                        placeholder="Prénom Nom"
                        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
                    />
                    <button
                        type="button"
                        onClick={() => nomCoach.trim() && setNomCoachSet(true)}
                        disabled={!nomCoach.trim()}
                        className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-slate-600 text-white font-bold py-2 rounded-lg transition-colors text-sm"
                    >
                        Confirmer
                    </button>
                </div>
            ) : (
                <p className="text-sm text-slate-400">Coach : <span className="text-white font-medium">{nomCoach}</span></p>
            )}

            {/* Barre de recherche */}
            <input
                type="search"
                placeholder="Rechercher un essayant…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm bg-slate-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
            />

            {/* Liste */}
            <div className="space-y-3">
                {filtered.map((e) => (
                    <div key={e.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="font-bold text-white">{e.prenom} {e.nom}</p>
                            <div className="flex items-center gap-3">
                                <PresenceDots n={e.nombrePresences} />
                                {e.presences[0] && (
                                    <span className="text-xs text-slate-400">
                                        Dernière : {new Date(e.presences[0].pointeLe).toLocaleDateString("fr-FR")}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handlePointer(e.id)}
                            disabled={e.accesBloque || isPending || !nomCoachSet}
                            title={e.accesBloque ? "3/3 — inscription en cours" : undefined}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shrink-0 ${
                                e.accesBloque
                                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    : "bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-slate-600 text-white"
                            }`}
                        >
                            {e.accesBloque ? "3/3 — inscription en cours" : pendingId === e.id ? "…" : "Pointer présence"}
                        </button>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-8">Aucun essayant trouvé.</p>
                )}
            </div>
        </main>
    );
}
