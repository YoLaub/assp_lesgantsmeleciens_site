# Image Optimization Plan v2 — Les Gants Meleciens

> Based on: Audit report (2026-03-06, branch `jlx-image-overall`)
> Sources: Next.js docs, next-cloudinary docs, Cloudinary docs (via Context7)
> Core principle: **Store Cloudinary identifiers and metadata at upload time — never reconstruct from URLs.**

---

## Guiding Principle

The current codebase stores raw Cloudinary `secure_url` strings in the database and then attempts to reconstruct public IDs, build blur URLs, and derive dimensions from those URLs at render time. This is backwards. Cloudinary's upload response already contains **everything** — the public ID, version, format, dimensions, resource type. Storing these at upload time eliminates an entire class of fragile regex-based URL parsing, and makes every downstream operation (rendering with `CldImage`, building transformation URLs, deleting assets, generating blur placeholders) trivial and reliable.

---

## Phase 0 — Data Model: `CloudinaryAsset` Type

**Why this is Phase 0:** Every other phase depends on having clean, structured image metadata in the database. This change is the foundation that makes everything else simple.

### 0.1 — Define the shared type

```ts
// src/shared/types/cloudinary.ts

/** What Cloudinary returns at upload time — store ALL of this. */
export interface CloudinaryAsset {
  publicId: string       // e.g. "gants-meleciens/gallery/abc123"
  version: number        // e.g. 1719307544
  format: string         // e.g. "jpg", "webp", "png"
  width: number          // original pixel width
  height: number         // original pixel height
  bytes: number          // file size in bytes
  resourceType: string   // "image" (or "video" if you ever need it)
}
```

Why each field matters:

| Field | Used for |
|-------|----------|
| `publicId` | `CldImage src`, delete operations, building any transformation URL |
| `version` | Cache-busting (`v1719307544` in URLs) — without it, CDN may serve stale after overwrite |
| `format` | Knowing what was uploaded, debugging, conditional logic |
| `width` / `height` | Preventing CLS (layout shift), correct `aspect-ratio` containers, responsive `sizes` |
| `bytes` | Admin UI (show file sizes), quota tracking, future size budgets |
| `resourceType` | Future-proofing for video support |

### 0.2 — Build a URL from stored metadata (not the other way around)

Instead of the current flow where you store a URL and then parse it, the new utility **builds** URLs when needed:

```ts
// src/shared/lib/cloudinary.ts

import { type CloudinaryAsset } from '@/shared/types/cloudinary'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

/**
 * Build a Cloudinary delivery URL from stored metadata.
 * Only needed when you can't use CldImage (e.g. og:image meta tags, emails).
 */
export function buildCloudinaryUrl(
  asset: CloudinaryAsset,
  transformations: string[] = []
): string {
  const txPart = transformations.length > 0
    ? transformations.join(',') + '/'
    : ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${txPart}v${asset.version}/${asset.publicId}.${asset.format}`
}

/**
 * Build a tiny blur placeholder URL — ~300 bytes, instant load.
 * No regex, no URL manipulation.
 */
