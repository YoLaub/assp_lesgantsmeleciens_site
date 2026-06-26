import { getAssociationAction } from '@/features/association/actions/association.actions';
import { AssociationForm } from './AssociationForm';

export default async function AdminAssociationPage() {
    const asso = await getAssociationAction();

    return (
        <div className="p-8 space-y-6 font-sans max-w-4xl">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Association</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Ces informations alimentent la page Contact et le pied de page du site.
                </p>
            </div>
            <AssociationForm asso={asso} />
        </div>
    );
}
