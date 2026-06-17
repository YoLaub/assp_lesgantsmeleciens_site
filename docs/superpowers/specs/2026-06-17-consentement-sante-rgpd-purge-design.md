# Consentement explicite données de santé (RGPD Art. 9.2.a) + purge annuelle

Date : 2026-06-17
Statut : design validé
Approche retenue : A (consentement au submit du questionnaire + purge intégrée au cron saison)

## Contexte & problème

Le club collecte des **données de santé** (questionnaire santé, certificat médical) et une
**photo perso** d'adhérents, dont des **mineurs**. Le RGPD impose pour les données de santé
(catégorie particulière, Art. 9) un **consentement explicite** (Art. 9.2.a), **prouvable**
(Art. 7.1), et une **durée de conservation** annoncée et **réellement appliquée** (Art. 5.1.e).

État actuel :
- Aucun consentement explicite n'est recueilli avant la saisie du questionnaire santé.
- Le cron annuel `reinitialisation-saison` (1er juillet) bascule seulement
  `inscriptionValide: false`. Il **ne purge pas** les réponses du questionnaire, ni le
  certificat médical, ni la photo perso. La durée « 1 an » ne serait donc pas honnête.

## Objectif

1. Recueillir un **consentement explicite** (case à cocher, opt-in) avant la saisie des
   données de santé, avec **traçabilité** (date + version du texte).
2. Étendre la **purge annuelle** pour supprimer réellement les données de santé et la photo
   perso, afin que l'annonce « conservées 1 an » soit exacte.

Hors périmètre : refonte du parcours dossier, autres bases légales, registre des traitements,
politique de confidentialité (document juridique séparé).

## Décisions validées

- **Placement** : la case de consentement bloque l'accès / la validation du **questionnaire
  santé** (là où la donnée de santé est réellement collectée).
- **Traçabilité** : horodatage + **version** du texte consenti, stockés en base.
- **Rétention** : annoncée *et* appliquée — extension de la purge à l'évènement annuel existant.

## Architecture

### 1. Schéma (migration Prisma)

Sur `model QuestionnaireSante`, deux colonnes nouvelles (nullable, rétro-compatibles) :

```prisma
consentementSanteLe       DateTime?
consentementSanteVersion  String?   @db.VarChar(20)
```

Migration additive uniquement (aucune donnée existante impactée).

### 2. Constante de consentement partagée

Nouveau fichier `src/shared/lib/consent.ts` :

```ts
export const CONSENT_SANTE = {
  version: '2026-06',
  texte:
    "Je consens expressément (RGPD art. 9.2.a) au traitement de mes données de santé " +
    "(questionnaire de santé, certificat médical) par l'association, dans le seul but du " +
    "suivi de mon dossier d'adhésion. Ces données sont conservées 1 an puis supprimées.",
} as const;
```

`version` est la source de vérité ; toute modification du texte impose d'incrémenter `version`.

### 3. Collecte du consentement

- **UI** (`MonDossierView`, section questionnaire santé) : une **case décochée par défaut**
  affichant `CONSENT_SANTE.texte`. Le bouton « Valider » est **désactivé** tant que la case
  n'est pas cochée. Aucune pré-coche (opt-in strict = condition de validité Art. 9.2.a).
