# Image Relational Refactor Design

> Prerequisite: Cloudinary optimization (IMAGE_OPTIMIZATION_PLAN_v2.md) must be completed first.
> This refactor builds on top of the structured `CloudinaryAsset` fields already in place.

---

## Goal

Centralize all image management through a single `Image` table with relational categories. Replace scattered image storage (JSON arrays, string arrays) on `Actualite` and `Discipline` with proper many-to-many relations.

---

## Data Model

### New: `ImageCategory` table

Seeded, no CRUD. Hardcoded categories stored in DB.

```prisma
model ImageCategory {
  id     String  @id @default(uuid())
  name   String          // "Competitions"
  slug   String  @unique // "competitions"
  images Image[]
}
```

Seeded categories:

| slug           | name            |
|----------------|-----------------|
| entrainements  | Entrainements   |
| competitions   | Competitions    |
| evenements     | Evenements      |
| portraits      | Portraits       |
| installations  | Installations   |
| carousel       | Carousel        |
| autre          | Autre           |

### Renamed: `GalleryImage` -> `Image`

Universal image table. Every image in the app lives here.

```prisma
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

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Modified: `Actualite`

```prisma
model Actualite {
  // ...existing fields (title, description, tags, active, featured, seo, etc.)

  // REMOVED: photo String[] / photos Json
  // NEW:
  images      Image[]
  imageOrder  String[]  // ordered array of Image IDs for display

  // ...timestamps
}
```

### Modified: `Discipline`

```prisma
model Discipline {
  // ...existing fields (title, coach, category, citation, description, tags, etc.)

  // REMOVED: photo String[] / photo_coach String?
  // NEW:
  images       Image[]
  imageOrder   String[]  // ordered array of Image IDs for display
  coachImage   Image     @relation("CoachImage", fields: [coachImageId], references: [id])
  coachImageId String

  // ...timestamps
}
```

---

## Category Scoping

Categories are hardcoded in DB (seeded). Scoping per admin form is hardcoded in code:

```ts
// Which categories appear in each admin form's image picker
const ACTUALITE_IMAGE_CATEGORIES = ['competitions', 'evenements', ...]
const DISCIPLINE_IMAGE_CATEGORIES = ['entrainements', 'portraits', ...]
// Gallery admin page shows ALL categories
```

No `type` or `scopes` field needed on `ImageCategory` — the code handles filtering.

---

## Data Flow

### Upload flow
1. Admin uploads image (from gallery admin OR from actualite/discipline form)
2. Image goes to Cloudinary, returns `CloudinaryAsset` metadata
3. `Image` row created with `categoryId` (admin picks category from hardcoded list)

### Linking flow (actualite/discipline admin form)
1. Image picker shows existing images filtered by relevant category slugs
2. Admin can also upload new images (creates `Image` row + links it)
3. Selected image IDs stored via implicit many-to-many join table
4. `imageOrder` array stores IDs in display order

### Display flow (front)
1. Query entity with `include: { images: true }`
2. Sort images using `imageOrder` array
3. Render with `CloudImage` wrapper

### Gallery page (front)
1. Query all `Image` rows, optionally filter by category
2. Order by `order` field (global gallery ordering)

### Coach photo
1. Admin picks one image for coach (browse existing or upload new)
2. Stored as `coachImageId` FK — direct relation, required

---

## Admin UI Changes

### Gallery admin
- Unchanged behavior — manages `Image` rows instead of `GalleryImage`
- Category filter uses `ImageCategory` relation instead of string field

### Actualite/Discipline form — image section
- **New: image picker** showing existing images filtered by relevant categories
- **Kept: upload button** — creates `Image` row + links to entity
- **Kept: reordering** — drag-and-drop updates `imageOrder` array
- **Kept: remove** — unlinks image from entity (image stays in gallery)

### Discipline form — coach photo
- Hybrid: pick existing image or upload new one
- Single selection, required

---

## Migration Strategy

No migration scripts needed. DB will be reset and re-seeded:
- Update Prisma schema
- Update seed files to create `ImageCategory` rows and `Image` rows with relations
- `prisma db push` or `prisma migrate reset`

---

## What Changes vs What Stays

### Changes
| Before | After |
|--------|-------|
| `GalleryImage` table with `category: String` | `Image` table with FK to `ImageCategory` |
| `Actualite.photos: Json` (CloudinaryAsset[]) | `Actualite.images` (implicit M2M) + `imageOrder: String[]` |
| `Discipline.photos: Json` / `coachPhoto: Json` | `Discipline.images` (implicit M2M) + `imageOrder: String[]` + `coachImageId` FK |
| 7 hardcoded categories as TS constant | 7 rows in `ImageCategory` table (seeded, no CRUD) |
| Upload creates data specific to each feature | Upload always creates an `Image` row |
| Actualite/discipline forms: upload-only | Hybrid: browse existing images + upload new |

### Stays the same
- Cloudinary as image CDN
- `CloudinaryAsset` structured metadata on `Image`
- `CloudImage` wrapper component
- Gallery admin page (manages all images)
- Upload pipeline (`uploadPublicImage`)
- Hardcoded category list (moved to DB)

### Not in scope
- Category CRUD UI
- Migration scripts (DB reset + seed)
