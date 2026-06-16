# Image Slot Picker Refactor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unbounded image grid picker with a fixed 5-slot drop zone system for disciplines (1 coach + 4 gallery) and actualites (5 gallery), with drag-and-drop reordering and a modal for uploading/selecting images.

**Architecture:** Three new components: `ImageSlot` (individual slot), `ImageSlotModal` (gallery browse + upload dialog), `ImageSlotPicker` (orchestrator with DnD). These replace the `ImagePicker` usage in both admin forms. Existing server actions and Cloudinary pipeline are reused as-is.

**Tech Stack:** Next.js, React, @dnd-kit/react (already installed), Tailwind, Cloudinary, lucide-react

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/shared/components/ImageSlot.tsx` | Single slot (filled thumbnail or empty drop zone) |
| Create | `src/shared/components/ImageSlotModal.tsx` | Modal dialog: "Galerie" tab + "Importer" tab |
| Create | `src/shared/components/ImageSlotPicker.tsx` | Orchestrator: N slots + DnD + modal state |
| Modify | `src/features/disciplines/.../DisciplineForm.tsx` | Replace 2x ImagePicker with 1+4 slot pickers |
| Modify | `src/features/actualites/.../ActualiteForm.tsx` | Replace 1x ImagePicker with 5 slot picker |

---

## Task 1: Create `ImageSlot` Component

**Files:**
- Create: `src/shared/components/ImageSlot.tsx`

- [ ] **Step 1: Create the ImageSlot component**

```tsx
'use client';

