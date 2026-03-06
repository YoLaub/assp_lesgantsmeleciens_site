# Native `<dialog>` Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all custom `<div>` overlay dialogs with native `<dialog>` elements using `showModal()` for automatic focus trapping, `aria-modal`, scroll lock, and top-layer stacking.

**Architecture:** Each of the 4 dialog components gets converted independently, simplest first. The outer `<div className="fixed inset-0 z-50 bg-black/50 ...">` wrapper becomes a `<dialog>` element. The inner JSX stays identical. State sync is handled via `useEffect` calling `showModal()`/`close()`. ESC handling goes through the native `cancel` event.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS 4, TypeScript

---

## Consumers Reference

These are the files that import the dialog components. **No changes needed** in consumers — props and API stay identical.

| Consumer | Imports |
|----------|---------|
| `src/features/gallery/presentation/components/GalleryManager.tsx` | ConfirmDialog, EditImageDialog, AddImagesDialog, Lightbox |
| `src/features/gallery/presentation/components/CardStackCarousel.tsx` | Lightbox |

---

## Task 1: ConfirmDialog — Simplest conversion, establishes the pattern

**Files:**
- Modify: `src/shared/components/ui/ConfirmDialog.tsx`

**Step 1: Add useRef and useEffect imports**

At the top of the file, add React imports:

```tsx
import { useRef, useEffect } from 'react';
```

**Step 2: Add dialog ref and open/close sync effect**

Inside the component function, before the `isDanger` line, add:

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
}, [isOpen]);
```

**Step 3: Add cancel event handler**

After the open/close effect, add:

```tsx
useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleCancel(e: Event) {
        e.preventDefault();
        onCancel();
    }
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
}, [onCancel]);
```

**Step 4: Remove early return and replace outer div with dialog**

- Remove `if (!isOpen) return null;`
- Replace the outer `<div className="fixed inset-0 z-[60] ...">` with:

```tsx
<dialog
    ref={dialogRef}
    className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-0 backdrop:bg-black/50"
    onClick={(e) => { if (e.target === dialogRef.current) onCancel(); }}
>
```

- Replace the closing `</div>` (the outer one) with `</dialog>`
- Remove the inner wrapper `<div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">` — the `<dialog>` itself now carries those styles
- Keep all inner content (the `p-6 space-y-3` div and the `px-6 pb-6` footer) intact

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors related to ConfirmDialog.

**Step 6: Commit**

```bash
git add src/shared/components/ui/ConfirmDialog.tsx
git commit -m "refactor: convert ConfirmDialog to native <dialog> element"
```

### Final ConfirmDialog code (reference)

```tsx
'use client';

import { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) dialog.showModal();
        else if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        function handleCancel(e: Event) {
            e.preventDefault();
            onCancel();
        }
        dialog.addEventListener('cancel', handleCancel);
        return () => dialog.removeEventListener('cancel', handleCancel);
    }, [onCancel]);

    const isDanger = variant === 'danger';

    return (
        <dialog
            ref={dialogRef}
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-0 backdrop:bg-black/50"
            onClick={(e) => { if (e.target === dialogRef.current) onCancel(); }}
        >
            <div className="p-6 space-y-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                    {title}
                </h3>
                <p className="text-sm text-slate-500">{message}</p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
                                active:scale-95 shadow-lg
                                ${isDanger
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                                }`}
                >
                    {isDanger && <Trash2 className="w-4 h-4" />}
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
```

---

## Task 2: EditImageDialog — Form modal, isOpen derived from image !== null

**Files:**
- Modify: `src/features/gallery/presentation/components/EditImageDialog.tsx`

**Step 1: Add useRef import**

Change the React import to:

```tsx
import { useState, useEffect, useRef } from 'react';
```

**Step 2: Add dialog ref and open/close sync**

After the state declarations (after `const [error, setError] = useState('');`), add:

```tsx
const isOpen = image !== null;
const dialogRef = useRef<HTMLDialogElement>(null);

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
}, [isOpen]);

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleCancel(e: Event) {
        e.preventDefault();
        onClose();
    }
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
}, [onClose]);
```

**Step 3: Remove early return and replace outer div with dialog**

- Remove `if (!image) return null;`
- Replace the outer `<div className="fixed inset-0 z-50 ...">` with:

```tsx
<dialog
    ref={dialogRef}
    className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-0 backdrop:bg-black/50"
    onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
