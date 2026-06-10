# Mémoire Projet — asso_lesgantsmeleciens_site
> Mis à jour le 2026-06-10 (migration DDD v2)

## En bref

Site associatif **Les Gants Méléciens** (club de boxe). Next.js 16.1.5 App Router + TypeScript + Prisma 7 / PostgreSQL. Clerk pour l'auth admin. Cloudinary pour les images, R2 pour les photos adhérents. Stripe pour les paiements d'inscription. Brevo pour les emails transactionnels. 205 fichiers source.

Architecture **DDD v2** (migration juin 2026) : bounded context `adhesion` introduit avec Membre (UUID, identité pérenne) + Inscription (par saison). Les modules `adherents` et `essayants` sont maintenant des thin wrappers sur des use-cases DDD qui passent par `IMembreRepository` / `IInscriptionRepository`. Les modules `gallery`, `actualites`, `disciplines` suivent toujours Clean Architecture standard.

## Structure

```
src/
  app/
    (front)/          # 9 pages publiques
    admin/            # 18 pages admin protégées Clerk
      club/           # adherents, essayants, coach-token
      config/         # tarifs, reglement, sante (questionnaire)
      content/        # actualites, disciplines, gallery
      dashboard/
    api/
      cron/           # 2 cron jobs (rappel dossier incomplet, reset saison)
      webhooks/stripe # Webhook Stripe
    coach/            # Portail coach (pointage présences essayants)
    login/            # Clerk sign-in
  features/
    adhesion/         # Bounded context DDD — Membre + Inscription (domain + data)
    actualites/       # Clean Architecture
    disciplines/      # Clean Architecture
    gallery/          # Clean Architecture — module le mieux testé
    adherents/        # Use-cases DDD (thin wrappers) + presentation
    essayants/        # Use-cases DDD (thin wrappers) + presentation
    inscriptions/     # Composant front seulement
    dashboard/        # Dashboard admin
  shared/
    lib/              # prisma, cloudinary, mail (21 fns Brevo), upload, result, sanitize, hcaptcha, rate-limit, adherent-utils
    components/       # CloudImage, ImageSlot*, ConfirmDialog, StatBadge
    types/            # cloudinary types
  proxy.ts            # Middleware Clerk (nom non-conventionnel, attendu : middleware.ts)
```

## Conventions détectées

- Clean Architecture : `domain/models/`, `domain/use-cases/`, `domain/repositories/`, `data/datasources/`, `data/repositories/`, `presentation/components/`
- Server Actions Next.js pour toutes les mutations (pas de route handlers sauf cron/webhook)
- Pattern token d'accès temporaire pour dossier adhérent (`Membre.accesToken`) et essai (même pattern via `Inscription`)
- `neverthrow` pour Result monad dans le code partagé
- Validation Zod dans toutes les actions
- Rate limiting sur formulaires publics via Upstash Redis (fallback mémoire en dev)

## Entités DB (Prisma — modèle DDD v2)

`ImageCategory`, `Image`, `Discipline`, `Actualite` — contenu
`Membre` (UUID), `Inscription` (par saison, FK → Membre), `PresenceEssai`, `Document`, `QuestionnaireSante`, `Question`, `Reponse`, `Interroge` — adhesion
`ConfigTarifs`, `CoachToken`, `ReglementInterieur` — config

## Risques identifiés

- 13 variables d'environnement référencées dans le code mais absentes du `.env` (CLERK, STRIPE, HCAPTCHA, UPSTASH, ADMIN_EMAIL, etc.)
- Couverture de tests partielle : `gallery` bien testée, `adhesion`/`essayants`/`adherents/questionnaire` testés partiellement — use-cases critiques (create-adherent, paiement) non testés
- `src/proxy.ts` nommé de façon non-conventionnelle pour un middleware Next.js
- Bounded context `adhesion` héberge les interfaces repos et impls, mais les use-cases restent dans `adherents/` et `essayants/` — architecture à clarifier
