"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { getMonEssaiAction, requestAccesEssaiAction } from "@/features/essayants/actions/essayants.actions";

// ─── Compteur de présences ────────────────────────────────────────────────────

function PresenceCounter({ nombrePresences }: { nombrePresences: number }) {
    const dots = [0, 1, 2].map((i) => (
        <span key={i} className={`text-2xl ${i < nombrePresences ? "text-[#FF8A00]" : "text-gray-300"}`}>●</span>
    ));

    const messages: Record<number, string> = {
        0: "Votre premier cours d'essai vous attend !",
        1: "Plus que 2 cours d'essai avant de rejoindre le club.",
        2: "Plus qu'un cours d'essai — vous pouvez déjà vous inscrire !",
        3: "Vos cours d'essai sont terminés. Rejoignez le club !",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center space-y-3">
            <p className="text-sm text-gray-500">Cours d&apos;essai effectués</p>
            <div className="flex justify-center gap-2">{dots}</div>
            <p className="text-sm font-medium text-gray-800">
                {messages[Math.min(nombrePresences, 3)]}
            </p>
            <p className="text-xs text-gray-400">({nombrePresences} / 3)</p>
        </div>
    );
}

// ─── Étape 1 — Identification ─────────────────────────────────────────────────

function IdentificationEssayantForm() {
    const hcaptchaRef = useRef<HCaptcha>(null);
    const [email, setEmail] = useState("");
    const [numeroAdherent, setNumeroAdherent] = useState("");
    const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hcaptchaToken) { setError("Veuillez compléter le captcha."); return; }
        setSubmitting(true);
        const result = await requestAccesEssaiAction({ email, numeroAdherent, hcaptchaToken });
        hcaptchaRef.current?.resetCaptcha();
        setHcaptchaToken(null);
        setSubmitting(false);
        if (result.success) setSubmitted(true);
        else setError(result.error ?? "Erreur");
    };

    if (submitted) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-700 font-medium">
                    Si ces informations correspondent à un profil, un email vient d&apos;être envoyé.
                </p>
            </div>
        );
    }

    const inputCls = "mt-1 w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]";

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Accéder à mon suivi d&apos;essai</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Numéro</label>
                <input required value={numeroAdherent} onChange={(e) => setNumeroAdherent(e.target.value.toUpperCase())} placeholder="ex. ADH-X7K2P" className={inputCls} />
            </div>
            <div className="flex justify-center">
                <HCaptcha
                    ref={hcaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? "10000000-ffff-ffff-ffff-000000000001"}
                    onVerify={(t) => setHcaptchaToken(t)}
                    onExpire={() => setHcaptchaToken(null)}
                />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button type="submit" disabled={submitting || !hcaptchaToken} className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors">
                {submitting ? "Envoi…" : "Recevoir mon lien d'accès"}
            </button>
        </form>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface EssayantData {
    id: string;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    nombrePresences: number;
    accesBloque: boolean;
}

export default function MonEssaiView({ token }: { token?: string }) {
    const [essayant, setEssayant] = useState<EssayantData | null>(null);
    const [loading, setLoading] = useState(!!token);
    const [tokenError, setTokenError] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!token) return;
        getMonEssaiAction(token).then((result) => {
            setLoading(false);
            if (result.success && result.essayant) {
                setEssayant(result.essayant as EssayantData);
            } else {
                setTokenError(true);
            }
        });
    }, [token]);

    if (!token || showForm) {
        return (
            <main className="min-h-screen bg-gray-50 py-20 px-4">
                <IdentificationEssayantForm />
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 py-20 px-4 flex items-center justify-center">
                <p className="text-gray-500">Chargement…</p>
            </main>
        );
    }

    if (tokenError) {
        return (
            <main className="min-h-screen bg-gray-50 py-20 px-4">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <p className="text-red-700 font-medium">Ce lien est invalide ou a expiré.</p>
                    <button type="button" onClick={() => setShowForm(true)} className="bg-black text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors">
                        Faire une nouvelle demande
                    </button>
                </div>
            </main>
        );
    }

    if (!essayant) return null;

    return (
        <main className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-md mx-auto space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Bonjour {essayant.prenom} !</h1>
                    <p className="text-sm text-gray-500">{essayant.numeroAdherent}</p>
                </div>

                {/* Lien inscription — toujours visible dès l'accès au suivi */}
                {token && (
                    <Link
                        href={`/inscription?conversion=${essayant.numeroAdherent}&token=${token}`}
                        className={`block w-full text-center font-bold py-3 rounded-lg transition-colors ${
                            essayant.accesBloque
                                ? "bg-[#FF8A00] hover:bg-[#e67a00] text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Créer mon dossier d&apos;inscription
                    </Link>
                )}

                <PresenceCounter nombrePresences={essayant.nombrePresences} />

                {essayant.accesBloque && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                        Vos cours d&apos;essai sont terminés. Complétez votre inscription pour continuer à pratiquer.
                    </div>
                )}
            </div>
        </main>
    );
}
