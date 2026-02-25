# Gallery (Mediatheque) Feature — Implementation Plan

## Context

The admin dashboard links to `/content/gallery` ("Mediatheque (Galerie)") but the route doesn't exist yet. We need to build an admin-only media library using the MasonryGallery prototype in `devassets/` as base and inspiration, following the project's Clean Architecture pattern established by the Disciplines feature.

**Scope**: Admin media library only — no public-facing page. Upload, view, select, delete images with title/alt/category metadata.

**Key constraint**: This is a collaborative project — we only create new files within the gallery scope. The only existing file we modify is `prisma/schema.prisma` (add model) and `src/app/globals.css` (add one keyframe).

---

## File Tree (all new unless marked MODIFY)

```
prisma/schema.prisma                                          # MODIFY: Add GalleryImage model
src/app/globals.css                                           # MODIFY: Add fadeSlideUp keyframe

src/features/gallery/
  domain/
    models/gallery-image.model.ts
    repositories/gallery-image.repository.ts
    usecases/
      save-gallery-image.usecase.ts
      getAll-gallery-images.usecase.ts
      delete-gallery-image.usecase.ts
      bulk-delete-gallery-images.usecase.ts
  data/
    datasources/gallery-image.postgres.datasource.ts
    repositories/gallery-image.repository.impl.ts
  presentation/
    hooks/
      useImageCollection.ts
      useLightbox.ts
      useKeyboardNavigation.ts
    components/
      GalleryManager.tsx          # Main orchestrator (client component)
      GalleryGrid.tsx             # CSS columns masonry layout
      GalleryCard.tsx             # Individual image card
      Lightbox.tsx                # Full-screen image viewer
      AddImageDialog.tsx          # Modal for uploading + saving images
      SelectionToolbar.tsx        # Floating bulk-actions bar
      GalleryToolbar.tsx          # Top bar with search + add button

src/app/(admin)/content/gallery/
  page.tsx                        # Server page (fetches data, renders GalleryManager)

src/app/(admin)/content/actions/
  gallery.actions.ts              # Server actions (separate from discipline actions)
```

---

## Implementation Steps

### Phase 1: Database

**1. Prisma Model** — `prisma/schema.prisma`

Add after the Discipline model:

```prisma
model GalleryImage {
  id        String   @id @default(uuid())
  title     String
  alt       String   @default("")
  category  String   @default("")
  src       String
  width     Int      @default(0)
  height    Int      @default(0)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then run: `npx prisma generate && npx prisma db push`

### Phase 2: Domain Layer

**2. Model type** — `gallery-image.model.ts`
- Plain TypeScript type matching Prisma model (same pattern as `discipline.model.ts`)

**3. Repository interface** — `gallery-image.repository.ts`
- Methods: `getAll()`, `getById()`, `save()`, `delete()`, `bulkDelete(ids: string[])`

**4. Use cases** (4 files)
- `save-gallery-image.usecase.ts` — validates title length >= 2 and src not empty
- `getAll-gallery-images.usecase.ts` — delegates to repository
- `delete-gallery-image.usecase.ts` — delegates to repository
- `bulk-delete-gallery-images.usecase.ts` — validates ids not empty, delegates

Pattern to follow: `src/features/disciplines/domain/usecases/save-discipline.usecase.ts`

### Phase 3: Data Layer

**5. PostgreSQL datasource** — `gallery-image.postgres.datasource.ts`
- `getGalleryImages()` — findMany ordered by `order: asc`
- `getGalleryImageById()` — findUnique
- `upsertGalleryImage()` — upsert pattern (same as `discipline.postgres.datasource.ts:7-36`)
- `deleteGalleryImage()` — delete by id
- `bulkDeleteGalleryImages()` — deleteMany with `{ id: { in: ids } }`
- Uses `import { prisma } from "@/shared/lib/prisma"`

**6. Repository impl** — `gallery-image.repository.impl.ts`
- Wires interface to datasource (same pattern as `discipline.repository.impl.ts`)

### Phase 4: Server Actions

**7. Gallery actions** — `src/app/(admin)/content/actions/gallery.actions.ts`

Separate file from discipline actions. Contains:
- `getAllGalleryImagesAction()` — returns `{ success, images }`
- `saveGalleryImageAction(data)` — save + revalidatePath
- `deleteGalleryImageAction(id)` — delete + revalidatePath
- `bulkDeleteGalleryImagesAction(ids)` — bulk delete + revalidatePath
- `uploadGalleryImageAction(formData)` — adapted from existing `uploadPhotoAction` in `actions.ts:39-80`, saves to `/public/uploads/gallery/` instead of `/public/uploads/disciplines/`, adds `mkdir(uploadDir, { recursive: true })`

### Phase 5: Presentation — Hooks

**8. `useImageCollection`** — manages images array + selection Set via `useReducer`
- Actions: SET_IMAGES, ADD_IMAGE, REMOVE_IMAGE, TOGGLE_SELECT, SELECT_ALL, CLEAR_SELECTION, DELETE_SELECTED
- Accepts `initialImages` param for server data hydration
- Returns: `{ images, selectedIds, selectedCount, hasSelection, selectedIdsArray, dispatch }`

**9. `useLightbox`** — manages open/close/navigation state
- `open(index)`, `close()`, `next()`, `prev()` with wrap-around
- Returns: `{ isOpen, currentIndex, open, close, next, prev }`

**10. `useKeyboardNavigation`** — binds keyboard events (Delete, Escape, Ctrl+A, Arrows)
- Guards against input/textarea focus
- Accepts callback options object

### Phase 6: Presentation — Components

**11. `GalleryCard`** — individual masonry card
- Translates MasonryGallery CSS module styles to Tailwind
- Selection state: `border-red-500` border, checkmark SVG overlay with scale animation
- Dimmed state: `opacity-55` for unselected cards during selection mode
- Staggered `fadeSlideUp` animation via inline `animationDelay`
- Hover: `scale-[1.03]`, shadow, title overlay gradient

**12. `GalleryGrid`** — CSS columns masonry
- Uses `[columns:4_280px]` Tailwind arbitrary value (= `columns: 4 280px`)
- Maps images to GalleryCards
- Empty state with guidance text

**13. `Lightbox`** — full-screen image viewer
- Fixed overlay `bg-black/90`, click-backdrop-to-close
- Prev/next buttons using `ChevronLeft`/`ChevronRight` from lucide-react
- Shows image title, category, and counter

**14. `AddImageDialog`** — modal for adding images
- Two-step flow: upload file immediately, then fill metadata and save
- Upload zone with drag-click interaction
- Fields: title (required), alt text, category
- Calls `uploadGalleryImageAction` then `saveGalleryImageAction`
- Optimistic add via `onImageAdded` callback
- Styling matches DisciplineForm exactly:
  - Labels: `text-[10px] font-black uppercase text-slate-400`
  - Inputs: `bg-slate-50 border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500`
  - Button: `bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest`

**15. `SelectionToolbar`** — floating bottom bar
- Fixed bottom-center, `bg-slate-900` with `bg-red-600` delete button
- Shows count, select all, delete, clear selection
- Slides in from bottom when selection is active

**16. `GalleryToolbar`** — top bar
- Search input + "Ajouter une image" button
- Matches disciplines page toolbar style (`bg-white p-4 rounded-2xl border-slate-100`)

**17. `GalleryManager`** — orchestrator (client component)
- Receives `initialImages` prop from server page
- Composes all hooks and components
- Client-side search filtering by title/category
- Optimistic delete with server action persistence
- Confirm dialog before bulk delete

### Phase 7: Page

**18. Gallery page** — `src/app/(admin)/content/gallery/page.tsx`
- Async server component
- Calls `getAllGalleryImagesAction()`, passes images to `GalleryManager`
- Header: "Mediatheque" with description, matching disciplines page style

### Phase 8: Minor edits

**19. `src/app/globals.css`** — add `fadeSlideUp` keyframe:
```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Server/Client Bridge

