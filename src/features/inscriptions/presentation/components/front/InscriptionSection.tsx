"use client";

import { useState } from "react";
import { CloudImage } from '@/shared/components/CloudImage';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';
import AdherentForm from "@/features/adherents/presentation/components/front/AdherentForm";

interface PrefillData {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone1?: string;
    dateDeNaissance?: string;
    numeroAdherentExistant?: string;
    essayantId?: number;
}

interface InscriptionSectionProps {
    prefill?: PrefillData;
    image?: CloudinaryAsset;
    blurDataUrl?: string;
}


export default function InscriptionSection({ prefill,  image, blurDataUrl }: InscriptionSectionProps) {
    const [isOpen, setIsOpen] = useState(!!prefill); // auto-open si pré-remplissage (conversion)

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
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-inner">
                                <AdherentForm
                                    prefill={prefill}
                                    readonlyFields={prefill ? ["nom", "prenom", "email", "telephone1", "dateDeNaissance"] : []}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
