'use client';

import { useState, useRef } from 'react';
import { X, Upload, Loader2, Check } from 'lucide-react';
import { type Image } from '@/features/gallery/domain/models/image.model';
import { type ImageCategorySlug, IMAGE_CATEGORIES } from '@/features/gallery/domain/models/gallery-category.model';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';
import {
    uploadGalleryImageAction,
    saveGalleryImageAction,
} from '@/app/admin/content/actions/gallery.actions';

interface ImageSlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (image: Image) => void;
    onImageUploaded: (image: Image) => void;
    categorySlugs: ImageCategorySlug[];
    availableImages: Image[];
    excludeIds: string[];
}

export function ImageSlotModal({
    isOpen,
    onClose,
    onSelectImage,
    onImageUploaded,
    categorySlugs,
    availableImages,
    excludeIds,
}: ImageSlotModalProps) {
    const [activeTab, setActiveTab] = useState<'galerie' | 'importer'>('galerie');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', categorySlugs[0] || 'autre');

        const uploadResult = await uploadGalleryImageAction(formData);
        if (!uploadResult.success) {
            setUploading(false);
            return;
        }

        const catSlug = categorySlugs[0] || 'autre';
        const catMeta = IMAGE_CATEGORIES.find((c) => c.slug === catSlug);

        const newImage: Image = {
            id: crypto.randomUUID(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            alt: '',
            publicId: uploadResult.asset.publicId,
            version: uploadResult.asset.version,
            format: uploadResult.asset.format,
            width: uploadResult.asset.width,
            height: uploadResult.asset.height,
            bytes: uploadResult.asset.bytes,
            blurDataUrl: uploadResult.blurDataUrl,
            order: 0,
            categoryId: uploadResult.categoryId,
            category: {
                id: uploadResult.categoryId,
                slug: catSlug,
                name: catMeta?.name || catSlug,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await saveGalleryImageAction(newImage);
        setUploading(false);
        onImageUploaded(newImage);
        onClose();
    }

    function handleSelectExisting(image: Image) {
        if (excludeIds.includes(image.id)) return;
        onSelectImage(image);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                        Choisir une image
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex gap-2 px-6 pt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('galerie')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'galerie'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Galerie
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('importer')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'importer'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Importer
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {activeTab === 'galerie' ? (
                        availableImages.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">Aucune image disponible</p>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {availableImages.map((img) => {
                                    const isExcluded = excludeIds.includes(img.id);
                                    return (
                                        <button
                                            key={img.id}
                                            type="button"
                                            onClick={() => handleSelectExisting(img)}
                                            disabled={isExcluded}
                                            className={`relative aspect-square rounded-lg overflow-hidden transition-all ring-offset-1
                                                ${isExcluded
                                                    ? 'opacity-50 cursor-not-allowed ring-1 ring-slate-200'
                                                    : 'ring-1 ring-slate-200 hover:ring-2 hover:ring-red-400 cursor-pointer'
                                                }`}
                                        >
                                            <CloudImage
                                                asset={toCloudinaryAsset(img)}
                                                alt={img.alt || img.title}
                                                fill
                                                sizes="80px"
                                                crop="fill"
                                                className="object-cover"
                                                placeholder="empty"
                                                blurDataUrl={img.blurDataUrl}
                                            />
                                            {isExcluded && (
                                                <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full aspect-[2/1] rounded-xl border-2 border-dashed border-slate-200
                                    hover:border-red-400 hover:bg-red-50 transition-all
                                    flex flex-col items-center justify-center gap-2
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                                        <span className="text-sm text-slate-400 font-medium">Envoi en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-slate-400" />
                                        <span className="text-sm text-slate-500 font-medium">
                                            Cliquez pour importer une image
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            JPG, PNG ou WebP - 5 Mo max
                                        </span>
                                    </>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleUpload}
                                className="hidden"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
