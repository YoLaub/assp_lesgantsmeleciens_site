import { getReglementAction } from '@/features/adherents/actions/reglement.actions';
import { ReglementEditor } from './ReglementEditor';

export default async function AdminReglementPage() {
    const { contenu } = await getReglementAction();

    return (
        <div className="p-8 space-y-6 font-sans max-w-4xl">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Règlement intérieur</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Le texte ci-dessous est affiché aux adhérents lors de la création de leur dossier.
                </p>
            </div>
            <ReglementEditor contenuInitial={contenu} />
        </div>
    );
}
