# Normalisation adresse Membre, collecte d'adresse & durcissement sécurité — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normaliser l'adresse du membre (table `Commune` en 3NF), collecter l'adresse dans le dossier via l'API Adresse du gouvernement, et durcir l'accès (hash du `accesToken` au repos + rate-limiting).

**Architecture:** Le `accesToken` devient un hash SHA-256 au repos ; le brut n'est connu qu'à la génération (envoyé par email) et jamais re-servi depuis la base — ce qui impose deux petits refactors du flux essai. La `ville` sort dans une table `Commune { codeInsee, nom }` remplie à la volée ; `codePostal` reste une colonne atomique de `Membre`. L'adresse est saisie dans le dossier via un composant d'autocomplétion branché sur `api-adresse.data.gouv.fr`.

**Tech Stack:** Next.js 16 (App Router, server actions), Prisma 7 / PostgreSQL, Vitest, React 19 / react-hook-form, Upstash rate-limit (infra existante).

**Conventions du repo :**
- Tests : `npm test` (vitest run). Un fichier de test côté node commence par `// @vitest-environment node`.
- Migration Prisma : `npx prisma migrate dev --name <nom>` (régénère aussi le client).
- Mapping domaine : les datasources renvoient le brut Prisma, les repositories mappent vers les modèles `domain/models`.

---

## Phase 1 — Rate-limiting de la demande d'accès dossier (quick win, isolé)

### Task 1 : Rate-limiter `requestAccesDossierAction`

**Files:**
- Modify: `src/features/adherents/actions/mon-dossier.actions.ts:19-32`

L'infra existe déjà (`checkRateLimit`), utilisée à l'identique dans `essayants.actions.ts:65`.

- [ ] **Step 1 : Ajouter l'import et le garde-fou rate-limit**

Dans `src/features/adherents/actions/mon-dossier.actions.ts`, ajouter l'import en tête (après les imports existants) :

```ts
import { checkRateLimit } from '@/shared/lib/rate-limit';
```

Puis modifier le début de `requestAccesDossierAction` :

```ts
export async function requestAccesDossierAction(input: { email: string; numeroAdherent: string; hcaptchaToken: string }) {
  const allowed = await checkRateLimit('acces-dossier');
  if (!allowed) return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' };

  const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };
  // ... reste inchangé
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/features/adherents/actions/mon-dossier.actions.ts
git commit -m "feat(securite): rate-limiting sur la demande d'acces dossier"
```

---

## Phase 2 — Hash du `accesToken` au repos + refactors essai

### Task 2 : Helper `hashToken`

**Files:**
- Create: `src/shared/lib/token.ts`
- Test: `src/shared/lib/token.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `src/shared/lib/token.test.ts` :

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { hashToken } from './token';

describe('hashToken', () => {
  it('est déterministe : même entrée → même sortie', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
  });

  it('produit un hash hexadécimal de 64 caractères (SHA-256)', () => {
    expect(hashToken('abc')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produit des sorties différentes pour des entrées différentes', () => {
    expect(hashToken('abc')).not.toBe(hashToken('abd'));
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier qu'il échoue**

Run: `npm test -- token`
Expected: FAIL (`Cannot find module './token'` ou `hashToken is not a function`).

- [ ] **Step 3 : Implémenter le helper**

Créer `src/shared/lib/token.ts` :

```ts
import crypto from 'crypto';

/**
 * Hash SHA-256 (hex) d'un token. Le token brut n'est jamais stocké :
 * on stocke hashToken(brut) en base, et on compare hashToken(entrant) à la lecture.
 */
export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
```

- [ ] **Step 4 : Lancer le test, vérifier qu'il passe**

Run: `npm test -- token`
Expected: PASS (3 tests).

- [ ] **Step 5 : Commit**

```bash
git add src/shared/lib/token.ts src/shared/lib/token.test.ts
git commit -m "feat(securite): helper hashToken (SHA-256)"
```

---

### Task 3 : Lecture par hash dans les datasources

**Files:**
- Modify: `src/features/adhesion/data/datasources/membre.postgres.datasource.ts:13-17`
- Modify: `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts:29-36`
- Test: `src/features/adhesion/data/datasources/membre.postgres.datasource.test.ts`

- [ ] **Step 1 : Hacher le token entrant dans `membreDataSource.findByToken`**

Ajouter en tête de `src/features/adhesion/data/datasources/membre.postgres.datasource.ts` :

```ts
import { hashToken } from '@/shared/lib/token';
```

Remplacer la méthode `findByToken` :

```ts
  findByToken(token: string) {
    return prisma.membre.findFirst({
      where: { accesToken: hashToken(token), accesTokenExpireLe: { gt: new Date() } },
    });
  },
