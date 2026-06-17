# Design — Normalisation adresse Membre, collecte d'adresse & durcissement sécurité

Date : 2026-06-13
Statut : approuvé (conception)

## Contexte

Trois problèmes à traiter sur le périmètre adhésion :

1. **Normalisation** — `Membre` stocke `ville`, `codePostal`, `adresse` à plat. La `ville`
   est fonctionnellement déterminée par le code INSEE de la commune ; la garder sur `Membre`
   crée une anomalie de mise à jour (même `codeInsee` pouvant porter deux orthographes).
2. **Oubli fonctionnel** — le formulaire d'inscription public ne collecte jamais l'adresse,
   la ville ni le code postal (cf. `AdherentForm.tsx`). Le téléphone est lui aussi reporté
   au dossier (pattern assumé « minimal à la création, complété dans le dossier »).
3. **Sécurité** — l'accès au dossier repose sur un magic-link (email + numéro d'adhérent →
   `accesToken` envoyé par email). Le `accesToken` (vrai bearer token) est stocké **en clair**
   en base. La demande d'accès n'est pas rate-limitée.

Base de données **vide / dev** : migration sans contrainte de reprise de données.

## Décisions de conception

### 1. Modèle de données (3NF)

Seule la dépendance fonctionnelle réelle est extraite : `codeInsee → nom de commune`.

```prisma
model Commune {
  codeInsee String   @id @db.VarChar(5)
  nom       String   @db.VarChar(100)
  membres   Membre[]
}

model Membre {
  // SUPPRIMÉ : ville
  // CONSERVÉ : adresse (voie), codePostal
  codeInsee String?  @db.VarChar(5)
  commune   Commune? @relation(fields: [codeInsee], references: [codeInsee])
  // ... reste inchangé
}
```

**Justifications explicites :**
- `codePostal` **reste une colonne** sur `Membre` : valeur atomique de l'adresse du membre,
  aucun attribut n'en dépend → aucune anomalie à prévenir. Une table `CodePostal` serait de
  la sur-normalisation (indirection + JOIN sans gain de stockage ni d'intégrité).
- Les valeurs répétées (`codeInsee`, `codePostal` identiques entre membres) sont normales et
  correctes — ce sont des faits réels / des clés étrangères, pas des doublons.
- `codeInsee` est **nullable** : un membre peut exister sans adresse renseignée (l'adresse est
  collectée plus tard, dans le dossier).

`Commune` est remplie **à la volée** (`upsert`) au moment où un membre enregistre son adresse.
Pas de seed, pas de référentiel à maintenir.

### 2. Collecte de l'adresse — dans le dossier

Cohérent avec le téléphone (déjà reporté au dossier). Le formulaire public reste inchangé.

- **Composant d'autocomplétion adresse** branché sur l'API publique
  `https://api-adresse.data.gouv.fr/search/?q=<query>&type=housenumber&limit=5`
  (Base Adresse Nationale, sans clé, CORS activé). À la sélection d'une `feature`, on extrait :
  - `properties.name` → `adresse` (numéro + voie)
  - `properties.postcode` → `codePostal`
  - `properties.citycode` → `codeInsee`
  - `properties.city` → `nom` de commune
- **Use-case `updateAdresse`** + action `updateAdresseAction(token, { adresse, codePostal, codeInsee, communeNom })` :
  1. `upsert` de la `Commune` (`codeInsee` → `nom`)
  2. update du `Membre` (`adresse`, `codePostal`, `codeInsee`)
  Calqué sur le pattern existant `updateTelephone` (validation Zod, lookup par token).
- **UI** : nouvelle section « Adresse » dans `MonDossierView`, à côté du téléphone.

### 3. Sécurité

#### 3a. Hash du `accesToken` au repos

Le `accesToken` est un bearer token : une fuite de base permettrait l'usurpation tant que le
TTL (1h) est valide. On le stocke haché.

- Helper partagé `hashToken(raw: string): string` → `SHA-256` hex (`crypto`).
- **Génération** : on crée un UUID brut, on envoie le **brut** dans l'email, on stocke
  `hashToken(brut)` en base. Concerné :
  - `requestAccesDossierAction` (flux dossier)
  - `request-acces-essai.use-case` (flux essai — même colonne `accesToken`)
- **Lecture** : on hache le token entrant avant le `where`. Concerné :
  - `membreDataSource.findByToken`
  - `inscriptionDataSource.findByToken`
- Le nom de colonne reste `accesToken` (contient désormais le hash, pas le secret brut).

**Refactors du flux essai requis par le hash** (le token brut ne doit plus jamais être
re-servi depuis la base) :
- `get-mon-essai.use-case` : **ne renvoie plus** `accesToken`. `getMonEssaiAction` cesse de le
  retourner. `MonEssaiView` utilise le `token` brut qu'il reçoit **déjà en prop** (depuis l'URL)
  pour construire le lien de conversion `/inscription?conversion=...&token=<token>`.
- `pointer-presence.use-case` : **retourne** le `newToken` brut généré à la conversion.
  `pointerPresenceAction` utilise ce `newToken` pour l'email de conversion au lieu de **re-lire**
  `accesToken` en base.

- `numeroAdherent` **reste en clair** : c'est un identifiant affiché à l'utilisateur et
  recherché par les admins, pas un secret. Le hacher casserait l'affichage/recherche sans
  aucun gain (il est déjà connu du membre).

#### 3b. Rate-limiting de la demande d'accès

- `checkRateLimit('acces-dossier', …)` en tête de `requestAccesDossierAction`
  (infra existante : Upstash + fallback in-memory).
- Idem sur l'action de demande d'accès essai si non déjà couverte.
- L'action continue de renvoyer `{ success: true }` que le membre existe ou non
  → pas d'oracle d'énumération (comportement actuel conservé).

## Tests (TDD sur les unités)

- `hashToken` : déterminisme + même entrée → même sortie.
- `updateAdresse` use-case : upsert commune + update membre (membre sans commune préalable, et
  commune déjà existante → pas de doublon).
- `findByToken` (membre & inscription) : match sur le hash, pas sur le brut ; rejet si expiré.

## Hors périmètre (YAGNI)

- Table `CodePostal` séparée (sur-normalisation, écartée).
- Référentiel pré-chargé des communes (remplissage à la volée suffisant).
- Migration de données existantes (base vide).
- Collecte d'adresse dans le formulaire public (reportée au dossier).

## Fichiers impactés (indicatif)

- `prisma/schema.prisma` + nouvelle migration
- `src/shared/lib/` : helper `hashToken`
- `src/features/adhesion/data/datasources/membre.postgres.datasource.ts`
- `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts`
- `src/features/adherents/actions/mon-dossier.actions.ts`
- `src/features/adherents/domain/use-cases/` : `update-adresse.use-case.ts`
- `src/features/essayants/domain/use-cases/request-acces-essai.use-case.ts`
- `src/features/essayants/domain/use-cases/create-essayant.use-case.ts` (génère aussi un token)
- `src/features/essayants/domain/use-cases/get-mon-essai.use-case.ts` (ne renvoie plus le token)
- `src/features/essayants/domain/use-cases/pointer-presence.use-case.ts` (retourne le newToken)
- `src/features/essayants/actions/essayants.actions.ts` (conversion utilise newToken)
- `src/features/essayants/presentation/components/front/MonEssaiView.tsx` (lien via prop token)
- `src/features/adherents/presentation/components/front/MonDossierView.tsx` + composant autocomplétion
