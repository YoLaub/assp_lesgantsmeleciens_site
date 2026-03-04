export const dynamic = 'force-dynamic';

import { getActiveActualitesAction } from '@/app/(front)/actualites/actions/actualite.actions';
import { ActualiteCard } from '@/features/actualites/presentation/components/front/ActualiteCard';
import CTAInscription from "@/app/(front)/_components/CTA-inscription";
import CTAFAQ from "@/app/(front)/_components/FAQ";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Actualités | Les Gants Méléciens',
    description: 'Suivez toutes les actualités du club.',
};

export default async function ActualitesPage() {
    const result = await getActiveActualitesAction();
    const actualites = result.data;

    return (
        <main className="container flex flex-col gap-20 pb-20 mx-auto px-5 md:px-0">
            <section className="flex flex-col gap-6 text-center pt-12">
                <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">Actualités</h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Retrouvez toutes les dernières nouvelles, événements et annonces de l&apos;association.
                </p>
            </section>

            {!result.success ? (
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
                    <p className="font-bold">{result.error}</p>
                </div>
            ) : actualites.length === 0 ? (
                <div className="bg-slate-50 text-slate-500 p-8 rounded-2xl text-center border border-slate-200">
                    <p className="font-bold italic">Les actualités seront bientôt publiées.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {actualites.map((actualite) => (
                        <ActualiteCard key={actualite.id} actualite={actualite} />
                    ))}
                </div>
            )}

            <section className="flex flex-col gap-4">
                <CTAInscription />
                <CTAFAQ />
            </section>
        </main>
    );
}
