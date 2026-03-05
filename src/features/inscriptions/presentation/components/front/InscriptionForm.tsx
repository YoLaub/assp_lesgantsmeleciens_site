"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Inscription } from "@/features/inscriptions/domain/models/inscriptions.model";
import { PaymentMethod, DocumentType } from "@/generated/prisma/enums";

import { submitInscriptionAction } from "@/app/(front)/inscription/actions/inscription.actions";
import { uploadDocumentAction } from "@/app/admin/club/adherents/actions/upload.actions";

type FormInput = z.input<typeof Inscription>;
type FormOutput = z.output<typeof Inscription>;

export default function InscriptionForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormInput, unknown, FormOutput>({
        resolver: zodResolver(Inscription),
        defaultValues: { paymentMethod: PaymentMethod.STRIPE },
    });

    const currentPaymentMethod = watch("paymentMethod");

    const onSubmit = async (data: FormOutput) => {
        try {
            const fileInput = document.getElementById('certif') as HTMLInputElement;
            const file = fileInput?.files?.[0];

            const realDocs: { type: DocumentType, url: string }[] = [];

            // 1. On ne tente l'upload QUE s'il y a un fichier sélectionné
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                // 2. Appel de la Server Action d'upload (vers Cloudflare R2)
                const uploadResult = await uploadDocumentAction(formData);

                // 3. On vérifie que l'upload a bien fonctionné
                if (uploadResult.success && uploadResult.fileKey) {
                    realDocs.push({
                        type: DocumentType.MEDICAL_CERTIFICATE,
                        url: uploadResult.fileKey // On stocke la clé R2 (ex: certificats/1234_doc.pdf)
                    });
                } else {
                    // Si l'upload échoue, on arrête tout
                    alert(uploadResult.error || "Erreur lors de l'envoi du certificat.");
                    return;
                }
            }

            // 4. Lancement de l'inscription globale en BDD
            const result = await submitInscriptionAction(data, realDocs);

            if (result.success) {
                console.log("Inscription réussie ! ID:", result.id);
                alert("Inscription validée avec succès !");
                // TODO: Si paiement Stripe, rediriger vers Checkout, sinon vers une page de succès
            } else {
                console.error("Erreur serveur:", result.errors || result.error);
                alert("Une erreur est survenue lors de l'enregistrement.");
            }
        } catch (error) {
            console.error("Erreur critique lors de la soumission:", error);
            alert("Une erreur inattendue s'est produite.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900">
                Dossier d'inscription
            </h3>

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                        {...register("firstName")}
                        className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                        {...register("lastName")}
                        className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        {...register("email")}
                        className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                        type="tel"
                        {...register("phone")}
                        className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                <input
                    type="date"
                    {...register("birthDate")}
                    className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                />
                {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
            </div>

            {/* Adresse */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800">Coordonnées</h4>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Adresse</label>
                    <input
                        {...register("address")}
                        className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code Postal</label>
                        <input
                            {...register("postalCode")}
                            className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                        />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ville</label>
                        <input
                            {...register("city")}
                            className="mt-1 w-full rounded-md border-gray-300 border p-2 focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800">Documents Requis</h4>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Certificat Médical (PDF ou Image)</label>
                    <input
                        type="file"
                        id="certif"
                        accept=".pdf, image/jpeg, image/png"
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-orange-50 file:text-[#FF8A00]
                          hover:file:bg-orange-100 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Fournir un certificat de moins de 3 mois (Optionnel pour tester).</p>
                </div>
            </div>

            {/* Paiement */}
            <div className="pt-4 border-t border-gray-200">
                <label className="block text-base font-semibold text-gray-900 mb-3">Mode de paiement</label>
                <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            value={PaymentMethod.STRIPE}
                            {...register("paymentMethod")}
                            className="h-4 w-4 text-[#FF8A00] focus:ring-[#FF8A00]"
                        />
                        <span className="ml-3 font-medium text-gray-900">Carte Bancaire (Stripe)</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            value={PaymentMethod.CHECK}
                            {...register("paymentMethod")}
                            className="h-4 w-4 text-[#FF8A00] focus:ring-[#FF8A00]"
                        />
                        <span className="ml-3 font-medium text-gray-900">Paiement par chèque</span>
                    </label>
                </div>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-6 text-center">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {isSubmitting
                        ? "Traitement en cours..."
                        : currentPaymentMethod === PaymentMethod.STRIPE
                            ? "Payer et valider l'inscription"
                            : "Valider l'inscription (Chèque)"
                    }
                </button>
            </div>
        </form>
    );
}