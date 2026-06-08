export const dynamic = "force-dynamic";

import { getConfigTarifsAction } from '@/features/adherents/actions/config-tarifs.actions';
import { ConfigTarifsForm } from '@/features/adherents/presentation/components/admin/ConfigTarifsForm';

export default async function AdminConfigTarifsPage() {
    const config = await getConfigTarifsAction();

    return (
        <div className="p-8 space-y-8 font-sans max-w-xl">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Configuration des tarifs</h1>
                <p className="text-slate-500 text-sm">Les modifications n'affectent pas les montants déjà enregistrés.</p>
            </div>
            <ConfigTarifsForm config={config} />
        </div>
    );
}