The page (server component) fetches all images and passes them as `initialImages` to `GalleryManager` (client component). All subsequent interactions (selection, lightbox, add, delete) use optimistic local state updates via the `useImageCollection` reducer, followed by server action calls to persist changes.

---

## Reference Files to Reuse

| Pattern | Reference file |
|---------|---------------|
| Prisma model structure | `prisma/schema.prisma` (Discipline model) |
| Domain model type | `src/features/disciplines/domain/models/discipline.model.ts` |
| Repository interface | `src/features/disciplines/domain/repositories/discipline.repository.ts` |
| Use case pattern | `src/features/disciplines/domain/usecases/save-discipline.usecase.ts` |
| Datasource (Prisma) | `src/features/disciplines/data/datasources/discipline.postgres.datasource.ts` |
| Repository impl | `src/features/disciplines/data/repositories/discipline.repository.impl.ts` |
| Server actions | `src/app/(admin)/content/actions/actions.ts` |
| Upload action | `src/app/(admin)/content/actions/actions.ts:39-80` |
| Admin page layout | `src/app/(admin)/content/disciplines/page.tsx` |
| Masonry layout & interactions | `devassets/MasonryGallery/MasonryGallery.tsx` |
| Masonry CSS technique | `devassets/MasonryGallery/MasonryGallery.module.css` |
| Prisma client import | `import { prisma } from "@/shared/lib/prisma"` |

---

## Verification

1. **Prisma**: Run `npx prisma generate && npx prisma db push` — should complete without errors
2. **Build**: Run `npm run build` (or `bun run build`) — no TypeScript errors
3. **Dev server**: Navigate to `/content/gallery` — page renders with empty state
4. **Upload**: Click "Ajouter une image", select a file, fill title, submit — image appears in grid
5. **Lightbox**: Click an image — opens full-screen viewer, arrow keys navigate
6. **Multi-select**: Right-click images — checkmarks appear, selection toolbar shows at bottom
7. **Bulk delete**: Select images, click delete — confirm dialog, images removed
8. **Keyboard**: Ctrl+A selects all, Delete removes selected, Escape clears selection
9. **Search**: Type in search bar — grid filters by title/category
10. **Dashboard link**: Click "Mediatheque (Galerie)" on dashboard — navigates to gallery