```

- [ ] **Step 2 : Idem dans `inscriptionDataSource.findByToken`**

Ajouter en tête de `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts` :

```ts
import { hashToken } from '@/shared/lib/token';
```

Remplacer la méthode `findByToken` :

```ts
  findByToken(token: string) {
    return prisma.inscription.findFirst({
      where: {
        membre: { accesToken: hashToken(token), accesTokenExpireLe: { gt: new Date() } },
      },
      include: INCLUDE_FULL,
    });
  },
```

- [ ] **Step 3 : Test — `findByToken` cherche le hash, pas le brut**

Créer `src/features/adhesion/data/datasources/membre.postgres.datasource.test.ts` :

```ts
// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { hashToken } from '@/shared/lib/token';

const mockFindFirst = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/prisma', () => ({
  prisma: { membre: { findFirst: mockFindFirst } },
}));

import { membreDataSource } from './membre.postgres.datasource';

describe('membreDataSource.findByToken', () => {
  beforeEach(() => vi.clearAllMocks());

  it('interroge la base avec le hash du token, pas le brut', async () => {
    mockFindFirst.mockResolvedValue(null);
    await membreDataSource.findByToken('brut-123');

    const arg = mockFindFirst.mock.calls[0][0];
    expect(arg.where.accesToken).toBe(hashToken('brut-123'));
    expect(arg.where.accesToken).not.toBe('brut-123');
  });
});
```

- [ ] **Step 4 : Lancer le test, vérifier qu'il passe**

Run: `npm test -- membre.postgres.datasource`
Expected: PASS.

- [ ] **Step 5 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add src/features/adhesion/data/datasources/membre.postgres.datasource.ts src/features/adhesion/data/datasources/inscription.postgres.datasource.ts src/features/adhesion/data/datasources/membre.postgres.datasource.test.ts
git commit -m "feat(securite): lecture du accesToken par hash"
```

---

### Task 4 : Stockage par hash à la génération (4 sites)

**Files:**
- Modify: `src/features/adherents/actions/mon-dossier.actions.ts:23-28`
- Modify: `src/features/essayants/domain/use-cases/request-acces-essai.use-case.ts`
- Modify: `src/features/essayants/domain/use-cases/create-essayant.use-case.ts`
- Modify: `src/features/essayants/domain/use-cases/pointer-presence.use-case.ts`

Principe : on génère un UUID brut, on **envoie/retourne le brut**, on **stocke `hashToken(brut)`**.

- [ ] **Step 1 : `requestAccesDossierAction` — stocker le hash, envoyer le brut**

Dans `src/features/adherents/actions/mon-dossier.actions.ts`, ajouter l'import :

```ts
import { hashToken } from '@/shared/lib/token';
```

Modifier le bloc dans `requestAccesDossierAction` :

```ts
  if (membre) {
    const token = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.membre.update({ where: { id: membre.id }, data: { accesToken: hashToken(token), accesTokenExpireLe: expireLe } });
    try { await sendLienAccesDossier({ email: membre.email, prenom: membre.prenom, token }); }
    catch (e) { console.error('[requestAccesDossierAction]', e); }
  }
```

- [ ] **Step 2 : `request-acces-essai.use-case` — stocker le hash, retourner le brut**

Remplacer `src/features/essayants/domain/use-cases/request-acces-essai.use-case.ts` :

```ts
import { membreRepository } from '@/features/adhesion/data/repositories/membre.repository.impl';
import { hashToken } from '@/shared/lib/token';

export async function requestAccesEssaiUseCase(email: string, numeroAdherent: string) {
  const membre = await membreRepository.findByEmailAndNumero(email, numeroAdherent);
  if (!membre) return null;

  const token = crypto.randomUUID();
  const expireLe = new Date(Date.now() + 60 * 60 * 1000);
  await membreRepository.updateToken(membre.id, hashToken(token), expireLe);

  return { email: membre.email, prenom: membre.prenom, token };
}
```

- [ ] **Step 3 : `create-essayant.use-case` — stocker le hash, retourner le brut**

