# Image Relational Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Centralize all image management through a single `Image` table with relational `ImageCategory`, replacing scattered photo storage on Actualite and Discipline with many-to-many relations.

**Architecture:** Rename `GalleryImage` to `Image`, create `ImageCategory` table (seeded, no CRUD), use Prisma implicit many-to-many between Image and Actualite/Discipline, add `imageOrder String[]` for display ordering, add `coachImageId` FK on Discipline.

**Tech Stack:** Next.js 16, Prisma 7, PostgreSQL, TypeScript, Cloudinary, React 19

**Prerequisite:** The Cloudinary optimization (IMAGE_OPTIMIZATION_PLAN_v2.md Phase 0) must be completed first. The `Image` table already has structured fields (`publicId`, `version`, `format`, `width`, `height`, `bytes`).

---

## Task 1: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add ImageCategory model and update Image/Actualite/Discipline models**

Replace the full schema with:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model ImageCategory {
  id     String  @id @default(uuid())
  name   String
  slug   String  @unique
  images Image[]
}

model Image {
  id          String   @id @default(uuid())
  title       String
  alt         String   @default("")
  publicId    String
  version     Int
  format      String
  width       Int
  height      Int
  bytes       Int      @default(0)
  order       Int      @default(0)

  category    ImageCategory @relation(fields: [categoryId], references: [id])
  categoryId  String

  actualites  Actualite[]
  disciplines Discipline[]

  coachOf     Discipline[] @relation("CoachImage")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Discipline {
  id          String   @id @default(uuid())
  title       String
  coach       String
  category    String
  citation    String?  @db.Text
  description String   @db.Text
  tags        String[]
  active      Boolean  @default(true)

  images       Image[]
  imageOrder   String[]
  coachImage   Image    @relation("CoachImage", fields: [coachImageId], references: [id])
  coachImageId String

  seo       Json
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum InscriptionStatus {
  PENDING
  VALIDATED
  INCOMPLETE
  UNPAID
}

enum PaymentMethod {
  STRIPE
  CHECK
  CASH
}

enum DocumentType {
  MEDICAL_CERTIFICATE
  ID_PHOTO
  ADDRESS_PROOF
  CAF_VOUCHER
  OTHER
}

model Inscription {
  id         String   @id @default(uuid())
  firstName  String
  lastName   String
  email      String   @unique
  phone      String
  birthDate  DateTime
  address    String
  postalCode String
  city       String

  documents Document[]

  status          InscriptionStatus @default(PENDING)
  paymentMethod   PaymentMethod
  stripeSessionId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Document {
  id   String       @id @default(uuid())
  type DocumentType
  name String?
  url  String

  adherent   Inscription @relation(fields: [adherentId], references: [id], onDelete: Cascade)
  adherentId String

  createdAt DateTime @default(now())
}

model Actualite {
  id          String    @id @default(uuid())
  title       String
  description String    @db.Text
  tags        String[]
  active      Boolean   @default(true)
  featured    Boolean   @default(false)

  images      Image[]
  imageOrder  String[]

  seo         Json
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

Note: `Image` needs a `coachOf Discipline[] @relation("CoachImage")` back-relation field for the named relation.

**Step 2: Reset database and regenerate client**

Run: `npx prisma db push --force-reset && npx prisma generate`
Expected: Schema pushed, client regenerated.

---

## Task 2: Update Seed Files

**Files:**
- Modify: `prisma/seed-gallery.ts`
- Modify: `prisma/seed-actualites.ts`
- Modify: `prisma/seed-disciplines.ts`
- Check: main seed file (find it via `grep -r "seed" prisma/package.json` or `prisma/seed.ts`)

**Step 1: Update seed-gallery.ts**

The seed must first create `ImageCategory` rows, then create `Image` rows with `categoryId` FK instead of `category` string. Replace `GalleryImage` references with `Image`.

Key changes:
- Create 7 `ImageCategory` records first
- Replace `prisma.galleryImage.create()` with `prisma.image.create()`
- Replace `category: randomCategory` (string) with `categoryId: categoryRecord.id`
- Replace `src` field with `publicId`, `version`, `format`, `width`, `height`, `bytes`
- Return the created category records so other seeds can reference them

**Step 2: Update seed-actualites.ts**

Replace `photo: String[]` with image relations:
- Create `Image` records for each actualite's photos
- Use `images: { connect: [...imageIds] }` on actualite creation
- Set `imageOrder` to the ordered array of image IDs

**Step 3: Update seed-disciplines.ts**

Replace `photo: String[]` and `photo_coach: String` with image relations:
- Create `Image` records for discipline photos and coach photos
- Use `images: { connect: [...imageIds] }` on discipline creation
- Set `imageOrder` to the ordered array of image IDs
- Set `coachImageId` to the coach image's ID

**Step 4: Run seed**

Run: `npx prisma db seed`
Expected: Seed completes with categories, images, actualites, and disciplines created.

---

## Task 3: Update Domain Models

**Files:**
- Create: `src/features/gallery/domain/models/image-category.model.ts`
- Modify: `src/features/gallery/domain/models/gallery-image.model.ts` (rename to `image.model.ts`)
- Modify: `src/features/gallery/domain/models/gallery-category.model.ts`
- Modify: `src/features/actualites/domain/models/actualite.model.ts`
- Modify: `src/features/disciplines/domain/models/discipline.model.ts`

**Step 1: Create image-category.model.ts**

```ts
export type ImageCategory = {
  id: string
  name: string
  slug: string
}
```

**Step 2: Rename gallery-image.model.ts to image.model.ts**

Update the type to match the new schema:
```ts
import type { ImageCategory } from './image-category.model'

export type Image = {
  id: string
  title: string
  alt: string
  publicId: string
  version: number
  format: string
  width: number
  height: number
  bytes: number
  order: number
  category: ImageCategory
  categoryId: string
  createdAt: Date
  updatedAt: Date
}
```

**Step 3: Update gallery-category.model.ts**

Keep the hardcoded list (used for seeding and UI filtering), but add scoping constants:

```ts
export const IMAGE_CATEGORIES = [
  { slug: 'entrainements', name: 'Entrainements' },
  { slug: 'competitions', name: 'Competitions' },
  { slug: 'evenements', name: 'Evenements' },
  { slug: 'portraits', name: 'Portraits' },
  { slug: 'installations', name: 'Installations' },
  { slug: 'autre', name: 'Autre' },
  { slug: 'carousel', name: 'Carousel' },
] as const

export type ImageCategorySlug = (typeof IMAGE_CATEGORIES)[number]['slug']

export function getCategoryLabel(slug: string): string {
  return IMAGE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
}

// Category scoping for admin forms
export const ACTUALITE_IMAGE_CATEGORIES: ImageCategorySlug[] = ['competitions', 'evenements', 'autre']
export const DISCIPLINE_IMAGE_CATEGORIES: ImageCategorySlug[] = ['entrainements', 'portraits', 'installations']
```

Note: Adjust which categories map to which feature based on your actual needs. These are starting suggestions.

**Step 4: Update actualite.model.ts**

Replace `photo: string[]` with:
```ts
import type { Image } from '@/features/gallery/domain/models/image.model'

export type Actualite = {
  id: string
  title: string
  description: string
  tags: string[]
  active: boolean
  featured: boolean
  images: Image[]
  imageOrder: string[]
  seo: { title: string; description: string }
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

**Step 5: Update discipline.model.ts**

Replace `photo: string[]` and `photo_coach: string | null` with:
```ts
import type { Image } from '@/features/gallery/domain/models/image.model'

export type Discipline = {
  id: string
  title: string
  coach: string
  coachImage: Image
  coachImageId: string
  citation: string | null
  category: string
  description: string
  tags: string[]
  active: boolean
  images: Image[]
  imageOrder: string[]
  seo: { title: string; description: string }
  order: number
  createdAt: Date
  updatedAt: Date
}
```


---

## Task 4: Update Gallery Data Layer

**Files:**
- Modify: `src/features/gallery/data/datasources/gallery-image.postgres.datasource.ts` (rename to `image.postgres.datasource.ts`)
- Modify: `src/features/gallery/domain/repositories/gallery-image.repository.ts` (rename to `image.repository.ts`)
- Modify: `src/features/gallery/data/repositories/gallery-image.repository.impl.ts` (rename to `image.repository.impl.ts`)
- Modify: all gallery use cases in `src/features/gallery/domain/usecases/`

**Step 1: Update datasource**

Key changes:
- Rename class to `ImagePostgresDataSource`
- Replace all `prisma.galleryImage` calls with `prisma.image`
- Add `include: { category: true }` to queries that need category data
- Update `getGalleryImagesByCategory()` to filter by `category: { slug: categorySlug }` instead of `category: categoryString`
- Add new methods: `getImagesByIds(ids: string[])` for fetching images by ID list
- Update create/upsert to use `categoryId` instead of `category` string

**Step 2: Update repository interface**

Rename to `ImageRepository`, update method signatures to use `Image` type instead of `GalleryImage`.

**Step 3: Update repository implementation**

Rename to `ImageRepositoryImpl`, update to use renamed datasource and types.

**Step 4: Update all gallery use cases**

Rename references from `GalleryImage` to `Image`, update imports. Files:
- `save-gallery-image.usecase.ts`
- `save-many-gallery-images.usecase.ts`
- `getAll-gallery-images.usecase.ts`
- `getByCategory-gallery-images.usecase.ts`
- `delete-gallery-image.usecase.ts`
- `bulk-delete-gallery-images.usecase.ts`
- `reorder-gallery-images.usecase.ts`

**Step 5: Run existing gallery tests**

Run: `npx vitest run src/features/gallery/`
Expected: Tests may need updates for renamed types. Fix any import/type errors.

---

## Task 5: Update Actualite Data Layer

**Files:**
- Modify: `src/features/actualites/data/datasources/actualite.postgres.datasource.ts`
- Modify: `src/features/actualites/data/repositories/actualite.repository.impl.ts`
- Modify: all actualite use cases

**Step 1: Update datasource**

Key changes in `upsertActualite()`:
- Remove `photo` field from create/update data
- Add `images: { set: [], connect: imageIds.map(id => ({ id })) }` for the M2M relation
- Add `imageOrder` field
- Add `include: { images: { include: { category: true } } }` to all queries that return actualites

Key changes in read methods (`getActualites`, `getActualiteById`, `getActiveActualites`, `getFeaturedActualite`):
- Add `include: { images: { include: { category: true } } }` to all findMany/findUnique calls

**Step 2: Update repository**

Update method signatures to accept `imageIds: string[]` and `imageOrder: string[]` where photos were previously accepted.

**Step 3: Update use cases**

Update `save-actualite.usecase.ts` to pass image IDs and order instead of photo URLs.


---

## Task 6: Update Discipline Data Layer

**Files:**
- Modify: `src/features/disciplines/data/datasources/discipline.postgres.datasource.ts`
- Modify: `src/features/disciplines/data/repositories/discipline.repository.impl.ts`
- Modify: all discipline use cases

**Step 1: Update datasource**

Key changes in `upsertDiscipline()`:
- Remove `photo` and `photo_coach` fields
- Add `images: { set: [], connect: imageIds.map(id => ({ id })) }` for M2M
- Add `imageOrder` field
- Add `coachImageId` field
- Add `include: { images: { include: { category: true } }, coachImage: { include: { category: true } } }` to all queries

**Step 2: Update repository and use cases**

Same pattern as actualite — update signatures and data flow.


---

## Task 7: Update Server Actions

**Files:**
- Modify: `src/app/admin/content/actions/gallery.actions.ts`
- Modify: `src/app/admin/content/actions/actions.ts`
- Modify: `src/app/(front)/actualites/actions/actualite.actions.ts`
- Modify: `src/app/(front)/disciplines/actions/discipline.actions.ts`

**Step 1: Update gallery.actions.ts**

- Replace all `GalleryImage` references with `Image`
- `uploadGalleryImageAction()` now creates an `Image` row with `categoryId` instead of `category` string
- Update `saveGalleryImageAction()` to accept `categoryId`

**Step 2: Update actions.ts (admin actualite/discipline)**

- `saveDisciplineAction()`: accept `imageIds`, `imageOrder`, `coachImageId` instead of `photo`/`photo_coach`
- `saveActualiteAction()`: accept `imageIds`, `imageOrder` instead of `photo`
- `uploadPhotoAction()` and `uploadActualitePhotoAction()`: these now create an `Image` row in the DB (with a `categoryId`) and return the image ID, not just a URL

**Step 3: Update front actions**

No major changes — just ensure the return types match the updated domain models (images relation instead of photo array).


---

## Task 8: Update Gallery Admin Components

**Files:**
- Modify: `src/features/gallery/presentation/components/GalleryManager.tsx`
- Modify: `src/features/gallery/presentation/components/GalleryCard.tsx`
- Modify: `src/features/gallery/presentation/components/GalleryGrid.tsx`
- Modify: `src/features/gallery/presentation/components/GalleryListRow.tsx`
- Modify: `src/features/gallery/presentation/components/AddImagesDialog.tsx`
- Modify: `src/features/gallery/presentation/components/EditImageDialog.tsx`

**Step 1: Update all components**

Key changes across all components:
- Replace `GalleryImage` type with `Image`
- Replace `image.src` with `buildCloudinaryUrl(image)` (using publicId/version/format)
- Replace `image.category` (string) with `image.category.slug` or `image.category.name`
- `AddImagesDialog`: upload creates `Image` with `categoryId` (select from ImageCategory list)
- `EditImageDialog`: category dropdown uses ImageCategory records instead of hardcoded strings
- `GalleryCard`: update blur URL to use `buildBlurUrl(image)` instead of `getCloudinaryBlurUrl(image.src)`
- `GalleryManager`: category filter uses ImageCategory slugs

**Step 2: Verify gallery admin works**

Run: `npm run dev` and test the gallery admin page.


---

## Task 9: Build Image Picker Component

**Files:**
- Create: `src/shared/components/ImagePicker.tsx`

**Step 1: Build the ImagePicker**

A reusable component for actualite/discipline admin forms. Features:
- Receives `categorySlugs: string[]` to filter which images to show
- Fetches images from DB filtered by those categories
- Grid display of available images (thumbnails)
- Click to select/deselect (multi-select for gallery, single-select for coach)
- Upload button to add new images (creates Image row + selects it)
- Returns selected image IDs
- Props: `categorySlugs`, `selected: string[]`, `onSelect: (ids: string[]) => void`, `multiple: boolean`


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
- Use `CloudImage` with the `Image` object's asset data

**Step 2: Update CarouselDiscipline**

- Replace `images: string[]` prop with `images: Image[]` + `imageOrder: string[]`
- Sort images by `imageOrder`
- Use `CloudImage` for rendering
- Fix alt text: `alt={image.alt || \`Photo de ${disciplineName}\`}`

**Step 3: Update DisciplineSection**

- Replace `discipline.photo_coach` with `discipline.coachImage`
- Replace `discipline.photo` with `discipline.images` sorted by `discipline.imageOrder`
- Use `CloudImage` for both coach and gallery images

**Step 4: Update CardStackCarousel**

- Replace `GalleryImage` type with `Image`
- Update blur URL to use `buildBlurUrl(image)`
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
- Modify: `src/features/gallery/data/datasources/gallery-image.postgres.datasource.test.ts`
- Modify: `src/features/gallery/data/repositories/gallery-image.repository.impl.test.ts`
- Modify: all use case test files in `src/features/gallery/domain/usecases/`
- Modify: component test files in `src/features/gallery/presentation/`

**Step 1: Update fixtures**

Replace `GalleryImage` fixtures with `Image` fixtures including `category` relation, `publicId`, etc.

**Step 2: Update mock repository**

Rename to match `ImageRepository` interface.

**Step 3: Update all test files**

- Replace `GalleryImage` type references with `Image`
- Update field references (`src` -> `publicId`, `category` string -> `category` object)
- Ensure all tests pass

**Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.


---

## Task 14: Cleanup

**Files:**
- Delete: `src/features/gallery/lib/cloudinary.ts` (if `isCloudinaryUrl` and `getCloudinaryBlurUrl` are fully replaced by shared utilities from the Cloudinary optimization)
- Delete: any leftover `GalleryImage` type references
- Check: no remaining references to `photo: String[]`, `photo_coach`, `GalleryImage`, or `gallery-image` in the codebase

**Step 1: Search for leftover references**

Run: `grep -r "GalleryImage\|photo_coach\|galleryImage\|gallery-image\|gallery_image" src/ prisma/`
Expected: No matches (except this plan file and the design doc).

**Step 2: Delete orphaned files**

Remove any files that are no longer imported.

**Step 3: Final test run**

Run: `npx vitest run`
Expected: All tests pass.

**Step 4: Final dev check**

Run: `npm run dev`
Manually verify: gallery admin, actualite admin, discipline admin, front pages.

