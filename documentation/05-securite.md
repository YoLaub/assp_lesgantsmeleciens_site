# 5. Sécurité

[← Retour au sommaire](./README.md)

## 5.1 Modèle d'authentification

L'application combine **trois mécanismes** d'identification, sans table d'utilisateurs interne :

| Population | Mécanisme | Implémentation |
|---|---|---|
| Admin | Session Clerk (JWT) | `clerkMiddleware` dans `src/proxy.ts` → `auth.protect()` sur `/admin(.*)` ; garde `requireAdmin()` / `auth()` dans les actions sensibles |
| Adhérent / Essayant | Magic-link (token par email) | Token passé **en argument** d'action, comparé à un hash stocké |
| Coach | `CoachToken` temporaire | Token avec expiration, sans compte |

> Il n'y a **pas** de modèle `User` en base. L'attribution d'une action admin se fait via un snapshot du `userId` Clerk (ex. `Association.modifiePar`).

## 5.2 Sécurité des tokens d'accès

- Les tokens d'accès (`Membre.accesToken`, token essai) ne sont **jamais persistés en clair** : seul leur **hash SHA-256** (`hashToken()` dans `shared/lib/token.ts`) est stocké.
- Le lookup se fait par hash (`findByToken`), avec contrôle d'**expiration** (`accesTokenExpireLe`).
- Lors d'une conversion essayant → adhérent, un `newToken` est régénéré ; le token brut n'est plus re-servi au client.

## 5.3 Posture CSRF

> Audit du 2026-06-15 — verdict : **posture correcte**, surface CSRF quasi nulle par conception.

1. **Server Actions** — Les 13 fichiers `'use server'` bénéficient de la protection CSRF intégrée de Next.js : POST uniquement + comparaison `Origin`/`Host`. Aucun `allowedOrigins` custom n'affaiblit ce comportement (same-origin strict).
2. **Pas de route API mutatrice exposée** — Les seules routes `api/` sont le webhook Stripe (vérification de **signature**, pas de cookie ambiant) et les crons (`Authorization: Bearer CRON_SECRET`).
3. **Magic-link** — Auth par token en argument, pas par cookie ambiant → CSRF sans objet.

**Points de vigilance** (pas des failles) :
- En auto-hébergement derrière un reverse-proxy, fixer `X-Forwarded-Host` côté serveur (ne pas le recopier du client), car la protection Server Action repose sur l'égalité `Origin == Host`. Sur Vercel, c'est géré.
- Toute future `route.ts` mutatrice s'appuyant sur le cookie Clerk devra implémenter sa **propre** protection (le contrôle d'Origin des Server Actions ne s'y applique pas).

## 5.4 En-têtes & CSP

Configurés dans `next.config.ts` :
- **CSP** construite dynamiquement à partir de `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (compatible test et prod).
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` (anti-clickjacking).
- `form-action 'self'`, **HSTS**.

## 5.5 Défense en profondeur des actions publiques

| Protection | Cible | Implémentation |
|---|---|---|
| hCaptcha | Création dossier, demande d'accès, essai | `shared/lib/hcaptcha.ts` |
| Rate-limiting | `createAdherentAction`, `createEssayantAction`, `requestAccesEssaiAction` | `shared/lib/rate-limit.ts` (Upstash Redis en prod, in-memory en dev) |
| Validation | Toutes les actions | Schémas **Zod** (entrées), `sanitize.ts` (HTML TipTap) |
| URLs réseaux | Module Association | Restreintes à http/https (exclut `javascript:`, `data:`) |

## 5.6 RGPD & données personnelles

- Adresses normalisées via l'**API Adresse BAN** (data.gouv.fr) ; référentiel `Commune` local.
- Carte de la page Contact via **iframe OpenStreetMap** (pas de tracker tiers type Google Maps).
- Documentation RGPD interne (non versionnée) : `docs/rgpd/` (registre de traitement, DPA) et purge du consentement santé (`docs/superpowers/plans/2026-06-17-consentement-sante-rgpd-purge.md`).

## 5.7 Fichiers de référence

| Fichier | Rôle sécurité |
|---|---|
| `next.config.ts` | En-têtes (CSP, HSTS, X-Frame-Options) |
| `src/proxy.ts` | `clerkMiddleware`, protection `/admin` |
| `src/app/api/webhooks/stripe/route.ts` | Vérification signature Stripe |
| `src/app/api/cron/*/route.ts` | Bearer `CRON_SECRET` |
| `src/shared/lib/token.ts` | Hash SHA-256 des tokens |
| `src/shared/lib/rate-limit.ts` | Rate-limiting |
| `src/shared/lib/hcaptcha.ts` | Validation captcha |