Dans `src/features/essayants/domain/use-cases/create-essayant.use-case.ts`, ajouter l'import :

```ts
import { hashToken } from '@/shared/lib/token';
```

Modifier la génération et la création (le `accesToken` envoyé à `membreRepository.create` devient le hash, la valeur retournée reste le brut) :

```ts
  const accesToken = crypto.randomUUID();
  const accesTokenExpireLe = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const saison = await inscriptionRepository.getCurrentSaison();

  const membre = await membreRepository.create({
    nom: input.nom,
    prenom: input.prenom,
    email: input.email,
    telephone: input.telephone,
    dateDeNaissance: input.dateDeNaissance,
    numeroAdherent,
    accesToken: hashToken(accesToken),
    accesTokenExpireLe,
  });

  await inscriptionRepository.create({
    statut: 'ESSAYANT',
    saison,
    membreId: membre.id,
  });

  return { membre, numeroAdherent, accesToken };
```

- [ ] **Step 4 : `pointer-presence.use-case` — stocker le hash, retourner le brut `newToken`**

Remplacer `src/features/essayants/domain/use-cases/pointer-presence.use-case.ts` :

```ts
import { prisma } from '@/shared/lib/prisma';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
import { hashToken } from '@/shared/lib/token';

export async function pointerPresenceUseCase(inscriptionId: number, nomCoach: string) {
  const inscription = await inscriptionRepository.findById(inscriptionId);
  if (!inscription || inscription.statut !== 'ESSAYANT') {
    return { success: false, error: 'Essayant introuvable' as const };
  }
  if (inscription.accesBloque) {
    return { success: false, error: 'Accès bloqué — 3 cours déjà effectués' as const };
  }

  const nouvPresences = inscription.nombrePresences + 1;
  const bloque = nouvPresences >= 3;

  await inscriptionRepository.createPresence(inscriptionId, nomCoach);

  let newToken: string | undefined;
  if (bloque) {
    newToken = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.membre.update({
      where: { id: inscription.membre.id },
      data: { accesToken: hashToken(newToken), accesTokenExpireLe: expireLe },
    });
  }

  await inscriptionRepository.update(inscriptionId, {
    nombrePresences: nouvPresences,
    accesBloque: bloque,
  } as Partial<import('@/features/adhesion/domain/models/inscription.model').Inscription>);

  return {
    success: true as const,
    nouvPresences,
    bloque,
    newToken,
    membre: { email: inscription.membre.email, prenom: inscription.membre.prenom, numeroAdherent: inscription.membre.numeroAdherent },
  };
}
```

- [ ] **Step 5 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: une erreur attendue dans `essayants.actions.ts` (la conversion lit encore `accesToken` en base) — corrigée à la Task 5. Si d'autres erreurs apparaissent, les corriger.

- [ ] **Step 6 : Commit**

```bash
git add src/features/adherents/actions/mon-dossier.actions.ts src/features/essayants/domain/use-cases/request-acces-essai.use-case.ts src/features/essayants/domain/use-cases/create-essayant.use-case.ts src/features/essayants/domain/use-cases/pointer-presence.use-case.ts
git commit -m "feat(securite): stockage du accesToken par hash a la generation"
```

---

### Task 5 : Conversion essai — utiliser `newToken` au lieu de re-lire la base

**Files:**
- Modify: `src/features/essayants/actions/essayants.actions.ts:90-110`

- [ ] **Step 1 : Remplacer la re-lecture du token par le `newToken` retourné**

Dans `src/features/essayants/actions/essayants.actions.ts`, `pointerPresenceAction`, remplacer le bloc `if (bloque) { ... }` (lignes ~100-108) qui re-lit `accesToken` en base :

```ts
  if (bloque) {
    if (result.newToken) {
      try { await sendConversionEssayant({ email: membre.email, prenom: membre.prenom, numeroAdherent: membre.numeroAdherent ?? '', accesToken: result.newToken }); }
      catch (e) { console.error('[pointerPresenceAction] conversion', e); }
    }
    try {
      const m = await prisma.membre.findFirst({ where: { email: membre.email }, select: { nom: true } });
      await sendNotificationConversionAdmin({ nom: m?.nom ?? '', prenom: membre.prenom, numeroAdherent: membre.numeroAdherent ?? '' });
    }
    catch (e) { console.error('[pointerPresenceAction] notifAdmin', e); }
  }
```

