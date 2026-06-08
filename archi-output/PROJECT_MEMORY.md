# Mémoire Projet — asso_lesgantsmeleciens_site

## En bref

Site associatif **Les Gants Méléciens** (club de boxe). Next.js 16.1.5 App Router + TypeScript + Prisma 7 / PostgreSQL. Clerk pour l'auth admin. Cloudinary pour les images, R2 pour les photos adhérents. Stripe pour les paiements d'inscription. Brevo pour les emails transactionnels. 178 fichiers source.

Architecture **hybride** : modules `gallery`, `actualites`, `disciplines` suivent Clean Architecture (domain/data/presentation) ; modules `adherents` et `essayants` utilisent des Server Actions directement sur Prisma.

## Structure

```
src/
  app/
    (front)/          # 9 pages publiques (accueil, disciplines, actualites, inscription, dossier, essai...)
    admin/            # 15 pages admin protégées Clerk (adherents, disciplines, actualites, gallery, config...)
    api/
      cron/           # 2 cron jobs (rappel dossier incomplet, reset saison)
      webhooks/stripe # Webhook Stripe
    coach/            # Portail coach (pointage présences essayants)
    login/            # Clerk sign-in
  features/
    actualites/       # Clean Architecture
    disciplines/      # Clean Architecture
    gallery/          # Clean Architecture — module le mieux testé
    adherents/        # Server Actions + Prisma direct
    essayants/        # Server Actions + Prisma direct
    inscriptions/     # Composant front seulement
    dashboard/        # Dashboard admin
  shared/
    lib/              # prisma, cloudinary, mail (16 fns Brevo), upload, result, sanitize, hcaptcha
    components/       # CloudImage, ImageSlot*, ConfirmDialog, StatBadge
    types/            # cloudinary types
  proxy.ts            # Middleware Clerk (nom non-conventionnel, attendu : middleware.ts)
```

## Conventions détectées

- Clean Architecture : `domain/models/`, `domain/usecases/`, `domain/repositories/`, `data/datasources/`, `data/repositories/`, `presentation/components/`
- Server Actions Next.js pour toutes les mutations (pas de route handlers sauf cron/webhook)
- Pattern token d'accès temporaire pour dossier adhérent et essai (pas de compte utilisateur front)
- `neverthrow` pour Result monad dans le code partagé
- Validation Zod dans toutes les actions

## Entités DB (Prisma)

`ImageCategory`, `Image`, `Discipline`, `Actualite`, `Document`, `ConfigTarifs`, `Adherent`, `QuestionnaireSanteReponses`, `Essayant`, `PresenceEssai`, `CoachToken`, `ReglementInterieur`

## Risques identifiés

- 13 variables d'environnement référencées dans le code mais absentes du `.env` (CLERK, STRIPE, HCAPTCHA, ADMIN_EMAIL, etc.)
- Couverture de tests quasi-nulle hors module `gallery`
- `src/proxy.ts` nommé de façon non-conventionnelle pour un middleware Next.js
- `uploadDocumentFile()` upload sur Cloudinary malgré le code R2 présent dans le même fichier
