# Image Handling Audit Report

> Project: Les Gants Meleciens - ASSP Website
> Date: 2026-03-06
> Branch: jlx-image-overall

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Next.js Configuration](#2-nextjs-configuration)
3. [Storage & Upload Pipeline](#3-storage--upload-pipeline)
4. [Static Assets (public/)](#4-static-assets-public)
5. [Image Rendering - Component-by-Component](#5-image-rendering---component-by-component)
6. [Data Models & Database Schema](#6-data-models--database-schema)
7. [Optimization Techniques In Use](#7-optimization-techniques-in-use)
8. [Issues & Inconsistencies](#8-issues--inconsistencies)
9. [Summary Matrix](#9-summary-matrix)

---

## 1. Architecture Overview

The project uses **two distinct image pipelines**:

| Pipeline | Storage | Purpose | Access |
|----------|---------|---------|--------|
| **Cloudinary** | `res.cloudinary.com` | Public images (gallery, actualites, disciplines) | CDN, public URLs |
| **Cloudflare R2** | S3-compatible bucket | Private documents (medical certificates, ID photos) | Signed URLs only |

**Rendering**: Almost exclusively `next/image` (24+ instances), with 1 native `<img>` tag and 1 CSS `background-image`.

**No custom image wrapper component exists** - `next/image` is used directly everywhere.

---

## 2. Next.js Configuration

**File**: `next.config.ts`

```ts
images: {
    remotePatterns: [
        { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
        { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' }, // DEV ONLY
    ],
},
experimental: {
    serverActions: { bodySizeLimit: "10mb" },
},
```

**Notes**:
- `picsum.photos` is allowed (dev placeholder) - should be removed in production
- No custom `loader` configured - uses default Next.js image optimization
- No `deviceSizes` or `imageSizes` overrides
- No `formats` override (defaults to WebP)
- `bodySizeLimit` set to 10mb for server actions (supports image uploads)

---

## 3. Storage & Upload Pipeline

### 3.1 Shared Upload Function

**File**: `src/shared/lib/upload.ts`

```
uploadPublicImage(file: File, subFolder: string): Promise<{ url, width, height }>
```

- Converts `File` -> `Buffer` -> Base64 data URI (for serverless compatibility)
- Uploads to Cloudinary folder: `gants-meleciens/{subFolder}`
- Returns: `{ url: secure_url, width, height }`
- **Validation**: 5 MB max, JPEG/PNG/WebP only (both client + server side)

### 3.2 Upload Flows by Feature

| Feature | Server Action | Cloudinary Folder | Returns |
|---------|--------------|-------------------|---------|
| Gallery (single) | `uploadGalleryImageAction()` | `gants-meleciens/gallery` | `{ url, width, height }` |
| Gallery (bulk) | Same action, called concurrently (max 3) | `gants-meleciens/gallery` | `{ url, width, height }` per file |
| Actualites | `uploadActualitePhotoAction()` | `gants-meleciens/actualites` | `{ url }` |
| Disciplines | `uploadPhotoAction()` | `gants-meleciens/disciplines` | `{ url }` |
| Adherent docs | `uploadFileAction()` (R2, NOT Cloudinary) | `certificats/{timestamp}` | `{ fileKey }` |

**Key inconsistency**: Gallery uploads return `width`+`height` from Cloudinary. Actualites and Disciplines uploads do **not** return dimensions.

### 3.3 Cloudinary Utilities

**File**: `src/features/gallery/lib/cloudinary.ts`

- `isCloudinaryUrl(src)`: Checks if URL contains `res.cloudinary.com`
- `getCloudinaryBlurUrl(src)`: Inserts `w_30,e_blur:1000,q_1` after `/upload/` in URL - produces a ~300 byte blur placeholder

**Note**: These utilities live under `features/gallery/` but are potentially useful project-wide.

---

## 4. Static Assets (public/)

### 4.1 Images Used in Code

| File | Format | Used In | Purpose |
|------|--------|---------|---------|
| `Header.webp` | WebP | Header.tsx | Full-screen background |
| `logoBlanc.webp` | WebP | Header.tsx | White logo (header) |
| `logoNoir.webp` | WebP | Footer.tsx | Black logo (footer) |
| `gant_de_boxe.jpg` | JPEG | page.tsx (home) | Hero section boxing gloves |
| `accueil_valeur.png` | PNG | page.tsx (home) | Values section image |

### 4.2 Images NOT Referenced in Code

| File | Format | Notes |
|------|--------|-------|
| `1.webp` | WebP | Unused / unknown purpose |
| `2.jpg` | JPEG | Unused / unknown purpose |
| `3.avif` | AVIF | Unused / unknown purpose |
| `file.svg` | SVG | Next.js default template leftover |
| `globe.svg` | SVG | Next.js default template leftover |
| `next.svg` | SVG | Next.js default template leftover |
| `vercel.svg` | SVG | Next.js default template leftover |
| `window.svg` | SVG | Next.js default template leftover |

### 4.3 Format Inconsistency

Static images use **3 different formats**: WebP, JPEG, and PNG. There is no unified format strategy for local assets.

---

## 5. Image Rendering - Component-by-Component

### 5.1 Front-Facing Pages

#### Header (`src/app/(front)/_components/Header.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Background | `next/image` | `/Header.webp` | `fill`, `priority`, **`unoptimized`**, `sizes="100vw"` | **Unoptimized flag disables Next.js optimization** |
| Logo | `next/image` | `/logoBlanc.webp` | `width={432}`, `height={280}`, `priority` | Drop-shadow + brightness filter via CSS |

#### HomePage (`src/app/(front)/page.tsx`)

| Element | Type | Source | Key Props |
|---------|------|--------|-----------|
| Boxing gloves | `next/image` | `/gant_de_boxe.jpg` | `width={768}`, `height={1024}`, `sizes="(max-width: 768px) 100vw, 384px"` |
| Values image | `next/image` | `/accueil_valeur.png` | `fill`, `sizes="(max-width: 768px) 100vw, 400px"` |

#### Footer (`src/app/(front)/_components/Footer.tsx`)

| Element | Type | Source | Key Props |
|---------|------|--------|-----------|
| Logo | `next/image` | `/logoNoir.webp` | `fill`, `sizes="192px"` |

#### Actualite Detail (`src/app/(front)/actualites/[id]/page.tsx`)

| Element | Type | Source | Key Props |
|---------|------|--------|-----------|
| Cover image | `next/image` | Dynamic (DB) | `fill`, `priority`, `sizes="(max-width: 900px) 100vw, 900px"` |
| Additional photos | `next/image` | Dynamic (DB) | `fill`, `sizes="(max-width: 768px) 50vw, 400px"` |

### 5.2 Feature Components (Front)

#### ActualiteCard (`src/features/actualites/presentation/components/front/ActualiteCard.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Card image | `next/image` | `actualite.photo[0]` | `fill`, `sizes="(max-width: 768px) 100vw, 300px"`, `draggable={false}` | Fallback: "Pas d'image" text |

#### ActualitesSection (`src/features/actualites/presentation/components/front/ActualitesSection.tsx`)

| Element | Type | Source | Key Props |
|---------|------|--------|-----------|
| Featured image | `next/image` | `featured.photo[0]` | `fill`, `sizes="(max-width: 1024px) 100vw, 800px"` |

#### CarouselDiscipline (`src/features/disciplines/presentation/components/front/CarouselDiscipline.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Carousel slide | `next/image` | `images[currentIndex]` | `fill`, `sizes="(max-width: 768px) 100vw, 800px"` | **Alt text is `images[currentIndex].slice(0,5)` - very poor** |

#### DisciplineSection (`src/features/disciplines/presentation/components/front/DisciplineSection.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Coach photo | `next/image` | `discipline.photo_coach` | `width={150}`, `height={150}` | Fallback: `/default-coach.jpg`, grayscale filter |

#### CardStackCarousel (`src/features/gallery/presentation/components/CardStackCarousel.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Stack cards | `next/image` | `image.src` (Cloudinary) | `width={image.width\|\|800}`, `height={image.height\|\|600}`, `sizes="400px"`, `placeholder="blur"`, `blurDataURL` | Uses `getCloudinaryBlurUrl()` |

#### Lightbox (`src/features/gallery/presentation/components/Lightbox.tsx`)

| Element | Type | Source | Key Props |
|---------|------|--------|-----------|
| Full-screen image | `next/image` | `image.src` (Cloudinary) | `width={image.width\|\|1200}`, `height={image.height\|\|800}`, `sizes="90vw"` |

### 5.3 Admin Components

#### GalleryCard (`src/features/gallery/presentation/components/GalleryCard.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Blur placeholder | CSS `background-image` | `getCloudinaryBlurUrl()` | Inline style | Replaced by Image on load |
| Gallery image | `next/image` | `image.src` | `width={image.width\|\|800}`, `height={image.height\|\|600}`, `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"` | `onLoad` tracks loaded state |

#### GalleryListRow (`src/features/gallery/presentation/components/GalleryListRow.tsx`)

| Element | Type | Source | Key Props |
|---------|------|--------|-----------|
| Thumbnail | `next/image` | `image.src` | `fill`, `sizes="48px"` |

#### ActualiteForm (`src/features/actualites/presentation/components/admin/ActualiteForm.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Photo previews (x5) | `next/image` | Cloudinary URL | `fill`, `sizes="200px"` | 5 upload slots |

#### DisciplineForm (`src/features/disciplines/presentation/components/admin/DisciplineForm.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Coach photo | `next/image` | Cloudinary URL | `fill`, `sizes="64px"` | Circular, alt="Coach" (poor) |
| Gallery photos (x5) | `next/image` | Cloudinary URL | `fill`, `sizes="200px"` | 5 upload slots |

#### AddImagesDialog (`src/features/gallery/presentation/components/AddImagesDialog.tsx`)

| Element | Type | Source | Key Props | Notes |
|---------|------|--------|-----------|-------|
| Upload preview | **Native `<img>`** | Data URL blob | `alt=""`, `className="w-full h-full object-cover"` | **Only native img in entire project** |

#### AddImageDialog / EditImageDialog

| Element | Type | Source | Key Props |
|---------|------|--------|-----------|
| Preview | `next/image` | Cloudinary URL | `width={400}`, `height={300}`, `sizes="400px"` |

---

## 6. Data Models & Database Schema

### 6.1 GalleryImage

```prisma
model GalleryImage {
  id        String   @id @default(uuid())
  title     String
  alt       String   @default("")
  category  String   @default("")
  src       String              // Cloudinary URL
  width     Int      @default(0) // Actual pixel dimensions
  height    Int      @default(0)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Stores dimensions**: Yes (`width`, `height`) - captured at upload time.

### 6.2 Actualite

```prisma
model Actualite {
  ...
  photo       String[]   // PostgreSQL array of Cloudinary URLs
  ...
}
```

**Stores dimensions**: No - only URLs stored.

### 6.3 Discipline

```prisma
model Discipline {
  ...
  photo_coach String?    // Single Cloudinary URL (coach portrait)
  photo       String[]   // PostgreSQL array of Cloudinary URLs
  ...
}
```

**Stores dimensions**: No - only URLs stored.

---

## 7. Optimization Techniques In Use

| Technique | Where Used | Coverage |
|-----------|-----------|----------|
| `next/image` component | Almost everywhere | 24+ instances |
| `priority` hint | Header bg, Header logo, Actualite cover | 3 instances (above-fold images) |
| `sizes` attribute | All `next/image` instances | Full coverage |
| `fill` layout | Cards, backgrounds, thumbnails | 13+ instances |
| Blur placeholder (Cloudinary) | CardStackCarousel, GalleryCard | Gallery feature only |
| Aspect ratio containers | Gallery, actualites, disciplines | Prevents CLS |
| Responsive breakpoints in `sizes` | Most components | Good coverage |
| `unoptimized` flag | Header.tsx | 1 instance (disables optimization) |

---

## 8. Issues & Inconsistencies

### CRITICAL

1. **`unoptimized` flag on Header background** (`Header.tsx:17`)
   - `Header.webp` is served without Next.js optimization (no resizing, no format conversion, no quality reduction)
   - This is a full-viewport image - significant performance impact

2. **No Cloudinary image cleanup on delete**
   - When DB records are deleted, Cloudinary files are **not removed** (orphaned files accumulate)

### IMPORTANT

3. **Inconsistent dimension tracking**
   - Gallery: `width` + `height` stored in DB and used for aspect ratios
   - Actualites: No dimensions stored - components use hardcoded aspect-video (16:9)
   - Disciplines: No dimensions stored - carousel uses `fill` with container aspect

4. **Poor alt text in several places**
   - `CarouselDiscipline.tsx`: Uses `images[currentIndex].slice(0,5)` - meaningless alt text
   - `DisciplineForm.tsx`: Coach photo uses just `"Coach"` as alt
   - `AddImagesDialog.tsx`: Native `<img>` has `alt=""`

5. **Blur placeholder inconsistency**
   - Gallery: Uses `getCloudinaryBlurUrl()` for progressive loading
   - Actualites: No blur placeholders
   - Disciplines: No blur placeholders
   - `getCloudinaryBlurUrl` lives under `features/gallery/lib/` but could benefit all features

6. **Upload return value inconsistency**
   - Gallery uploads return `{ url, width, height }`
   - Actualite/Discipline uploads return only `{ url }` - dimensions are lost

### MINOR

7. **Unused static assets in public/**
   - `1.webp`, `2.jpg`, `3.avif` - unknown purpose, possibly test files
   - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` - Next.js template leftovers

8. **Mixed static image formats**
   - WebP (`Header.webp`, `logoBlanc.webp`, `logoNoir.webp`)
   - JPEG (`gant_de_boxe.jpg`)
   - PNG (`accueil_valeur.png`)
   - No unified format strategy

9. **`picsum.photos` in next.config.ts**
   - Dev placeholder domain still in remote patterns config

10. **Cloudinary utilities scoped to gallery**
    - `getCloudinaryBlurUrl()` and `isCloudinaryUrl()` are in `features/gallery/lib/` but are generic Cloudinary helpers

---

## 9. Summary Matrix

### Image Count by Source Type

| Source Type | Count | Examples |
|------------|-------|---------|
| Static local (public/) | 5 | Header.webp, logos, boxing gloves, values |
| Remote Cloudinary | 14+ | Gallery, actualites, disciplines images |
| Data URL (blob) | 1 | Upload preview in AddImagesDialog |

### Image Count by Render Method

| Method | Count | Notes |
|--------|-------|-------|
| `next/image` | 24+ | Primary method |
| Native `<img>` | 1 | Blob preview only |
| CSS `background-image` | 1 | Blur placeholder |
| Lucide React icons | 11+ | SVG icons |
| Custom SVG components | 6 | Chevrons, arrows |

### Feature Image Capabilities

| Feature | Upload | Dimensions | Blur Placeholder | Multiple Images | Reorder |
|---------|--------|-----------|-----------------|-----------------|---------|
| Gallery | Yes | Yes (DB) | Yes | Yes (bulk) | Yes (drag) |
| Actualites | Yes | No | No | Yes (5 slots) | No |
| Disciplines | Yes | No | No | Yes (5 slots + coach) | No |

---

*End of audit report*
