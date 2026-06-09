'use client';

import { useState, useTransition } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import type { QuestionSante, QuestionSanteEnfant } from '@/features/adherents/actions/questionnaire-questions.actions';

interface QuestionnaireEditorProps {
    questions: (QuestionSante | QuestionSanteEnfant)[];
    updateAction: (questions: { code: string; label: string }[]) => Promise<{ success: boolean; error?: string }>;
    groupBySection?: boolean;
}

export function QuestionnaireEditor({ questions: initial, updateAction, groupBySection }: QuestionnaireEditorProps) {
    const [questions, setQuestions] = useState(initial);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setLabel = (code: string, label: string) =>
        setQuestions((qs) => qs.map((q) => (q.code === code ? { ...q, label } : q)));

    const handleSave = () => {
        setSaved(false);
        setError(null);
        startTransition(async () => {
            const result = await updateAction(
                questions.map(({ code, label }) => ({ code, label }))
            );
            if (result.success) setSaved(true);
            else setError(result.error ?? 'Erreur');
        });
    };

    const renderQuestion = (q: QuestionSante | QuestionSanteEnfant, globalIndex: number) => (
        <div key={q.code} className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Question {globalIndex + 1}
            </label>
            <textarea
                value={q.label}
                onChange={(e) => setLabel(q.code, e.target.value)}
                rows={2}
                title={`Libellé de la question ${q.code}`}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />
        </div>
    );

    const renderContent = () => {
        if (!groupBySection) {
            return questions.map((q, i) => renderQuestion(q, i));
        }

        // Grouper par section
        const groups = new Map<string, (QuestionSante | QuestionSanteEnfant)[]>();
        for (const q of questions) {
            const section = (q as QuestionSanteEnfant).section ?? '';
            if (!groups.has(section)) groups.set(section, []);
            groups.get(section)!.push(q);
        }

        let globalIndex = 0;
        return Array.from(groups.entries()).map(([section, qs]) => (
            <div key={section} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2">{section}</h4>
                {qs.map((q) => {
                    const node = renderQuestion(q, globalIndex);
                    globalIndex++;
                    return node;
                })}
            </div>
        ));
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                {renderContent()}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
                >
                    <Save size={16} />
                    {isPending ? 'Sauvegarde…' : 'Enregistrer'}
                </button>
                {saved && (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} />
                        Sauvegardé
                    </span>
                )}
            </div>
        </div>
    );
}
