# Rapport d'étonnement — Les Gants Méléciens
Date : 2026-05-17
Analyste : Claude (archi-mapper)

---

## Résumé exécutif

Le site est une application Next.js 16 App Router de niveau production pour une ASSP de boxe. L'architecture est globalement solide : clean architecture pour les features contenus (gallery, disciplines, actualités), server actions bien typées, et un flow d'adhésion complet avec Stripe, Brevo et hCaptcha. La qualité du code est uniforme et les choix techniques sont cohérents avec la taille du projet. Plusieurs points méritent attention : l'absence de middleware Clerk expose les routes admin côté serveur uniquement, des tokens d'accès sans-auth sont utilisés pour des données sensibles (dossiers adhérents), et la couverture de tests reste partielle.

---

## Points positifs

- **Clean Architecture appliquée** sur gallery, disciplines, actualités : data / domain / presentation bien séparés, usecases testables.
- **Server Actions** utilisées partout à bon escient — pas de route API pour le CRUD, ce qui simplifie le surface d'attaque.
- **Flow d'adhésion complet** : de l'inscription à la validation paiement Stripe en passant par documents, questionnaire santé et emails automatiques.
- **neverthrow** présent dans les dépendances pour la gestion d'erreurs typée (même si son usage semble limité à la gallery pour l'instant).
- **sanitize-html** utilisé au write-time pour descriptions — pas de re-sanitisation côté affichage, bonne décision.
- **Tests unitaires** sur la gallery : usecases, repositories, hooks, composants — pattern cohérent.
- **hCaptcha** sur tous les formulaires publics — bonne protection anti-bot.

---

## Points d'attention

### 1. Absence de middleware Clerk (`src/middleware.ts` manquant)
- **Constat** : Il n'existe pas de fichier `middleware.ts` à la racine `src/`. La protection des routes `/admin` repose uniquement sur `auth()` appelé dans les server actions et les composants serveur, pas sur un middleware Next.js.
- **Risque** : Un utilisateur non authentifié peut accéder aux pages admin côté HTML statique (layout, shell) même si les données sont protégées. Pas de redirection côté edge. En cas d'oubli d'un `auth()` dans un composant, la donnée serait exposée.
- **Sévérité** : 🟠 Important
- **Recommandation** : Ajouter `src/middleware.ts` avec `clerkMiddleware()` et une `matcher` couvrant `/admin/(.*)`. C'est la pratique recommandée par Clerk pour Next.js.

### 2. Tokens d'accès en clair dans l'URL (dossiers adhérents)
- **Constat** : L'accès à `/mon-dossier` et `/mon-essai` repose sur un token UUID passé en query param (`?token=...`) stocké en base. Ce token donne accès à des données personnelles sensibles (nom, email, documents, questionnaire santé).
- **Risque** : Le token peut être loggué par des proxies, apparaître dans les logs Vercel, ou être exposé dans l'historique navigateur. En cas de fuite, l'accès à des données sensibles est direct.
- **Sévérité** : 🟠 Important
- **Recommandation** : Courte durée de vie (1h actuelle — correct). Envisager un paramètre POST ou un cookie HttpOnly plutôt qu'un query param pour les prochaines évolutions. À minima, logger un warning si le token est utilisé après expiration sans invalider.

### 3. Stripe Webhook — stripeSessionId non réservé à la création
- **Constat** : Dans `createCheckoutAction`, le `stripeSessionId` est sauvegardé APRÈS la création de la session Stripe. Si le webhook arrive avant la fin de la requête (race condition), `adherent.findFirst({ where: { stripeSessionId: session.id } })` retournera null et le paiement ne sera pas validé.
- **Risque** : Perte de validation automatique après paiement. L'adhérent paye mais reste `inscriptionValide: false`.
- **Sévérité** : 🟠 Important
- **Recommandation** : Sauvegarder le `stripeSessionId` avant de créer la session Stripe (ou dans la même transaction), ou implémenter une logique de retry dans le webhook handler.

### 4. Upload documents vers S3 — pas de validation antivirus
- **Constat** : `uploadDocumentFile` dans `upload.ts` accepte JPEG, PNG, WebP et PDF jusqu'à 5 Mo. Les fichiers sont envoyés directement vers S3. Il n'y a pas de scan antivirus ou de vérification du contenu réel (magic bytes).
- **Risque** : Upload de fichiers malveillants déguisés en PDF/images. Risque limité car les fichiers ne sont pas exécutés, mais présent si des URLs S3 sont partagées ou si S3 est utilisé comme distribution.
- **Sévérité** : 🟡 Mineur
- **Recommandation** : Vérifier les magic bytes en plus du MIME type déclaré. Envisager des URLs S3 présignées avec expiration plutôt que des URLs permanentes si les documents sont sensibles.

