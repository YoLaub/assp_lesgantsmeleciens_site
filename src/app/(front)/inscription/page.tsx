import { Info, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import InscriptionSection from '@/features/inscriptions/presentation/components/front/InscriptionSection';
import { getActiveDisciplinesAction } from '@/app/(front)/disciplines/actions/discipline.actions';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';
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
                telephone1: result.data.telephone ?? undefined,
                dateDeNaissance: result.data.dateDeNaissance,
                membreId: result.data.id,
            };
        }
    }

    return (
        <main className="container mx-auto py-20 px-5">
            <InscriptionSection prefill={prefill} />

            <div className="max-w-6xl mx-auto bg-amber-50 border-l-4 border-amber-500 p-4 mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Info className="text-amber-500 shrink-0" />
                    <p className="text-amber-800 font-bold uppercase text-sm tracking-tight">
                        Offre : 3 cours d'essai avant inscription !
                    </p>
                </div>
                <Link
                    href="/essai"
                    className="group relative inline-flex items-center justify-center gap-2 self-start sm:self-auto overflow-hidden rounded-full bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-amber-500/30 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                    <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                    <span>Je tente l'essai</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </main>
    );
}