export function buildBlurUrl(asset: CloudinaryAsset): string {
  return buildCloudinaryUrl(asset, ['w_30', 'e_blur:1000', 'q_1', 'f_auto'])
}
```

Notice: **zero regex, zero URL parsing.** Every operation is construction from known data, not extraction from opaque strings.

### 0.3 — Update the Prisma schema

#### GalleryImage — migrate from `src: String` to structured fields

```prisma
model GalleryImage {
  id          String   @id @default(uuid())
  title       String
  alt         String   @default("")
  category    String   @default("")

  // ❌ OLD: src String (opaque Cloudinary URL)
  // ✅ NEW: structured Cloudinary metadata
  publicId    String              // "gants-meleciens/gallery/abc123"
  version     Int                 // 1719307544
  format      String              // "jpg"
  width       Int                 // pixel width (already existed, now always populated)
  height      Int                 // pixel height (already existed, now always populated)
  bytes       Int      @default(0)

  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Keep the old `src` column temporarily for migration
  // src       String?  @map("src_legacy")
}
```

#### Actualite — replace `photo String[]` with a JSON array of `CloudinaryAsset`

```prisma
model Actualite {
  // ...existing fields...

  // ❌ OLD: photo String[]  (array of opaque URLs)
  // ✅ NEW: structured array
  photos  Json     @default("[]")
  // Runtime type: CloudinaryAsset[]

  // ...
}
```

Why `Json` instead of a separate relation table: these photos have no independent identity — they only exist as part of an Actualite. A JSON column keeps the data co-located and avoids N+1 queries. Prisma's `Json` type maps to PostgreSQL's native `jsonb`, which supports indexing if needed later.

#### Discipline — same treatment

```prisma
model Discipline {
  // ...existing fields...

  // ❌ OLD: photo_coach String?  / photo String[]
  // ✅ NEW:
  coachPhoto   Json?    // CloudinaryAsset | null
  photos       Json     @default("[]")  // CloudinaryAsset[]

  // ...
}
```

### 0.4 — Update the upload pipeline

**Current** `uploadPublicImage()` returns `{ url, width, height }` — discarding most of Cloudinary's response.

**New** — capture and return the full `CloudinaryAsset`:

```ts
// src/shared/lib/upload.ts

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { type CloudinaryAsset } from '@/shared/types/cloudinary'

export async function uploadPublicImage(
  file: File,
  subFolder: string
): Promise<CloudinaryAsset> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  const result: UploadApiResponse = await cloudinary.uploader.upload(base64, {
    folder: `gants-meleciens/${subFolder}`,
    resource_type: 'image',
  })

  return {
    publicId: result.public_id,
    version: result.version,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    resourceType: result.resource_type,
  }
}
```

This is the **single source of truth** at upload time. Every server action (`uploadGalleryImageAction`, `uploadActualitePhotoAction`, `uploadPhotoAction`) now receives a `CloudinaryAsset` and stores it directly. No more "Gallery returns dimensions, Actualites doesn't" inconsistency — it's structurally impossible.

### 0.5 — Data migration for existing records

Write a one-shot script that:

1. Reads every record with an old `src` / `photo` URL
2. Calls Cloudinary's Admin API (`cloudinary.api.resource(publicId)`) to get the full metadata
3. Extracts the public ID from the URL (one last time, using the regex)
4. Writes the structured `CloudinaryAsset` to the new fields
5. Verifies all records migrated, then drop the legacy columns

```ts
// scripts/migrate-cloudinary-metadata.ts

import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/shared/lib/prisma'

// Temporary — last time we ever do URL parsing
function extractPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/)
  return match?.[1] ?? ''
}

async function migrateGalleryImages() {
  const images = await prisma.galleryImage.findMany()

  for (const img of images) {
    const publicId = extractPublicId(img.src)
    if (!publicId) {
      console.warn(`Skipping GalleryImage ${img.id}: could not extract publicId`)
      continue
    }

    try {
      const resource = await cloudinary.api.resource(publicId)
      await prisma.galleryImage.update({
        where: { id: img.id },
        data: {
          publicId: resource.public_id,
          version: resource.version,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          bytes: resource.bytes,
        },
      })
    } catch (err) {
      console.error(`Failed for ${img.id} (${publicId}):`, err)
    }
  }
}

// Similar functions for Actualite.photo[] and Discipline.photo[] / photo_coach
// ...
```

Rate limit note: Cloudinary Admin API has rate limits (500 calls/hour on free plan). For a small club site this is fine, but batch with `Promise.allSettled` + throttling if you have hundreds of images.

---

## Phase 1 — Adopt `next-cloudinary` + `<CloudImage>` Wrapper

### 1.1 — Install `next-cloudinary`

```bash
npm install next-cloudinary
```

Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env`.