- **Action serveur** `soumettreQuestionnaireAction(token, reponses, consentementSante: boolean)` :
  refuse avec `{ success: false, error: 'Consentement requis' }` si `consentementSante !== true`,
  **avant** toute écriture. (Défense côté serveur ; la désactivation UI n'est pas une garantie.)
  Idem pour `soumettreQuestionnaireEnfantAction`.
- **Use-case** `soumettreQuestionnaireUseCase(inscriptionId, type, reponses)` : reçoit en plus
  la date/version et les persiste lors de l'upsert :
  `consentementSanteLe = new Date()`, `consentementSanteVersion = CONSENT_SANTE.version`.

### 4. Purge annuelle (extension de `reinitialisation-saison`)

Le cron [reinitialisation-saison/route.ts](../../../src/app/api/cron/reinitialisation-saison/route.ts)
ajoute, **pour les inscriptions réinitialisées**, une étape de purge des données de santé :

Pour chaque inscription concernée :
1. Supprimer son `QuestionnaireSante` (la cascade Prisma supprime `Reponse` et `Interroge`).
2. Supprimer les `Document` de type `MEDICAL_CERTIFICATE` (objet **R2**) et `ID_PHOTO`
   (asset **Cloudinary**), fichier puis ligne DB.
3. Remettre l'`Inscription` : `photo = null`, `certificatMedical = 'non_fourni'`,
   `certificatMedicalReq = false`.

**Robustesse** : une erreur de suppression de fichier (R2/Cloudinary) est **loguée** mais
**ne bloque pas** la purge des autres inscriptions ni l'effacement en base. La purge des
fichiers est *best-effort* ; la suppression des **données personnelles en base** est la
garantie principale.

**Réponse du cron** enrichie : `{ ok, reinitialises, emailsEnvoyes, questionnairesPurges,
documentsPurges }`.

### 5. Dérivation des clés de stockage depuis l'URL

Les `Document` ne stockent que `url`. Deux helpers (dans `src/shared/lib/upload.ts`) :

- `r2KeyFromUrl(url)` : retire le préfixe `R2_PUBLIC_URL` → la clé S3 ; puis
  `deleteR2Object(key)` (commande `DeleteObjectCommand`).
- `cloudinaryPublicIdFromUrl(url)` : parse le chemin Cloudinary
  (`.../upload/v123/<folder>/<name>.<ext>`) → `<folder>/<name>` (sans version ni extension),
  réutilisé par `deleteCloudinaryAsset`.

Dérivations déterministes, testées unitairement (URLs nominales + cas dégradés → renvoient
`null`, suppression ignorée et loguée).

## Flux de données

```
Adhérent ─(coche + valide)→ soumettreQuestionnaireAction(token, reponses, consent=true)
                              │  refuse si consent ≠ true
                              ▼
                       soumettreQuestionnaireUseCase
                              │  upsert questionnaire + consentementSanteLe/Version
                              ▼
                          QuestionnaireSante (traçé)

[1er juillet] Cron reinitialisation-saison (Bearer CRON_SECRET)
   ├─ updateMany inscriptionValide=false  (existant)
   ├─ sendOuvertureInscriptions            (existant)
   └─ purge santé (nouveau) :
        delete QuestionnaireSante (cascade) ; delete Documents (R2/Cloudinary + DB) ;
        reset Inscription.photo/certificatMedical/certificatMedicalReq
```

## Gestion d'erreurs

- Consentement absent → refus serveur explicite avant écriture.
- Suppression fichier R2/Cloudinary en échec → `console.error`, on continue (best-effort).
- URL non parsable → helper renvoie `null`, suppression fichier ignorée et loguée ;
  la ligne `Document` et les champs DB sont quand même purgés.

## Tests

- **use-case questionnaire** : refus si consentement absent ; enregistrement
  `consentementSanteLe`/`Version` si présent (repo mocké).
- **actions** : `soumettreQuestionnaireAction` / `...EnfantAction` rejettent `consent=false`.
- **purge** (route cron, prisma + libs fichiers mockés) : QuestionnaireSante + Documents
  supprimés, champs Inscription reset, échec fichier non bloquant.
- **dérivation URL** : `r2KeyFromUrl` / `cloudinaryPublicIdFromUrl` — cas nominaux + dégradés.

## Risques & limites

- La purge fichiers dépend de la dérivation d'URL ; si un fournisseur change de schéma d'URL,
  la suppression fichier échoue (loguée) — la donnée DB reste, elle, purgée. Évolution future
  possible : persister la clé/publicId à l'upload (approche C, non retenue maintenant, YAGNI).
- Le texte de consentement (`CONSENT_SANTE.texte`) est rédigé côté dev ; **à faire valider par
  le responsable de traitement** avant mise en prod.
