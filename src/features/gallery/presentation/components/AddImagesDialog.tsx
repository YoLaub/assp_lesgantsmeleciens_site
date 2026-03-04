'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Loader2, Trash2, Check, AlertCircle } from 'lucide-react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { GALLERY_CATEGORIES, type GalleryCategory } from '@/features/gallery/domain/models/gallery-category.model';
import {
    uploadGalleryImageAction,
    bulkSaveGalleryImagesAction,
} from '@/app/admin/content/actions/gallery.actions';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface PendingImage {
    id: string;
    file: File;
    preview: string;
    title: string;
    alt: string;
    category: GalleryCategory | '';
    status: UploadStatus;
    uploadedUrl: string;
    width: number;
    height: number;
    error: string;
}

interface AddImagesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImagesAdded: (images: GalleryImage[]) => void;
}

export function AddImagesDialog({ isOpen, onClose, onImagesAdded }: AddImagesDialogProps) {
    const [step, setStep] = useState<'select' | 'metadata' | 'uploading'>('select');
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [globalCategory, setGlobalCategory] = useState<GalleryCategory | ''>('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    function resetAndClose() {
        pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setPendingImages([]);
        setStep('select');
        setDragActive(false);
        setGlobalCategory('');
        setError('');
        onClose();
    }

    function addFiles(files: FileList | File[]) {
        const newImages: PendingImage[] = Array.from(files)
            .filter((f) => f.type.startsWith('image/'))
            .map((file) => ({
                id: crypto.randomUUID(),
                file,
                preview: URL.createObjectURL(file),
                title: file.name.replace(/\.[^/.]+$/, ''),
                alt: '',
                category: globalCategory,
                status: 'pending' as const,
                uploadedUrl: '',
                width: 0,
                height: 0,
                error: '',
            }));

        if (newImages.length === 0) {
            setError('Aucun fichier image valide sélectionné.');
            return;
        }

        setError('');
        setPendingImages((prev) => [...prev, ...newImages]);
        if (step === 'select') setStep('metadata');
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragActive(false);
        addFiles(e.dataTransfer.files);
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) addFiles(e.target.files);
        e.target.value = '';
    }

    function removePending(id: string) {
        setPendingImages((prev) => {
            const img = prev.find((i) => i.id === id);
            if (img) URL.revokeObjectURL(img.preview);
            const next = prev.filter((i) => i.id !== id);
            if (next.length === 0) setStep('select');
            return next;
        });
    }

    function updatePending(id: string, updates: Partial<PendingImage>) {
        setPendingImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
        );
    }

    function applyGlobalCategory(cat: GalleryCategory | '') {
        setGlobalCategory(cat);
        setPendingImages((prev) =>
            prev.map((img) => ({ ...img, category: cat }))
        );
    }

    async function handleUploadAll() {
        const incomplete = pendingImages.find((img) => !img.title.trim() || img.title.trim().length < 2);
        if (incomplete) {
            setError(`Le titre est requis (min. 2 caractères) pour "${incomplete.title || 'sans titre'}".`);
            return;
        }

        setError('');
        setStep('uploading');

        const CONCURRENCY = 3;
        const results: PendingImage[] = [...pendingImages];

        async function uploadOne(index: number) {
            const img = results[index];

            setPendingImages((prev) =>
                prev.map((p) => (p.id === img.id ? { ...p, status: 'uploading' } : p))
            );

            const formData = new FormData();
            formData.append('file', img.file);

            try {
                const uploadResult = await uploadGalleryImageAction(formData);
                if (uploadResult.success) {
                    results[index] = { ...results[index], status: 'success', uploadedUrl: uploadResult.url, width: uploadResult.width, height: uploadResult.height };
                } else {
                    results[index] = { ...results[index], status: 'error', error: uploadResult.error || 'Erreur' };
                }
            } catch {
                results[index] = { ...results[index], status: 'error', error: 'Erreur réseau' };
            }

            setPendingImages([...results]);
        }

        for (let i = 0; i < results.length; i += CONCURRENCY) {
            const batch = [];
            for (let j = i; j < Math.min(i + CONCURRENCY, results.length); j++) {
                batch.push(uploadOne(j));
            }
            await Promise.allSettled(batch);
        }

        // Save metadata for all successful uploads
        const successfulImages: GalleryImage[] = results
            .filter((img) => img.status === 'success')
            .map((img) => ({
                id: img.id,
                title: img.title.trim(),
                alt: img.alt.trim(),
                category: img.category,
                src: img.uploadedUrl,
                width: img.width,
                height: img.height,
                order: 0,
            }));

        if (successfulImages.length > 0) {
            const saveResult = await bulkSaveGalleryImagesAction(successfulImages);
            if (saveResult.success) {
                onImagesAdded(successfulImages);
            } else {
                setError(saveResult.error || 'Erreur lors de la sauvegarde des métadonnées.');
                return;
            }
        }

        const hasErrors = results.some((img) => img.status === 'error');
        if (!hasErrors) {
            resetAndClose();
        }
    }

    const successCount = pendingImages.filter((i) => i.status === 'success').length;
    const errorCount = pendingImages.filter((i) => i.status === 'error').length;
    const isUploading = step === 'uploading' && pendingImages.some((i) => i.status === 'uploading');

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !isUploading) resetAndClose(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                        Ajouter des images
                    </h2>
                    <button
                        onClick={resetAndClose}
                        disabled={isUploading}
                        className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Drop zone — always visible in select/metadata steps */}
                    {step !== 'uploading' && (
                        <div
                            className={`
                                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                                ${dragActive
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:border-red-400 hover:bg-slate-50'
                                }
                                ${step === 'metadata' ? 'p-4' : ''}
                            `}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className={`text-slate-400 mx-auto ${step === 'metadata' ? 'w-6 h-6 mb-1' : 'w-10 h-10 mb-3'}`} />
                            <p className="text-sm text-slate-600 font-medium">
                                {step === 'metadata'
                                    ? 'Ajouter plus de fichiers'
                                    : 'Glissez des images ici ou cliquez pour sélectionner'
                                }
                            </p>
                            {step === 'select' && (
                                <p className="text-xs text-slate-400 mt-1">JPG, PNG ou WebP — Max 5 Mo par fichier</p>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Metadata step — image list */}
                    {(step === 'metadata' || step === 'uploading') && pendingImages.length > 0 && (
                        <>
                            {/* Global category selector */}
                            {step === 'metadata' && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">
                                        Catégorie pour toutes les images
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {GALLERY_CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => applyGlobalCategory(
                                                    globalCategory === cat.value ? '' : cat.value
                                                )}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                                    ${globalCategory === cat.value
                                                        ? 'bg-red-600 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Per-image cards */}
                            <div className="space-y-3">
                                {pendingImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className={`flex gap-3 p-3 rounded-xl border transition-colors
                                            ${img.status === 'error' ? 'border-red-200 bg-red-50' : ''}
                                            ${img.status === 'success' ? 'border-green-200 bg-green-50' : ''}
                                            ${img.status === 'uploading' ? 'border-amber-200 bg-amber-50' : ''}
                                            ${img.status === 'pending' ? 'border-slate-100 bg-white' : ''}
                                        `}
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                            <img
                                                src={img.preview}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Fields or status */}
                                        <div className="flex-1 min-w-0">
                                            {step === 'metadata' ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={img.title}
                                                        onChange={(e) => updatePending(img.id, { title: e.target.value })}
                                                        placeholder="Titre *"
                                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm
                                                                   focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={img.alt}
                                                        onChange={(e) => updatePending(img.id, { alt: e.target.value })}
                                                        placeholder="Texte alternatif"
                                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm
                                                                   focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 h-full">
                                                    {img.status === 'uploading' && (
                                                        <>
                                                            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                                            <span className="text-sm text-amber-700">Téléchargement...</span>
                                                        </>
                                                    )}
                                                    {img.status === 'success' && (
                                                        <>
                                                            <Check className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-green-700 truncate">{img.title}</span>
                                                        </>
                                                    )}
                                                    {img.status === 'error' && (
                                                        <>
                                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                                            <span className="text-sm text-red-600">{img.error}</span>
                                                        </>
                                                    )}
                                                    {img.status === 'pending' && (
                                                        <span className="text-sm text-slate-500 truncate">{img.title}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove button */}
                                        {step === 'metadata' && (
                                            <button
                                                onClick={() => removePending(img.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors shrink-0 self-start mt-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Upload summary */}
                    {step === 'uploading' && !isUploading && (successCount > 0 || errorCount > 0) && (
                        <div className="text-center text-sm">
                            {successCount > 0 && (
                                <p className="text-green-600 font-medium">
                                    {successCount} image{successCount > 1 ? 's' : ''} ajoutée{successCount > 1 ? 's' : ''}
                                </p>
                            )}
                            {errorCount > 0 && (
                                <p className="text-red-600 font-medium mt-1">
                                    {errorCount} erreur{errorCount > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    )}
                </div>

                {/* Footer */}
                {pendingImages.length > 0 && (
                    <div className="px-6 pb-6 pt-2 flex justify-between items-center border-t border-slate-100 shrink-0">
                        <span className="text-xs text-slate-400">
                            {pendingImages.length} image{pendingImages.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={resetAndClose}
                                disabled={isUploading}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors
                                           disabled:opacity-50"
                            >
                                {step === 'uploading' && !isUploading ? 'Fermer' : 'Annuler'}
                            </button>
                            {step === 'metadata' && (
                                <button
                                    onClick={handleUploadAll}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl
                                               font-black uppercase text-xs tracking-widest transition-all
                                               shadow-lg shadow-red-600/20 active:scale-95"
                                >
                                    Enregistrer
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
