'use client';

import React, {useRef, useState} from 'react';
import {Save, Image as ImageIcon, X, Plus, Bold, Italic, Heading2, List, Upload} from 'lucide-react';
import {Editor} from "@tiptap/core";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { saveDisciplineAction, uploadPhotoAction } from '@/app/(admin)/content/actions/actions';
import { useRouter } from 'next/navigation';
import { Discipline } from '../../domain/models/discipline.model';

// Barre d'outils isolée pour l'éditeur
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

interface DisciplineFormProps {
    id?: string;
    initialData?: Discipline;
}

export const DisciplineForm = ({ id, initialData }: DisciplineFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [photos, setPhotos] = useState<string[]>(
        initialData?.photo || []
    );
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Configuration de l'éditeur Tiptap pour la Description
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialData?.description || '<p>Décrivez la discipline ici...</p>',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3',
            },
        },
    });

    const handlePhotoSelect = async (index: number, file: File) => {
        setUploadingIndex(index);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadPhotoAction(formData);

            if (result.success && result.url) {
                const newPhotos = [...photos];
                newPhotos[index] = result.url;
                setPhotos(newPhotos);
            } else {
                setError(result.error || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            setError('Upload failed');
        } finally {
            setUploadingIndex(null);
        }
    };

    const handlePhotoClick = (index: number) => {
        fileInputRefs.current[index]?.click();
    };

    const handlePhotoRemove = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Convertir les tags en tableau
        const tagsString = formData.get('tags') as string;
        const tagsArray = tagsString
            ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];

        const disciplineData: Discipline = {
            id: id,
            title: formData.get('title') as string,
            coach: formData.get('coach') as string,
            category: formData.get('category') as string,
            description: editor?.getHTML() || '',
            tags: tagsArray,
            photo: photos,
            seo: {
                metaTitle: formData.get('metaTitle') as string,
                metaDescription: formData.get('metaDescription') as string,
            },
            active: true,
        };

        try {
            const result = await saveDisciplineAction(disciplineData);

            if (result.success) {
                alert("Discipline enregistrée avec succès !");
                router.push('/content/disciplines');
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

    // Créer un tableau de 5 slots pour l'affichage
    const photoSlots = Array(5).fill(null).map((_, index) => photos[index] || null);


    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLONNE GAUCHE : Informations Principales */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            Contenu Général
                        </h3>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Titre de la Discipline</label>
                            <input
                                type="text"
                                name="title"
                                defaultValue={initialData?.title}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                placeholder="ex: Muay Thaï"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Coach</label>
                            <input
                                type="text"
                                name="coach"
                                defaultValue={initialData?.coach}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                placeholder="ex: Tony"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Categorie</label>
                            <input
                                type="text"
                                name="category"
                                defaultValue={initialData?.category}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                placeholder="ex: Ados / Adultes"
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
                                placeholder="Combat, Cardio, Traditionnel"
                            />
                        </div>
                    </div>

                    {/* SEO & Meta */}
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

                {/* COLONNE DROITE : Galerie Photos (5 slots) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-red-600" /> Galerie (Max 5)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {photoSlots.map((photo, index) => (
                                <div
                                    key={index}
                                    className={`relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${index === 0 ? 'col-span-2' : ''} ${photo ? 'border-slate-200 bg-slate-50' : 'border-slate-100 hover:border-red-200 hover:bg-red-50 cursor-pointer'}`}
                                    onClick={() => !photo && uploadingIndex !== index && handlePhotoClick(index)}
                                >
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        ref={el => fileInputRefs.current[index] = el}
                                        className="hidden"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handlePhotoSelect(index, file);
                                        }}
                                    />

                                    {uploadingIndex === index ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-6 h-6 text-red-600 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-slate-400">Upload...</span>
                                        </div>
                                    ) : photo ? (
                                        <>
                                            <img
                                                src={photo}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePhotoRemove(index);
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            >
                                                <X size={12}/>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <Plus className="w-6 h-6 text-slate-300" />
                                            <span className="text-[9px] font-black uppercase text-slate-400">Ajouter</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[10px] text-slate-400 italic">
                            Format: JPG/WebP 800x800px max 5MB. La première photo sera l'image de couverture.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || uploadingIndex !== null}
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