export const dynamic = 'force-dynamic';

import { getQuestionsAction } from '@/features/adherents/actions/questionnaire-questions.actions';
import { QuestionnaireEditor } from './QuestionnaireEditor';

export default async function AdminQuestionnaireSantePage() {
    const questions = await getQuestionsAction();

    return (
        <div className="p-8 space-y-6 font-sans max-w-4xl">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Questionnaire de santé</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Ces libellés sont affichés aux adhérents lors du remplissage de leur dossier (QS-Sport, Cerfa 15699-01).
                </p>
            </div>
            <QuestionnaireEditor questions={questions} />
        </div>
    );
}
