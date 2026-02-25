"use client";

import { useState } from "react";
import Image from "next/image";
import InscriptionForm from "./InscriptionForm";

export default function InscriptionSection() {
    const [isOpen, setIsOpen] = useState(false);

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
                        <div className="w-3/4 h-[2px] bg-[#E33535] mb-8"></div> {/* Ligne rouge haut */}
                        <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden bg-gray-100 shadow-md">
                            {/* Remplace le src par ton image */}
                            <Image
                                src="/images/placeholder-boxe.jpg"
                                alt="Enfants en cours de boxe"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="w-3/4 h-[2px] bg-[#E33535] mt-8"></div> {/* Ligne rouge bas */}
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
                                MODALITÉS<br />D'INSCRIPTIONS
                            </h3>
                            <p className="text-[11px] leading-relaxed text-gray-600 mb-6 max-w-sm text-justify">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                            <button className="border border-[#E33535] text-gray-700 text-xs px-6 py-2 rounded-sm hover:bg-red-50 transition-colors duration-300">
                                Voir plus
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bouton d'action (Toggle Formulaire) */}
                <div className="flex justify-center relative z-10">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-[#FF8A00] hover:bg-[#e67a00] text-white font-bold py-3 px-10 rounded-full transition-all duration-300 uppercase tracking-widest shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        {isOpen ? "Fermer le formulaire" : "Inscription"}
                    </button>
                </div>

                {/* Le Formulaire avec Animation de Déploiement
          L'astuce magique de Tailwind : grid-rows-[0fr] vers grid-rows-[1fr]
        */}
                <div
                    className={`grid transition-all duration-700 ease-in-out origin-top ${
                        isOpen ? "grid-rows-[1fr] opacity-100 mt-8" : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                >
                    <div className="overflow-hidden">
                        <div className="pt-8 border-t border-gray-200">

                            {/* C'est ici que tu appelleras ton Dumb Component InscriptionForm */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-inner">
                                <InscriptionForm/>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}