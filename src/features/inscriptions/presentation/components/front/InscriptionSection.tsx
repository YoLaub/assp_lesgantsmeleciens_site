"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { CloudImage } from '@/shared/components/CloudImage';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';
import AdherentForm from "@/features/adherents/presentation/components/front/AdherentForm";
import { rechercherMembreParEmailAction } from "@/features/adherents/actions/mon-dossier.actions";

interface PrefillData {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone1?: string;
    dateDeNaissance?: string;
    membreId?: number;
}

interface InscriptionSectionProps {
    prefill?: PrefillData;
    image?: CloudinaryAsset;
    blurDataUrl?: string;
}


export default function InscriptionSection({ prefill, image, blurDataUrl }: InscriptionSectionProps) {
    const [isOpen, setIsOpen] = useState(!!prefill); // auto-open si pré-remplissage (conversion)

    // ─── Renouvellement ───────────────────────────────────────────────────────
    const [showRenouvellement, setShowRenouvellement] = useState(false);
    const [renouvEmail, setRenouvEmail] = useState('');
    const [renouvLoading, setRenouvLoading] = useState(false);
    const [renouvError, setRenouvError] = useState<string | null>(null);
    const [renouvSuccess, setRenouvSuccess] = useState(false);
    const [formPrefill, setFormPrefill] = useState<PrefillData | undefined>(prefill);
    const [readonlyFields, setReadonlyFields] = useState<('nom' | 'prenom' | 'email' | 'dateDeNaissance')[]>(
        prefill ? ['nom', 'prenom', 'email', 'dateDeNaissance'] : []
    );

    const handleImporter = async () => {
        if (!renouvEmail) return;
        setRenouvLoading(true);
        setRenouvError(null);
        const result = await rechercherMembreParEmailAction(renouvEmail);
        setRenouvLoading(false);
        if (result.success && result.data) {
            const d = result.data;
            const dob = d.dateDeNaissance instanceof Date
                ? d.dateDeNaissance.toISOString().split('T')[0]
                : String(d.dateDeNaissance).split('T')[0];
            setFormPrefill({
                nom: d.nom,
                prenom: d.prenom,
                email: d.email,
                telephone1: d.telephone ?? undefined,
                dateDeNaissance: dob,
            });
            setReadonlyFields(['nom', 'prenom', 'email', 'dateDeNaissance']);
            setRenouvSuccess(true);
            setTimeout(() => {
                setShowRenouvellement(false);
                setRenouvSuccess(false);
            }, 1500);
        } else {
            setRenouvError(result.error ?? 'Erreur lors de la recherche');
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
                            <h3 className="text-xl font-bold tracking-[0.2em] mb-6 text-gray-900">TARIFS</h3>
                            <ul className="space-y-3 text-sm font-semibold text-gray-800">
                                <li>Tarifs : Enfants (2011-2020) : 80€</li>
                                <li>Ados/adultes (&lt;2010) : 140€</li>
                                <li>Partenariat Oxygène : + 40€</li>
                            </ul>
                        </div>

                        {/* Bloc Modalités */}
                        <div className="flex flex-col items-center lg:items-start">
                            <h3 className="text-xl font-bold tracking-[0.2em] mb-4 text-gray-900">
                                MODALITÉS<br />D&apos;INSCRIPTIONS
                            </h3>
                            <p className="text-[11px] leading-relaxed text-gray-600 mb-6 max-w-sm text-justify">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                            <button type="button" className="border border-[#E33535] text-gray-700 text-xs px-6 py-2 rounded-sm hover:bg-red-50 transition-colors duration-300">
                                Voir plus
                            </button>
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
                                    Offre : 3 cours d'essai avant inscription !
                                </p>
                                <Link
                                    href="/essai"
                                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-amber-600 transition-colors self-start sm:self-auto"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    <span>Je tente l'essai</span>
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

                                {/* ── Panneau import renouvellement ─────────────────────── */}
                                {showRenouvellement && (
                                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                                        <p className="text-sm font-medium text-orange-900">Importez vos informations depuis votre dossier précédent</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={renouvEmail}
                                                onChange={(e) => setRenouvEmail(e.target.value)}
                                                placeholder="Votre email de l'année dernière"
                                                className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleImporter}
                                                disabled={renouvLoading || !renouvEmail}
                                                className="bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                                            >
                                                {renouvLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Import…
                                                    </span>
                                                ) : 'Importer'}
                                            </button>
                                        </div>
                                        {renouvSuccess && (
                                            <p className="text-sm text-green-700 font-medium">Importation réussie ✓</p>
                                        )}
                                        {renouvError && (
                                            <p className="text-sm text-red-600">{renouvError}</p>
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