>
```

- Replace closing outer `</div>` with `</dialog>`
- Remove the inner wrapper `<div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">`
- Guard all inner content with `{image && (<>...</>)}` since the dialog stays in the DOM

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/features/gallery/presentation/components/EditImageDialog.tsx
git commit -m "refactor: convert EditImageDialog to native <dialog> element"
```

### Final EditImageDialog code (reference)

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { GALLERY_CATEGORIES, type GalleryCategory } from '@/features/gallery/domain/models/gallery-category.model';
import { saveGalleryImageAction } from '@/app/admin/content/actions/gallery.actions';

interface EditImageDialogProps {
    image: GalleryImage | null;
    onClose: () => void;
    onSaved: (updated: GalleryImage) => void;
}

export function EditImageDialog({ image, onClose, onSaved }: EditImageDialogProps) {
    const [title, setTitle] = useState('');
    const [alt, setAlt] = useState('');
    const [category, setCategory] = useState<GalleryCategory | ''>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const isOpen = image !== null;
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) dialog.showModal();
        else if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        function handleCancel(e: Event) {
            e.preventDefault();
            onClose();
        }
        dialog.addEventListener('cancel', handleCancel);
        return () => dialog.removeEventListener('cancel', handleCancel);
    }, [onClose]);

    useEffect(() => {
        if (image) {
            setTitle(image.title);
            setAlt(image.alt);
            setCategory(image.category as GalleryCategory | '');
            setError('');
            setIsSaving(false);
        }
    }, [image]);

    async function handleSave() {
        if (!title.trim() || title.trim().length < 2) {
            setError('Le titre est requis (minimum 2 caractères).');
            return;
        }

        setIsSaving(true);
        setError('');

        const updated: GalleryImage = {
            ...image!,
            title: title.trim(),
            alt: alt.trim(),
            category,
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
        <dialog
            ref={dialogRef}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-0 backdrop:bg-black/50"
            onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
        >
            {image && (
                <>
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
                            <Image
                                src={image.src}
                                alt={image.alt || image.title}
                                width={image.width || 400}
                                height={image.height || 300}
                                sizes="400px"
                                className="max-h-48 w-auto h-auto object-contain"
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
                                Categorie
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
                </>
            )}
        </dialog>
    );
}
```

---

## Task 3: AddImagesDialog — Multi-step modal, prevent ESC during upload

**Files:**
- Modify: `src/features/gallery/presentation/components/AddImagesDialog.tsx`

**Step 1: Add useEffect import**

Change the React import to:

```tsx
import { useState, useRef, useCallback, useEffect } from 'react';
```

**Step 2: Move state declarations before the early return guard**

The current code has `if (!isOpen) return null;` at line 42, before `resetAndClose` and all the handlers. With native `<dialog>`, we remove that guard, so **no reordering is needed** — we simply delete the guard.

**Step 3: Add dialog ref, open/close sync, and cancel handler**

After the existing state declarations (after `const fileInputRef = useRef<HTMLInputElement>(null);`), add:

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
}, [isOpen]);

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleCancel(e: Event) {
        const isUploading = step === 'uploading' && pendingImages.some((i) => i.status === 'uploading');
        if (isUploading) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        resetAndClose();
    }
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
}, [step, pendingImages]);
```

**Important:** The cancel handler checks `step` and `pendingImages` to prevent ESC close during upload.

**Step 4: Remove early return, replace outer div with dialog**

- Remove `if (!isOpen) return null;`
- Replace outer `<div className="fixed inset-0 z-50 ...">` with:

```tsx
<dialog
    ref={dialogRef}
    className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col p-0 backdrop:bg-black/50"
    onClick={(e) => {
        const isCurrentlyUploading = step === 'uploading' && pendingImages.some((i) => i.status === 'uploading');
        if (e.target === dialogRef.current && !isCurrentlyUploading) resetAndClose();
    }}
>
```

- Replace closing outer `</div>` with `</dialog>`
- Remove the inner wrapper `<div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">`
- Keep all inner content unchanged

**Step 5: Note about `resetAndClose` reference in cancel handler**

The `resetAndClose` function is defined after the effects. This works because `resetAndClose` is read at event time, not at registration time — the event listener closure captures variables from the render scope. However, to avoid lint warnings, move the `resetAndClose` function definition **above** the effects, or wrap it in `useCallback`. The simplest approach: wrap `resetAndClose` with `useCallback`:

```tsx
const resetAndClose = useCallback(() => {
    pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setPendingImages([]);
    setStep('select');
    setDragActive(false);
    setGlobalCategory('');
    setError('');
    onClose();
}, [pendingImages, onClose]);
```

And update the cancel effect dependency array to include `resetAndClose`:

```tsx
}, [step, pendingImages, resetAndClose]);
```

**Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add src/features/gallery/presentation/components/AddImagesDialog.tsx
git commit -m "refactor: convert AddImagesDialog to native <dialog> element

Prevents ESC close during active uploads via cancel event handler."
```

---

## Task 4: Lightbox — Fullscreen viewer

**Files:**
- Modify: `src/features/gallery/presentation/components/Lightbox.tsx`

**Step 1: Add React imports**

```tsx
import { useRef, useEffect } from 'react';
```

**Step 2: Add dialog ref and sync effects**

Inside the component, after the destructured props, add:

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const shouldBeOpen = isOpen && images.length > 0;
    if (shouldBeOpen && !dialog.open) dialog.showModal();
    else if (!shouldBeOpen && dialog.open) dialog.close();
}, [isOpen, images.length]);

useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleCancel(e: Event) {
        e.preventDefault();
        onClose();
    }
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
}, [onClose]);
```

