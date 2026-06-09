export const dynamic = 'force-dynamic';

import {
    getQuestionsAction,
    getQuestionsEnfantAction,
} from '@/features/adherents/actions/questionnaire-questions.actions';
import {
    updateQuestionsAction,
    updateQuestionsEnfantAction,
} from '@/features/adherents/actions/questionnaire-questions.actions';
import { QuestionnaireEditor } from './QuestionnaireEditor';

export default async function AdminQuestionnaireSantePage() {
    const [questionsAdulte, questionsEnfant] = await Promise.all([
        getQuestionsAction(),
        getQuestionsEnfantAction(),
    ]);

    return (
        <div className="p-8 space-y-10 font-sans max-w-4xl">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Questionnaire de santé</h1>
                <p className="text-slate-400 text-sm mt-1">Libellés officiels FNSMR — QS-Sport</p>
            </div>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Questionnaire adulte (majeur)</h2>
                <p className="text-slate-400 text-xs">Cerfa 15699-01 — 7 questions</p>
                <QuestionnaireEditor questions={questionsAdulte} updateAction={updateQuestionsAction} />
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Questionnaire enfant (mineur)</h2>
                <p className="text-slate-400 text-xs">FNSMR v.2 — 24 questions en 4 sections</p>
                <QuestionnaireEditor questions={questionsEnfant} updateAction={updateQuestionsEnfantAction} groupBySection />
            </section>
        </div>
    );
}
