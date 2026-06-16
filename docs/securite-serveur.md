# Sécurité serveur — Security headers, CSP & Rate-limiting

> Mise en place : 2026-06-06 — branche `refacto&security`

Ce document décrit les mesures de sécurité serveur ajoutées au site, leurs choix
d'implémentation et les points de vérification après déploiement.

## Contexte

Le projet est une application **Next.js 16 (App Router)** déployée sur Vercel.
La question initiale portait sur les « manques » classiques : Helmet, CORS, rate-limiting.

Analyse :

- **CORS** → non applicable. Aucune API REST publique cross-origin n'est exposée :
  tout passe par des **Server Actions** (same-origin par construction, origine
  vérifiée par Next.js). Aucun middleware CORS n'est nécessaire.
- **Helmet** → middleware Express, incompatible avec Next.js. L'équivalent correct
  est un bloc `headers()` dans `next.config.ts` (voir ci-dessous).
- **Rate-limiting** → réellement absent. Les formulaires publics étaient protégés
  par hCaptcha mais sans limite de débit. Ajouté (voir ci-dessous).

## 1. Security headers + Content Security Policy

Fichier : [`next.config.ts`](../next.config.ts) — fonction `headers()`, appliquée à
toutes les routes (`/:path*`).

### Headers

| Header | Valeur | Rôle |
|---|---|---|
| `Content-Security-Policy` | voir ci-dessous | Limite les sources de scripts/frames/styles/images |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS (HSTS, 2 ans) |
| `X-Frame-Options` | `DENY` | Anti-clickjacking (legacy) |
| `X-Content-Type-Options` | `nosniff` | Anti MIME-sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limite la fuite de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Désactive APIs sensibles |
| `X-DNS-Prefetch-Control` | `on` | Préfetch DNS |

### CSP — domaine Clerk décodé dynamiquement

Le domaine du Frontend API Clerk est **décodé depuis la clé publishable**
(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, qui encode `<domaine>$` en base64). La CSP
fonctionne ainsi sans modification aussi bien en test (`pk_test_`,
`*.clerk.accounts.dev`) qu'en production (`pk_live_`, `clerk.mon-domaine.com`).

Sources autorisées :

- **self** partout par défaut
- **Cloudinary** (`res.cloudinary.com`, `img.clerk.com`) → `img-src`
- **hCaptcha** (`hcaptcha.com`, `*.hcaptcha.com`) → `script-src`, `style-src`, `connect-src`, `frame-src`
- **Clerk** (`*.clerk.accounts.dev`, `*.clerk.com`, domaine décodé, `challenges.cloudflare.com`, `clerk-telemetry.com`)
- **Stripe** → *non listé* : le paiement se fait par **redirection** vers la page
  Checkout hébergée (`window.location.href`), pas en frame embarquée. Rien à autoriser.

### Compromis assumé

`script-src` inclut `'unsafe-inline'` et `'unsafe-eval'`, requis par l'hydratation
Next.js, Clerk et hCaptcha. La CSP bloque donc l'injection de scripts vers des
domaines inconnus mais pas l'inline. **Durcissement possible** ultérieurement via
une CSP à **nonce** générée dans `proxy.ts` (le middleware Next.js 16).

## 2. Rate-limiting

Fichier : [`src/shared/lib/rate-limit.ts`](../src/shared/lib/rate-limit.ts).

### Fonctionnement

`checkRateLimit(scope, opts?)` : **5 requêtes / 10 min par IP** (configurable).

- Si `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` sont présents →
  limite **distribuée** via Upstash Redis (fiable sur serverless Vercel, et
  fonctionne aussi depuis un serveur auto-hébergé — c'est une API REST HTTPS).
- Sinon → **fallback in-memory** (process unique). Suffisant en dev local ou sur
  un serveur mono-instance ; best-effort seulement sur serverless.

Tant qu'Upstash n'est pas provisionné, rien ne casse : le fallback prend le relais.

> À noter : le rate-limiting **distribué** n'est un vrai besoin que sur du
> **serverless** (N lambdas éphémères sans mémoire partagée). Sur un serveur en
> process unique, le fallback in-memory est pleinement fonctionnel.

### Actions protégées

| Action | Scope |
|---|---|
| `createAdherentAction` ([fichier](../src/features/adherents/actions/create-adherent.actions.ts)) | `adhesion` |
| `createEssayantAction` ([fichier](../src/features/essayants/actions/essayants.actions.ts)) | `essai` |
| `requestAccesEssaiAction` ([fichier](../src/features/essayants/actions/essayants.actions.ts)) | `acces-essai` |

Le contrôle s'exécute **avant** la vérification hCaptcha, pour rejeter les abus au
plus tôt.

## Variables d'environnement

```dotenv
# Rate-limiting (Upstash Redis) — optionnel.
# Sans ces variables, fallback in-memory automatique.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

⚠️ À reporter dans **Vercel → Settings → Environment Variables** pour activer le
rate-limiting distribué en production. Utiliser les valeurs **REST** d'Upstash
(pas l'URL `redis://...`).

## ✅ À vérifier après déploiement

Un blocage CSP casserait silencieusement ces flux — vérifier dans la console
navigateur l'absence de `Refused to load…` :

- [ ] Connexion admin Clerk (+ OAuth Google)
- [ ] Affichage du captcha hCaptcha sur les formulaires (adhésion, essai)
- [ ] Affichage des images Cloudinary
- [ ] Redirection vers Stripe Checkout depuis « Mon dossier »
- [ ] Variables Upstash présentes dans Vercel
