import { Info } from 'lucide-react';
import InscriptionSection from '@/features/inscriptions/presentation/components/front/InscriptionSection';
import { getEssayantConversionDataAction } from '@/features/essayants/actions/essayants.actions';

interface InscriptionPageProps {
    searchParams: Promise<{ conversion?: string; token?: string }>;
}

export default async function InscriptionPage({ searchParams }: InscriptionPageProps) {
    const params = await searchParams;
    let prefill: Parameters<typeof InscriptionSection>[0]['prefill'] = undefined;

    if (params.token) {
        const result = await getEssayantConversionDataAction(params.token);
        if (result.success && result.data) {
            prefill = {
                nom: result.data.nom,
                prenom: result.data.prenom,
                email: result.data.email,
                telephone1: result.data.telephone,
                dateDeNaissance: result.data.dateDeNaissance,
                numeroAdherentExistant: result.data.numeroAdherent,
                essayantId: result.data.id,
            };
        }
    }

    return (
        <main className="container mx-auto py-20 px-5">
            <div className="max-w-6xl mx-auto bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 flex items-center gap-3">
                <Info className="text-amber-500 shrink-0" />
                <p className="text-amber-800 font-bold uppercase text-sm tracking-tight">
                    Offre : 3 cours d'essai avant inscription !
                </p>
            </div>

            <InscriptionSection prefill={prefill} />
        </main>
    );
}
