# Testing Report — Les Gants Mêléciens

> Generated on 2026-04-01 — To be used as a planning prompt for a full test implementation plan.

---

## 1. Executive Summary

The application is a **Next.js 16 / React 19** full-stack site for a martial arts association, using a **Domain-Driven Design (DDD)** architecture with Prisma ORM, Clerk auth, Cloudinary images, and Brevo email.

| Metric | Value |
|---|---|
| Total source files | ~97 (excl. types, configs, generated) |
| Files with tests | 19 |
| Test coverage | ~13% (gallery feature only) |
| Test suite status | **6 FAILED** / 11 passed (20 failed assertions / 88 passed) |
| Testing framework | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| E2E testing | **None** |
| Coverage tooling | **Not installed** (@vitest/coverage-v8 missing) |

**Bottom line:** Only the gallery feature has tests, and many of those are broken due to a model refactor that wasn't propagated to the test files. All other features (actualites, disciplines, inscriptions, dashboard) and all shared utilities have zero test coverage.

---

## 2. Current Test Failures — Root Cause Analysis

### 2.1 Model Mismatch (15 test failures)

**Files affected:**
- `gallery/data/datasources/gallery-image.postgres.datasource.test.ts`
- `gallery/data/repositories/gallery-image.repository.impl.test.ts`
- `gallery/domain/usecases/save-gallery-image.usecase.test.ts`
- `gallery/domain/usecases/save-many-gallery-images.usecase.test.ts`
- `app/admin/content/actions/gallery.actions.test.ts`

**Root cause:** The codebase was refactored from a `GalleryImage` model (with `src`, `category: string`, `asset: CloudinaryAsset`) to a flat `Image` model (with `publicId`, `version`, `format`, `width`, `height`, `bytes`, `blurDataUrl`, `categoryId`, `category: ImageCategory`). The test fixtures (`__tests__/fixtures.ts`) and mock repository (`__tests__/mock-repository.ts`) still reference the old types.

**Specific issues:**
- `fixtures.ts` creates `GalleryImage` objects (old type) but usecases now expect `Image` (new type)
- `mock-repository.ts` is typed against `GalleryImageRepository` but the interface is now `ImageRepository` with different method signatures (added `getByIds`)
- Test for `save-gallery-image.usecase.test.ts` checks for `src` field but the usecase now validates `publicId`
- `gallery.actions.test.ts` mocks are outdated — the actions were restructured

### 2.2 UI Text Mismatch (3 test failures)

**File:** `gallery/presentation/components/GalleryToolbar.test.tsx`

**Root cause:** Tests look for French text with accents (`Compétitions`, `Entraînements`) but the `IMAGE_CATEGORIES` model now uses unaccented names (`Competitions`, `Entrainements`). Also, the test expects an `onAdd` prop/button ("Ajouter") which no longer exists in the `GalleryToolbar` component interface.

### 2.3 Server Action Test Architecture (multiple failures)

**File:** `app/admin/content/actions/gallery.actions.test.ts`

The server action tests mock Next.js server functions (`revalidatePath`, `cookies`) but the mocking strategy doesn't match the current module structure. These tests need to be rewritten to properly mock the DDD use-case layer rather than mocking at the Prisma level.

---

## 3. Test Coverage Gap Analysis

### 3.1 Features With ZERO Tests

#### Actualites (News) — 17 untested files
| Layer | Files | Priority |
|---|---|---|
| Data (datasource, repository) | 2 | High |
| Domain (6 usecases, 1 model, 1 repo interface) | 8 | **Critical** |
| Presentation (4 admin + 3 front components) | 7 | Medium |

**Key usecases to test:**
- `save-actualite.usecase.ts` — CRUD with HTML sanitization
- `get-featured-actualite.usecase.ts` — Homepage featured logic
- `reorder-actualites.usecase.ts` — Drag-drop ordering

#### Disciplines — 15 untested files
| Layer | Files | Priority |
|---|---|---|
| Data (datasource, repository) | 2 | High |
| Domain (5 usecases, 1 model, 1 repo interface) | 7 | **Critical** |
| Presentation (3 admin + 2 front components) | 5 | Medium |

**Key usecases to test:**
- `save-discipline.usecase.ts` — CRUD with coach image association
- `get-active-disciplines.usecase.ts` — Public page filtering