### 1.2 — Update `next.config.ts`

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    // REMOVE picsum.photos in production
  ],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [32, 48, 64, 96, 128, 256, 384],
},
```

### 1.3 — Create the `<CloudImage>` wrapper

Now that we store `CloudinaryAsset`, the wrapper doesn't need URL sniffing or regex extraction. It receives structured data:

```tsx
// src/shared/components/CloudImage.tsx
'use client'

import { CldImage } from 'next-cloudinary'
import Image from 'next/image'
import { type CloudinaryAsset } from '@/shared/types/cloudinary'
import { buildBlurUrl } from '@/shared/lib/cloudinary'

type CloudImageProps = {
  /** Pass a CloudinaryAsset for Cloudinary images, or a string path for local images */
  asset?: CloudinaryAsset
  /** Fallback: local path like "/Header.webp" — uses standard next/image */
  localSrc?: string
  alt: string
  sizes: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  crop?: string
  gravity?: string
  className?: string
  placeholder?: 'blur' | 'empty'
}

export function CloudImage({
  asset,
  localSrc,
  alt,
  sizes,
  fill,
  width,
  height,
  priority,
  crop = 'limit',
  gravity,
  className,
  placeholder = 'blur',
}: CloudImageProps) {
  // Cloudinary asset → CldImage (f_auto, q_auto, responsive srcset from CDN)
  if (asset) {
    return (
      <CldImage
        src={asset.publicId}
        width={fill ? undefined : (width ?? asset.width)}
        height={fill ? undefined : (height ?? asset.height)}
        fill={fill}
        alt={alt}
        sizes={sizes}
        priority={priority}
        crop={crop}
        gravity={gravity}
        className={className}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? buildBlurUrl(asset) : undefined}
      />
    )
  }

  // Local / non-Cloudinary images → standard next/image
  if (localSrc) {
    return (
      <Image
        src={localSrc}
        width={width}
        height={height}
        fill={fill}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    )
  }

  return null
}
```

What this gives you compared to v1 of the plan:

- **No `isCloudinaryUrl()` check** — the caller passes an `asset` or a `localSrc`, never an ambiguous string
- **No `getCloudinaryPublicId()` regex** — `asset.publicId` is already there
- **Blur placeholders for free** — `buildBlurUrl(asset)` just constructs a URL from known fields
- **Correct `width`/`height` always** — directly from `asset.width` / `asset.height`, not hardcoded or defaulting to `800x600`

### 1.4 — Usage examples across features

```tsx
// Gallery card — asset comes from DB with full metadata
<CloudImage asset={image} alt={image.alt} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />

// Actualite card — asset comes from the parsed JSON array
<CloudImage asset={actualite.photos[0]} alt={`Photo de ${actualite.titre}`} fill sizes="(max-width: 768px) 100vw, 300px" />

// Header background — local static image
<CloudImage localSrc="/Header.webp" fill priority sizes="100vw" alt="Salle de boxe" />

// Coach photo — single nullable asset
{discipline.coachPhoto && (
  <CloudImage asset={discipline.coachPhoto} alt={`Coach ${discipline.coachName}`} width={150} height={150} crop="fill" gravity="face" sizes="150px" />
)}
```

### 1.5 — Eliminate old utilities

After migration, **delete entirely**:

| Utility | Reason for deletion |
|---------|-------------------|
| `isCloudinaryUrl(src)` | No longer needed — we know the data type at compile time |
| `getCloudinaryBlurUrl(src)` | Replaced by `buildBlurUrl(asset)` — no URL manipulation |
| `getCloudinaryPublicId(url)` | Never created — the `publicId` is already stored |

The `features/gallery/lib/cloudinary.ts` file can be deleted or replaced by the shared utilities.

---

## Phase 2 — Fix Critical Issues

### 2.1 — Remove `unoptimized` from Header background

**File:** `Header.tsx:17`

Single biggest perf win. The full-viewport `Header.webp` is served unoptimized — no resizing, no format conversion.

**Fix:** Use static import for auto-generated `blurDataURL`:

```tsx
import headerBg from '@/../public/Header.webp'

