'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { type Image } from '@/features/gallery/domain/models/image.model';
import { type ImageCategorySlug, IMAGE_CATEGORIES } from '@/features/gallery/domain/models/gallery-category.model';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';
import { getGalleryImagesByCategoryAction, uploadGalleryImageAction, saveGalleryImageAction } from '@/app/admin/content/actions/gallery.actions';

interface ImagePickerProps {
    categorySlugs: ImageCategorySlug[];
    selected: string[];
    onSelect: (ids: string[]) => void;
    multiple?: boolean;
    label?: string;
}

export function ImagePicker({
    categorySlugs,
    selected,
    onSelect,
    multiple = true,
    label = 'Images',
}: ImagePickerProps) {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchImages() {
            setLoading(true);
            const allImages: Image[] = [];
            for (const slug of categorySlugs) {
                const result = await getGalleryImagesByCategoryAction(slug);
                if (result.success) {
                    allImages.push(...result.images);
                }
            }
            setImages(allImages);
            setLoading(false);
        }
        fetchImages();
    }, [categorySlugs]);

    function toggleSelect(id: string) {
        if (multiple) {
            if (selected.includes(id)) {
                onSelect(selected.filter((s) => s !== id));
            } else {
                onSelect([...selected, id]);
            }
        } else {
            onSelect(selected.includes(id) ? [] : [id]);
        }
    }

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
        setImages((prev) => [newImage, ...prev]);

        if (multiple) {
            onSelect([...selected, newImage.id]);
        } else {
            onSelect([newImage.id]);
        }

        setUploading(false);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 ml-1">
                    {label}
                </label>
                {selected.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onSelect([])}
                        className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Tout désélectionner
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {/* Upload button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-lg border-2 border-dashed border-slate-200
                                   hover:border-red-400 hover:bg-red-50 transition-all
                                   flex flex-col items-center justify-center gap-1
                                   disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-5 h-5 text-slate-400" />
                                <span className="text-[10px] text-slate-400 font-medium">Ajouter</span>
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

                    {/* Image grid */}
                    {images.map((img) => {
                        const isSelected = selected.includes(img.id);
                        return (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => toggleSelect(img.id)}
                                className={`relative aspect-square rounded-lg overflow-hidden
                                    transition-all ring-offset-1
                                    ${isSelected
                                        ? 'ring-2 ring-red-500 shadow-md'
                                        : 'ring-1 ring-slate-200 hover:ring-red-300'
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
                                {isSelected && (
                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {selected.length > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                    {selected.length} image{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