Note : `sendConversionEssayant` reçoit désormais le **token brut** `result.newToken` (lien valide), plus le hash.

- [ ] **Step 2 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: l'erreur de la Task 4 disparaît. Reste éventuellement une erreur dans `get-mon-essai`/`MonEssaiView` si déjà touchés — sinon RAS jusqu'à la Task 6.

- [ ] **Step 3 : Commit**

```bash
git add src/features/essayants/actions/essayants.actions.ts
git commit -m "feat(securite): conversion essai via newToken (plus de re-lecture du token)"
```

---

### Task 6 : `get-mon-essai` ne renvoie plus le token ; `MonEssaiView` utilise sa prop `token`

**Files:**
- Modify: `src/features/essayants/domain/use-cases/get-mon-essai.use-case.ts:15`
- Modify: `src/features/essayants/actions/essayants.actions.ts:79-84`
- Modify: `src/features/essayants/presentation/components/front/MonEssaiView.tsx:107-178`

- [ ] **Step 1 : Retirer `accesToken` du retour de `get-mon-essai.use-case`**

Dans `src/features/essayants/domain/use-cases/get-mon-essai.use-case.ts`, supprimer la ligne `accesToken: inscription.membre.accesToken,` du `return`. Résultat :

```ts
  return {
    inscriptionId: inscription.id,
    id: inscription.membre.id,
    numeroAdherent: inscription.membre.numeroAdherent,
    nom: inscription.membre.nom,
    prenom: inscription.membre.prenom,
    nombrePresences: inscription.nombrePresences,
    accesBloque: inscription.accesBloque,
  };
```

- [ ] **Step 2 : Retirer `accesToken` du retour de `getMonEssaiAction`**

Dans `src/features/essayants/actions/essayants.actions.ts`, modifier `getMonEssaiAction` :

```ts
export async function getMonEssaiAction(token: string) {
  if (!token) return { success: false, error: 'Token manquant' };
  const data = await getMonEssaiUseCase(token);
  if (!data) return { success: false, error: 'Lien invalide ou expiré' };
  return { success: true, essayant: data };
}
```

- [ ] **Step 3 : `MonEssaiView` — utiliser la prop `token` pour le lien de conversion**

Dans `src/features/essayants/presentation/components/front/MonEssaiView.tsx` :

Supprimer l'état `accesToken` (ligne 109) et son `setAccesToken` (ligne 120). Le `useEffect` devient :

```tsx
    useEffect(() => {
        if (!token) return;
        getMonEssaiAction(token).then((result) => {
            setLoading(false);
            if (result.success && result.essayant) {
                setEssayant(result.essayant as EssayantData);
            } else {
                setTokenError(true);
            }
        });
    }, [token]);
```

Et le lien de conversion (ligne ~167) utilise la prop `token` (toujours définie ici, on est passé le garde `if (!token || showForm)`) :

```tsx
                {token && (
                    <Link
                        href={`/inscription?conversion=${essayant.numeroAdherent}&token=${token}`}
```

- [ ] **Step 4 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5 : Commit**

```bash
git add src/features/essayants/domain/use-cases/get-mon-essai.use-case.ts src/features/essayants/actions/essayants.actions.ts src/features/essayants/presentation/components/front/MonEssaiView.tsx
git commit -m "feat(securite): le token brut n'est plus re-servi au client (flux essai)"
```

---

## Phase 3 — Normalisation : table `Commune`

### Task 7 : Schéma Prisma + migration

**Files:**
- Modify: `prisma/schema.prisma:109-126` (model Membre) et ajout du model Commune

- [ ] **Step 1 : Modifier le schéma**

Dans `prisma/schema.prisma`, supprimer la ligne `ville ... @db.VarChar(100)` du model `Membre` (ligne 116) et ajouter la relation commune. Le model `Membre` devient (extrait modifié) :

```prisma
model Membre {
  id                 String   @id @default(uuid())
  nom                String   @db.VarChar(100)
  prenom             String   @db.VarChar(100)
  email              String   @unique @db.VarChar(150)
  telephone          String?  @db.VarChar(20)
  sexe               String?  @db.VarChar(10)
  codePostal         String?  @db.VarChar(5)
  adresse            String?  @db.Text
  codeInsee          String?  @db.VarChar(5)
  commune            Commune? @relation(fields: [codeInsee], references: [codeInsee])
  dateDeNaissance    DateTime @db.Date
  numeroAdherent     String?  @unique @db.VarChar(10)
  accesToken         String?  @db.VarChar(255)
  accesTokenExpireLe DateTime?
  dateCreation       DateTime @default(now())

  inscriptions       Inscription[]
}
```

