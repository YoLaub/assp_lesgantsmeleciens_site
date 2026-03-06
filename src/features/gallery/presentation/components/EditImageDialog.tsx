'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Image } from '@/features/gallery/domain/models/image.model';
import { IMAGE_CATEGORIES, type ImageCategorySlug } from '@/features/gallery/domain/models/gallery-category.model';
import { saveGalleryImageAction } from '@/app/admin/content/actions/gallery.actions';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';

interface EditImageDialogProps {
    image: Image | null;
    onClose: () => void;
    onSaved: (updated: Image) => void;
}

export function EditImageDialog({ image, onClose, onSaved }: EditImageDialogProps) {
    const [title, setTitle] = useState('');
    const [alt, setAlt] = useState('');
    const [categorySlug, setCategorySlug] = useState<ImageCategorySlug | ''>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (image) {
            setTitle(image.title);
            setAlt(image.alt);
            setCategorySlug(image.category.slug as ImageCategorySlug | '');
            setError('');
            setIsSaving(false);
        }
    }, [image]);

    if (!image) return null;

    async function handleSave() {
        if (!title.trim() || title.trim().length < 2) {
            setError('Le titre est requis (minimum 2 caractères).');
            return;
        }

        setIsSaving(true);
        setError('');

        const selectedCat = IMAGE_CATEGORIES.find((c) => c.slug === categorySlug);
        const updated: Image = {
            ...image!,
            title: title.trim(),
            alt: alt.trim(),
            category: selectedCat
                ? { id: image!.category.id, slug: selectedCat.slug, name: selectedCat.name }
                : image!.category,
            categoryId: image!.categoryId,
        };

        const result = await saveGalleryImageAction(updated);

        if (result.success) {
            onSaved(updated);
            onClose();
        } else {
            setError(result.error || 'Erreur lors de la sauvegarde.');
        }

        setIsSaving(false);
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                        Modifier l&apos;image
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Preview */}
                    <div className="rounded-xl overflow-hidden bg-slate-50 max-h-48 flex items-center justify-center">
                        <CloudImage
                            asset={toCloudinaryAsset(image)}
                            alt={image.alt || image.title}
                            width={image.width || 400}
                            height={image.height || 300}
                            sizes="400px"
                            className="max-h-48 w-auto h-auto object-contain"
                            placeholder="empty"
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
                            {IMAGE_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.slug}
                                    type="button"
                                    onClick={() => setCategorySlug(
                                        categorySlug === cat.slug ? '' : cat.slug
                                    )}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                        ${categorySlug === cat.slug
                                            ? 'bg-red-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
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
            </div>
        </div>
    );
}
