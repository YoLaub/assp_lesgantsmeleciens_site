'use client';

import { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { GALLERY_CATEGORIES, type GalleryCategory } from '@/features/gallery/domain/models/gallery-category.model';
import { uploadGalleryImageAction, saveGalleryImageAction } from '@/app/admin/content/actions/gallery.actions';

interface AddImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImageAdded: (image: GalleryImage) => void;
}

export function AddImageDialog({ isOpen, onClose, onImageAdded }: AddImageDialogProps) {
    const [step, setStep] = useState<'upload' | 'metadata'>('upload');
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [title, setTitle] = useState('');
    const [alt, setAlt] = useState('');
    const [category, setCategory] = useState<GalleryCategory | ''>('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    function resetForm() {
        setStep('upload');
        setUploadedUrl('');
        setTitle('');
        setAlt('');
        setCategory('');
        setError('');
        setIsUploading(false);
        setIsSaving(false);
        setDragActive(false);
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    async function handleFileUpload(file: File) {
        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadGalleryImageAction(formData);

        if (result.success) {
            setUploadedUrl(result.url);
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
            setStep('metadata');
        } else {
            setError(result.error || 'Erreur lors du téléchargement');
        }

        setIsUploading(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    }

    async function handleSave() {
        if (!title.trim()) {
            setError('Le titre est requis');
            return;
        }

        setIsSaving(true);
        setError('');

        const imageData: GalleryImage = {
            id: crypto.randomUUID(),
            title: title.trim(),
            alt: alt.trim(),
            category: category.trim(),
            src: uploadedUrl,
            width: 0,
            height: 0,
            order: 0,
        };

        const result = await saveGalleryImageAction(imageData);

        if (result.success) {
            onImageAdded(imageData);
            handleClose();
        } else {
            setError(result.error || 'Erreur lors de la sauvegarde');
        }

        setIsSaving(false);
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                        Ajouter une image
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {step === 'upload' && (
                        <div
                            className={`
                                border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                                transition-colors
                                ${dragActive
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:border-red-400 hover:bg-slate-50'
                                }
                            `}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? (
                                <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
                            ) : (
                                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            )}
                            <p className="text-sm text-slate-600 font-medium">
                                {isUploading
                                    ? 'Téléchargement en cours...'
                                    : 'Glissez une image ici ou cliquez pour sélectionner'
                                }
                            </p>
                            <p className="text-xs text-slate-400 mt-1">JPG, PNG ou WebP — Max 10 Mo</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </div>
                    )}

                    {step === 'metadata' && (
                        <>
                            {/* Preview */}
                            <div className="rounded-xl overflow-hidden bg-slate-50 max-h-48 flex items-center justify-center">
                                <img
                                    src={uploadedUrl}
                                    alt="Aperçu"
                                    className="max-h-48 object-contain"
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Titre de l'image"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm
                                               focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                />
                            </div>

                            {/* Alt text */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">
                                    Texte alternatif
                                </label>
                                <input
                                    type="text"
                                    value={alt}
                                    onChange={(e) => setAlt(e.target.value)}
                                    placeholder="Description pour l'accessibilité"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm
                                               focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">
                                    Catégorie
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {GALLERY_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setCategory(
                                                category === cat.value ? '' : cat.value
                                            )}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                                ${category === cat.value
                                                    ? 'bg-red-600 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {error && (
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    )}
                </div>

                {/* Footer */}
                {step === 'metadata' && (
                    <div className="px-6 pb-6 flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl
                                       font-black uppercase text-xs tracking-widest transition-all
                                       shadow-lg shadow-red-600/20 active:scale-95
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Enregistrer'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
