"use client";

import { useState, useTransition } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { genererCoachTokenAction } from "@/features/essayants/actions/essayants.actions";

interface TokenData {
    id: number;
    expireLe: Date;
    actif: boolean;
    url: string;
}

export function CoachTokenManager({ tokenData }: { tokenData: TokenData | null }) {
    const [current, setCurrent] = useState(tokenData);
    const [isPending, startTransition] = useTransition();
    const [copied, setCopied] = useState(false);

    const handleGenerer = () => {
        startTransition(async () => {
            const result = await genererCoachTokenAction();
            if (result.success && result.url && result.expireLe) {
                setCurrent({
                    id: Date.now(),
                    expireLe: result.expireLe,
                    actif: true,
                    url: result.url,
                });
            }
        });
    };

    const handleCopier = () => {
        if (!current) return;
        navigator.clipboard.writeText(current.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            {/* Statut du lien actuel */}
            <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Statut du lien actuel</p>
                {current ? (
                    <div className="space-y-3">
                        <p className={`text-sm font-medium ${current.actif ? "text-green-600" : "text-red-600"}`}>
                            {current.actif
                                ? `Actif jusqu'au ${new Date(current.expireLe).toLocaleString("fr-FR")}`
                                : "Expiré"}
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value={current.url}
                                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 truncate"
                            />
                            <button
                                type="button"
                                onClick={handleCopier}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
                                title="Copier le lien"
                            >
                                <Copy className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        {copied && <p className="text-xs text-green-600">✓ Lien copié !</p>}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic">Aucun lien généré.</p>
                )}
            </div>

            {/* Avertissement */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
                ⚠️ Générer un nouveau lien révoque immédiatement l'ancien. Les coachs utilisant l'ancien lien seront déconnectés.
            </div>

            <button
                type="button"
                onClick={handleGenerer}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
                <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                {isPending ? "Génération…" : "Générer un nouveau lien"}
            </button>
        </div>
    );
}
