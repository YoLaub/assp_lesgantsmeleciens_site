import MonEssaiView from '@/features/essayants/presentation/components/front/MonEssaiView';

interface MonEssaiPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function MonEssaiPage({ searchParams }: MonEssaiPageProps) {
    const params = await searchParams;
    return <MonEssaiView token={params.token} />;
}
