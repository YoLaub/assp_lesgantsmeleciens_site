"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import { patchAdherentAction } from "@/features/adherents/actions/admin-adherents.actions";

type StatutDocument = "non_fourni" | "declare" | "valide";

interface Questionnaire {
    q1: boolean; q2: boolean; q3: boolean; q4: boolean; q5: boolean;
    q6: boolean; q7: boolean; q8: boolean; q9: boolean;
}

interface AdherentDetailData {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    dateDeNaissance: Date;
    sexe: string;
    categorie: string;
    email: string;
    telephone1: string | null;
    telephone2: string | null;
    adresse: string | null;
    codePostal: string | null;
    ville: string | null;
    oxygene: boolean;
    renouvellement: boolean;
    fnsmr: boolean;
    droitImage: boolean;
    reglementSigne: StatutDocument;
    certificatMedical: StatutDocument;
    certificatMedicalReq: boolean;
    autorisationParentale: StatutDocument;
    couponSport: StatutDocument;
    bonCaf: StatutDocument;
    montantSnapshot: number | null;
    typePaiement: string | null;
    inscriptionValide: boolean;
    dateInscription: Date;
    questionnaire: Questionnaire | null;
    documents: { id: string; type: string; url: string; name: string | null }[];
}


function StatutBadge({ statut }: { statut: StatutDocument }) {
    const config: Record<StatutDocument, { label: string; cls: string }> = {
        non_fourni: { label: "Non fourni", cls: "bg-gray-100 text-gray-600" },
        declare: { label: "Déclaré", cls: "bg-orange-100 text-orange-700" },
        valide: { label: "Validé", cls: "bg-green-100 text-green-700" },
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${config[statut].cls}`}>{config[statut].label}</span>;
}

function DocumentRow({
    label,
    statut,
    note,
    adherentId,
    field,
    documentUrl,
}: {
    label: string;
    statut: StatutDocument;
    note?: string;
    adherentId: number;
    field: string;
    documentUrl?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleValider = () => {
        startTransition(async () => {
            await patchAdherentAction(adherentId, { [field]: "valide" } as Parameters<typeof patchAdherentAction>[1]);
            router.refresh();
        });
    };

    const handleAnnuler = () => {
        startTransition(async () => {
            await patchAdherentAction(adherentId, { [field]: "declare" } as Parameters<typeof patchAdherentAction>[1]);
            router.refresh();
        });
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                {note && <p className="text-xs text-slate-400">{note}</p>}
            </div>
            <div className="flex items-center gap-3">
                <StatutBadge statut={statut} />
                {documentUrl && (
                    <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                        Voir
                    </a>
                )}
                {statut === "declare" && (
                    <button
                        type="button"
                        onClick={handleValider}
                        disabled={isPending}
                        className="text-xs font-bold text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                        Valider
                    </button>
                )}
                {statut === "valide" && (
                    <button
                        type="button"
                        onClick={handleAnnuler}
                        disabled={isPending}
                        className="text-xs font-bold text-orange-600 hover:text-orange-800 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </div>
    );
}

export function AdherentDetail({ adherent }: { adherent: AdherentDetailData }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [checkboxPending, setCheckboxPending] = useState<string | null>(null);

    const isMineur = (() => {
        const d = new Date(adherent.dateDeNaissance);
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age < 18;
    })();

    const handleToggleBoolean = async (field: "renouvellement", current: boolean) => {
        setCheckboxPending(field);
        await patchAdherentAction(adherent.id, { [field]: !current });
        setCheckboxPending(null);
        router.refresh();
    };

    const handleMarquerPaye = () => {
        startTransition(async () => {
            await patchAdherentAction(adherent.id, { inscriptionValide: true });
            router.refresh();
        });
    };

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                        {adherent.prenom} {adherent.nom}
                    </h1>
                    <p className="text-slate-400 text-sm">{adherent.numeroAdherent} · {adherent.categorie} · Inscrit le {new Date(adherent.dateInscription).toLocaleDateString("fr-FR")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ── Informations ── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Informations</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-slate-700">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <a href={`mailto:${adherent.email}`} className="hover:text-blue-600">{adherent.email}</a>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>
                                {adherent.telephone1
                                    ? `${adherent.telephone1}${adherent.telephone2 ? ` / ${adherent.telephone2}` : ""}`
                                    : <span className="text-slate-400 italic">Non renseigné</span>}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Né(e) le {new Date(adherent.dateDeNaissance).toLocaleDateString("fr-FR")} · {adherent.sexe}</span>
                        </div>
                        {adherent.adresse && (
                            <div className="flex items-start gap-3 text-slate-700">
                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                <span>{adherent.adresse}<br />{adherent.codePostal} {adherent.ville}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600 pt-2 border-t border-slate-100">
                            <span className="font-medium">Option Oxygène :</span>
                            {adherent.oxygene ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-medium">Droit à l'image :</span>
                            {adherent.droitImage ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                        </div>
                    </div>
                </div>

                {/* ── Questionnaire de santé ── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Questionnaire de santé</h2>
                    {adherent.questionnaire ? (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-400 italic">Les réponses sont confidentielles.</p>
                            <p className="text-sm font-medium text-slate-700">
                                Certificat médical requis :{" "}
                                <span className={adherent.certificatMedicalReq ? "text-orange-600 font-bold" : "text-green-600"}>
                                    {adherent.certificatMedicalReq ? "Oui" : "Non"}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Questionnaire non rempli.</p>
                    )}
                </div>

                {/* ── Validation documents ── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Documents</h2>
                    <div>
                        <DocumentRow label="Règlement intérieur" statut={adherent.reglementSigne} field="reglementSigne" adherentId={adherent.id} />
                        {adherent.certificatMedicalReq && (
                            <DocumentRow
                                label="Certificat médical"
                                statut={adherent.certificatMedical}
                                note="Requis suite au questionnaire"
                                field="certificatMedical"
                                adherentId={adherent.id}
                                documentUrl={adherent.documents.find((d) => d.type === "MEDICAL_CERTIFICATE")?.url}
                            />
                        )}
                        {isMineur && (
                            <DocumentRow label="Autorisation parentale" statut={adherent.autorisationParentale} field="autorisationParentale" adherentId={adherent.id} />
                        )}
                        {adherent.couponSport !== "non_fourni" && (
                            <DocumentRow label="Pass Sport" statut={adherent.couponSport} note="Déduction appliquée" field="couponSport" adherentId={adherent.id} />
                        )}
                        {adherent.bonCaf !== "non_fourni" && (
                            <DocumentRow label="Bon CAF" statut={adherent.bonCaf} note="Information uniquement — aucun impact montant" field="bonCaf" adherentId={adherent.id} />
                        )}
                        {adherent.documents.some((d) => d.type === "ID_PHOTO") && (
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <p className="text-sm font-medium text-slate-800">Photo d'identité</p>
                                <a
                                    href={adherent.documents.find((d) => d.type === "ID_PHOTO")!.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                >
                                    Voir
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FNSMR, renouvellement & paiement ── */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Options admin</h2>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={adherent.renouvellement}
                                onChange={() => handleToggleBoolean("renouvellement", adherent.renouvellement)}
                                disabled={checkboxPending === "renouvellement"}
                                className="rounded text-[#FF8A00] focus:ring-[#FF8A00]"
                            />
                            <span className="text-sm text-slate-700">Renouvellement</span>
                        </label>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Paiement</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Montant</span>
                                <span className="font-bold">{adherent.montantSnapshot !== null ? `${Number(adherent.montantSnapshot).toFixed(2)} €` : "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Mode</span>
                                <span>{adherent.typePaiement === "en_ligne" ? "En ligne" : "Sur place"}</span>
                            </div>
                        </div>
                        {adherent.typePaiement === "sur_place" && !adherent.inscriptionValide ? (
                            <button
                                type="button"
                                onClick={handleMarquerPaye}
                                disabled={isPending}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                            >
                                {isPending ? "En cours…" : "Marquer comme payé"}
                            </button>
                        ) : adherent.inscriptionValide ? (
                            <p className="text-center text-sm font-medium text-green-600">✓ Paiement reçu</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