<Image src={headerBg} fill priority sizes="100vw" placeholder="blur" alt="Salle de boxe Les Gants Meleciens" />
```

Static imports give you automatic `width`, `height`, and `blurDataURL` with zero effort.

### 2.2 — Cloudinary cleanup on delete

Now trivial — `publicId` is stored, no parsing needed:

```ts
// src/shared/lib/cloudinary.ts

export async function deleteCloudinaryAsset(asset: CloudinaryAsset): Promise<void> {
  await cloudinary.uploader.destroy(asset.publicId)
}

export async function deleteCloudinaryAssets(assets: CloudinaryAsset[]): Promise<void> {
  const publicIds = assets.map(a => a.publicId)
  await cloudinary.api.delete_resources(publicIds)
}
```

Call in every server action that deletes records. Type-safe, no URL parsing, can't accidentally pass a malformed string.

### 2.3 — Remove `picsum.photos` from `next.config.ts`

Dev leftover — remove it.

---

## Phase 3 — Universal Blur Placeholders

With `CloudinaryAsset` stored, blur placeholders become essentially free for every feature.

### 3.1 — How it works

The `buildBlurUrl(asset)` function constructs:

```
https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_30,e_blur:1000,q_1,f_auto/v1719307544/gants-meleciens/gallery/abc123.jpg
```

This is a ~300 byte image that Cloudinary caches on CDN. The `CloudImage` wrapper passes it as `blurDataURL` automatically when `placeholder="blur"`.

### 3.2 — Coverage after this phase

| Feature | Before | After |
|---------|--------|-------|
| Gallery (CardStackCarousel, GalleryCard) | Blur via `getCloudinaryBlurUrl()` URL hack | Blur via `buildBlurUrl(asset)` |
| Actualites (cards, detail page, section) | No blur | Blur from `asset` metadata |
| Disciplines (carousel, coach, section) | No blur | Blur from `asset` metadata |

No per-feature implementation needed — the wrapper handles it.

---

## Phase 4 — Fix Alt Text & Accessibility

### 4.1 — `CarouselDiscipline.tsx`

**Current:** `alt={images[currentIndex].slice(0,5)}` — slicing a URL string, meaningless.

**Fix:** Now that `photos` is `CloudinaryAsset[]`, this doesn't even type-check anymore. Replace with:

```tsx
alt={`Photo de ${discipline.nom} - ${currentIndex + 1} sur ${photos.length}`}
```

### 4.2 — `DisciplineForm.tsx` coach photo

**Current:** `alt="Coach"` → **Fix:** `alt={`Photo du coach ${coachName || 'de la discipline'}`}`

### 4.3 — `AddImagesDialog.tsx` native `<img>`

**Current:** `alt=""` → **Fix:** `alt={`Aperçu de ${file.name}`}`

The native `<img>` here is fine — it's a local blob preview before upload, not a Cloudinary image.

---

## Phase 5 — Static Asset Cleanup

### 5.1 — Delete unused files from `public/`

Remove: `1.webp`, `2.jpg`, `3.avif`, `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.

### 5.2 — Convert local assets to static imports

| Asset | Current | Change |
|-------|---------|--------|
| `Header.webp` | `src="/Header.webp"` + `unoptimized` | Static import, remove `unoptimized` |
| `logoBlanc.webp` | `src="/logoBlanc.webp"` | Static import |
| `logoNoir.webp` | `src="/logoNoir.webp"` | Static import |
| `gant_de_boxe.jpg` | `src="/gant_de_boxe.jpg"` | Static import (auto WebP/AVIF + blur) |
| `accueil_valeur.png` | `src="/accueil_valeur.png"` | Static import (auto WebP/AVIF + blur) |

Static imports give free `width`, `height`, `blurDataURL`, and Next.js serves optimal format.

### 5.3 — Verify `default-coach.jpg` exists and is optimized

Referenced as fallback in `DisciplineSection.tsx` but missing from audit file list.

---