import { X, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/react/sortable';
import { type Image } from '@/features/gallery/domain/models/image.model';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';

interface ImageSlotProps {
    image: Image | null;
    index: number;
    onClickEmpty: () => void;
    onRemove: () => void;
    draggable: boolean;
}

function DraggableSlot({ image, index, onRemove }: { image: Image; index: number; onRemove: () => void }) {
    const { ref, handleRef, isDragging } = useSortable({ id: image.id, index });

    return (
        <div
            ref={ref}
            className={`relative rounded-xl aspect-square overflow-hidden ring-1 ring-slate-200
                group transition-all
                ${isDragging ? 'opacity-50 ring-2 ring-red-400 z-50' : 'hover:ring-red-300'}`}
        >
            <div ref={handleRef} className="absolute inset-0 cursor-grab active:cursor-grabbing">
                <CloudImage
                    asset={toCloudinaryAsset(image)}
                    alt={image.alt || image.title}
                    fill
                    sizes="120px"
                    crop="fill"
                    className="object-cover"
                    placeholder="empty"
                    blurDataUrl={image.blurDataUrl}
                />
            </div>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X className="w-3.5 h-3.5 text-white" />
            </button>
        </div>
    );
}

function StaticFilledSlot({ image, onRemove }: { image: Image; onRemove: () => void }) {
    return (
        <div className="relative rounded-xl aspect-square overflow-hidden ring-1 ring-slate-200 group transition-all hover:ring-red-300">
            <CloudImage
                asset={toCloudinaryAsset(image)}
                alt={image.alt || image.title}
                fill
                sizes="120px"
                crop="fill"
                className="object-cover"
                placeholder="empty"
                blurDataUrl={image.blurDataUrl}
            />
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X className="w-3.5 h-3.5 text-white" />
            </button>
        </div>
    );
}

function EmptySlot({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-200
                hover:border-red-400 hover:bg-red-50 transition-all
                flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
            <Plus className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-medium">Ajouter</span>
        </button>
    );
}

export function ImageSlot({ image, index, onClickEmpty, onRemove, draggable }: ImageSlotProps) {
    if (!image) {
        return <EmptySlot onClick={onClickEmpty} />;
    }
    if (draggable) {
        return <DraggableSlot image={image} index={index} onRemove={onRemove} />;
    }
    return <StaticFilledSlot image={image} onRemove={onRemove} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/ImageSlot.tsx
git commit -m "feat: add ImageSlot component (filled/empty/draggable states)"
```

---

## Task 2: Create `ImageSlotModal` Component

**Files:**
- Create: `src/shared/components/ImageSlotModal.tsx`

- [ ] **Step 1: Create the ImageSlotModal component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/ImageSlotModal.tsx
git commit -m "feat: add ImageSlotModal with gallery browse and upload tabs"
```

---

## Task 3: Create `ImageSlotPicker` Component

**Files:**
- Create: `src/shared/components/ImageSlotPicker.tsx`

- [ ] **Step 1: Create the ImageSlotPicker orchestrator**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/ImageSlotPicker.tsx
git commit -m "feat: add ImageSlotPicker with DnD reordering and modal integration"
```

---

## Task 4: Integrate into `DisciplineForm`

**Files:**
- Modify: `src/features/disciplines/presentation/components/admin/DisciplineForm.tsx`

- [ ] **Step 1: Replace imports**

Replace:
```tsx
import { ImagePicker } from '@/shared/components/ImagePicker';
```
With:
```tsx
import { ImageSlotPicker } from '@/shared/components/ImageSlotPicker';
```

- [ ] **Step 2: Replace coach image picker (around line 178-186)**

Replace:
```tsx
<div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
    <ImagePicker
        categorySlugs={['portraits']}
        selected={coachImageIds}
        onSelect={setCoachImageIds}
        multiple={false}
        label="Photo du Coach"
    />
</div>
```
With:
```tsx
<div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
    <ImageSlotPicker
        maxSlots={1}
        categorySlugs={['portraits']}
        selectedIds={coachImageIds}
        onChange={setCoachImageIds}
        label="Photo du Coach"
    />
</div>
```

- [ ] **Step 3: Replace gallery image picker (around line 247-253)**

Replace:
```tsx
<ImagePicker
    categorySlugs={DISCIPLINE_IMAGE_CATEGORIES}
    selected={imageOrder}
    onSelect={setImageOrder}
    multiple
    label="Sélectionner des images"
/>
```
With:
```tsx
<ImageSlotPicker
    maxSlots={4}
    categorySlugs={DISCIPLINE_IMAGE_CATEGORIES}
    selectedIds={imageOrder}
    onChange={setImageOrder}
    label="Sélectionner des images"
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/features/disciplines/presentation/components/admin/DisciplineForm.tsx
git commit -m "feat: replace ImagePicker with ImageSlotPicker in DisciplineForm"
```

---

## Task 5: Integrate into `ActualiteForm`

**Files:**
- Modify: `src/features/actualites/presentation/components/admin/ActualiteForm.tsx`

- [ ] **Step 1: Replace import**

Replace:
```tsx
import { ImagePicker } from '@/shared/components/ImagePicker';
```
With:
```tsx
import { ImageSlotPicker } from '@/shared/components/ImageSlotPicker';
```

- [ ] **Step 2: Replace image picker (around line 232-238)**

Replace:
```tsx
<ImagePicker
    categorySlugs={ACTUALITE_IMAGE_CATEGORIES}
    selected={imageOrder}
    onSelect={setImageOrder}
    multiple
    label="Sélectionner des images"
/>
```
With:
```tsx
<ImageSlotPicker
    maxSlots={5}
    categorySlugs={ACTUALITE_IMAGE_CATEGORIES}
    selectedIds={imageOrder}
    onChange={setImageOrder}
    label="Sélectionner des images"
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/features/actualites/presentation/components/admin/ActualiteForm.tsx
git commit -m "feat: replace ImagePicker with ImageSlotPicker in ActualiteForm"
```

---

## Task 6: Manual Verification

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test discipline form**

Navigate to `/admin/content/disciplines/new`:
1. Verify 1 coach slot + 4 gallery slots are displayed
2. Click an empty slot -> modal opens with "Galerie" / "Importer" tabs
3. Select an image from the gallery -> slot fills with thumbnail
4. Upload a new image -> slot fills after upload completes
5. Remove an image (hover -> X button) -> slot becomes empty
6. Fill 2+ gallery slots -> drag to reorder -> order updates
7. Try to fill more than 4 gallery slots -> no more empty slots, can't add more
8. Save the discipline -> verify images persist on page reload

- [ ] **Step 3: Test actualite form**

Navigate to `/admin/content/actualites/new`:
1. Verify 5 empty slots are displayed
2. Same interaction tests as above but with 5 slots
3. Verify images from correct categories appear (competitions, evenements, autre)
4. Save and reload to verify persistence

- [ ] **Step 4: Test editing existing records**

Navigate to an existing discipline and actualite:
1. Verify slots are pre-populated with existing images
2. Verify you can remove, add, and reorder
3. Save and verify changes persist
