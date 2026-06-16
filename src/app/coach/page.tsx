import CoachDashboard from '@/features/essayants/presentation/components/coach/CoachDashboard';

interface CoachPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function CoachPage({ searchParams }: CoachPageProps) {
    const params = await searchParams;
    if (!params.token) {
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                <p className="text-white font-medium">Ce lien n&apos;est plus valide. Contactez l&apos;administrateur.</p>
            </main>
        );
    }

    return <CoachDashboard coachToken={params.token} />;
}