#### Inscriptions (Registration) — 9 untested files
| Layer | Files | Priority |
|---|---|---|
| Data (repository) | 1 | High |
| Domain (1 usecase, 1 model with Zod schema, 1 repo interface) | 3 | **Critical** |
| Presentation (3 admin + 2 front components) | 5 | Medium |

**Key files to test:**
- `inscriptions.model.ts` — Zod validation schema (email, phone, postal code, birth date)
- `register-adherent.usecase.ts` — Registration flow with document upload + email
- `InscriptionForm.tsx` — Complex form with file upload and conditional payment

#### Dashboard — 3 untested files
| Layer | Files | Priority |
|---|---|---|
| Presentation (3 components) | 3 | Low |

### 3.2 Server Actions — 5 untested action files

| File | Features | Priority |
|---|---|---|
| `(front)/actualites/actions/actualite.actions.ts` | Public actualite fetching | Medium |
| `(front)/disciplines/actions/discipline.actions.ts` | Public disciplines fetching | Medium |
| `(front)/inscription/actions/inscription.actions.ts` | Registration submission, email, file upload | **Critical** |
| `admin/club/adherents/actions/admin.actions.ts` | Member management | Medium |
| `admin/club/adherents/actions/upload.actions.ts` | Document upload to R2 | High |
| `admin/content/actions/actions.ts` | Actualite + discipline admin CRUD | High |

### 3.3 Shared Libraries — 6 untested files

| File | What it does | Priority |
|---|---|---|
| `shared/lib/cloudinary.ts` | URL builders, blur URL generation | Medium |
| `shared/lib/cloudinary.server.ts` | Server-side Cloudinary API calls | High |
| `shared/lib/mail.ts` | Brevo email sending | High |
| `shared/lib/prisma.ts` | Prisma client singleton | Low (infra) |
| `shared/lib/result.ts` | neverthrow wrappers | Medium |
| `shared/lib/upload.ts` | Cloudinary upload handler | High |

**Note:** `shared/lib/sanitize.ts` is already tested (PASS).

### 3.4 Shared Components — 7 untested files

| Component | Complexity | Priority |
|---|---|---|
| `ImageSlotPicker.tsx` | High (DnD + modal) | High |
| `ImageSlotModal.tsx` | High (gallery browse + upload tabs) | High |
| `ImageSlot.tsx` | Medium (3 states: filled/empty/dragging) | Medium |
| `ImagePicker.tsx` | Medium (gallery image selection) | Medium |
| `CloudImage.tsx` | Low (Cloudinary Next/Image wrapper) | Low |
| `ui/ConfirmDialog.tsx` | Low (generic modal) | Low |
| `ui/StatBadge.tsx` | Low (display component) | Low |

### 3.5 Layout/Page Components — 8 untested files

| Component | Priority |
|---|---|
| `Navbar.tsx` (mobile menu, active links) | Medium |
| `Header.tsx` | Low |
| `Footer.tsx` | Low |
| `CTA-inscription.tsx` | Low |
| `FAQ.tsx` | Low |
| `AdminHeader.tsx` | Low |
| `AdminSidebar.tsx` | Low |

---

## 4. Missing Infrastructure

### 4.1 Coverage Tooling
- `@vitest/coverage-v8` is **not installed** — no way to measure test coverage
- No coverage thresholds configured in `vitest.config.ts`
- No CI coverage gates

### 4.2 E2E Testing
- **No E2E test framework** (no Playwright/Cypress config)
- No smoke tests for critical user flows
- No visual regression testing

### 4.3 CI/CD Integration
- No test scripts in CI pipeline (needs verification)
- No pre-commit hooks running tests

---

## 5. Recommended Testing Plan — Priority Order

### Phase 1: Fix Broken Tests (IMMEDIATE)
> Restore the test suite to green before adding new tests.

1. **Update `__tests__/fixtures.ts`** — Align `makeGalleryImage()` with the current `Image` model (replace `src`→`publicId`, `asset`→flat fields, add `categoryId`, `blurDataUrl`, etc.)
2. **Update `__tests__/mock-repository.ts`** — Type against `ImageRepository` interface, add `getByIds` mock
3. **Fix `GalleryToolbar.test.tsx`** — Remove `onAdd` tests, fix category name assertions (accented→unaccented)
4. **Fix `gallery.actions.test.ts`** — Rewrite mocks to match current DDD architecture (mock usecases, not Prisma directly)
5. **Fix datasource & repository tests** — Align with new `Image` model and Prisma schema

