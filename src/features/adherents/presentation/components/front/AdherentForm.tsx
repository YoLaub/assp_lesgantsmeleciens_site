"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { createAdherentAction } from "@/features/adherents/actions/create-adherent.actions";
import { getConfigTarifsAction } from "@/features/adherents/actions/config-tarifs.actions";

// ─── Schéma de validation ─────────────────────────────────────────────────────

const FormSchema = z.object({
    nom: z.string().min(1, "Champ requis"),
    prenom: z.string().min(1, "Champ requis"),
    dateDeNaissance: z.string().refine((d) => !isNaN(Date.parse(d)) && new Date(d) < new Date(), {
        message: "Date invalide ou dans le futur",
    }),
    sexe: z.enum(["M", "F", "autre"], { error: "Champ requis" }),
    email: z.string().email({ message: "Email invalide" }),
    telephone1: z.string().min(6, "Champ requis"),
    oxygene: z.boolean().optional(),
    couponSport: z.boolean().optional(),
    bonCaf: z.boolean().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dateStr: string): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdherentFormProps {
    prefill?: {
        nom?: string;
        prenom?: string;
        email?: string;
        telephone1?: string;
        dateDeNaissance?: string;
        numeroAdherentExistant?: string;
        essayantId?: number;
    };
    readonlyFields?: (keyof FormValues)[];
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdherentForm({ prefill, readonlyFields = [] }: AdherentFormProps) {
    const hcaptchaRef = useRef<HCaptcha>(null);
    const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
    const [config, setConfig] = useState<{
        tarifEnfant: number;
        tarifAdos: number;
        tarifAdulte: number;
        supplementOxygene: number;
        deductionCouponSport: number;
    } | null>(null);
    const [successInfo, setSuccessInfo] = useState<{ numeroAdherent: string } | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        getConfigTarifsAction().then((c) => {
            if (c) setConfig({
                tarifEnfant: Number(c.tarifEnfant),
                tarifAdos: Number(c.tarifAdos),
                tarifAdulte: Number(c.tarifAdulte),
                supplementOxygene: Number(c.supplementOxygene),
                deductionCouponSport: Number(c.deductionCouponSport),
            });
        });
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            nom: prefill?.nom ?? "",
            prenom: prefill?.prenom ?? "",
            email: prefill?.email ?? "",
            telephone1: prefill?.telephone1 ?? "",
            dateDeNaissance: prefill?.dateDeNaissance ?? "",
            oxygene: false,
            couponSport: false,
            bonCaf: false,
        },
    });

    const watchedValues = watch();
    const age = calcAge(watchedValues.dateDeNaissance ?? "");
    const isReadonly = (field: keyof FormValues) => readonlyFields.includes(field);

    // Calcul du montant estimé
    const montantEstime = (() => {
        if (!config || age === null) return null;
        const categorie = age < 12 ? "enfant" : age < 18 ? "ados" : "adulte";
        const base = age < 12 ? config.tarifEnfant : age < 18 ? config.tarifAdos : config.tarifAdulte;
        let total = base;
        if (watchedValues.oxygene) total += config.supplementOxygene;
        if (watchedValues.couponSport) total -= config.deductionCouponSport;
        return { base, total, categorie };
    })();

    const onSubmit = async (data: FormValues) => {
        setServerError(null);

        if (!hcaptchaToken) {
            setServerError("Veuillez compléter le captcha.");
            return;
        }

        const result = await createAdherentAction({
            nom: data.nom,
            prenom: data.prenom,
            dateDeNaissance: data.dateDeNaissance,
            sexe: data.sexe,
            email: data.email,
            telephone1: data.telephone1,
            oxygene: data.oxygene ?? false,
            couponSport: data.couponSport ?? false,
            bonCaf: data.bonCaf ?? false,
            hcaptchaToken,
            essayantId: prefill?.essayantId,
            numeroAdherentExistant: prefill?.numeroAdherentExistant,
        });

        hcaptchaRef.current?.resetCaptcha();
        setHcaptchaToken(null);

        if (result.success && result.numeroAdherent) {
            setSuccessInfo({ numeroAdherent: result.numeroAdherent });
        } else {
            setServerError(result.error ?? "Une erreur est survenue.");
        }
    };

    // ─── Message de succès ────────────────────────────────────────────────────

    if (successInfo) {
        return (
            <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Dossier créé !</h3>
                <p className="text-gray-700">
                    Votre numéro d'adhérent est{" "}
                    <strong className="text-[#FF8A00]">{successInfo.numeroAdherent}</strong> — conservez-le.
                </p>
                <p className="text-sm text-gray-500">
                    Un email vient d'être envoyé avec un lien pour compléter votre dossier (questionnaire de santé, documents, paiement).
                </p>
            </div>
        );
    }

    // ─── Formulaire ───────────────────────────────────────────────────────────

    const inputCls = "mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-center mb-2 text-gray-900">Dossier d'inscription</h3>

            {/* ── Identité ─────────────────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Prénom <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("prenom")}
                            readOnly={isReadonly("prenom")}
                            className={`${inputCls} ${isReadonly("prenom") ? "bg-gray-100" : ""}`}
                        />
                        {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("nom")}
                            readOnly={isReadonly("nom")}
                            className={`${inputCls} ${isReadonly("nom") ? "bg-gray-100" : ""}`}
                        />
                        {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Date de naissance <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...register("dateDeNaissance")}
                            readOnly={isReadonly("dateDeNaissance")}
                            className={`${inputCls} ${isReadonly("dateDeNaissance") ? "bg-gray-100" : ""}`}
                            max={new Date().toISOString().split("T")[0]}
                        />
                        {age !== null && <p className="text-xs text-gray-500 mt-1">Âge : {age} ans</p>}
                        {errors.dateDeNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateDeNaissance.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Sexe <span className="text-red-500">*</span>
                        </label>
                        <select {...register("sexe")} className={inputCls}>
                            <option value="">-- Choisir --</option>
                            <option value="M">Homme</option>
                            <option value="F">Femme</option>
                            <option value="autre">Autre</option>
                        </select>
                        {errors.sexe && <p className="text-red-500 text-xs mt-1">{errors.sexe.message}</p>}
                    </div>
                </div>
            </div>

            {/* ── Contact ───────────────────────────────────────────────────── */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register("email")}
                            readOnly={isReadonly("email")}
                            className={`${inputCls} ${isReadonly("email") ? "bg-gray-100" : ""}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            {...register("telephone1")}
                            readOnly={isReadonly("telephone1")}
                            className={`${inputCls} ${isReadonly("telephone1") ? "bg-gray-100" : ""}`}
                        />
                        {errors.telephone1 && <p className="text-red-500 text-xs mt-1">{errors.telephone1.message}</p>}
                    </div>
                </div>
            </div>

            {/* ── Options & estimation du tarif ─────────────────────────────── */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">Options & réductions</p>

                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" {...register("oxygene")} className="mt-0.5 text-[#FF8A00] focus:ring-[#FF8A00]" />
                    <span className="text-sm text-gray-700">
                        Option Oxygène
                        {config && <span className="text-gray-500"> (+{config.supplementOxygene.toFixed(2)} €)</span>}
                    </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" {...register("couponSport")} className="mt-0.5 text-[#FF8A00] focus:ring-[#FF8A00]" />
                    <span className="text-sm text-gray-700">
                        Je bénéficie du Pass Sport
                        {config && <span className="text-gray-500"> (−{config.deductionCouponSport.toFixed(2)} €)</span>}
                    </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" {...register("bonCaf")} className="mt-0.5 text-[#FF8A00] focus:ring-[#FF8A00]" />
                    <span className="text-sm text-gray-700">
                        Je bénéficie d'une aide CAF{" "}
                        <span className="text-gray-500">(remboursement direct CAF, aucun impact sur le montant)</span>
                    </span>
                </label>

                {/* Estimation dynamique */}
                {montantEstime !== null && (
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-1">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Estimation du tarif</p>
                        <div className="flex justify-between text-gray-700">
                            <span>Tarif de base ({montantEstime.categorie})</span>
                            <span>{montantEstime.base.toFixed(2)} €</span>
                        </div>
                        {watchedValues.oxygene && config && (
                            <div className="flex justify-between text-gray-700">
                                <span>+ Option Oxygène</span>
                                <span>{config.supplementOxygene.toFixed(2)} €</span>
                            </div>
                        )}
                        {watchedValues.couponSport && config && (
                            <div className="flex justify-between text-gray-700">
                                <span>− Pass Sport</span>
                                <span>−{config.deductionCouponSport.toFixed(2)} €</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-300">
                            <span>Estimation totale</span>
                            <span>{montantEstime.total.toFixed(2)} €</span>
                        </div>
                        <p className="text-xs text-gray-400 pt-1">
                            Le questionnaire de santé et le mode de paiement seront à compléter dans votre dossier.
                        </p>
                    </div>
                )}
            </div>

            {/* ── hCaptcha ─────────────────────────────────────────────────── */}
            <div className="pt-6 border-t border-gray-200 flex flex-col items-center gap-4">
                <HCaptcha
                    ref={hcaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? "10000000-ffff-ffff-ffff-000000000001"}
                    onVerify={(token) => setHcaptchaToken(token)}
                    onExpire={() => setHcaptchaToken(null)}
                />

                {serverError && (
                    <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {serverError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || !hcaptchaToken}
                    className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {isSubmitting ? "Envoi en cours..." : "Créer mon dossier"}
                </button>
            </div>
        </form>
    );
}
