'use client';

import React, { useState } from 'react';
import { submitInscriptionAction } from './actions/inscription.actions';
// Importer les composants UI...

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
            <h1 className="text-3xl font-black uppercase mb-10">Formulaire d'Adhésion</h1>
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Étape 1 : Identité */}
                <div className="grid grid-cols-2 gap-4">
                    <input name="firstName" placeholder="Prénom" className="border p-3 rounded" required />
                    <input name="lastName" placeholder="Nom" className="border p-3 rounded" required />
                </div>

                {/* Étape 2 : Coordonnées */}
                <input name="email" type="email" placeholder="Email" className="w-full border p-3 rounded" required />

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