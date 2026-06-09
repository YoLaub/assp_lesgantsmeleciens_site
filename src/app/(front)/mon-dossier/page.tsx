import MonDossierView from '@/features/adherents/presentation/components/front/MonDossierView';
import {
    getQuestionsAction,
    getQuestionsEnfantAction,
} from '@/features/adherents/actions/questionnaire-questions.actions';

interface MonDossierPageProps {
    searchParams: Promise<{ token?: string; paiement?: string }>;
}

export default async function MonDossierPage({ searchParams }: MonDossierPageProps) {
    const params = await searchParams;
    const [questions, questionsEnfant] = await Promise.all([
        getQuestionsAction(),
        getQuestionsEnfantAction(),
    ]);
    return (
        <MonDossierView
            token={params.token}
            paiementStatus={params.paiement as 'succes' | 'annule' | undefined}
            questions={questions}
            questionsEnfant={questionsEnfant}
        />
    );
}
