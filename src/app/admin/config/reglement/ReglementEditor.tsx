'use client';

import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import { Bold, Italic, Heading2, List, ListOrdered, Save, CheckCircle } from 'lucide-react';
import { updateReglementAction } from '@/features/adherents/actions/reglement.actions';

function MenuBar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    const btnCls = (active: boolean) =>
        `p-1.5 rounded text-sm ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`;

    return (
        <div className="flex flex-wrap gap-2 p-2 mb-2 bg-slate-100 rounded-lg border border-slate-200">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive('bold'))}>
                <Bold size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive('italic'))}>
                <Italic size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive('heading', { level: 2 }))}>
                <Heading2 size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive('bulletList'))}>
                <List size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive('orderedList'))}>
                <ListOrdered size={16} />
            </button>
        </div>
    );
}

export function ReglementEditor({ contenuInitial }: { contenuInitial: string }) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: contenuInitial,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
            },
        },
        onUpdate: () => setSaved(false),
    });

    const handleSave = async () => {
        if (!editor) return;
        setSaving(true);
        setError(null);

        const result = await updateReglementAction({ contenu: editor.getHTML() });
        setSaving(false);

        if (result.success) {
            setSaved(true);
        } else {
            setError(result.error ?? 'Erreur lors de la sauvegarde');
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <MenuBar editor={editor} />
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
                >
                    <Save size={16} />
                    {saving ? 'Sauvegarde…' : 'Enregistrer'}
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
