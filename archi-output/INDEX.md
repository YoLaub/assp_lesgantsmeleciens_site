# Index d'Architecture — asso_lesgantsmeleciens_site
> Généré le 2026-06-08 — mis à jour le 2026-06-10 (migration DDD v2)

## Stack

```
STACK DÉTECTÉ :
  Type         : Single-app
  Framework    : Next.js 16.1.5 (App Router, React 19)
  Langage      : TypeScript 5.9
  ORM/DB       : Prisma 7 / PostgreSQL (adapter pg + Prisma Postgres)
  Auth         : Clerk (@clerk/nextjs 6)
  Images       : Cloudinary (next-cloudinary + cloudinary SDK)
  Documents    : Cloudflare R2 (AWS S3 SDK) — photos adhérents uniquement
  Email        : Brevo (HTTP API)
  Paiements    : Stripe 21
  UI           : Tailwind CSS v4, Lucide React, dnd-kit, TipTap (rich text)
  Forms        : react-hook-form + @hookform/resolvers
  Tests        : Vitest 4 + @testing-library/react
  CI/CD        : GitHub Actions (dossier .github présent)
  Error monad  : neverthrow (Result/ResultAsync)
  Captcha      : hCaptcha
```

---

## Env Vars

| Variable | Fichier(s) source | Dans .env |
|---|---|---|
| DATABASE_URL | Prisma (Prisma Postgres) | ✅ |
| BREVO_API_KEY | src/shared/lib/mail.ts | ✅ |
| R2_ENDPOINT | src/app/admin/club/adherents/actions/upload.actions.ts | ✅ |
| R2_ACCESS_KEY_ID | src/shared/lib/upload.ts, upload.actions.ts | ✅ |
| R2_SECRET_ACCESS_KEY | src/shared/lib/upload.ts, upload.actions.ts | ✅ |
| R2_BUCKET_NAME | src/shared/lib/upload.ts, upload.actions.ts | ✅ |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | Cloudinary front | ✅ |
| CLOUDINARY_API_KEY | src/shared/lib/cloudinary.server.ts | ✅ |
| CLOUDINARY_API_SECRET | src/shared/lib/cloudinary.server.ts | ✅ |
| CLERK_SECRET_KEY | src/proxy.ts (middleware Clerk) | ❌ |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | layout Clerk | ❌ |
| STRIPE_SECRET_KEY | src/features/adherents/actions/mon-dossier.actions.ts | ❌ |
| STRIPE_WEBHOOK_SECRET | src/app/api/webhooks/stripe/route.ts | ❌ |
| HCAPTCHA_SECRET | src/shared/lib/hcaptcha.ts | ❌ |
| NEXT_PUBLIC_HCAPTCHA_SITEKEY | formulaires front | ❌ |
| ADMIN_EMAIL | src/shared/lib/mail.ts | ❌ |
| CLUB_EMAIL | src/shared/lib/mail.ts | ❌ |
| CRON_SECRET | src/app/api/cron/*.ts | ❌ |
| NEXT_PUBLIC_APP_URL | usage général | ❌ |
| NEXT_PUBLIC_HERO_VIDEO_URL | page d'accueil | ❌ |
| R2_ACCOUNT_ID | src/shared/lib/upload.ts | ❌ |
| R2_PUBLIC_URL | src/shared/lib/upload.ts | ❌ |

⚠️ **Non déclarées dans .env** : CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, HCAPTCHA_SECRET, NEXT_PUBLIC_HCAPTCHA_SITEKEY, ADMIN_EMAIL, CLUB_EMAIL, CRON_SECRET, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_HERO_VIDEO_URL, R2_ACCOUNT_ID, R2_PUBLIC_URL

---

## Routes

### Pages Front (`src/app/(front)/`)

| Route | Fichier |
|---|---|
| `/` | `src/app/(front)/page.tsx` |
| `/actualites` | `src/app/(front)/actualites/page.tsx` |
| `/actualites/[id]` | `src/app/(front)/actualites/[id]/page.tsx` |
| `/disciplines` | `src/app/(front)/disciplines/page.tsx` |
| `/essai` | `src/app/(front)/essai/page.tsx` |
| `/inscription` | `src/app/(front)/inscription/page.tsx` |
| `/mentions-legales` | `src/app/(front)/mentions-legales/page.tsx` |
| `/mon-dossier` | `src/app/(front)/mon-dossier/page.tsx` |
| `/mon-essai` | `src/app/(front)/mon-essai/page.tsx` |

### Pages Admin (`src/app/admin/`) — toutes protégées Clerk

| Route | Fichier |
|---|---|
| `/admin` | redirect → `/admin/dashboard` (middleware) |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` |
| `/admin/club/adherents` | `src/app/admin/club/adherents/page.tsx` |
| `/admin/club/adherents/[id]` | `src/app/admin/club/adherents/[id]/page.tsx` |
| `/admin/club/coach-token` | `src/app/admin/club/coach-token/page.tsx` |
| `/admin/club/config-tarifs` | `src/app/admin/club/config-tarifs/page.tsx` |
| `/admin/club/essayants` | `src/app/admin/club/essayants/page.tsx` |
| `/admin/content/actualites` | `src/app/admin/content/actualites/page.tsx` |
| `/admin/content/actualites/new` | `src/app/admin/content/actualites/new/page.tsx` |
| `/admin/content/actualites/[id]` | `src/app/admin/content/actualites/[id]/page.tsx` |
| `/admin/content/disciplines` | `src/app/admin/content/disciplines/page.tsx` |
| `/admin/content/disciplines/new` | `src/app/admin/content/disciplines/new/page.tsx` |
| `/admin/content/disciplines/[id]` | `src/app/admin/content/disciplines/[id]/page.tsx` |
| `/admin/content/gallery` | `src/app/admin/content/gallery/page.tsx` |
| `/admin/config/reglement` | `src/app/admin/config/reglement/page.tsx` |
| `/admin/config/sante` | `src/app/admin/config/sante/page.tsx` |
| `/admin/config/tarifs` | `src/app/admin/config/tarifs/page.tsx` |

### Autres pages

| Route | Fichier |
|---|---|
| `/coach` | `src/app/coach/page.tsx` |
| `/login/[[...sign-in]]` | `src/app/login/[[...sign-in]]/page.tsx` |

### API Routes

| Route | Fichier | Description |
|---|---|---|
| `GET /api/cron/dossier-incomplet` | `src/app/api/cron/dossier-incomplet/route.ts` | Cron : rappel dossiers incomplets |
| `GET /api/cron/reinitialisation-saison` | `src/app/api/cron/reinitialisation-saison/route.ts` | Cron : reset saison |
| `POST /api/webhooks/stripe` | `src/app/api/webhooks/stripe/route.ts` | Webhook paiement Stripe |

---

## Modules

### 📦 Module: Actualites

**Architecture** : Clean Architecture (data/domain/presentation)

- **Data** :
  - Datasource : `src/features/actualites/data/datasources/actualite.postgres.datasource.ts`
  - Repository impl : `src/features/actualites/data/repositories/actualite.repository.impl.ts`
- **Domain** :
  - Model : `src/features/actualites/domain/models/actualite.model.ts`
    → `Actualite { id, title, description, tags[], active, featured, images[], imageOrder[], seo, order, publishedAt, createdAt, updatedAt }`
  - Repository interface : `src/features/actualites/domain/repositories/actualite.repository.ts`
  - Use cases : `get-active-actualites`, `get-actualite`, `get-featured-actualite`, `getAll-actualite`, `reorder-actualites`, `save-actualite`
- **Presentation** :
  - Admin : `ActualiteForm`, `ActualiteManager`, `ActualiteTable`, `ActualiteTableRow`
  - Front : `ActualiteCard`, `ActualitesCarousel`, `ActualitesSection`
- **Tests** : aucun

---

### 📦 Module: Disciplines

**Architecture** : Clean Architecture (data/domain/presentation)

- **Data** :
  - Datasource : `src/features/disciplines/data/datasources/discipline.postgres.datasource.ts`
  - Repository impl : `src/features/disciplines/data/repositories/discipline.repository.impl.ts`
- **Domain** :
  - Model : `src/features/disciplines/domain/models/discipline.model.ts`
    → `Discipline { id, title, coach, category, citation?, description, tags[], active, images[], imageOrder[], coachImage?, seo, order, createdAt, updatedAt }`
  - Repository interface : `src/features/disciplines/domain/repositories/discipline.repository.ts`
  - Use cases : `get-active-disciplines`, `get-discipline`, `getAll-discipline`, `reorder-disciplines`, `save-discipline`
- **Presentation** :
  - Admin : `DisciplineForm`, `DisciplineManager`, `DisciplineTable`, `DisciplineTableRow`
  - Front : `CarouselDiscipline`, `DisciplineSection`
- **Tests** : aucun

---

### 📦 Module: Gallery

**Architecture** : Clean Architecture — module le plus testé du projet

- **Data** :
  - Datasource : `src/features/gallery/data/datasources/image.postgres.datasource.ts`
  - Repository impl : `src/features/gallery/data/repositories/image.repository.impl.ts`
  - Tests : `gallery-image.postgres.datasource.test.ts`, `gallery-image.repository.impl.test.ts`
- **Domain** :
  - Models :
    - `Image { id, title, alt, publicId, version, format, width, height, bytes, blurDataUrl, order, categoryId, createdAt, updatedAt }`
    - `ImageCategory { id, name, slug }`
  - Repository interface : `src/features/gallery/domain/repositories/image.repository.ts`
  - Use cases (tous testés) : `bulk-delete-gallery-images`, `delete-gallery-image`, `getAll-gallery-images`, `getByCategory-gallery-images`, `reorder-gallery-images`, `save-gallery-image`, `save-many-gallery-images`
- **Presentation** :
  - Components : `AddImageDialog`, `AddImagesDialog`, `CardStackCarousel`, `EditImageDialog`, `GalleryCard`, `GalleryCardSkeleton`, `GalleryEmptyState`, `GalleryGrid`, `GalleryListRow`, `GalleryListView`, `GalleryManager`, `GalleryToolbar`, `Lightbox`, `SelectionToolbar`
  - Hooks : `useImageCollection`, `useKeyboardNavigation`, `useLightbox`
  - Tests components : `GalleryCardSkeleton.test.tsx`, `GalleryEmptyState.test.tsx`, `GalleryToolbar.test.tsx`, `SelectionToolbar.test.tsx`
  - Tests hooks : `useImageCollection.test.ts`, `useKeyboardNavigation.test.ts`, `useLightbox.test.ts`
- **Actions admin** : `src/app/admin/content/actions/gallery.actions.ts` — testé dans `gallery.actions.test.ts`
- **Tests** : 10+ fichiers de test

---

### 📦 Bounded Context: Adhesion (DDD v2 — NOUVEAU)

**Architecture** : Clean Architecture complète (domain/data)

> Introduit par la migration DDD v2 (2026-06-10). Sépare la notion de **Membre** (identité pérenne, UUID) de **Inscription** (adhésion par saison, autoincrement).

- **Domain models** (`src/features/adhesion/domain/models/`) :
  - `Membre { id (UUID), nom, prenom, email, telephone?, sexe?, ville?, codePostal?, adresse?, dateDeNaissance, numeroAdherent?, accesToken?, accesTokenExpireLe?, dateCreation, inscriptions[] }`
  - `Inscription { id (int), statut (ESSAYANT|ACTIF|BLOQUE|ARCHIVE), photo?, certificatMedical, engagementPrisConnaissance, autorisationParentale, couponSport, bonCaf, codePassSport?, montantSnapshot?, inscriptionValide, fnsmr, droitImage, reglementSigne, oxygene, renouvellement, typePaiement?, accesBloque, telephone2?, stripeSessionId?, categorie?, nombrePresences, dateInscription?, saison, membreId (FK) }`
  - Types enums : `StatutInscription`, `StatutDocument`, `TypePaiement`, `Categorie`
  - Composites : `InscriptionAvecMembre`, `InscriptionAvecDetails` (avec documents, questionnaire, présences)
- **Repository interfaces** :
  - `IMembreRepository` : `findById`, `findByEmail`, `findByToken`, `findByEmailAndNumero`, `findAllWithInscription`, `create`, `updateToken`, `generateUniqueNumero`
  - `IInscriptionRepository` : lecture (findById, findCurrentByMembreId, findByToken, findByStripeSessionId, findByEssayantsByToken, findAllEssayants, findAllAdherents, findAdherentById), écriture (create, update), présences, documents, questionnaire, config
- **Data** (`src/features/adhesion/data/`) :
  - Datasources : `membre.postgres.datasource.ts`, `inscription.postgres.datasource.ts`
  - Repos impls : `membre.repository.impl.ts`, `inscription.repository.impl.ts`
  - Tests : `inscription.repository.impl.test.ts`

---

### 📦 Module: Adherents (Inscriptions)

**Architecture** : Use-cases DDD + thin Server Actions wrappers (refactoré v2)

> Les Server Actions sont désormais des wrappers minces sur des use-cases isolés qui utilisent `IMembreRepository` et `IInscriptionRepository`.

- **Use-cases** (`src/features/adherents/domain/use-cases/`) :
  - Front : `createAdherentUseCase`, `getMonDossierUseCase`, `createCheckoutUseCase`, `soumettreQuestionnaireUseCase`, `signerReglementUseCase`, `setTypePaiementUseCase`, `patchAutorisationSortieUseCase`, `updateTelephoneUseCase`, `updateDroitImageUseCase`, `validerEngagementUseCase`, `uploadDocumentAdherentUseCase`
  - Admin : `getAdherentsUseCase`, `getAdherentByIdUseCase`, `patchAdherentUseCase`, `validerDocumentUseCase`, `notifierRejetDossierUseCase`
- **Actions** (thin wrappers) :
  - `admin-adherents.actions.ts` : `getAdherentsAction()`, `getAdherentByIdAction(id)`, `patchAdherentAction(id, data)`, `validerDocumentAdminAction(...)`, `notifierRejetDossierAction(id)`
  - `create-adherent.actions.ts` : `createAdherentAction(input: CreateAdherentInput)`
  - `mon-dossier.actions.ts` : `requestAccesDossierAction`, `getMonDossierAction`, `soumettreQuestionnaireAction`, `soumettreQuestionnaireEnfantAction`, `signerReglementAction`, `setTypePaiementAction`, `patchAutorisationSortieAction`, `updateTelephoneAction`, `updateDroitImageAction`, `validerEngagementAction`, `uploadDocumentAdherentAction`, `createCheckoutAction`, `rechercherMembreParEmailAction`
  - `questionnaire-questions.actions.ts` : gestion des questions santé admin (testé)
  - `config-tarifs.actions.ts` : `getConfigTarifsAction()`, `updateConfigTarifsAction(data)`
  - `reglement.actions.ts` : `getReglementAction()`, `updateReglementAction(data)`
- **Presentation** :
  - Admin : `AdherentDetail`, `AdherentsList`, `ConfigTarifsForm`
  - Front : `AdherentForm`, `MonDossierView`
- **Règles métier** :
  - `requireAdmin()` dans `admin-adherents.actions.ts` : vérifie que l'utilisateur Clerk est connecté
  - Accès dossier par token unique (`Membre.accesToken`), avec expiration
  - Paiement en ligne via Stripe Checkout Session
  - Documents uploadés sur Cloudinary — remplacement si même type déjà présent
- **Tests** : `questionnaire-questions.actions.test.ts`

---

### 📦 Module: Essayants (Essai libre)

**Architecture** : Use-cases DDD + thin Server Actions wrappers (refactoré v2)

- **Use-cases** (`src/features/essayants/domain/use-cases/`) :
  - `createEssayantUseCase`, `requestAccesEssaiUseCase`, `getMonEssaiUseCase`, `pointerPresenceUseCase`, `getEssayantConversionDataUseCase`, `getEssayantsForCoachUseCase`
- **Actions** (thin wrappers — `src/features/essayants/actions/essayants.actions.ts`) :
  - `createEssayantAction(input)`, `requestAccesEssaiAction(input)`, `getMonEssaiAction(token)`, `pointerPresenceAction(inscriptionId, coachToken, nomCoach)`, `getEssayantConversionDataAction(token)`, `genererCoachTokenAction()`, `getCoachTokenActifAction()`, `getEssayantsForCoachAction(coachToken)`
- **Presentation** :
  - Admin : `CoachTokenManager`
  - Coach : `CoachDashboard`
  - Front : `EssaiForm`, `MonEssaiView`
- **Règles métier** :
  - 3 présences max avant blocage (`accesBloque = true`)
  - Conversion Essayant → Adherent possible après 3 présences
  - CoachToken requis pour pointer les présences (accès coach sans compte admin Clerk)
- **Tests** : `essayants.actions.test.ts`

---

### 📦 Module: Inscriptions

- Composant front uniquement : `src/features/inscriptions/presentation/components/front/InscriptionSection.tsx`

---

### 📦 Module: Dashboard Admin

- `src/features/dashboard/presentation/components/AdminDashboard.tsx`
- `ActivityItem.tsx`, `ModuleCard.tsx`

---

### Règles Métier Identifiées

| Règle | Localisation | Détail |
|---|---|---|
| Auth admin obligatoire | `admin-adherents.actions.ts`, `config-tarifs.actions.ts`, `reglement.actions.ts` | `requireAdmin()` → `auth()` Clerk |
| Protection routes admin | `src/proxy.ts` | `clerkMiddleware` → `auth.protect()` pour `/admin(.*)` |
| Accès dossier par token | `mon-dossier.actions.ts` | Token unique stocké en base, expiration |
| Accès essai par token | `essayants.actions.ts` | Même pattern |
| Blocage essayant | `essayants.actions.ts:pointerPresenceAction` | `accesBloque = true` après 3 présences |
| Remplacement document | `mon-dossier.actions.ts:uploadDocumentAdherentAction` | Si même DocumentType → remplacement Cloudinary |
| CoachToken requis pointage | `essayants.actions.ts` | Coach identifié par token temporaire (pas Clerk) |

---

## Transversal

### 🔧 Middleware (`src/proxy.ts`)

- `clerkMiddleware` : protège toutes les routes `/admin(.*)` via `auth.protect()`
- Redirect `/admin` → `/admin/dashboard`
- ⚠️ Fichier nommé `proxy.ts` au lieu du conventionnel `middleware.ts`

### 🏗️ Shared Lib (`src/shared/lib/`)

| Fichier | Exports clés | Description |
|---|---|---|
| `prisma.ts` | `prisma` (PrismaClient) | Singleton Prisma avec pool pg |
| `cloudinary.server.ts` | `generateBlurBase64(asset)`, `deleteCloudinaryAsset(asset)`, `deleteCloudinaryAssets(assets)` | Opérations Cloudinary serveur |
| `cloudinary.ts` | config client Cloudinary | Config front |
| `mail.ts` | 21 fonctions `send*` | Email via Brevo API (nouvelles : sendRelanceEssayant, sendConversionEssayant, sendNotificationConversionAdmin, sendLienAccesEssai, sendNotificationRejetDossier) |
| `upload.ts` | `uploadDocumentFile(file, subFolder)`, `uploadPublicImage(file, subFolder)` | Upload vers Cloudinary |
| `result.ts` | re-exports neverthrow + `genererNumeroAdherentUnique()`, `genererNumeroEssayantUnique()`, `calculerCategorie(dateNaissance)` | Result monad + utilitaires métier |
| `hcaptcha.ts` | vérification hCaptcha | Validation captcha |
| `sanitize.ts` | sanitize HTML | TipTap output sanitization (testé) |
| `adherent-utils.ts` | `genererNumeroMembreUnique()`, `calculerCategorie(dateDeNaissance)` | Utilitaires adhesion DDD |
| `rate-limit.ts` | `checkRateLimit(key, limit, windowMs)`, `getClientIp()` | Rate limiting (Upstash Redis prod, mémoire dev) |

### 🖼️ Shared Components (`src/shared/components/`)

- `CloudImage.tsx` : wrapper Next/Image + Cloudinary
- `ImageSlot.tsx`, `ImageSlotModal.tsx`, `ImageSlotPicker.tsx` : sélecteur d'image galerie partagé
- `ui/ConfirmDialog.tsx` : dialog de confirmation générique
- `ui/StatBadge.tsx` : badge statistique

### 📡 Call Sites (fonctions à fort impact)

| Fonction | Appelée dans |
|---|---|
| `uploadDocumentFile()` | `mon-dossier.actions.ts`, `create-adherent.actions.ts`, `essayants.actions.ts`, `gallery.actions.ts`, `actions.ts` |
| `uploadPublicImage()` | `gallery.actions.ts`, `actions.ts` (disciplines/actualites) |
| `sendEmail` (variants) | `create-adherent.actions.ts`, `mon-dossier.actions.ts`, `essayants.actions.ts`, `api/webhooks/stripe/route.ts`, `api/cron/*.ts` |
| `prisma` | importé directement partout (pas d'injection de dépendance dans les modules adherents/essayants) |

---

## Métriques

- Nombre total de routes : 31 (9 front + 18 admin + 2 cron + 1 webhook + 1 coach + 1 login)
- Nombre de modules métier : 7 (actualites, disciplines, gallery, adhesion, adherents, essayants, inscriptions)
- Nombre de fichiers source : 205 TS/TSX
- Fichiers de test : 20
- Couverture de test : partielle — `gallery` bien testée, `adhesion` (inscription repo), `essayants` (actions), `adherents` (questionnaire) testés ; disciplines/actualites : 0 test

---

## Points d'attention

1. ⚠️ **Variables d'environnement manquantes dans .env** : 13 variables référencées dans le code absentes du `.env` — dont des clés critiques (CLERK, STRIPE, HCAPTCHA, UPSTASH)
2. ⚠️ **Couverture de tests partielle** : `gallery` bien testée, tests ajoutés pour `adhesion`, `essayants`, `adherents/questionnaire` — mais les use-cases principaux (create-adherent, create-essayant, paiement) n'ont aucun test.
3. ℹ️ **Architecture hybride résolue partiellement** : `adherents` et `essayants` ont migré vers DDD v2 avec use-cases, mais les datasources postgres sont toujours dans `adhesion/data` (bounded context partagé) — pas encore aligné sur le pattern `gallery`/`actualites`/`disciplines`.
4. ⚠️ **`src/proxy.ts`** : fichier middleware nommé de façon non-conventionnelle (Next.js attend `src/middleware.ts` ou `middleware.ts` à la racine).
5. ℹ️ **Dual upload** : `src/app/admin/club/adherents/actions/upload.actions.ts` (photos → R2) vs `src/shared/lib/upload.ts` (documents/images → Cloudinary). Deux chemins distincts selon le type de fichier.
6. ℹ️ **`uploadDocumentFile`** : malgré le nom, cette fonction upload sur Cloudinary (pas R2).
7. ℹ️ **Bounded context `adhesion`** : les repos (`IMembreRepository`, `IInscriptionRepository`) sont définis dans `src/features/adhesion/domain/repositories/` et leur implémentation dans `src/features/adhesion/data/` — mais les use-cases eux-mêmes vivent dans `src/features/adherents/` et `src/features/essayants/`. Décision architecturale à clarifier si le projet évolue.