### 5. Emails construits en HTML inline sans template centralisé
- **Constat** : Les 15+ fonctions d'email dans `mail.ts` construisent le HTML inline avec des template literals. Il n'y a pas de design system email, pas de layout commun, pas d'internationalisation.
- **Risque** : Incohérence visuelle entre emails. Maintenance coûteuse si le design du club évolue. Risque de XSS si des données utilisateur non échappées étaient injectées (actuellement OK car les params sont typés TypeScript).
- **Sévérité** : 🟡 Mineur
- **Recommandation** : Extraire un `emailLayout(body: string)` minimal pour partager header/footer. À terme, migrer vers des templates Brevo natifs (plus maintenables côté club).

### 6. Pas de middleware de protection pour les routes CRON
- **Constat** : Les routes `/api/cron/*` sont protégées par un `Bearer CRON_SECRET` en header. C'est un pattern valide, mais si `CRON_SECRET` n'est pas défini en prod, la comparaison `undefined === undefined` serait vraie et la route serait ouverte.
- **Risque** : Réinitialisation accidentelle de toutes les inscriptions si le cron est appelé par un acteur externe et que la variable d'env est manquante.
- **Sévérité** : 🟠 Important
- **Recommandation** : Ajouter une guard explicite : `if (!process.env.CRON_SECRET) return 401` avant la comparaison. Ou utiliser Vercel Cron avec le header `x-vercel-cron-signature` officiel.

### 7. Absence de pagination sur les listes admin
- **Constat** : Les pages admin (`/admin/club/adherents`, `/admin/club/essayants`) semblent charger toutes les données sans pagination évidente dans les fichiers analysés.
- **Risque** : Dégradation des performances à mesure que la base grandit. Timeout Vercel possible sur les lambdas si plusieurs centaines d'adhérents.
- **Sévérité** : 🟡 Mineur
- **Recommandation** : Ajouter pagination côté serveur (cursor-based avec Prisma) dès que la liste dépasse ~200 entrées.

### 8. `z` (Zod) absent des dépendances déclarées
- **Constat** : Zod est utilisé dans plusieurs server actions (`create-adherent.actions.ts`, `mon-dossier.actions.ts`, `essayants.actions.ts`) mais n'apparaît pas dans `package.json` (ni en dependencies, ni en devDependencies).
- **Risque** : Zod est probablement une dépendance transitive de `react-hook-form` ou `@hookform/resolvers`. Si ces packages modifient leur arbre de dépendances, le build peut casser sans warning.
- **Sévérité** : 🟠 Important
- **Recommandation** : Ajouter `zod` explicitement en dépendance directe (`npm install zod`).

---

## Dettes techniques identifiées

| Dette | Effort estimé |
|-------|---------------|
| Ajouter `src/middleware.ts` Clerk | S |
| Ajouter `zod` en dépendance directe | S |
| Guard `CRON_SECRET` non défini | S |
| Extraire layout commun pour emails | M |
| Pagination listes admin | M |
| Vérification magic bytes upload | M |
| Migrer emails vers templates Brevo | L |
| Tests E2E (Playwright) parcours adhésion | L |
| Tests intégration actions server-side | M |

---

## Questions ouvertes

1. **Vercel Cron Jobs** : Les routes `/api/cron/*` sont-elles appelées par Vercel Cron (avec `vercel.json`) ou par un service externe ? La configuration Vercel n'a pas été trouvée dans le repo.
2. **S3 vs Cloudinary pour documents** : Les images de contenu vont sur Cloudinary, les documents adhérents sur S3. Ce split est logique (documents privés vs images publiques) mais est-il documenté ? Y a-t-il des buckets S3 avec accès public restreint ?
3. **Prisma Accelerate** (`@prisma/extension-accelerate`) : La dépendance est présente mais son usage effectif dans `prisma.ts` n'est pas clair. Est-il activé ? Le connection pooling est-il configuré pour Neon/Vercel ?
4. **Coach token expiration** : Le `CoachToken` a une `expireLe` mais le code de vérification côté coach n'a pas été inspecté. Est-ce que le coach peut pointer des présences avec un token expiré ?
5. **Réinitialisation de saison** : Le cron `reinitialisation-saison` remet `inscriptionValide: false` pour tous les adhérents valides — est-ce une opération prévue en production ou un outil de migration une fois par an ?

---

## Métriques clés

| Métrique | Valeur |
|----------|--------|
| Composants / features | 6 (gallery, disciplines, actualités, adherents, essayants, dashboard) |
| Intégrations externes | 6 (Clerk, Cloudinary, Brevo, Stripe, hCaptcha, AWS S3) |
| Modèles Prisma | 11 |
| Server Actions identifiées | ~30 |
| Emails transactionnels | 15 fonctions |
| Fichiers de test | ~15 (unitaires, gallery principalement) |
| Couverture estimée | ~20% (uniquement gallery + lib) |
| Complexité globale | Moyenne |
