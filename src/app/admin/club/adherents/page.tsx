export const dynamic = "force-dynamic";

import { getAdherentsAction } from '@/features/adherents/actions/admin-adherents.actions';
import { AdherentsList } from '@/features/adherents/presentation/components/admin/AdherentsList';
import { ExportCsvButton } from '@/features/adherents/presentation/components/admin/ExportCsvButton';

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
        autorisationSortieSeul: a.autorisationSortieSeul,
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
                <ExportCsvButton />
            </div>

            <AdherentsList adherents={adherentRows} />
        </div>
    );
}
