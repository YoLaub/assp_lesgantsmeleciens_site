# Les Gants Méléciens — Site associatif

Site web de l'ASSP Les Gants Méléciens, club de self-protection. Gestion des inscriptions, des adhérents, des essais et de l'interface d'administration.

## Stack technique

| Couche | Outil |
|---|---|
| Framework | Next.js 16.1 (App Router), React 19 |
| Base de données | PostgreSQL + Prisma 7 (`prisma-client`) |
| Auth | Clerk (`@clerk/nextjs`) |
| Emails | Brevo (API REST) |
| Médias | Cloudinary (images & documents) |
| Paiement | Stripe |
| Captcha | hCaptcha |
| Style | Tailwind CSS v4 |
| Formulaires | react-hook-form + Zod |
| Tests | Vitest |
| Déploiement | Vercel |

## Architecture

Architecture feature-based :

```
src/
  features/[feature]/
    domain/models/          # Zod schemas
    data/repositories/      # Prisma (repository pattern)
    presentation/components/
      admin/                # composants interface admin
      front/                # composants publics
  app/
    (front)/[route]/        # pages publiques
    admin/[route]/          # pages admin (protégées Clerk)
    api/
      webhooks/stripe/      # webhook Stripe (seule vraie API route)
      cron/                 # tâches cron (rappel dossier, réinit saison)
  shared/lib/               # prisma.ts, mail.ts, hcaptcha.ts, rate-limit.ts
```

Le client Prisma est généré dans `src/generated/prisma`. Toujours importer depuis `@/generated/prisma` (et `@/generated/prisma/enums` pour les enums).

Toutes les mutations BDD passent par des **Server Actions** (`'use server'`), sauf le webhook Stripe qui est une vraie API route.

## Fonctionnalités

- Site vitrine (actualités, galerie, disciplines)
- Formulaire d'essai (séance découverte)
- Formulaire d'inscription simplifié : prénom, nom, date de naissance, sexe, email + options (oxygène, Pass Sport, Bon CAF)
- Espace "Mon Dossier" (`/mon-dossier?token=XXXX`) : coordonnées, upload certificat médical et photo, droit à l'image, code Pass Sport, engagement pris connaissance
- Interface admin protégée par Clerk : liste adhérents, fiche adhérent, config tarifs, gestion coach-token, suivi essayants
- Webhook Stripe pour les paiements
- Cron quotidien (9h) : rappel aux adhérents avec dossier incomplet depuis +30j
- Cron annuel (1er juillet 9h) : réinitialisation de saison + email ouverture inscriptions

## Démarrage local

```bash
npm install
```

Créer un fichier `.env.local` avec les variables suivantes (voir section Variables d'environnement) :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

```bash
npm run dev          # serveur de développement
npm run build        # build de production
npm run lint         # ESLint
npm run test         # tests Vitest (run once)
npm run test:watch   # tests en mode watch
npm run db:push      # applique le schéma Prisma en base
npm run db:studio    # ouvre Prisma Studio
npm run db:seed      # seed galerie, disciplines, actualités, questionnaire
```

## Variables d'environnement

| Variable | Obligatoire | Usage |
|---|---|---|
| `DATABASE_URL` | Oui | PostgreSQL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Oui | Clerk (front) |
| `CLERK_SECRET_KEY` | Oui | Clerk (serveur) |
| `BREVO_API_KEY` | Oui | Envoi d'emails |
| `ADMIN_EMAIL` | Oui | Destinataire notifications admin |
| `CLUB_EMAIL` | Oui | Email expéditeur du club |
| `NEXT_PUBLIC_CLUB_EMAIL` | Oui | Affiché en front |
| `NEXT_PUBLIC_APP_URL` | Oui | URL base (liens emails) |
| `HCAPTCHA_SECRET` | Oui | Validation captcha (serveur) |
| `NEXT_PUBLIC_HCAPTCHA_SITEKEY` | Oui | Affichage captcha (front) |
| `STRIPE_SECRET_KEY` | Oui | Paiements Stripe |
| `STRIPE_WEBHOOK_SECRET` | Oui | Validation webhook Stripe |
| `CLOUDINARY_API_KEY` | Oui | Upload documents |
| `CLOUDINARY_API_SECRET` | Oui | Upload documents |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Oui | Affichage images |
| `CRON_SECRET` | Oui | Sécurisation routes `/api/cron/*` |
| `UPSTASH_REDIS_REST_URL` | Recommandé | Rate-limiting en prod |
| `UPSTASH_REDIS_REST_TOKEN` | Recommandé | Rate-limiting en prod |

> Sans `UPSTASH_REDIS_*`, le rate-limiting bascule en mode in-memory (best-effort sur Vercel serverless).

## Modèles Prisma actifs

### Médias
| Modèle | Description |
|---|---|
| `ImageCategory` | Catégories d'images |
| `Image` | Images Cloudinary (publicId, version, format, dimensions…) |
| `Discipline` | Disciplines du club (coach, description, SEO, images) |
| `Actualite` | Actualités (titre, description, tags, images) |

### Adhésion (bounded context Membre/Inscription)
| Modèle | Description |
|---|---|
| `Membre` | Identité du membre (nom, prénom, email, date de naissance, token d'accès) |
| `Inscription` | Adhésion par saison (statut, documents, paiement, catégorie) |
| `PresenceEssai` | Présences aux séances d'essai |
| `Document` | Fichiers uploadés (certificat médical, photo, règlement…) |

### Questionnaire santé (normalisé)
| Modèle | Description |
|---|---|
| `QuestionnaireSante` | En-tête questionnaire lié à une inscription |
| `Question` | Référentiel de questions (majeur/mineur) |
| `Reponse` | Réponses booléennes par questionnaire/question |
| `Interroge` | Questions posées pour un questionnaire donné |

### Configuration
| Modèle | Description |
|---|---|
| `ConfigTarifs` | Tarifs par saison (enfant, ados, adulte, suppléments) |
| `CoachToken` | Tokens d'accès coach temporaires |
| `ReglementInterieur` | Contenu du règlement intérieur |

### Enums
| Enum | Valeurs |
|---|---|
| `StatutDocument` | `non_fourni`, `declare`, `valide` |
| `TypePaiement` | `sur_place`, `en_ligne` |
| `StatutInscription` | `ESSAYANT`, `ACTIF`, `BLOQUE`, `ARCHIVE` |
| `Categorie` | `enfant`, `ados`, `adulte` |

> Il n'y a pas de modèle `User` en base — l'authentification admin est entièrement gérée par Clerk.
> Le client Prisma est généré dans `src/generated/prisma`. Importer depuis `@/generated/prisma` (et `@/generated/prisma/enums` pour les enums).

## Déploiement Vercel

Configurer toutes les variables d'environnement dans le dashboard Vercel.

Actions post-déploiement :
1. Configurer le webhook Stripe → `https://votre-domaine/api/webhooks/stripe`
2. Enregistrer le site sur [hcaptcha.com](https://hcaptcha.com)
3. Vérifier les flux critiques : login Clerk, captcha, images Cloudinary, redirection Stripe
4. Le `vercel.json` contient déjà la configuration des deux crons

## Sécurité

- Security headers et CSP configurés dans `next.config.ts`
- CSP construite dynamiquement depuis `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (compatible test et prod)
- Rate-limiting sur les actions publiques (`createAdherentAction`, `createEssayantAction`, `requestAccesEssaiAction`) via `src/shared/lib/rate-limit.ts`
