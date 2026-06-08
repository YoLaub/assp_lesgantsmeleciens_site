'use client';

import { useState, useTransition } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { updateQuestionsAction } from '@/features/adherents/actions/questionnaire-questions.actions';
import type { QuestionSante } from '@/features/adherents/actions/questionnaire-questions.actions';

export function QuestionnaireEditor({ questions: initial }: { questions: QuestionSante[] }) {
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
            const result = await updateQuestionsAction(
                questions.map(({ code, label }) => ({ code, label }))
            );
            if (result.success) setSaved(true);
            else setError(result.error ?? 'Erreur');
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                {questions.map((q, i) => (
                    <div key={q.code} className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Question {i + 1}
                        </label>
                        <textarea
                            value={q.label}
                            onChange={(e) => setLabel(q.code, e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                        />
                    </div>
                ))}
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
