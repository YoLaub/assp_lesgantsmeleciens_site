# Image Relational Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Centralize all image management through a single `Image` table with relational `ImageCategory`, replacing scattered photo storage on Actualite and Discipline with many-to-many relations.

**Architecture:** Rename `GalleryImage` to `Image`, create `ImageCategory` table (seeded, no CRUD), use Prisma implicit many-to-many between Image and Actualite/Discipline, add `imageOrder String[]` for display ordering, add `coachImageId` FK on Discipline.

**Tech Stack:** Next.js 16, Prisma 7, PostgreSQL, TypeScript, Cloudinary, React 19

**Prerequisite:** The Cloudinary optimization (IMAGE_OPTIMIZATION_PLAN_v2.md Phase 0) must be completed first. The `Image` table already has structured fields (`publicId`, `version`, `format`, `width`, `height`, `bytes`).

---

## Task 1: Update Prisma Schema ✅

**Files:**
- Modify: `prisma/schema.prisma`

**Status:** Complete. Schema written with `ImageCategory`, `Image`, M2M on `Actualite`/`Discipline`, `coachImage` named relation.

**Manual step required:** Run `npx prisma db push --force-reset && npx prisma generate`

---

## Task 2: Update Seed Files ✅

**Files:**
- Modify: `prisma/seed-gallery.ts` — creates ImageCategory records first, then Image records with `categoryId`. Exports `seedGallery()`.
- Modify: `prisma/seed-actualites.ts` — creates Image records per actualite, connects via M2M + `imageOrder`. Exports `seedActualites(categoryRecords)`.
- Modify: `prisma/seed-disciplines.ts` — creates coach Image + gallery Images per discipline, connects via M2M + `imageOrder` + `coachImageId`. Exports `seedDisciplines(categoryRecords)`.

**Status:** Complete. Each seed can run standalone (fetches categories from DB) or in sequence via `db:seed` script.

**Manual step required:** Run `npm run db:seed`

---

## Task 3: Update Domain Models ✅

**Files:**
- Created: `src/features/gallery/domain/models/image-category.model.ts`
- Created: `src/features/gallery/domain/models/image.model.ts` (flat fields, no nested `asset`)
- Modified: `src/features/gallery/domain/models/gallery-category.model.ts` — `slug/name` fields, `IMAGE_CATEGORIES`, `ImageCategorySlug`, scoping constants
- Modified: `src/features/actualites/domain/models/actualite.model.ts` — `images: Image[]`, `imageOrder: string[]`
- Modified: `src/features/disciplines/domain/models/discipline.model.ts` — `images: Image[]`, `imageOrder: string[]`, `coachImage: Image`, `coachImageId: string`
- Deleted: `src/features/gallery/domain/models/gallery-image.model.ts`

**Status:** Complete.

**Deviation from plan:** `seo` keeps existing `{ metaTitle, metaDescription }` field names (plan suggested `{ title, description }`).

---

## Task 4: Update Gallery Data Layer ✅

**Files:**
- Created: `src/features/gallery/data/datasources/image.postgres.datasource.ts` — `include: { category: true }`, filter by `category: { slug }`, new `getImagesByIds()`
- Created: `src/features/gallery/domain/repositories/image.repository.ts` — added `getByIds()` method
- Created: `src/features/gallery/data/repositories/image.repository.impl.ts`
- Modified: all 7 use cases — `Image` type, `ImageRepository`
- Deleted: old `gallery-image.postgres.datasource.ts`, `gallery-image.repository.ts`, `gallery-image.repository.impl.ts`

**Status:** Complete.

---

## Task 5: Update Actualite Data Layer ✅

**Files:**
- Modified: `src/features/actualites/data/datasources/actualite.postgres.datasource.ts` — M2M `images` relation, `imageOrder`, `include: { images: { include: { category: true } } }` on all queries

**Status:** Complete. Repository interface/impl and use cases unchanged (pass-through Actualite objects).

