'use client';

import React, { useState } from 'react';
import { submitInscriptionAction } from './actions/inscription.actions';
import { Info } from 'lucide-react';


export default function InscriptionPage() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        // Logique d'upload préalable des documents (Certificat, etc.)
        const docs = [
            { type: 'MEDICAL_CERTIFICATE', url: '/uploads/temp/certif.pdf' }
        ];

        const result = await submitInscriptionAction(formData, docs as any);

        if (result.success) {
            // Redirection vers succès ou Stripe
            window.location.href = "/inscription/merci";
        }
        setIsSubmitting(false);
    };

    return (
        <main className="container mx-auto py-20 px-5">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 flex items-center gap-3">
                <Info className="text-amber-500" />
                <p className="text-amber-800 font-bold uppercase text-sm tracking-tight">
                    Offre Spéciale : 3 cours d'essai gratuits au choix pour toute nouvelle inscription !
                </p>
            </div>
            <h1 className="text-3xl font-black uppercase mb-10">Formulaire d'Adhésion</h1>
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Étape 1 : Identité */}
                <div className="grid grid-cols-2 gap-4">
                    <input name="firstName" placeholder="Prénom" className="border p-3 rounded" required />
                    <input name="lastName" placeholder="Nom" className="border p-3 rounded" required />
                </div>

                {/* Étape 2 : Coordonnées */}
                <input name="email" type="email" placeholder="Email" className="w-full border p-3 rounded" required />

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-slate-400">Date de naissance</label>
                    <input name="birthDate" type="date" className="border p-3 rounded-xl" required />
                </div>

                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-black uppercase tracking-widest text-slate-900 border-b pb-2">Adresse de résidence</h3>
                    <input name="address" placeholder="N° et Rue" className="w-full border p-3 rounded-xl" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="postalCode" placeholder="Code Postal" className="border p-3 rounded-xl" required />
                        <input name="city" placeholder="Ville" className="border p-3 rounded-xl" required />
                    </div>
                </div>
                {/* Étape 3 : Paiement */}
                <select name="paymentMethod" className="w-full border p-3 rounded">
                    <option value="STRIPE">Paiement par Carte (Stripe)</option>
                    <option value="CHECK">Paiement par Chèque</option>
                </select>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-red text-white font-bold py-4 rounded-full"
                >
                    {isSubmitting ? "Traitement..." : "Valider mon inscription"}
                </button>
            </form>
        </main>
    );
}