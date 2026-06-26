"use client";

import { useState, useTransition } from "react";
import { updateAssociationAction, type AssociationData } from "@/features/association/actions/association.actions";

const champ = (v: string | null | undefined) => v ?? "";

export function AssociationForm({ asso }: { asso: AssociationData }) {
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [values, setValues] = useState({
        email: champ(asso.email),
        telephone: champ(asso.telephone),
        lieu: champ(asso.lieu),
        president: champ(asso.president),
        secretaire: champ(asso.secretaire),
        viceSecretaire: champ(asso.viceSecretaire),
        tresorier: champ(asso.tresorier),
        viceTresoriere: champ(asso.viceTresoriere),
        instagramUrl: champ(asso.instagramUrl),
        xUrl: champ(asso.xUrl),
        youtubeUrl: champ(asso.youtubeUrl),
    });

    const set = (key: keyof typeof values, value: string) =>
        setValues((v) => ({ ...v, [key]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        startTransition(async () => {
            const result = await updateAssociationAction(values);
            if (result.success) setSuccess(true);
            else setError(result.error ?? "Erreur");
        });
    };

    const inputCls = "mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300";
    const labelCls = "block text-sm font-medium text-slate-700";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Coordonnées */}
            <fieldset className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <legend className="text-sm font-bold uppercase tracking-widest text-slate-500 px-2">Coordonnées</legend>
                <div>
                    <label htmlFor="email" className={labelCls}>E-mail</label>
                    <input id="email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} required className={inputCls} />
                </div>
                <div>
                    <label htmlFor="telephone" className={labelCls}>Téléphone (WhatsApp)</label>
                    <input id="telephone" value={values.telephone} onChange={(e) => set("telephone", e.target.value)} required className={inputCls} />
                </div>
                <div>
                    <label htmlFor="lieu" className={labelCls}>Lieu / adresse</label>
                    <input id="lieu" value={values.lieu} onChange={(e) => set("lieu", e.target.value)} required className={inputCls} />
                </div>
            </fieldset>

            {/* Bureau */}
            <fieldset className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <legend className="text-sm font-bold uppercase tracking-widest text-slate-500 px-2">Le bureau</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="president" className={labelCls}>Président</label>
                        <input id="president" value={values.president} onChange={(e) => set("president", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label htmlFor="secretaire" className={labelCls}>Secrétaire</label>
                        <input id="secretaire" value={values.secretaire} onChange={(e) => set("secretaire", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label htmlFor="viceSecretaire" className={labelCls}>Vice-secrétaire</label>
                        <input id="viceSecretaire" value={values.viceSecretaire} onChange={(e) => set("viceSecretaire", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label htmlFor="tresorier" className={labelCls}>Trésorier</label>
                        <input id="tresorier" value={values.tresorier} onChange={(e) => set("tresorier", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label htmlFor="viceTresoriere" className={labelCls}>Vice-trésorière</label>
                        <input id="viceTresoriere" value={values.viceTresoriere} onChange={(e) => set("viceTresoriere", e.target.value)} className={inputCls} />
                    </div>
                </div>
            </fieldset>

            {/* Réseaux sociaux */}
            <fieldset className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <legend className="text-sm font-bold uppercase tracking-widest text-slate-500 px-2">Réseaux sociaux</legend>
                <p className="text-xs text-slate-400">URL complète (https://…) ou laisser vide pour masquer l&apos;icône.</p>
                <div>
                    <label htmlFor="instagramUrl" className={labelCls}>Instagram</label>
                    <input id="instagramUrl" type="url" placeholder="https://instagram.com/…" value={values.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label htmlFor="xUrl" className={labelCls}>X (Twitter)</label>
                    <input id="xUrl" type="url" placeholder="https://x.com/…" value={values.xUrl} onChange={(e) => set("xUrl", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label htmlFor="youtubeUrl" className={labelCls}>YouTube</label>
                    <input id="youtubeUrl" type="url" placeholder="https://youtube.com/…" value={values.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} className={inputCls} />
                </div>
            </fieldset>

            {success && <p className="text-green-600 text-sm">✓ Informations de l&apos;association sauvegardées.</p>}
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