## Phase 6 — Fine-tune Performance

### 6.1 — Audit `sizes` accuracy

| Component | Current `sizes` | Status |
|-----------|----------------|--------|
| Header bg | `100vw` | ✅ Correct |
| Boxing gloves | `(max-width: 768px) 100vw, 384px` | Verify 384px matches CSS |
| GalleryCard | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw` | ✅ Matches grid |
| Lightbox | `90vw` | ✅ Correct |
| Thumbnails | `48px` | ✅ Correct |

### 6.2 — Add `priority` to LCP candidates

Currently 3 images have `priority`. Run Lighthouse on each route and ensure the LCP image has `priority`. Likely candidates: featured actualite on homepage, hero images on discipline pages.

### 6.3 — `quality` is handled by Cloudinary

With `CldImage`, Cloudinary's `q_auto` analyzes each image individually and picks optimal compression. No need to manually set `quality` per-component — it's smarter than a fixed value.

---

## Implementation Progress

> Last updated: 2026-03-06 — branch `jlx-image-overall`

| # | Task | Status |
|---|------|--------|
| **P0.1** | Define `CloudinaryAsset` type (`src/shared/types/cloudinary.ts`) | DONE |
| **P0.2** | Build URL utilities (`buildCloudinaryUrl`, `buildBlurUrl`) | DONE |
| **P0.3** | Update Prisma schema (new fields + legacy columns kept) | DONE |
| **P0.4** | Update upload pipeline, domain models, datasources, server actions, components | DONE |
| **P0.5** | Data migration script (`scripts/migrate-cloudinary-metadata.ts`) | DONE |
| **P1.1** | Install `next-cloudinary` | DONE |
| **P1.2** | Update `next.config.ts` (formats, deviceSizes, remove picsum) | DONE |
| **P1.3** | Create `<CloudImage>` wrapper component | DONE |
| **P1.4** | Adopt `<CloudImage>` in all features | DONE |
| **P1.5** | Delete old `features/gallery/lib/cloudinary.ts` utilities | DONE |
| **P2.1** | Remove `unoptimized` from Header (use static import) | DONE |
| **P2.2** | Cloudinary cleanup on delete (server actions) | DONE |
| **P2.3** | Remove `picsum.photos` from `next.config.ts` | DONE |
| **P3** | Universal blur placeholders (verify across all features) | DONE |
| **P4.1** | Fix `CarouselDiscipline` alt text | DONE |
| **P4.2** | Fix `DisciplineForm` coach photo alt | DONE |
| **P4.3** | Fix `AddImagesDialog` preview alt | DONE |
| **P5.1** | Delete unused files from `public/` | SKIPPED |
| **P5.2** | Convert local assets to static imports | DONE |
| **P5.3** | Verify `default-coach.jpg` exists | DONE |
| **P6.1** | Audit `sizes` accuracy | DONE |
| **P6.2** | Add `priority` to LCP candidates | DONE |

### Notes on completed work

- **P0.4** was the largest task — cascaded through ~25 files: upload.ts, 3 domain models, 3 datasources, 3 server actions, 2 use cases, 10 components, 1 test fixture.
- **P4.1** was fixed during P0.4 when CarouselDiscipline was rewritten to accept `CloudinaryAsset[]`.
- All production TypeScript errors are resolved. Remaining test file errors are pre-existing mock typing issues.
- Legacy DB columns (`src`, `photo`, `photo_coach`) are kept with defaults for migration — remove after running migration script.
- **P1.2+P2.3** done together — added `formats`, `deviceSizes`, `imageSizes`, removed `picsum.photos`.
- **P1.3** — `CloudImage` wrapper at `src/shared/components/CloudImage.tsx`, wraps `CldImage` for Cloudinary assets, `next/image` for local.
- **P1.4** — Adopted `CloudImage` in 12 components: GalleryCard, CardStackCarousel, Lightbox, GalleryListRow, EditImageDialog, AddImageDialog, ActualiteCard, ActualitesSection, ActualiteDetailPage, CarouselDiscipline, DisciplineSection, DisciplineForm, ActualiteForm.
- **P1.5** — Deleted `features/gallery/lib/cloudinary.ts` and empty `lib/` directory. No remaining imports.
- **P2.1** — Header uses static import of `Header.webp` with `placeholder="blur"`, `unoptimized` removed.
- **P2.2** — Added `deleteCloudinaryAsset`/`deleteCloudinaryAssets` to `shared/lib/cloudinary.ts`. Wired into `deleteGalleryImageAction` and `bulkDeleteGalleryImagesAction` (best-effort cleanup after DB delete).
- **P3** — All CloudImage usages default to `placeholder="blur"`. Admin previews and thumbnails use `placeholder="empty"`.
- **P4.2** — Coach photo alt changed from `"Coach"` to `"Photo du coach"`.
- **P5.3** — `default-coach.jpg` does not exist. DisciplineSection now shows a placeholder div with "Pas de photo" text instead of referencing a missing file.
- **P4.3** — `AddImagesDialog` preview alt changed from `""` to `` `Aperçu de ${img.file.name}` ``.
- **P5.1** — Skipped (user deferred file deletion).
- **P5.2** — Converted 4 local assets to static imports with `placeholder="blur"`: `logoBlanc.webp` (Header), `logoNoir.webp` (Footer), `gant_de_boxe.jpg` and `accueil_valeur.png` (page.tsx).
- **P6.1** — All `sizes` values audited and correct. One fix: added missing `sizes="(max-width: 1024px) 100vw, 50vw"` to InscriptionSection.
- **P6.2** — All LCP candidates already have `priority` (Header bg, logo blanc, actualite detail cover). No additions needed — remaining images are below the fold.

---

## Quick Wins (Decouple from Schema Migration)

These can ship independently, right now:

1. ~~**Remove `unoptimized` from `Header.tsx`** — use static import instead~~ → P2.1
2. ~~**Delete 8 unused files from `public/`**~~ → P5.1
3. ~~**Remove `picsum.photos`** from `next.config.ts`~~ → P2.3
4. ~~**Add `formats: ['image/avif', 'image/webp']`** to `next.config.ts`~~ → P1.2
5. ~~**Fix `CarouselDiscipline` alt text**~~ → DONE (P4.1)

---

## Architecture After Optimization

```
UPLOAD TIME                          RENDER TIME
────────────                         ───────────