---

## Task 6: Update Discipline Data Layer ✅

**Files:**
- Modified: `src/features/disciplines/data/datasources/discipline.postgres.datasource.ts` — M2M `images` + `coachImage` relation, `imageOrder`, `coachImageId`, includes on all queries

**Status:** Complete. Repository interface/impl and use cases unchanged (pass-through Discipline objects).

---

## Task 7: Update Server Actions ✅

**Files:**
- Modified: `src/app/admin/content/actions/gallery.actions.ts` — `ImageRepositoryImpl`, `Image` type, `toCloudinaryAsset()` for cleanup, `categoryId` in upload FormData
- `src/app/admin/content/actions/actions.ts` — no changes needed (types flow through domain models)
- `src/app/(front)/*/actions/*.ts` — no changes needed (read-only, return updated domain types)

**Status:** Complete.

**Deviation from plan:** Upload actions still return `CloudinaryAsset` (forms construct Image records client-side). `actions.ts` didn't need changes since `Discipline`/`Actualite` types flow through.

---

## Task 8: Update Gallery Admin Components ✅

**Files modified (10 files):**
- `src/features/gallery/presentation/hooks/useImageCollection.ts` — `Image` type
- `src/features/gallery/presentation/components/GalleryManager.tsx` — `Image`, `category.slug` filtering
- `src/features/gallery/presentation/components/GalleryCard.tsx` — flat fields, `toCloudinaryAsset()`
- `src/features/gallery/presentation/components/GalleryGrid.tsx` — `Image` type
- `src/features/gallery/presentation/components/GalleryListRow.tsx` — flat fields, `toCloudinaryAsset()`
- `src/features/gallery/presentation/components/GalleryListView.tsx` — `Image` type
- `src/features/gallery/presentation/components/GalleryToolbar.tsx` — `IMAGE_CATEGORIES` with `slug/name`
- `src/features/gallery/presentation/components/AddImagesDialog.tsx` — `IMAGE_CATEGORIES`, `ImageCategorySlug`, constructs `Image`
- `src/features/gallery/presentation/components/AddImageDialog.tsx` — same pattern
- `src/features/gallery/presentation/components/EditImageDialog.tsx` — `IMAGE_CATEGORIES`, `toCloudinaryAsset()`

**Shared utility added:** `toCloudinaryAsset()` in `src/shared/lib/cloudinary.ts` — converts flat Image fields to `CloudinaryAsset` for `CloudImage` component.

**Status:** Complete.

---

## Task 9: Build Image Picker Component ✅

**Files:**
- Created: `src/shared/components/ImagePicker.tsx`

Features: fetches images by category slugs, grid display with select/deselect, upload + auto-select, single/multi-select modes.

Props: `categorySlugs`, `selected`, `onSelect`, `multiple`, `label`

**Status:** Complete.

---

## Task 10: Update Actualite Admin Form

**Files:**
- Modify: `src/features/actualites/presentation/components/admin/ActualiteForm.tsx`

**Step 1: Replace photo upload with ImagePicker**

- Remove direct file upload for photos
- Add `ImagePicker` with `categorySlugs={ACTUALITE_IMAGE_CATEGORIES}`
- Manage `imageIds` and `imageOrder` state instead of `photos` URL array
- Keep drag-and-drop reordering (updates `imageOrder`)
- On save: pass `imageIds` and `imageOrder` to `saveActualiteAction()`

**Step 2: Verify actualite admin form works**

Run: `npm run dev` and test creating/editing an actualite.


---

## Task 11: Update Discipline Admin Form

**Files:**
- Modify: `src/features/disciplines/presentation/components/admin/DisciplineForm.tsx`

**Step 1: Replace photo upload with ImagePicker**

- Remove direct file upload for gallery photos and coach photo
- Add `ImagePicker` with `categorySlugs={DISCIPLINE_IMAGE_CATEGORIES}` for gallery images (multiple select)
- Add `ImagePicker` with appropriate categories for coach photo (single select)
- Manage `imageIds`, `imageOrder`, and `coachImageId` state
- On save: pass all to `saveDisciplineAction()`

