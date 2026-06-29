# Documentation — Les Gants Méléciens

Documentation technique de l'application web de l'ASSP **Les Gants Méléciens**, club de self-protection : site vitrine, inscriptions adhérents, gestion des essais et back-office d'administration.

> Source : générée à partir de l'index d'architecture (`archi-output/`) — dernière synchronisation avec le code le 2026-06-26.

## Sommaire

| # | Document | Contenu |
|---|----------|---------|
| 1 | [Vue d'ensemble & architecture](./01-vue-densemble.md) | Stack, schéma d'architecture, conventions, arborescence |
| 2 | [Modèle de données](./02-modele-de-donnees.md) | MCD, modèles Prisma, enums, bounded context Adhésion |
| 3 | [Modules métier](./03-modules.md) | Découpage par feature, use-cases, règles métier |
| 4 | [Parcours utilisateurs](./04-parcours-utilisateurs.md) | Acteurs, cas d'usage, diagrammes de séquence |
| 5 | [Sécurité](./05-securite.md) | Auth, tokens, CSP, rate-limiting, RGPD |
| 6 | [Exploitation](./06-exploitation.md) | Variables d'env, démarrage local, tests, CI/CD, déploiement |

## En un coup d'œil

| | |
|---|---|
| **Type** | Application Next.js mono-repo (App Router) |
| **Framework** | Next.js 16.1 · React 19 · TypeScript 5.9 |
| **Base de données** | PostgreSQL · Prisma 7 |
| **Auth admin** | Clerk |
| **Paiement** | Stripe |
| **Médias** | Cloudinary (images/documents) · Cloudflare R2 (photos adhérents) |
| **Email** | Brevo (API HTTP) |
| **Hébergement** | Vercel |
| **Modules métier** | 8 (actualites, disciplines, gallery, adhesion, adherents, essayants, inscriptions, association) |
| **Routes** | 34 (10 front · 19 admin · 2 cron · 1 webhook · login · 404) |
| **Tests** | Vitest — 63 fichiers, ~80 % de la couche logique |

## Conventions de cette documentation

- Les chemins de fichiers sont relatifs à la racine du dépôt.
- Les diagrammes sont au format **Mermaid** et rendus automatiquement par GitHub.
- Cette documentation décrit **l'architecture et le métier** ; le détail d'implémentation fait foi dans le code.