File → Cloudinary API                DB → CloudinaryAsset
         │                                    │
         ▼                                    ▼
  UploadApiResponse                    CloudImage wrapper
         │                              ┌─────┴──────┐
         ▼                              │             │
  CloudinaryAsset {               CldImage          next/image
    publicId ─────────────────→  src={publicId}    (local assets)
    version                        f_auto
    format                         q_auto            Static imports
    width  ───────────────────→  width/height       auto blur
    height                        responsive
    bytes                         srcset
  }                               blur via
         │                        buildBlurUrl()
         ▼
    Store in DB                  Delete: cloudinary.uploader.destroy(publicId)
   (Prisma JSON / fields)        No parsing. Just use the stored publicId.
```

### What disappeared

| Before (URL-based) | After (metadata-based) |
|--------------------|----------------------|
| `isCloudinaryUrl(src)` — regex check | Type system — `asset` vs `localSrc` |
| `getCloudinaryBlurUrl(src)` — URL string manipulation | `buildBlurUrl(asset)` — pure construction |
| `getCloudinaryPublicId(url)` — regex extraction | `asset.publicId` — direct field access |
| `image.width \|\| 800` fallback defaults | `asset.width` — always populated |
| Inconsistent upload returns (`{ url }` vs `{ url, width, height }`) | Single `CloudinaryAsset` type everywhere |
| `String[]` photo arrays (opaque URLs) | `Json` columns with typed `CloudinaryAsset[]` |

---

*Plan v2 — storing identifiers at upload time, never reconstructing from URLs.*
