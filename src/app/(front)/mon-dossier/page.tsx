import MonDossierView from '@/features/adherents/presentation/components/front/MonDossierView';

interface MonDossierPageProps {
    searchParams: Promise<{ token?: string; paiement?: string }>;
}

export default async function MonDossierPage({ searchParams }: MonDossierPageProps) {
    const params = await searchParams;
    return <MonDossierView token={params.token} paiementStatus={params.paiement as 'succes' | 'annule' | undefined} />;
}