Ajouter le model `Commune` (par exemple juste avant le model `Membre`) :

```prisma
model Commune {
  codeInsee String   @id @db.VarChar(5)
  nom       String   @db.VarChar(100)
  membres   Membre[]
}
```

- [ ] **Step 2 : Générer la migration**

Run: `npx prisma migrate dev --name normalisation_commune`
Expected: migration créée et appliquée ; client Prisma régénéré ; aucune erreur (base vide).

- [ ] **Step 3 : Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): table Commune, codeInsee FK sur Membre, suppression de ville"
```

---

### Task 8 : Modèle domaine `Membre` + mappers

**Files:**
- Modify: `src/features/adhesion/domain/models/membre.model.ts:1-16`
- Modify: `src/features/adhesion/data/repositories/membre.repository.impl.ts:8-25`
- Modify: `src/features/adhesion/data/datasources/membre.postgres.datasource.ts:5-7`
- Modify: `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts:4-15`
- Modify: `src/features/adhesion/data/repositories/inscription.repository.impl.ts:29`

Le champ `ville` du domaine est remplacé par `codeInsee` + `communeNom` (dérivé de la commune jointe).

- [ ] **Step 1 : Mettre à jour le modèle domaine**

Dans `src/features/adhesion/domain/models/membre.model.ts`, remplacer `ville: string | null;` par :

```ts
  codeInsee: string | null;
  communeNom: string | null;
```

- [ ] **Step 2 : Inclure la commune dans les requêtes membre**

Dans `src/features/adhesion/data/datasources/membre.postgres.datasource.ts`, `findById` doit inclure la commune (c'est la source de vérité du mapper `toMembre`) :

```ts
  findById(id: string) {
    return prisma.membre.findUnique({ where: { id }, include: { commune: true } });
  },
```

- [ ] **Step 3 : Inclure la commune dans les requêtes inscription**

Dans `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts`, modifier les deux includes :

```ts
const INCLUDE_MEMBRE = { membre: { include: { commune: true } } } as const;

const INCLUDE_FULL = {
  membre: { include: { commune: true } },
  presences: { orderBy: { pointeLe: 'asc' as const } },
  documents: true,
  questionnaire: {
    include: {
      reponses: { include: { question: true } },
    },
  },
} satisfies Prisma.InscriptionInclude;
```

- [ ] **Step 4 : Mettre à jour le mapper `toMembre`**

Dans `src/features/adhesion/data/repositories/membre.repository.impl.ts`, remplacer la ligne `ville: raw.ville,` par :

```ts
    codeInsee: raw.codeInsee,
    communeNom: raw.commune?.nom ?? null,
```

- [ ] **Step 5 : Mettre à jour le mapper membre dans inscription.repository.impl**

Dans `src/features/adhesion/data/repositories/inscription.repository.impl.ts`, à la ligne 29 (`ville: raw.ville,` dans le mapping du membre), remplacer par :

```ts
    codeInsee: raw.codeInsee,
    communeNom: raw.commune?.nom ?? null,
