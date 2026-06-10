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

    return (
        <div className="p-8 space-y-6 font-sans">
            <Link href="/admin/club/adherents" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                <ChevronLeft className="w-4 h-4" />
                Retour à la liste
            </Link>

            <AdherentDetail adherent={adherent as unknown as Parameters<typeof AdherentDetail>[0]['adherent']} />
        </div>
    );
}
