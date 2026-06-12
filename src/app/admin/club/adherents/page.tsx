export const dynamic = "force-dynamic";

import { Download } from 'lucide-react';
import { getAdherentsAction } from '@/features/adherents/actions/admin-adherents.actions';
import { AdherentsList } from '@/features/adherents/presentation/components/admin/AdherentsList';

export default async function AdminAdherentsPage() {
    const adherents = await getAdherentsAction();

    const adherentRows = adherents.map((a) => ({
        id: a.id,
        numeroAdherent: a.membre.numeroAdherent ?? '',
        nom: a.membre.nom,
        prenom: a.membre.prenom,
        categorie: a.categorie ?? '',
        montantSnapshot: a.montantSnapshot,
        typePaiement: a.typePaiement,
        inscriptionValide: a.inscriptionValide,
        dateInscription: a.dateInscription ?? new Date(),
        reglementSigne: a.reglementSigne,
        certificatMedical: a.certificatMedical,
        certificatMedicalReq: a.certificatMedicalReq,
        autorisationParentale: a.autorisationParentale,
        couponSport: a.couponSport,
        bonCaf: a.bonCaf,
        dateDeNaissance: a.membre.dateDeNaissance,
    }));

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Gestion des Adhérents</h1>
                    <p className="text-slate-500 text-sm">Consultez et validez les dossiers d&apos;inscription.</p>
                </div>
                <button type="button" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <AdherentsList adherents={adherentRows} />
        </div>
    );
}
