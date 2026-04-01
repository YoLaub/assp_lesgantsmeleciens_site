'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { type Image } from '@/features/gallery/domain/models/image.model';
import { type ImageCategorySlug } from '@/features/gallery/domain/models/gallery-category.model';
import { getGalleryImagesByCategoryAction } from '@/app/admin/content/actions/gallery.actions';
import { ImageSlot } from './ImageSlot';
import { ImageSlotModal } from './ImageSlotModal';

interface ImageSlotPickerProps {
    maxSlots: number;
    categorySlugs: ImageCategorySlug[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    label?: string;
}

export function ImageSlotPicker({
    maxSlots,
    categorySlugs,
    selectedIds,
    onChange,
    label = 'Images',
}: ImageSlotPickerProps) {
    const [allImages, setAllImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

    useEffect(() => {
        async function fetchImages() {
            setLoading(true);
            const fetched: Image[] = [];
            for (const slug of categorySlugs) {
                const result = await getGalleryImagesByCategoryAction(slug);
                if (result.success) {
                    fetched.push(...result.images);
                }
            }
            setAllImages(fetched);
            setLoading(false);
        }
        fetchImages();
    }, [categorySlugs]);

    // Resolve IDs to Image objects; filled slots cluster left, empty slots pad right
    const filledImages: (Image | null)[] = selectedIds
        .map((id) => allImages.find((img) => img.id === id) ?? null)
        .filter((img): img is Image => img !== null);

    const slots: (Image | null)[] = [
        ...filledImages,
        ...Array(Math.max(0, maxSlots - filledImages.length)).fill(null),
    ];

    function handleReorder(fromIndex: number, toIndex: number) {
        const next = [...selectedIds];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        onChange(next);
    }

    function handleRemove(slotIndex: number) {
        // slotIndex maps directly to selectedIds index (filled slots are first)
        const next = selectedIds.filter((_, i) => i !== slotIndex);
        onChange(next);
    }

    function handleSlotClick(slotIndex: number) {
        setActiveSlotIndex(slotIndex);
        setModalOpen(true);
    }

    function handleSelectExisting(image: Image) {
        if (selectedIds.includes(image.id)) return;
        const next = [...selectedIds, image.id];
        onChange(next);
    }

    function handleNewUpload(image: Image) {
        setAllImages((prev) => [image, ...prev]);
        const next = [...selectedIds, image.id];
        onChange(next);
    }

    const enableDnD = maxSlots > 1 && filledImages.length > 1;

    const slotElements = slots.map((img, index) => (
        <div key={img?.id ?? `empty-${index}`} className="flex-1 min-w-0">
            <ImageSlot
                image={img}
                index={index}
                onClickEmpty={() => handleSlotClick(index)}
                onRemove={() => handleRemove(index)}
                draggable={enableDnD && img !== null}
            />
        </div>
    ));

    return (
        <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                {label}
            </label>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                </div>
            ) : enableDnD ? (
                <DragDropProvider
                    onDragEnd={(event) => {
                        if (event.canceled) return;
                        const { source } = event.operation;
                        if (isSortable(source)) {
                            const { initialIndex, index } = source;
                            if (initialIndex !== index) {
                                handleReorder(initialIndex, index);
                            }
                        }
                    }}
                >
                    <div className="flex gap-2">{slotElements}</div>
                </DragDropProvider>
            ) : (
                <div className="flex gap-2">{slotElements}</div>
            )}

            {selectedIds.length > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                    {selectedIds.length} / {maxSlots} image{selectedIds.length > 1 ? 's' : ''}
                </p>
            )}

            <ImageSlotModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setActiveSlotIndex(null); }}
                onSelectImage={handleSelectExisting}
                onImageUploaded={handleNewUpload}
                categorySlugs={categorySlugs}
                availableImages={allImages}
                excludeIds={selectedIds}
            />
        </div>
    );
}
