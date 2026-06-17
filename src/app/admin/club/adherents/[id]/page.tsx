import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getAdherentByIdAction } from '@/features/adherents/actions/admin-adherents.actions';
import { AdherentDetail } from '@/features/adherents/presentation/components/admin/AdherentDetail';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminAdherentDetailPage({ params }: PageProps) {
    const { id } = await params;
    const adherent = await getAdherentByIdAction(Number(id));

    if (!adherent) notFound();

    const adherentData = {
        id: adherent.id,
        numeroAdherent: adherent.membre.numeroAdherent ?? '',
        nom: adherent.membre.nom,
        prenom: adherent.membre.prenom,
        dateDeNaissance: adherent.membre.dateDeNaissance,
        sexe: adherent.membre.sexe ?? '',
        categorie: adherent.categorie ?? '',
        email: adherent.membre.email,
        telephone: adherent.membre.telephone,
        telephone2: adherent.telephone2,
        adresse: adherent.membre.adresse,
        codePostal: adherent.membre.codePostal,
        ville: adherent.membre.communeNom,
        oxygene: adherent.oxygene,
        renouvellement: adherent.renouvellement,
        fnsmr: adherent.fnsmr,
        droitImage: adherent.droitImage,
        reglementSigne: adherent.reglementSigne,
        certificatMedical: adherent.certificatMedical,
        certificatMedicalReq: adherent.certificatMedicalReq,
        autorisationSortieSeul: adherent.autorisationSortieSeul,
        couponSport: adherent.couponSport,
        bonCaf: adherent.bonCaf,
        montantSnapshot: adherent.montantSnapshot,
        typePaiement: adherent.typePaiement,
        inscriptionValide: adherent.inscriptionValide,
        dateInscription: adherent.dateInscription ?? new Date(),
        questionnaire: adherent.questionnaire
            ? {
                q1: adherent.questionnaire.reponses[0]?.reponse ?? false,
                q2: adherent.questionnaire.reponses[1]?.reponse ?? false,
                q3: adherent.questionnaire.reponses[2]?.reponse ?? false,
                q4: adherent.questionnaire.reponses[3]?.reponse ?? false,
                q5: adherent.questionnaire.reponses[4]?.reponse ?? false,
                q6: adherent.questionnaire.reponses[5]?.reponse ?? false,
                q7: adherent.questionnaire.reponses[6]?.reponse ?? false,
                q8: adherent.questionnaire.reponses[7]?.reponse ?? false,
                q9: adherent.questionnaire.reponses[8]?.reponse ?? false,
            }
            : null,
        codePassSport: adherent.codePassSport,
        documents: adherent.documents.map((d) => ({ id: d.id, type: d.type, url: d.url, name: d.name })),
    };

    return (
        <div className="p-8 space-y-6 font-sans">
            <Link href="/admin/club/adherents" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                <ChevronLeft className="w-4 h-4" />
                Retour à la liste
            </Link>

            <AdherentDetail adherent={adherentData} />
        </div>
    );
}
