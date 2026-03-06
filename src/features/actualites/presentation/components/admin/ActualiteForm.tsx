'use client';

import React, { useState } from 'react';
import { Save, Image as ImageIcon, Bold, Italic, Heading2, List } from 'lucide-react';
import { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { saveActualiteAction } from '@/app/admin/content/actions/actions';
import { useRouter } from 'next/navigation';
import { Actualite } from '../../../domain/models/actualite.model';
import { ACTUALITE_IMAGE_CATEGORIES } from '@/features/gallery/domain/models/gallery-category.model';
import { ImagePicker } from '@/shared/components/ImagePicker';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-2 p-2 mb-2 bg-slate-100 rounded-lg border border-slate-200">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <Bold size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <Italic size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <Heading2 size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <List size={16} />
            </button>
        </div>
    );
};

interface ActualiteFormProps {
    id?: string;
    initialData?: Actualite;
}

export const ActualiteForm = ({ id, initialData }: ActualiteFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [imageOrder, setImageOrder] = useState<string[]>(
        initialData?.imageOrder ?? initialData?.images?.map((i) => i.id) ?? []
    );

    const [activeState, setActiveState] = useState(initialData?.active ?? true);
    const [featuredState, setFeaturedState] = useState(initialData?.featured ?? false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: initialData?.description || '<p>Décrivez l\'actualité ici...</p>',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3',
            },
        },
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const tagsString = formData.get('tags') as string;
        const tagsArray = tagsString
            ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];

        const actualiteData: Actualite = {
            id: id || '',
            title: formData.get('title') as string,
            description: editor?.getHTML() || '',
            tags: tagsArray,
            images: [],
            imageOrder: imageOrder,
            seo: {
                metaTitle: formData.get('metaTitle') as string,
                metaDescription: formData.get('metaDescription') as string,
            },
            active: activeState,
            featured: featuredState,
            publishedAt: initialData?.publishedAt ?? null,
            createdAt: initialData?.createdAt ?? new Date(),
            updatedAt: new Date(),
        };

        try {
            const result = await saveActualiteAction(actualiteData);
            if (result.success) {
                alert("Actualité enregistrée avec succès !");
                router.push('/admin/content/actualites');
                router.refresh();
            } else {
                setError(result.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error(error);
            setError('Une erreur inattendue est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLONNE GAUCHE : Contenu */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            Contenu Général
                        </h3>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Titre de l&apos;actualité</label>
                            <input
                                type="text"
                                name="title"
                                defaultValue={initialData?.title}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                placeholder="ex: Galette des Rois 2026"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Description Détaillée</label>
                            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500 transition-all">
                                <MenuBar editor={editor} />
                                <EditorContent editor={editor} className="bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Tags (séparés par des virgules)</label>
                            <input
                                type="text"
                                name="tags"
                                defaultValue={initialData?.tags?.join(', ')}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                placeholder="Événement, Club, Compétition"
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900">Publication</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 text-sm">En ligne</p>
                                <p className="text-xs text-slate-500">Rendre cette actualité visible sur le site</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveState(!activeState)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${activeState ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${activeState ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 text-sm">À la une</p>
                                <p className="text-xs text-slate-500">Afficher en évidence sur la page d&apos;accueil</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFeaturedState(!featuredState)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${featuredState ? 'bg-amber-500' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${featuredState ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">Configuration SEO</h3>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Meta Title</label>
                            <input
                                type="text"
                                name="metaTitle"
                                defaultValue={initialData?.seo?.metaTitle}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Meta Description</label>
                            <textarea
                                rows={3}
                                name="metaDescription"
                                defaultValue={initialData?.seo?.metaDescription}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : Image Picker */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-red-600" /> Photos
                        </h3>
                        <ImagePicker
                            categorySlugs={ACTUALITE_IMAGE_CATEGORIES}
                            selected={imageOrder}
                            onSelect={setImageOrder}
                            multiple
                            label="Sélectionner des images"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </form>
    );
};
