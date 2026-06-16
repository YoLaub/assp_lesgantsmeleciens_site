"use client";

import { useState, useTransition } from "react";
import { updateConfigTarifsAction } from "@/features/adherents/actions/config-tarifs.actions";

interface ConfigData {
    id: number;
    saison: string;
    tarifEnfant: unknown;
    tarifAdos: unknown;
    tarifAdulte: unknown;
    supplementOxygene: unknown;
    deductionCouponSport: unknown;
    modifieLe: Date;
    modifiePar: string | null;
}

export function ConfigTarifsForm({ config }: { config: ConfigData | null }) {
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [values, setValues] = useState({
        saison: config?.saison ?? "",
        tarifEnfant: config ? Number(config.tarifEnfant) : 0,
        tarifAdulte: config ? Number(config.tarifAdulte) : 0,
        supplementOxygene: config ? Number(config.supplementOxygene) : 45,
        deductionCouponSport: config ? Number(config.deductionCouponSport) : 50,
    });

    const set = (key: keyof typeof values, value: string) =>
        setValues((v) => ({ ...v, [key]: key === "saison" ? value : Number(value) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        startTransition(async () => {
            const result = await updateConfigTarifsAction({ ...values, tarifAdos: values.tarifAdulte });
            if (result.success) setSuccess(true);
            else setError(result.error ?? "Erreur");
        });
    };

    const inputCls = "mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300";

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div>
                <label htmlFor="saison" className="block text-sm font-medium text-slate-700">Saison (ex. Mi-Saison 2025-2026)</label>
                <input id="saison" value={values.saison} onChange={(e) => set("saison", e.target.value)} required className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="tarifEnfant" className="block text-sm font-medium text-slate-700">Tarif enfant (€)</label>
                    <input id="tarifEnfant" type="number" step="0.01" min="0" value={values.tarifEnfant} onChange={(e) => set("tarifEnfant", e.target.value)} required className={inputCls} />
                </div>
                <div>
                    <label htmlFor="tarifAdulte" className="block text-sm font-medium text-slate-700">Tarif ados/adulte (€)</label>
                    <input id="tarifAdulte" type="number" step="0.01" min="0" value={values.tarifAdulte} onChange={(e) => set("tarifAdulte", e.target.value)} required className={inputCls} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="supplementOxygene" className="block text-sm font-medium text-slate-700">Supplément Oxygène (€)</label>
                    <input id="supplementOxygene" type="number" step="0.01" min="0" value={values.supplementOxygene} onChange={(e) => set("supplementOxygene", e.target.value)} required className={inputCls} />
                </div>
                <div>
                    <label htmlFor="deductionCouponSport" className="block text-sm font-medium text-slate-700">Déduction Pass Sport (€)</label>
                    <input id="deductionCouponSport" type="number" step="0.01" min="0" value={values.deductionCouponSport} onChange={(e) => set("deductionCouponSport", e.target.value)} required className={inputCls} />
                </div>
            </div>

            {config && (
                <p className="text-xs text-slate-400">
                    Dernière modification : {new Date(config.modifieLe).toLocaleString("fr-FR")}
                    {config.modifiePar && ` par ${config.modifiePar}`}
                </p>
            )}

            {success && <p className="text-green-600 text-sm">✓ Tarifs sauvegardés.</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
                {isPending ? "Sauvegarde…" : "Sauvegarder"}
            </button>
        </form>
    );
}