### Phase 2: Install Missing Infrastructure
1. Install `@vitest/coverage-v8`
2. Configure coverage thresholds in `vitest.config.ts` (e.g., 60% for new code)
3. Add coverage reporting to CI
4. Install Playwright for E2E tests
5. Add `playwright.config.ts` with dev server integration

### Phase 3: Domain Layer Tests (HIGH PRIORITY)
> The DDD architecture makes domain usecases highly testable — pure business logic with injected repos.

**For each feature (actualites, disciplines, inscriptions), add:**
- Usecase tests (mock repository, test business rules)
- Model/schema validation tests (Zod schemas)
- Repository implementation tests (mock Prisma)

**Priority order:**
1. `inscriptions` — Registration is the most critical user flow
   - `inscriptions.model.ts` — Zod schema validation (email, phone, postal code format)
   - `register-adherent.usecase.ts` — Email sending, document handling
2. `actualites` — Content management
   - `save-actualite.usecase.ts` — HTML sanitization, image ordering
   - `get-featured-actualite.usecase.ts` — Homepage logic
3. `disciplines` — Similar CRUD patterns
   - `save-discipline.usecase.ts` — Coach image, tags validation

**Estimated tests:** ~35 test files, ~150 test cases

### Phase 4: Shared Library Tests (HIGH PRIORITY)
1. `upload.ts` — File validation (type, size), Cloudinary upload mocking
2. `mail.ts` — Email template construction, Brevo API mocking
3. `cloudinary.ts` — URL builder correctness
4. `cloudinary.server.ts` — Server-side operations with mocked API
5. `result.ts` — neverthrow utility wrappers

**Estimated tests:** ~5 test files, ~30 test cases

### Phase 5: Server Action Tests (MEDIUM PRIORITY)
1. `inscription.actions.ts` — Full registration flow (validation → save → email)
2. `admin/content/actions/actions.ts` — Actualite + discipline CRUD
3. `upload.actions.ts` — R2 document upload
4. Public actions (actualite, discipline fetching)

**Estimated tests:** ~6 test files, ~40 test cases

### Phase 6: Component Tests (MEDIUM PRIORITY)

**Admin components (higher priority):**
1. `InscriptionForm.tsx` — Form validation, submission, file upload UX
2. `ActualiteForm.tsx` — Rich text editor integration, image slot ordering
3. `DisciplineForm.tsx` — Similar form patterns
4. `ImageSlotPicker.tsx` + `ImageSlotModal.tsx` — DnD + gallery modal
5. Admin tables (ActualiteTable, DisciplineTable, InscriptionsTable)

**Front components (lower priority):**
1. `Navbar.tsx` — Mobile menu toggle, active link state
2. `ActualitesCarousel.tsx` — Carousel behavior
3. `CarouselDiscipline.tsx` — Carousel behavior
4. `InscriptionSection.tsx` — Section rendering

**Estimated tests:** ~15 test files, ~80 test cases

### Phase 7: E2E Tests (MEDIUM PRIORITY)

**Critical user flows to cover:**
1. **Homepage → Disciplines → Back** — Navigation, data loading, responsive layout
2. **Inscription flow** — Fill form → upload certificate → select payment → submit → success
3. **Actualites browsing** — List page → detail page → back
4. **Admin login → Dashboard** — Clerk auth redirect, dashboard rendering
5. **Admin gallery management** — Upload → edit → reorder → delete
6. **Admin actualite CRUD** — Create → edit (TipTap) → publish → reorder
7. **Admin discipline CRUD** — Create → edit → toggle active
8. **Mobile navigation** — Hamburger menu → navigate → close
9. **404 handling** — Unknown route → 404 page

**Estimated tests:** ~9 E2E test files

### Phase 8: Edge Cases & Security (LOW PRIORITY)
1. HTML sanitization edge cases (XSS via TipTap content)
2. File upload validation (oversized, wrong type, malicious filenames)
3. Auth boundary tests (admin routes without session)
4. Concurrent operations (reorder during delete)
5. Error boundary / fallback UI behavior

---

## 6. Effort Estimation