**Step 2: Verify discipline admin form works**

Run: `npm run dev` and test creating/editing a discipline.


---

## Task 12: Update Front-End Components

**Files:**
- Modify: `src/features/actualites/presentation/components/front/ActualiteCard.tsx`
- Modify: `src/features/disciplines/presentation/components/front/CarouselDiscipline.tsx`
- Modify: `src/features/disciplines/presentation/components/front/DisciplineSection.tsx`
- Modify: `src/features/gallery/presentation/components/CardStackCarousel.tsx`
- Modify: `src/features/gallery/presentation/components/Lightbox.tsx`

**Step 1: Update ActualiteCard**

- Replace `actualite.photo[0]` with first image from `actualite.images` sorted by `actualite.imageOrder`
- Use `CloudImage` with `toCloudinaryAsset(image)`

**Step 2: Update CarouselDiscipline**

- Replace `images: string[]` prop with `images: Image[]` + `imageOrder: string[]`
- Sort images by `imageOrder`
- Use `CloudImage` for rendering
- Fix alt text: `alt={image.alt || \`Photo de ${disciplineName}\`}`

**Step 3: Update DisciplineSection**

- Replace `discipline.photo_coach` with `discipline.coachImage`
- Replace `discipline.photo` with `discipline.images` sorted by `discipline.imageOrder`
- Use `CloudImage` with `toCloudinaryAsset()` for both coach and gallery images

**Step 4: Update CardStackCarousel**

- Replace `GalleryImage` type with `Image`
- Update blur URL to use `buildBlurUrl(toCloudinaryAsset(image))`
- Update category display to use `image.category.name`

**Step 5: Update Lightbox**

- Replace `GalleryImage` type with `Image`
- Update category label display

**Step 6: Verify all front pages work**

Run: `npm run dev` and check gallery, actualites, disciplines pages.


---

## Task 13: Update Gallery Tests

**Files:**
- Modify: `src/features/gallery/__tests__/fixtures.ts`
- Modify: `src/features/gallery/__tests__/mock-repository.ts`
- Modify: `src/features/gallery/data/datasources/gallery-image.postgres.datasource.test.ts` (rename)
- Modify: `src/features/gallery/data/repositories/gallery-image.repository.impl.test.ts` (rename)
- Modify: all use case test files in `src/features/gallery/domain/usecases/`
- Modify: component test files in `src/features/gallery/presentation/`

**Step 1: Update fixtures**

Replace `GalleryImage` fixtures with `Image` fixtures including `category` relation, flat `publicId`/etc fields.

**Step 2: Update mock repository**

Rename to match `ImageRepository` interface, add `getByIds` mock.

**Step 3: Update all test files**

- Replace `GalleryImage` type references with `Image`
- Update field references (`asset.publicId` -> `publicId`, `category` string -> `category` object)
- Ensure all tests pass

**Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.


---

## Task 14: Cleanup

**Files:**
- Delete: `src/features/gallery/lib/cloudinary.ts` (if fully replaced by shared utilities)
- Delete: any leftover `GalleryImage` type references
- Delete: old test files with `gallery-image` names
- Check: no remaining references to `photo: String[]`, `photo_coach`, `GalleryImage`, or `gallery-image` in source code

**Step 1: Search for leftover references**

Run: `grep -r "GalleryImage\|photo_coach\|galleryImage\|gallery-image\|gallery_image" src/ prisma/`
Expected: No matches (except this plan file and design docs).

**Step 2: Delete orphaned files**

Remove any files that are no longer imported.

**Step 3: Final test run**

Run: `npx vitest run`
Expected: All tests pass.

**Step 4: Final dev check**

Run: `npm run dev`
Manually verify: gallery admin, actualite admin, discipline admin, front pages.