```

- [ ] **Step 6 : Corriger le test du repository**

Dans `src/features/adhesion/data/repositories/inscription.repository.impl.test.ts:51`, dans l'objet `membre` du mock, remplacer `ville: null,` par :

```ts
codeInsee: null, commune: null,
```

- [ ] **Step 7 : Lancer les tests + compilation**

Run: `npm test && npx tsc --noEmit`
Expected: tests PASS ; restera des erreurs `tsc` dans les fichiers admin qui lisent `.ville` (Task 9) — les corriger là. Si une erreur concerne `rechercherMembreParEmailAction` (select `ville`), elle est traitée Task 9.

- [ ] **Step 8 : Commit**

```bash
git add src/features/adhesion
git commit -m "feat(db): modele domaine Membre avec codeInsee/communeNom"
```

---

### Task 9 : Consommateurs admin de `ville`

**Files:**
- Modify: `src/features/adherents/actions/mon-dossier.actions.ts:162-170` (rechercherMembreParEmailAction)
- Modify: `src/app/admin/club/adherents/[id]/page.tsx:30`
- Modify: `src/features/adherents/presentation/components/admin/AdherentDetail.tsx:28,234` (inchangé sauf source)

- [ ] **Step 1 : `rechercherMembreParEmailAction` — sélectionner la commune, exposer `ville`**

Dans `src/features/adherents/actions/mon-dossier.actions.ts`, remplacer `rechercherMembreParEmailAction` :

```ts
export async function rechercherMembreParEmailAction(email: string) {
  if (!email || !email.includes('@')) return { success: false, error: 'Email invalide' };
  const membre = await prisma.membre.findFirst({
    where: { email },
    select: { nom: true, prenom: true, email: true, telephone: true, dateDeNaissance: true, sexe: true, adresse: true, codePostal: true, commune: { select: { nom: true } } },
  });
  if (!membre) return { success: false, error: 'Aucun dossier trouvé pour cet email' };
  const { commune, ...rest } = membre;
  return { success: true, data: { ...rest, ville: commune?.nom ?? null } };
}
```

- [ ] **Step 2 : Page détail adhérent — lire `communeNom`**

Dans `src/app/admin/club/adherents/[id]/page.tsx:30`, remplacer `ville: adherent.membre.ville,` par :

```ts
        ville: adherent.membre.communeNom,
```

- [ ] **Step 3 : `AdherentDetail` — inchangé**

`AdherentDetail.tsx` garde sa prop `ville: string | null` (lignes 28 et 234) : elle est désormais alimentée par `communeNom`. Aucune modification de ce fichier.

- [ ] **Step 4 : Compilation complète**

Run: `npx tsc --noEmit`
Expected: aucune erreur liée à `ville`.

- [ ] **Step 5 : Commit**

```bash
git add src/features/adherents/actions/mon-dossier.actions.ts src/app/admin/club/adherents/[id]/page.tsx
git commit -m "feat(admin): affichage ville via commune (codeInsee)"
```

---

## Phase 4 — Collecte de l'adresse dans le dossier

### Task 10 : Use-case `updateAdresse` (upsert Commune + update Membre)

**Files:**
- Create: `src/features/adherents/domain/use-cases/update-adresse.use-case.ts`
- Test: `src/features/adherents/domain/use-cases/update-adresse.use-case.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `src/features/adherents/domain/use-cases/update-adresse.use-case.test.ts` :

```ts
// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockCommuneUpsert = vi.hoisted(() => vi.fn());
const mockMembreUpdate = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    commune: { upsert: mockCommuneUpsert },
    membre: { update: mockMembreUpdate },
  },
}));

import { updateAdresseUseCase } from './update-adresse.use-case';

describe('updateAdresseUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upsert la commune puis met à jour le membre', async () => {
    await updateAdresseUseCase('membre-1', {
      adresse: '10 rue de la Paix',
      codePostal: '59000',
      codeInsee: '59350',
      communeNom: 'Lille',
    });

    expect(mockCommuneUpsert).toHaveBeenCalledWith({
      where: { codeInsee: '59350' },
      update: { nom: 'Lille' },
      create: { codeInsee: '59350', nom: 'Lille' },
    });
    expect(mockMembreUpdate).toHaveBeenCalledWith({
      where: { id: 'membre-1' },
      data: { adresse: '10 rue de la Paix', codePostal: '59000', codeInsee: '59350' },
    });
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier qu'il échoue**

Run: `npm test -- update-adresse`
Expected: FAIL (module introuvable).

- [ ] **Step 3 : Implémenter le use-case**

Créer `src/features/adherents/domain/use-cases/update-adresse.use-case.ts` :

```ts
import { prisma } from '@/shared/lib/prisma';

export interface UpdateAdresseInput {
  adresse: string;
  codePostal: string;
  codeInsee: string;
  communeNom: string;
}

export async function updateAdresseUseCase(membreId: string, data: UpdateAdresseInput) {
  await prisma.commune.upsert({
    where: { codeInsee: data.codeInsee },
    update: { nom: data.communeNom },
    create: { codeInsee: data.codeInsee, nom: data.communeNom },
  });
  await prisma.membre.update({
    where: { id: membreId },
    data: { adresse: data.adresse, codePostal: data.codePostal, codeInsee: data.codeInsee },
  });
}
```

- [ ] **Step 4 : Lancer le test, vérifier qu'il passe**

Run: `npm test -- update-adresse`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add src/features/adherents/domain/use-cases/update-adresse.use-case.ts src/features/adherents/domain/use-cases/update-adresse.use-case.test.ts
git commit -m "feat(adresse): use-case updateAdresse (upsert commune + update membre)"
```