| Phase | Files | Test Cases (est.) | Effort |
|---|---|---|---|
| Phase 1: Fix broken tests | 5 | Fix 20 failing | Small |
| Phase 2: Infrastructure | 2 configs | — | Small |
| Phase 3: Domain tests | ~20 | ~150 | Large |
| Phase 4: Shared lib tests | ~5 | ~30 | Medium |
| Phase 5: Server action tests | ~6 | ~40 | Medium |
| Phase 6: Component tests | ~15 | ~80 | Large |
| Phase 7: E2E tests | ~9 | ~30 | Large |
| Phase 8: Edge cases | ~5 | ~20 | Medium |
| **Total** | **~67** | **~350** | — |

---

## 7. Live App Reconnaissance Notes

Tested with Playwright against dev server:

- **Homepage:** Loads correctly. Title "Les Gants Mêléciens". Navigation has 8 elements (Accueil, Disciplines, Inscription, Actualités + duplicates for mobile)
- **Disciplines:** Page loads but 0 card/article elements found (may need seeded data or different selectors)
- **Inscription form:** 11 inputs detected (firstName, lastName, email, phone, birthDate, address, postalCode, city, certif file upload, 2x paymentMethod radio)
- **Login:** Clerk SSO component causes long network idle (expected)
- **Admin routes:** Redirect to login when unauthenticated (correct behavior)
- **Performance:** Dev server compilation is slow (15s+ for some pages) — should test with production build for realistic metrics

---

## 8. Quick Wins

1. **Fix `fixtures.ts` + `mock-repository.ts`** → Immediately restores 15+ tests to green
2. **Fix `GalleryToolbar.test.tsx`** → 3 more tests green
3. **Add `inscriptions.model.ts` Zod schema tests** → High value, pure validation, no mocking needed
4. **Add `sanitize.ts` edge case tests** → Already has test file, easy to extend
5. **Install `@vitest/coverage-v8`** → Instant visibility into actual coverage %

---

## Appendix A: File-by-File Test Status

### Gallery Feature
| File | Has Test | Status |
|---|---|---|
| `usecases/save-gallery-image.usecase.ts` | Yes | FAILING |
| `usecases/save-many-gallery-images.usecase.ts` | Yes | FAILING |
| `usecases/delete-gallery-image.usecase.ts` | Yes | PASSING |
| `usecases/bulk-delete-gallery-images.usecase.ts` | Yes | PASSING |
| `usecases/getAll-gallery-images.usecase.ts` | Yes | PASSING |
| `usecases/reorder-gallery-images.usecase.ts` | Yes | PASSING |
| `usecases/getByCategory-gallery-images.usecase.ts` | No | — |
| `data/datasources/gallery-image.postgres.datasource.ts` | Yes | FAILING |
| `data/repositories/gallery-image.repository.impl.ts` | Yes | FAILING |
| `data/datasources/image.postgres.datasource.ts` | No | — |
| `data/repositories/image.repository.impl.ts` | No | — |
| `components/GalleryToolbar.tsx` | Yes | FAILING (3/7) |
| `components/GalleryCardSkeleton.tsx` | Yes | PASSING |
| `components/GalleryEmptyState.tsx` | Yes | PASSING |
| `components/SelectionToolbar.tsx` | Yes | PASSING |
| `components/GalleryManager.tsx` | No | — |
| `components/GalleryGrid.tsx` | No | — |
| `components/GalleryCard.tsx` | No | — |
| `components/Lightbox.tsx` | No | — |
| `components/AddImagesDialog.tsx` | No | — |
| `components/EditImageDialog.tsx` | No | — |
| `components/GalleryListView.tsx` | No | — |
| `hooks/useImageCollection.ts` | Yes | PASSING |
| `hooks/useKeyboardNavigation.ts` | Yes | PASSING |
| `hooks/useLightbox.ts` | Yes | PASSING |
| `actions/gallery.actions.ts` | Yes | FAILING |

### All Other Features
| Feature | Tested Files | Total Files | Coverage |
|---|---|---|---|
| Actualites | 0 | 17 | 0% |
| Disciplines | 0 | 15 | 0% |
| Inscriptions | 0 | 9 | 0% |
| Dashboard | 0 | 3 | 0% |
| Shared libs | 1 | 7 | 14% |
| Shared components | 0 | 7 | 0% |
| Server actions | 1 | 6 | 17% |
| Layout components | 0 | 8 | 0% |
