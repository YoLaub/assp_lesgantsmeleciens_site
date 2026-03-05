# Dialog Migration — Native `<dialog>` Element

## Why

Current dialogs are custom `<div>` overlays (`fixed inset-0 z-50`). They lack:
- Focus trapping (Tab can escape the dialog)
- `aria-modal="true"` (screen readers don't know it's a modal)
- Scroll lock (background content scrollable)
- Proper stacking (manual `z-index` management)

Native `<dialog>` with `showModal()` provides all of this automatically.

---

## Files to Convert

| File | Type | Notes |
|------|------|-------|
| `src/shared/components/ui/ConfirmDialog.tsx` | Confirm modal | Start here — simplest, establishes pattern |
| `src/features/gallery/presentation/components/EditImageDialog.tsx` | Form modal | `isOpen` derived from `image !== null` |
| `src/features/gallery/presentation/components/AddImagesDialog.tsx` | Multi-step modal | Prevent ESC close during upload |
| `src/features/gallery/presentation/components/Lightbox.tsx` | Fullscreen viewer | Needs `max-w-none max-h-none m-0` overrides |

---

## Conversion Pattern

### Before (current)
```tsx
export function MyDialog({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl ...">
                {/* content */}
            </div>
        </div>
    );
}
```

### After (native `<dialog>`)
```tsx
import { useRef, useEffect } from 'react';

export function MyDialog({ isOpen, onClose }) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Sync open/close state with dialog API
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) dialog.showModal();
        else if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    // Handle native ESC (dialog fires 'cancel' event)
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
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-0 backdrop:bg-black/50"
            onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
        >
            {/* content — same inner JSX, no wrapper div needed */}
        </dialog>
    );
}
```

---

## Key Details

### What changes
- `<div className="fixed inset-0 z-50 bg-black/50 ...">` → `<dialog className="... backdrop:bg-black/50">`
- Remove `if (!isOpen) return null` — dialog is always in DOM, visibility via `showModal()`/`close()`
- Remove `z-index` — `showModal()` places dialog in the top layer automatically
- Add `p-0` on `<dialog>` to reset browser default padding
- Backdrop styled with Tailwind `backdrop:` variant (targets `::backdrop` pseudo-element)

### What stays the same
- All inner JSX (form fields, buttons, content)
- Tailwind classes on inner elements
- State management and server action calls
- Component props and API

### Backdrop click detection
`showModal()` makes `::backdrop` a pseudo-element of `<dialog>`. Clicking it fires a click on the `<dialog>` element itself. Check `e.target === dialogRef.current` to detect it.

### ESC key handling
Native `<dialog>` closes on ESC and fires a `cancel` event. We `preventDefault()` so we control the close via our state callback (keeping React state in sync).

---

## Per-Component Notes

### ConfirmDialog (shared)
Straightforward conversion. No special handling needed.

### EditImageDialog
- `isOpen` is derived: `const isOpen = image !== null`
- Content guarded with `{image && (...)}` inside the `<dialog>`
- If combined with `<form action={}>` (4D), wrap content in `<form>` inside the dialog

### AddImagesDialog
- Must prevent close during upload: check `step !== 'uploading'` in the `cancel` event handler
- The `cancel` event handler depends on `step` and `pendingImages` state

### Lightbox
- Full viewport: `w-screen h-screen max-w-none max-h-none m-0 bg-black/90`
- Transparent backdrop: `backdrop:bg-transparent` (the dialog itself is the dark background)
- Navigation buttons and image content unchanged

---

## Verification Checklist

- [ ] Each dialog opens centered with correct backdrop
- [ ] ESC closes dialog (except AddImagesDialog during upload)
- [ ] Clicking backdrop closes dialog
- [ ] Tab key stays trapped inside dialog
- [ ] Screen reader announces dialog correctly
- [ ] No z-index conflicts between stacked dialogs (ConfirmDialog over EditImageDialog)
- [ ] Existing Tailwind styling preserved (rounded corners, shadows, spacing)
- [ ] `npm run build` succeeds with no warnings