**Step 3: Remove early return and replace outer div**

- Remove `if (!isOpen || images.length === 0) return null;`
- Remove `const image = images[currentIndex]; if (!image) return null;`
- Replace the outer `<div className="fixed inset-0 z-50 bg-black/90 ...">` with:

```tsx
<dialog
    ref={dialogRef}
    className="w-screen h-screen max-w-none max-h-none m-0 bg-black/90 flex items-center justify-center p-0 backdrop:bg-transparent"
    onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
>
```

- Replace closing outer `</div>` with `</dialog>`
- Guard all inner content with a check: `{isOpen && images.length > 0 && images[currentIndex] && (<>...</>)}`
- Inside the guard, use `images[currentIndex]` directly (assign to a local `const image = images[currentIndex]!;` at the top of the guard block for readability)

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/features/gallery/presentation/components/Lightbox.tsx
git commit -m "refactor: convert Lightbox to native <dialog> element

Uses fullscreen overrides: w-screen h-screen max-w-none max-h-none m-0."
```

### Final Lightbox code (reference)

```tsx
'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { getCategoryLabel } from '@/features/gallery/domain/models/gallery-category.model';
import { ChevronLeft, ChevronRight, X, Pencil } from 'lucide-react';

interface LightboxProps {
    images: GalleryImage[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    onEdit?: (image: GalleryImage) => void;
}

export function Lightbox({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNext,
    onPrev,
    onEdit,
}: LightboxProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const shouldBeOpen = isOpen && images.length > 0;
        if (shouldBeOpen && !dialog.open) dialog.showModal();
        else if (!shouldBeOpen && dialog.open) dialog.close();
    }, [isOpen, images.length]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        function handleCancel(e: Event) {
            e.preventDefault();
            onClose();
        }
        dialog.addEventListener('cancel', handleCancel);
        return () => dialog.removeEventListener('cancel', handleCancel);
    }, [onClose]);

    return (
        <dialog
            ref={dialogRef}
            className="w-screen h-screen max-w-none max-h-none m-0 bg-black/90 flex items-center justify-center p-0 backdrop:bg-transparent"
            onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
        >
            {isOpen && images.length > 0 && images[currentIndex] && (() => {
                const image = images[currentIndex];
                return (
                    <>
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
                            aria-label="Fermer"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Previous button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onPrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                            aria-label="Image precedente"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        {/* Image */}
                        <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4">
                            <Image
                                src={image.src}
                                alt={image.alt || image.title}
                                width={image.width || 1200}
                                height={image.height || 800}
                                sizes="90vw"
                                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg"
                            />
                            <div className="text-center">
                                <p className="text-white text-lg font-semibold">{image.title}</p>
                                {image.category && (
                                    <span className="inline-block mt-1 px-3 py-1 bg-white/10 rounded-lg text-white/70 text-xs font-semibold uppercase tracking-wide">
                                        {getCategoryLabel(image.category)}
                                    </span>
                                )}
                                <div className="flex items-center justify-center gap-3 mt-2">
                                    <p className="text-white/40 text-xs">
                                        {currentIndex + 1} / {images.length}
                                    </p>
                                    {onEdit && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(image); }}
                                            className="text-white/50 hover:text-white transition-colors"
                                            aria-label="Modifier cette image"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Next button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                            aria-label="Image suivante"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </>
                );
            })()}
        </dialog>
    );
}
```

---

## Task 5: Final build and full verification

**Step 1: Run full build**

Run: `npm run build`
Expected: Clean build, no warnings.

**Step 2: Run existing tests**

Run: `npm test`
Expected: All tests pass (useLightbox tests should still pass since they test the hook, not the component).

**Step 3: Manual verification checklist**

Test in the browser:

- [ ] ConfirmDialog opens centered with backdrop
- [ ] ConfirmDialog closes on ESC
- [ ] ConfirmDialog closes on backdrop click
- [ ] Tab stays trapped inside ConfirmDialog
- [ ] EditImageDialog opens with image data populated
- [ ] EditImageDialog closes on ESC
- [ ] EditImageDialog closes on backdrop click
- [ ] AddImagesDialog opens and accepts file drops
- [ ] AddImagesDialog ESC is blocked during upload
- [ ] AddImagesDialog backdrop click is blocked during upload
- [ ] Lightbox opens fullscreen with image
- [ ] Lightbox closes on ESC
- [ ] Lightbox prev/next navigation works
- [ ] Lightbox closes on backdrop click
- [ ] ConfirmDialog stacks correctly over EditImageDialog (both in top layer)
- [ ] Screen reader announces dialogs as modal

**Step 4: Commit any fixes**

If any issues are found during manual testing, fix and commit.

---

## Order of Execution

1. **Task 1** — ConfirmDialog (establishes the pattern)
2. **Task 2** — EditImageDialog (form modal with derived `isOpen`)
3. **Task 3** — AddImagesDialog (most complex — upload-blocking ESC)
4. **Task 4** — Lightbox (fullscreen overrides)
5. **Task 5** — Final verification
