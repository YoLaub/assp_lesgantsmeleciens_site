export const dynamic = 'force-dynamic';

import DisciplineSection from "@/features/disciplines/presentation/components/front/DisciplineSection";
import CTAInscription from "@/app/(front)/_components/CTA-inscription";
import CTAFAQ from "@/app/(front)/_components/FAQ";
import { getActiveDisciplinesAction } from '@/app/(front)/disciplines/actions/discipline.actions';

export default async function Page() {
    // 1. Appel propre au contrôleur
    const result = await getActiveDisciplinesAction();
    const disciplines = result.data;

    return (
        <main className="container flex flex-col gap-20 pb-20 mx-auto px-5 md:px-0">
            <section className="flex flex-col gap-10 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">Les Disciplines</h1>
                <p className="text-slate-500 text-lg">
                    Au sein de notre association, nous célébrons la richesse des sports de combat...
                </p>
            </section>

            {/* 2. GESTION DES ÉTATS (Erreur, Vide, ou Succès) */}
            {!result.success ? (
                // Cas 1 : La BDD a planté (ETIMEDOUT)
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
                    <p className="font-bold">{result.error}</p>
                </div>
            ) : disciplines.length === 0 ? (
                // Cas 2 : La BDD va bien, mais il n'y a aucune discipline
                <div className="bg-slate-50 text-slate-500 p-8 rounded-2xl text-center border border-slate-200">
                    <p className="font-bold italic">Les disciplines seront bientôt annoncées. Restez connectés !</p>
                </div>
            ) : (
                // Cas 3 : Succès, on affiche les disciplines !
                <div className="flex flex-col gap-10">
                    {disciplines.map((discipline) => (
                        <DisciplineSection key={discipline.id} discipline={discipline} />
                    ))}
                </div>
            )}

            <section className="flex flex-col gap-10">
                <div className="flex gap-4">
                    <CTAInscription />
                </div>
                <div className="flex gap-4">
                    <CTAFAQ />
                </div>
            </section>
        </main>
    );
}