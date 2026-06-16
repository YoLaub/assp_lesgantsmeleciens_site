export const dynamic = "force-dynamic";

import { getCoachTokenActifAction } from '@/features/essayants/actions/essayants.actions';
import { CoachTokenManager } from '@/features/essayants/presentation/components/admin/CoachTokenManager';

export default async function AdminCoachTokenPage() {
    const result = await getCoachTokenActifAction();
    const tokenData = result.success ? result.token : null;

    return (
        <div className="p-8 space-y-8 font-sans max-w-xl">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Lien coach</h1>
                <p className="text-slate-500 text-sm">Gérez le magic link d&apos;accès au tableau de bord coach.</p>
            </div>

            <CoachTokenManager tokenData={tokenData ?? null} />
        </div>
    );
}
