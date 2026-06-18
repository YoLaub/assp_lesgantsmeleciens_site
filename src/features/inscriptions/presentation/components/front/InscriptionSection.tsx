"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { CloudImage } from '@/shared/components/CloudImage';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';
import AdherentForm from "@/features/adherents/presentation/components/front/AdherentForm";
import { demanderLienRenouvellementAction } from "@/features/adherents/actions/mon-dossier.actions";

interface PrefillData {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone1?: string;
    dateDeNaissance?: string;
    membreId?: string;
}

interface ConfigTarifs {
    saison: string;
    tarifEnfant: number;
    tarifAdos: number;
    tarifAdulte: number;
    supplementOxygene: number;
}

interface InscriptionSectionProps {
    prefill?: PrefillData;
    image?: CloudinaryAsset;
    blurDataUrl?: string;
    configTarifs?: ConfigTarifs | null;
}


export default function InscriptionSection({ prefill, image, blurDataUrl, configTarifs }: InscriptionSectionProps) {
    const [isOpen, setIsOpen] = useState(!!prefill); // auto-open si pré-remplissage (conversion)

    // ─── Renouvellement ───────────────────────────────────────────────────────
    // Sécurité : on ne récupère plus les données par email (exposition de PII).
    // On envoie un lien d'accès au dossier, qui n'arrive que dans la boîte du
    // propriétaire ; il y retrouve et reporte ses informations en toute sécurité.
    const [showRenouvellement, setShowRenouvellement] = useState(false);
    const [renouvEmail, setRenouvEmail] = useState('');
    const [renouvLoading, setRenouvLoading] = useState(false);
    const [renouvError, setRenouvError] = useState<string | null>(null);
    const [renouvSent, setRenouvSent] = useState(false);
    const hcaptchaRef = useRef<HCaptcha>(null);
    const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
    const [formPrefill] = useState<PrefillData | undefined>(prefill);
    const [readonlyFields] = useState<('nom' | 'prenom' | 'email' | 'dateDeNaissance')[]>(
        prefill ? ['nom', 'prenom', 'email', 'dateDeNaissance'] : []
    );

    const handleDemanderLien = async () => {
        if (!renouvEmail || !hcaptchaToken) return;
        setRenouvLoading(true);
        setRenouvError(null);
        const result = await demanderLienRenouvellementAction({ email: renouvEmail, hcaptchaToken });
        setRenouvLoading(false);
        hcaptchaRef.current?.resetCaptcha();
        setHcaptchaToken(null);
        if (result.success) {
            setRenouvSent(true);
        } else {
            setRenouvError(result.error ?? 'Erreur lors de la demande');
        }
    };

    return (
        <section className="py-16 bg-white w-full">
            <div className="max-w-6xl mx-auto px-4">

                {/* Titre de section */}
                <h2 className="text-center text-2xl md:text-3xl font-bold tracking-widest uppercase mb-16 text-gray-900">
                    Rejoignez Nous !
                </h2>

                {/* Contenu principal : 2 colonnes (Image à gauche, Texte à droite) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">

                    {/* Colonne Gauche : Image + Lignes rouges */}
                    <div className="flex flex-col items-center w-full">
                        <div className="w-3/4 h-0.5 bg-[#E33535] mb-8"></div> {/* Ligne rouge haut */}
                        <div className="relative w-full aspect-4/3 rounded-sm overflow-hidden bg-gray-100 shadow-md">
                            {image ? (
                                <CloudImage
                                    asset={image}
                                    alt="Enfants en cours de boxe"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    crop="fill"
                                    className="object-cover"
                                    blurDataUrl={blurDataUrl}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200" />
                            )}
                        </div>
                        <div className="w-3/4 h-0.5 bg-[#E33535] mt-8"></div>
                    </div>

                    {/* Colonne Droite : Tarifs et Modalités */}
                    <div className="flex flex-col space-y-12 text-center lg:text-left">

                        {/* Bloc Tarifs */}
                        <div>
                            <h3 className="text-xl font-bold tracking-[0.2em] mb-6 text-gray-900">TARIFS {configTarifs?.saison}</h3>
                            <ul className="space-y-3 text-sm font-semibold text-gray-800">
                                {configTarifs ? (
                                    <>
                                        <li>Enfants : {configTarifs.tarifEnfant}€</li>
                                        {configTarifs.tarifAdos === configTarifs.tarifAdulte ? (
                                            <li>Ados / Adultes : {configTarifs.tarifAdos}€</li>
                                        ) : (
                                            <>
                                                <li>Ados : {configTarifs.tarifAdos}€</li>
                                                <li>Adultes : {configTarifs.tarifAdulte}€</li>
                                            </>
                                        )}
                                        {configTarifs.supplementOxygene > 0 && (
                                            <li>Partenariat Oxygène : +{configTarifs.supplementOxygene}€</li>
                                        )}
                                    </>
                                ) : (
                                    <li className="text-gray-400">Tarifs non disponibles</li>
                                )}
                            </ul>
                        </div>

                        {/* Bloc Modalités */}
                        <div className="flex flex-col items-center lg:items-start">
                            <h3 className="text-xl font-bold tracking-[0.2em] mb-4 text-gray-900">
                                MODALITÉS<br />D&apos;INSCRIPTIONS
                            </h3>
                            <ul className="text-[11px] leading-relaxed text-gray-600 max-w-sm text-justify space-y-2">
                                <li>
                                    <span className="font-semibold text-gray-800">3 cours d&apos;essai offerts</span> avant tout engagement — venez tester gratuitement avant de vous inscrire.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Cours à la carte</span> - Votre inscription vous donne accès à tout les cours proposé.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Partenariat Oxygène</span> — inscrivez-vous simultanément au club Oxygène et bénéficiez d&apos;un tarif préférentiel{configTarifs?.supplementOxygene ? ` (+${configTarifs.supplementOxygene}€ seulement)` : ''}.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bouton d'action (Toggle Formulaire) */}
                <div className="flex justify-center relative z-10">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-[#FF8A00] hover:bg-[#e67a00] text-white font-bold py-3 px-10 rounded-full transition-all duration-300 uppercase tracking-widest shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        {isOpen ? "Fermer le formulaire" : "Inscription directe"}
                    </button>
                </div>

                {/* Le Formulaire avec Animation de Déploiement */}
                <div
                    className={`grid transition-all duration-700 ease-in-out origin-top ${
                        isOpen ? "grid-rows-[1fr] opacity-100 mt-8" : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                >
                    <div className="overflow-hidden">
                        <div className="pt-8 border-t border-gray-200">

                            {/* ── Banner essai ──────────────────────────────────────── */}
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                                <p className="text-amber-800 font-bold uppercase text-sm tracking-tight flex-1">
                                    Offre : 3 cours d&apos;essai avant inscription !
                                </p>
                                <Link
                                    href="/essai"
                                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-amber-600 transition-colors self-start sm:self-auto"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    <span>Je tente l&apos;essai</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* ── Séparateur "OU" ───────────────────────────────────── */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-4 text-gray-500 font-medium uppercase tracking-widest">Ou</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-inner">

                                {/* ── Bouton Renouvellement ────────────────────────────── */}
                                <div className="mb-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => { setShowRenouvellement(!showRenouvellement); setRenouvError(null); }}
                                        className="border border-[#FF8A00] text-[#FF8A00] text-sm px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        Renouvellement
                                    </button>
                                </div>

                                {/* ── Panneau renouvellement (lien d'accès sécurisé) ────── */}
                                {showRenouvellement && (
                                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                                        {renouvSent ? (
                                            <p className="text-sm text-green-700 font-medium">
                                                Si un dossier correspond à cet email, un lien d&apos;accès vient d&apos;y être envoyé.
                                                Ouvrez-le pour retrouver et reporter vos informations.
                                            </p>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-orange-900">
                                                    Renouvellement : recevez un lien d&apos;accès à votre dossier de l&apos;année précédente.
                                                </p>
                                                <input
                                                    type="email"
                                                    value={renouvEmail}
                                                    onChange={(e) => setRenouvEmail(e.target.value)}
                                                    placeholder="Votre email de l'année dernière"
                                                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                                                />
                                                <HCaptcha
                                                    ref={hcaptchaRef}
                                                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? "10000000-ffff-ffff-ffff-000000000001"}
                                                    onVerify={(t) => setHcaptchaToken(t)}
                                                    onExpire={() => setHcaptchaToken(null)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleDemanderLien}
                                                    disabled={renouvLoading || !renouvEmail || !hcaptchaToken}
                                                    className="bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    {renouvLoading ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            Envoi…
                                                        </span>
                                                    ) : "Recevoir le lien d'accès"}
                                                </button>
                                                {renouvError && (
                                                    <p className="text-sm text-red-600">{renouvError}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                <AdherentForm
                                    prefill={formPrefill}
                                    readonlyFields={readonlyFields}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
