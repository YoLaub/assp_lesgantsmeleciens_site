import { X, FileText, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Inscription } from "@/features/inscriptions/domain/models/inscriptions.model";
import { StatusBadge } from "./StatusBadge";
import {useTransition} from "react";
import {InscriptionStatus} from "@/generated/prisma/enums";
import {updateInscriptionStatusAction} from "@/app/(admin)/club/adherents/actions/admin.actions";

interface InscriptionDetailDrawerProps {
    adherent: Inscription;
    onClose: () => void;
}

export function InscriptionDetailDrawer({ adherent, onClose }: InscriptionDetailDrawerProps) {

    const [isPending, startTransition] = useTransition();

    const handleUpdateStatus = (newStatus: InscriptionStatus) => {
        // L'ID est optionnel dans ton schéma Zod, on vérifie qu'il existe bien
        if (!adherent.id) return;

        startTransition(async () => {
            const result = await updateInscriptionStatusAction(adherent.id!, newStatus);

            if (result.success) {
                // Si la mise à jour a réussi, on ferme le tiroir
                // Le tableau en dessous se mettra à jour tout seul grâce au revalidatePath !
                onClose();
            } else {
                alert("Une erreur est survenue : " + result.error);
            }
        });
    };


    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Arrière-plan sombre cliquable pour fermer */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Le Tiroir en lui-même */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">

                {/* En-tête du tiroir */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-black uppercase text-slate-900">
                            {adherent.firstName} {adherent.lastName}
                        </h2>
                        <p className="text-sm text-slate-500">Dossier d'inscription</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenu défilant */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Statut & Paiement */}
                    <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Paiement</p>
                            <p className="text-sm font-bold text-slate-700">{adherent.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Statut</p>
                            <StatusBadge status={adherent.status} />
                        </div>
                    </div>

                    {/* Informations Personnelles */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Informations</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <a href={`mailto:${adherent.email}`} className="hover:text-blue-600">{adherent.email}</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <a href={`tel:${adherent.phone}`} className="hover:text-blue-600">{adherent.phone}</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>Né(e) le {new Date(adherent.birthDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-700">
                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                <span>
                                    {adherent.address}<br />
                                    {adherent.postalCode} {adherent.city}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Pièces Jointes</h3>
                        {adherent.documents && adherent.documents.length > 0 ? (
                            <div className="space-y-2">
                                {adherent.documents.map((doc, index) => (
                                    <a
                                        key={index}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="bg-orange-100 p-2 rounded-md text-[#FF8A00]">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                {doc.type}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase">Voir le document</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Aucun document fourni.</p>
                        )}
                    </div>
                </div>

                {/* Pied du tiroir (Actions Admin) */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
                    <button
                        onClick={() => handleUpdateStatus(InscriptionStatus.VALIDATED)}
                        disabled={isPending || adherent.status === InscriptionStatus.VALIDATED}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        {isPending ? "Chargement..." : "Valider le dossier"}
                    </button>

                    <button
                        onClick={() => handleUpdateStatus(InscriptionStatus.INCOMPLETE)}
                        disabled={isPending || adherent.status === InscriptionStatus.INCOMPLETE}
                        className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed font-bold py-3 rounded-xl transition-colors"
                    >
                        {isPending ? "Chargement..." : "Marquer comme incomplet"}
                    </button>
                </div>

            </div>
        </div>
    );
}