---

### Task 11 : Action `updateAdresseAction`

**Files:**
- Modify: `src/features/adherents/actions/mon-dossier.actions.ts`

- [ ] **Step 1 : Ajouter l'action**

Dans `src/features/adherents/actions/mon-dossier.actions.ts`, ajouter l'import :

```ts
import { updateAdresseUseCase } from '../domain/use-cases/update-adresse.use-case';
```

Et ajouter l'action (à la suite de `updateTelephoneAction`) :

```ts
const UpdateAdresseSchema = z.object({
  adresse: z.string().min(3),
  codePostal: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  codeInsee: z.string().regex(/^\w{5}$/, 'Code INSEE invalide'),
  communeNom: z.string().min(1),
});

export async function updateAdresseAction(token: string, data: z.infer<typeof UpdateAdresseSchema>) {
  if (!token) return { success: false, error: 'Token manquant' };
  const parsed = UpdateAdresseSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Adresse invalide' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await updateAdresseUseCase(inscription.membreId, parsed.data);
  return { success: true };
}
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/features/adherents/actions/mon-dossier.actions.ts
git commit -m "feat(adresse): action updateAdresse (lookup par token)"
```

---

### Task 12 : Composant d'autocomplétion BAN

**Files:**
- Create: `src/features/adherents/presentation/components/front/AdresseAutocomplete.tsx`

Composant contrôlé : champ de recherche → suggestions de l'API Adresse → `onSelect` avec les champs normalisés.

- [ ] **Step 1 : Créer le composant**

Créer `src/features/adherents/presentation/components/front/AdresseAutocomplete.tsx` :

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export interface AdresseSelection {
  adresse: string;
  codePostal: string;
  codeInsee: string;
  communeNom: string;
}

interface BanFeature {
  properties: { name: string; postcode: string; citycode: string; city: string; label: string };
}

