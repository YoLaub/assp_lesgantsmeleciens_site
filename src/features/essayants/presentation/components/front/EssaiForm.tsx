"use client";

import { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { createEssayantAction } from "@/features/essayants/actions/essayants.actions";

export default function EssaiForm() {
    const hcaptchaRef = useRef<HCaptcha>(null);
    const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [values, setValues] = useState({ nom: "", prenom: "", email: "", telephone: "", dateDeNaissance: "" });
    const set = (k: keyof typeof values, v: string) => setValues((p) => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hcaptchaToken) { setError("Veuillez compléter le captcha."); return; }
        setSubmitting(true);
        setError(null);

        const result = await createEssayantAction({ ...values, hcaptchaToken });

        hcaptchaRef.current?.resetCaptcha();
        setHcaptchaToken(null);
        setSubmitting(false);

        if (result.success && result.numeroAdherent) {
            setSuccess(result.numeroAdherent);
        } else {
            setError(result.error ?? "Erreur lors de l'inscription.");
        }
    };

    if (success) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Bienvenue !</h2>
                <p className="text-gray-700">
                    Votre numéro est <strong className="text-[#FF8A00]">{success}</strong>.{" "}
                    Conservez-le — il vous permettra de suivre vos cours d'essai et deviendra votre numéro d'adhérent si vous rejoignez le club.
                </p>
                <p className="text-sm text-gray-500">Un email de confirmation vient d'être envoyé.</p>
            </div>
        );
    }

    const inputCls = "mt-1 w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]";

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                    <input required value={values.prenom} onChange={(e) => set("prenom", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                    <input required value={values.nom} onChange={(e) => set("nom", e.target.value)} className={inputCls} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input type="email" required value={values.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                <input type="tel" required value={values.telephone} onChange={(e) => set("telephone", e.target.value)} className={inputCls} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Date de naissance <span className="text-red-500">*</span></label>
                <input type="date" required value={values.dateDeNaissance} onChange={(e) => set("dateDeNaissance", e.target.value)} max={new Date().toISOString().split("T")[0]} className={inputCls} />
            </div>

            <div className="flex justify-center pt-2">
                <HCaptcha
                    ref={hcaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? "10000000-ffff-ffff-ffff-000000000001"}
                    onVerify={(t) => setHcaptchaToken(t)}
                    onExpire={() => setHcaptchaToken(null)}
                />
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button
                type="submit"
                disabled={submitting || !hcaptchaToken}
                className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
            >
                {submitting ? "Inscription…" : "Je m'inscris pour les cours d'essai"}
            </button>
        </form>
    );
}
