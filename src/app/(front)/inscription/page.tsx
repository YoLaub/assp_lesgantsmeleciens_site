import InscriptionSection from '@/features/inscriptions/presentation/components/front/InscriptionSection';
import { getEssayantConversionDataAction } from '@/features/essayants/actions/essayants.actions';
import EssaiForm from '@/features/essayants/presentation/components/front/EssaiForm';

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
                telephone1: result.data.telephone ?? undefined,
                dateDeNaissance: result.data.dateDeNaissance,
                membreId: result.data.id,
            };
        }
    }

    return (
        <main className="container mx-auto py-20 px-5">
            <InscriptionSection prefill={prefill} essaiForm={<EssaiForm />} />
        </main>
    );
}