export default function AdresseAutocomplete({
  defaultValue = "",
  onSelect,
}: {
  defaultValue?: string;
  onSelect: (sel: AdresseSelection) => void;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [features, setFeatures] = useState<BanFeature[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 4) {
      setFeatures([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=housenumber&limit=5`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        setFeatures(json.features ?? []);
        setOpen(true);
      } catch {
        setFeatures([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (f: BanFeature) => {
    const p = f.properties;
    setQuery(p.label);
    setOpen(false);
    onSelect({ adresse: p.name, codePostal: p.postcode, codeInsee: p.citycode, communeNom: p.city });
  };

  const inputCls = "mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]";

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => features.length > 0 && setOpen(true)}
        placeholder="Commencez à taper votre adresse…"
        className={inputCls}
        autoComplete="off"
      />
      {open && features.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {features.map((f, i) => (
            <li key={`${f.properties.label}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(f)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {f.properties.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/features/adherents/presentation/components/front/AdresseAutocomplete.tsx
git commit -m "feat(adresse): composant d'autocompletion API Adresse (BAN)"
```

---

### Task 13 : Section Adresse dans `MonDossierView` + données dossier

**Files:**
- Modify: `src/features/adherents/domain/use-cases/get-mon-dossier.use-case.ts`
- Modify: `src/features/adherents/presentation/components/front/MonDossierView.tsx`

L'adresse est une section éditable, présentée à côté des coordonnées téléphoniques. **Décision de périmètre :** ce n'est pas un verrou bloquant de complétion du dossier (contrairement au téléphone) — c'est un champ de profil saisissable à tout moment. Pas de modification de la logique `dossierIncomplet`.

- [ ] **Step 1 : Exposer l'adresse dans `get-mon-dossier.use-case`**

Dans `src/features/adherents/domain/use-cases/get-mon-dossier.use-case.ts`, ajouter au `return` (après `email: m.email,`) :

```ts
    adresse: m.adresse,
    codePostal: m.codePostal,
    ville: m.communeNom,
```

- [ ] **Step 2 : Étendre l'interface `DossierData`**

Dans `src/features/adherents/presentation/components/front/MonDossierView.tsx`, ajouter à l'interface `DossierData` (après `email: string;`) :

```ts
    adresse: string | null;
    codePostal: string | null;
    ville: string | null;
```

- [ ] **Step 3 : Créer la section Adresse**

Dans `src/features/adherents/presentation/components/front/MonDossierView.tsx`, ajouter l'import en tête :

```tsx
import AdresseAutocomplete, { type AdresseSelection } from "./AdresseAutocomplete";
import { updateAdresseAction } from "@/features/adherents/actions/mon-dossier.actions";
```

Puis ajouter le composant `AdresseSection` (juste après `CoordonneesSection`) :

```tsx
function AdresseSection({
    token,
    adresse,
    codePostal,
    ville,
    onDone,
}: {
    token: string;
    adresse: string | null;
    codePostal: string | null;
    ville: string | null;
    onDone: (adresse: string, codePostal: string, ville: string) => void;
}) {
    const [selection, setSelection] = useState<AdresseSelection | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const dejaSaisie = Boolean(adresse && codePostal && ville);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selection) return;
        setSubmitting(true);
        setError(null);

        const result = await updateAdresseAction(token, selection);
        setSubmitting(false);

        if (result.success) {
            setSaved(true);
            onDone(selection.adresse, selection.codePostal, selection.communeNom);
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Adresse postale</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Recherchez votre adresse et sélectionnez-la dans la liste.
                </p>
                {dejaSaisie && (
                    <p className="text-sm text-gray-700 mt-2">
                        Actuelle : {adresse}, {codePostal} {ville}
                    </p>
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <AdresseAutocomplete
                    defaultValue={dejaSaisie ? `${adresse}, ${codePostal} ${ville}` : ""}
                    onSelect={setSelection}
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {saved && <p className="text-green-600 text-sm">Adresse enregistrée.</p>}
                <button
                    type="submit"
                    disabled={submitting || !selection}
                    className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    {submitting ? "Enregistrement…" : "Enregistrer l'adresse"}
                </button>
            </form>
        </div>
    );
}
```

- [ ] **Step 4 : Afficher la section dans le rendu**

Dans `src/features/adherents/presentation/components/front/MonDossierView.tsx`, juste après le bloc de rendu de la `CoordonneesSection` (autour de la ligne 1006, le bloc `{!questionnaireManquant && ... telephoneManquant && (<CoordonneesSection ... />)}`), ajouter le rendu de la section adresse (toujours visible une fois le téléphone renseigné) :

```tsx
            {!questionnaireManquant && !reglementManquant && !typePaiementManquant && !telephoneManquant && (
                <AdresseSection
                    token={token}
                    adresse={dossier.adresse}
                    codePostal={dossier.codePostal}
                    ville={dossier.ville}
                    onDone={(adresse, codePostal, ville) => setDossier((d) => ({ ...d, adresse, codePostal, ville }))}
                />
            )}
```

Note : `token` et `dossier` sont déjà disponibles dans ce scope (vérifié : `<CoordonneesSection token={token} ... />` à la ligne 1001-1002, `dossier.telephone1` à la ligne 1004).

- [ ] **Step 5 : Lancer tests + compilation**

Run: `npm test && npx tsc --noEmit`
Expected: tests PASS, aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add src/features/adherents/domain/use-cases/get-mon-dossier.use-case.ts src/features/adherents/presentation/components/front/MonDossierView.tsx
git commit -m "feat(adresse): section adresse dans le dossier (autocompletion BAN)"
```

---

## Vérification finale

### Task 14 : Build + tests complets

- [ ] **Step 1 : Suite de tests**

Run: `npm test`
Expected: tous les tests PASS.

- [ ] **Step 2 : Typecheck**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3 : Lint**

Run: `npm run lint`
Expected: aucune erreur (warnings tolérés selon la config existante).

- [ ] **Step 4 : Build Next.js**

Run: `npm run build`
Expected: build réussi.

- [ ] **Step 5 : Vérification manuelle (cf. skill `verify` si besoin)**

Parcours à valider manuellement :
1. Création d'un essayant → email reçu avec lien valide (token brut) → accès au suivi.
2. Demande d'accès dossier (email + numéro) → email reçu → ouverture du dossier.
3. Dans le dossier : recherche d'adresse → sélection → enregistrement → l'adresse s'affiche.
4. Vérifier en base (`npm run db:studio`) : `Membre.accesToken` contient un hash de 64 caractères, `Commune` contient la ligne (codeInsee, nom), `Membre.codePostal` et `Membre.codeInsee` renseignés, pas de doublon de `Commune` si deux membres choisissent la même ville.
```
