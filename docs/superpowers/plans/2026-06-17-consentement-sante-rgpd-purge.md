# Consentement santé RGPD + purge annuelle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recueillir un consentement explicite tracé (RGPD art. 9.2.a) avant la saisie des données de santé, et étendre la purge annuelle pour supprimer réellement questionnaire, certificat médical et photo perso.

**Architecture:** Approche A (cf. spec). Le consentement est validé côté serveur dans les actions `soumettreQuestionnaire*` et horodaté (date + version) dans le `QuestionnaireSante` au moment de l'upsert. La purge est ajoutée comme étape du cron `reinitialisation-saison` existant, via une fonction testable `purgerDonneesSanteSaison()` qui supprime les données en base et les fichiers R2/Cloudinary (clés dérivées de l'URL, best-effort).

**Tech Stack:** Next.js 16, Prisma 7 (PostgreSQL), Vitest, Cloudflare R2 (AWS SDK v3), Cloudinary.

Spec : [docs/superpowers/specs/2026-06-17-consentement-sante-rgpd-purge-design.md](../specs/2026-06-17-consentement-sante-rgpd-purge-design.md)

---

## File Structure

- **Create** `src/shared/lib/consent.ts` — constante `CONSENT_SANTE` (version + texte). Source de vérité du consentement.
- **Create** `src/shared/lib/consent.test.ts` — garde-fou sur la forme de la constante.
- **Modify** `prisma/schema.prisma` — 2 colonnes sur `QuestionnaireSante`.
- **Create** `prisma/migrations/<ts>_consentement_sante/migration.sql` — généré par `prisma migrate dev`.
- **Modify** `src/features/adhesion/domain/repositories/inscription.repository.ts` — signature `upsertQuestionnaire`.
- **Modify** `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts` — écrit les champs consentement.
- **Modify** `src/features/adhesion/data/repositories/inscription.repository.impl.ts` — passe le consentement.
- **Modify** `src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.ts` — stampe date+version.
- **Modify** `src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.test.ts` — tests.
- **Modify** `src/features/adherents/actions/mon-dossier.actions.ts` — gate consentement.
- **Modify** `src/features/adherents/actions/mon-dossier.actions.test.ts` — tests gate.
- **Modify** `src/features/adherents/presentation/components/front/MonDossierView.tsx` — case à cocher.
- **Modify** `src/shared/lib/upload.ts` — `r2KeyFromUrl`, `deleteR2Object`.
- **Modify** `src/shared/lib/cloudinary.server.ts` — `cloudinaryPublicIdFromUrl`, `deleteCloudinaryAssetByUrl`.
- **Create** `src/shared/lib/storage-keys.test.ts` — tests dérivation URL→clé/publicId.
- **Create** `src/shared/lib/purge-sante.ts` — `purgerDonneesSanteSaison()`.
- **Create** `src/shared/lib/purge-sante.test.ts` — tests purge.
- **Modify** `src/app/api/cron/reinitialisation-saison/route.ts` — appelle la purge.

---

## Task 1: Migration Prisma — champs de consentement

**Files:**
- Modify: `prisma/schema.prisma:203-213` (model `QuestionnaireSante`)
- Create: `prisma/migrations/<ts>_consentement_sante/migration.sql` (généré)

- [ ] **Step 1: Ajouter les deux colonnes au modèle**

Dans `model QuestionnaireSante`, après la ligne `createdAt DateTime @default(now())` :

```prisma
model QuestionnaireSante {
  id            Int         @id @default(autoincrement())
  type          String      @db.VarChar(10)  // 'majeur' | 'mineur'
  createdAt     DateTime    @default(now())

  consentementSanteLe      DateTime?
  consentementSanteVersion String?  @db.VarChar(20)

  inscriptionId Int         @unique
  inscription   Inscription @relation(fields: [inscriptionId], references: [id], onDelete: Cascade)

  reponses      Reponse[]
  interroges    Interroge[]
}
```

- [ ] **Step 2: Générer la migration**

Run: `npx prisma migrate dev --name consentement_sante`
Expected: nouvelle migration créée, client Prisma régénéré, `ALTER TABLE "QuestionnaireSante" ADD COLUMN ...` appliqué sans erreur.

- [ ] **Step 3: Vérifier la compilation des types**

Run: `npm run typecheck`
Expected: PASS (0 erreur).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): champs consentement sante (date + version) sur QuestionnaireSante"
```

---

## Task 2: Constante de consentement partagée

**Files:**
- Create: `src/shared/lib/consent.ts`
- Test: `src/shared/lib/consent.test.ts`

- [ ] **Step 1: Écrire le test (échoue)**

`src/shared/lib/consent.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { CONSENT_SANTE } from './consent';

describe('CONSENT_SANTE', () => {
  it('expose une version courte non vide', () => {
    expect(CONSENT_SANTE.version).toMatch(/^\S.{0,18}\S$/);
  });

  it('mentionne le fondement légal et la durée de conservation', () => {
    expect(CONSENT_SANTE.texte).toContain('9.2.a');
    expect(CONSENT_SANTE.texte.toLowerCase()).toContain('1 an');
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npx vitest run src/shared/lib/consent.test.ts`
Expected: FAIL — `Cannot find module './consent'`.

- [ ] **Step 3: Créer la constante**

`src/shared/lib/consent.ts` :

```ts
/**
 * Consentement explicite au traitement des données de santé (RGPD art. 9.2.a).
 * `version` est la source de vérité : toute modification du `texte` impose
 * d'incrémenter `version` (la version consentie est tracée en base).
 */
export const CONSENT_SANTE = {
  version: '2026-06',
  texte:
    "Je consens expressément (RGPD art. 9.2.a) au traitement de mes données de santé " +
    "(questionnaire de santé, certificat médical) par l'association, dans le seul but du " +
    "suivi de mon dossier d'adhésion. Ces données sont conservées 1 an puis supprimées.",
} as const;
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `npx vitest run src/shared/lib/consent.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/consent.ts src/shared/lib/consent.test.ts
git commit -m "feat(consent): constante CONSENT_SANTE (version + texte art. 9.2.a)"
```

---

## Task 3: Traçabilité — persister date + version à l'upsert

**Files:**
- Modify: `src/features/adhesion/domain/repositories/inscription.repository.ts` (signature `upsertQuestionnaire`)
- Modify: `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts:110-132`
- Modify: `src/features/adhesion/data/repositories/inscription.repository.impl.ts:202-207`
- Modify: `src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.ts`
- Test: `src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.test.ts`

- [ ] **Step 1: Écrire le test du use-case (échoue)**

Remplacer le contenu de `src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.test.ts` par :

```ts
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ upsert: vi.fn(), update: vi.fn() }));
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { upsertQuestionnaire: h.upsert, update: h.update },
}));
vi.mock('@/shared/lib/consent', () => ({ CONSENT_SANTE: { version: 'TEST-V', texte: 'x' } }));

import { soumettreQuestionnaireUseCase } from './soumettre-questionnaire.use-case';

beforeEach(() => vi.clearAllMocks());

describe('soumettreQuestionnaireUseCase', () => {
  it('persiste le consentement (date + version) via upsertQuestionnaire', async () => {
    await soumettreQuestionnaireUseCase(2, 'majeur', { q1: false });
    expect(h.upsert).toHaveBeenCalledTimes(1);
    const [inscriptionId, type, reponses, consent] = h.upsert.mock.calls[0];
    expect(inscriptionId).toBe(2);
    expect(type).toBe('majeur');
    expect(reponses).toEqual({ q1: false });
    expect(consent.version).toBe('TEST-V');
    expect(consent.le).toBeInstanceOf(Date);
  });

  it('calcule certificatMedicalReq=false si toutes les réponses sont false', async () => {
    await soumettreQuestionnaireUseCase(2, 'majeur', { q1: false, q2: false });
    expect(h.update).toHaveBeenCalledWith(2, { certificatMedicalReq: false, certificatMedical: 'non_fourni' });
  });

  it('calcule certificatMedicalReq=true si au moins une réponse est true', async () => {
    const res = await soumettreQuestionnaireUseCase(2, 'majeur', { q1: true });
    expect(res).toEqual({ certificatMedicalReq: true });
    expect(h.update).toHaveBeenCalledWith(2, { certificatMedicalReq: true, certificatMedical: undefined });
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npx vitest run src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.test.ts`
Expected: FAIL — `upsert` reçoit 3 arguments, `consent` est `undefined`.

- [ ] **Step 3: Modifier le use-case**

`src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.ts` :

```ts
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
import { CONSENT_SANTE } from '@/shared/lib/consent';

export async function soumettreQuestionnaireUseCase(
  inscriptionId: number,
  type: 'majeur' | 'mineur',
  reponses: Record<string, boolean>
) {
  const certificatMedicalReq = Object.values(reponses).some(Boolean);
  await inscriptionRepository.upsertQuestionnaire(inscriptionId, type, reponses, {
    le: new Date(),
    version: CONSENT_SANTE.version,
  });
  await inscriptionRepository.update(inscriptionId, {
    certificatMedicalReq,
    certificatMedical: certificatMedicalReq ? undefined : 'non_fourni',
  } as Parameters<typeof inscriptionRepository.update>[1]);
  return { certificatMedicalReq };
}
```

- [ ] **Step 4: Mettre à jour la signature du repository (domaine)**

Dans `src/features/adhesion/domain/repositories/inscription.repository.ts`, repérer la déclaration de `upsertQuestionnaire` et ajouter le paramètre `consent` :

```ts
upsertQuestionnaire(
  inscriptionId: number,
  type: 'majeur' | 'mineur',
  reponses: Record<string, boolean>,
  consent: { le: Date; version: string },
): Promise<void>;
```

- [ ] **Step 5: Implémenter dans le repository concret**

Dans `src/features/adhesion/data/repositories/inscription.repository.impl.ts`, remplacer la méthode `upsertQuestionnaire` (lignes 202-207) par :

```ts
  async upsertQuestionnaire(inscriptionId, type, reponses, consent) {
    const questions = await inscriptionDataSource.findQuestionsByType(type);
    const questionIds = questions.map((q) => q.id);
    const reponsesArray = questions.map((_, i) => reponses[`q${i + 1}`] ?? false);
    await inscriptionDataSource.upsertQuestionnaire(inscriptionId, type, questionIds, reponsesArray, consent);
  },
```

- [ ] **Step 6: Écrire les champs consentement dans le datasource**

Dans `src/features/adhesion/data/datasources/inscription.postgres.datasource.ts`, remplacer `upsertQuestionnaire` (lignes 110-132) par :

```ts
  upsertQuestionnaire(
    inscriptionId: number,
    type: string,
    questionIds: number[],
    reponses: boolean[],
    consent: { le: Date; version: string },
  ) {
    return prisma.$transaction(async (tx) => {
      let questionnaire = await tx.questionnaireSante.findUnique({ where: { inscriptionId } });

      if (!questionnaire) {
        questionnaire = await tx.questionnaireSante.create({
          data: {
            inscriptionId,
            type,
            consentementSanteLe: consent.le,
            consentementSanteVersion: consent.version,
          },
        });
        await tx.interroge.createMany({
          data: questionIds.map((questionId) => ({ questionnaireSanteId: questionnaire!.id, questionId })),
          skipDuplicates: true,
        });
      } else {
        await tx.questionnaireSante.update({
          where: { id: questionnaire.id },
          data: { consentementSanteLe: consent.le, consentementSanteVersion: consent.version },
        });
      }

      for (let i = 0; i < questionIds.length; i++) {
        await tx.reponse.upsert({
          where: { questionnaireSanteId_questionId: { questionnaireSanteId: questionnaire.id, questionId: questionIds[i] } },
          update: { reponse: reponses[i] },
          create: { questionnaireSanteId: questionnaire.id, questionId: questionIds[i], reponse: reponses[i] },
        });
      }

      return questionnaire;
    });
  },
```

- [ ] **Step 7: Lancer le test + typecheck**

Run: `npx vitest run src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.test.ts && npm run typecheck`
Expected: PASS (3 tests) ; typecheck 0 erreur.

- [ ] **Step 8: Commit**

```bash
git add src/features/adhesion src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.ts src/features/adherents/domain/use-cases/soumettre-questionnaire.use-case.test.ts
git commit -m "feat(consent): trace date+version du consentement sante a l'upsert questionnaire"
```

---

## Task 4: Gate serveur — refuser la soumission sans consentement

**Files:**
- Modify: `src/features/adherents/actions/mon-dossier.actions.ts:52-79`
- Test: `src/features/adherents/actions/mon-dossier.actions.test.ts`

- [ ] **Step 1: Écrire les tests du gate (échouent)**

Ajouter ce bloc à la fin de `src/features/adherents/actions/mon-dossier.actions.test.ts` (le mock `h.soumettreQ` et `h.findByToken` existent déjà en haut du fichier) :

```ts
describe('gate consentement questionnaire', () => {
  beforeEach(() => {
    h.findByToken.mockResolvedValue({ id: 1, membreId: 'm-1' });
    h.soumettreQ.mockResolvedValue({ certificatMedicalReq: false });
  });

  it('refuse le questionnaire majeur sans consentement', async () => {
    const r = { q1: true, q2: true, q3: true, q4: true, q5: true, q6: true, q7: true };
    const res = await actions.soumettreQuestionnaireAction('tok', r, false);
    expect(res).toMatchObject({ success: false });
    expect(h.soumettreQ).not.toHaveBeenCalled();
  });

  it('accepte le questionnaire majeur avec consentement', async () => {
    const r = { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false, q7: false };
    const res = await actions.soumettreQuestionnaireAction('tok', r, true);
    expect(res).toMatchObject({ success: true });
    expect(h.soumettreQ).toHaveBeenCalled();
  });

  it('refuse le questionnaire enfant sans consentement', async () => {
    const res = await actions.soumettreQuestionnaireEnfantAction('tok', {} as never, false);
    expect(res).toMatchObject({ success: false });
    expect(h.soumettreQ).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npx vitest run src/features/adherents/actions/mon-dossier.actions.test.ts`
Expected: FAIL — les actions ignorent le 3e argument et appellent quand même `soumettreQ`.

- [ ] **Step 3: Ajouter le gate dans les deux actions**

Dans `src/features/adherents/actions/mon-dossier.actions.ts`, remplacer `soumettreQuestionnaireAction` et `soumettreQuestionnaireEnfantAction` (lignes 52-79) par :

```ts
export async function soumettreQuestionnaireAction(token: string, reponses: z.infer<typeof QuestionnaireSchema>, consentementSante: boolean) {
  if (!token) return { success: false, error: 'Token manquant' };
  if (consentementSante !== true) return { success: false, error: 'Consentement requis' };
  const parsed = QuestionnaireSchema.safeParse(reponses);
  if (!parsed.success) return { success: false, error: 'Données invalides' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  const result = await soumettreQuestionnaireUseCase(inscription.id, 'majeur', parsed.data);
  return { success: true, certificatMedicalReq: result.certificatMedicalReq };
}
```

et

```ts
export async function soumettreQuestionnaireEnfantAction(token: string, reponses: z.infer<typeof QuestionnaireEnfantSchema>, consentementSante: boolean) {
  if (!token) return { success: false, error: 'Token manquant' };
  if (consentementSante !== true) return { success: false, error: 'Consentement requis' };
  const parsed = QuestionnaireEnfantSchema.safeParse(reponses);
  if (!parsed.success) return { success: false, error: 'Données invalides' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  const result = await soumettreQuestionnaireUseCase(inscription.id, 'mineur', parsed.data);
  return { success: true, certificatMedicalReq: result.certificatMedicalReq };
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `npx vitest run src/features/adherents/actions/mon-dossier.actions.test.ts`
Expected: PASS (le nouveau bloc + les tests existants).

- [ ] **Step 5: Commit**

```bash
git add src/features/adherents/actions/mon-dossier.actions.ts src/features/adherents/actions/mon-dossier.actions.test.ts
git commit -m "feat(consent): refuse cote serveur la soumission du questionnaire sans consentement"
```

---

## Task 5: UI — case de consentement bloquante

**Files:**
- Modify: `src/features/adherents/presentation/components/front/MonDossierView.tsx:177-286` et appels lignes ~1057-1076

- [ ] **Step 1: Étendre le type d'`action` et l'état de la section**

Dans `MonDossierView.tsx`, dans le composant `QuestionnaireSection` (à partir de la ligne 177) :

Remplacer la signature de la prop `action` :

```ts
    action: (token: string, reponses: Record<string, boolean>, consent: boolean) => Promise<{ success: boolean; certificatMedicalReq?: boolean; error?: string }>;
```

Ajouter l'état du consentement juste après `const [error, setError] = useState<string | null>(null);` :

```ts
    const [consent, setConsent] = useState(false);
```

- [ ] **Step 2: Bloquer et transmettre le consentement dans `handleSubmit`**

Remplacer le corps de `handleSubmit` :

```ts
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!toutesRepondues || !consent) return;
        setSubmitting(true);
        setError(null);

        const result = await action(token, reponses, consent);
        setSubmitting(false);

        if (result.success) {
            onDone(result.certificatMedicalReq ?? false);
        } else {
            setError(result.error ?? "Erreur");
        }
    };
```

- [ ] **Step 3: Importer la constante de consentement**

En haut de `MonDossierView.tsx`, ajouter l'import :

```ts
import { CONSENT_SANTE } from "@/shared/lib/consent";
```

- [ ] **Step 4: Ajouter la case à cocher avant le bouton de validation**

Dans le `return` du formulaire, juste avant le `<button type="submit" ...>` (ligne ~278), insérer :

```tsx
                <label className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 text-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    <span>{CONSENT_SANTE.texte}</span>
                </label>
```

et modifier le `disabled` du bouton :

```tsx
                    disabled={!toutesRepondues || !consent || submitting}
```

- [ ] **Step 5: Mettre à jour les deux appels de `QuestionnaireSection`**

Aux lignes ~1057-1076, les `action={(t, r) => ...}` deviennent `(t, r, c) => ...` et transmettent le consentement :

```tsx
                    action={(t, r, c) => soumettreQuestionnaireEnfantAction(t, r as Parameters<typeof soumettreQuestionnaireEnfantAction>[1], c)}
```

```tsx
                    action={(t, r, c) => soumettreQuestionnaireAction(t, r as Parameters<typeof soumettreQuestionnaireAction>[1], c)}
```

- [ ] **Step 6: Vérifier typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: typecheck 0 erreur ; lint 0 erreur (warnings préexistants tolérés).

- [ ] **Step 7: Commit**

```bash
git add src/features/adherents/presentation/components/front/MonDossierView.tsx
git commit -m "feat(consent): case de consentement sante bloquante dans le questionnaire"
```

---

## Task 6: Helpers de dérivation des clés de stockage

**Files:**
- Modify: `src/shared/lib/upload.ts` (ajout `r2KeyFromUrl`, `deleteR2Object`)
- Modify: `src/shared/lib/cloudinary.server.ts` (ajout `cloudinaryPublicIdFromUrl`, `deleteCloudinaryAssetByUrl`)
- Test: `src/shared/lib/storage-keys.test.ts`

- [ ] **Step 1: Écrire les tests de dérivation (échouent)**

`src/shared/lib/storage-keys.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { r2KeyFromUrl } from './upload';
import { cloudinaryPublicIdFromUrl } from './cloudinary.server';

describe('r2KeyFromUrl', () => {
  it('extrait la clé après le préfixe public', () => {
    expect(r2KeyFromUrl('https://pub-x.r2.dev/gants-meleciens/certs/123.pdf', 'https://pub-x.r2.dev'))
      .toBe('gants-meleciens/certs/123.pdf');
  });
  it('renvoie null si l’URL ne correspond pas au préfixe', () => {
    expect(r2KeyFromUrl('https://autre.example/x.pdf', 'https://pub-x.r2.dev')).toBeNull();
  });
  it('renvoie null si préfixe vide', () => {
    expect(r2KeyFromUrl('https://pub-x.r2.dev/a.pdf', '')).toBeNull();
  });
});

describe('cloudinaryPublicIdFromUrl', () => {
  it('extrait folder/name sans version ni extension', () => {
    expect(cloudinaryPublicIdFromUrl('https://res.cloudinary.com/demo/image/upload/v1699999999/gants-meleciens/photos/abc.jpg'))
      .toBe('gants-meleciens/photos/abc');
  });
  it('gère l’absence de segment version', () => {
    expect(cloudinaryPublicIdFromUrl('https://res.cloudinary.com/demo/image/upload/gants-meleciens/photos/abc.png'))
      .toBe('gants-meleciens/photos/abc');
  });
  it('renvoie null si pas un URL cloudinary upload', () => {
    expect(cloudinaryPublicIdFromUrl('https://example.com/x.jpg')).toBeNull();
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npx vitest run src/shared/lib/storage-keys.test.ts`
Expected: FAIL — fonctions non exportées.

- [ ] **Step 3: Ajouter `r2KeyFromUrl` et `deleteR2Object` dans `upload.ts`**

Dans `src/shared/lib/upload.ts`, ajouter l'import de `DeleteObjectCommand` (compléter la ligne existante) :

```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
```

Puis ajouter, après la fonction `uploadToR2` :

```ts
/** Déduit la clé R2 d'une URL publique R2. `null` si l'URL ne correspond pas au préfixe. */
export function r2KeyFromUrl(url: string, publicBase = process.env.R2_PUBLIC_URL ?? ''): string | null {
    if (!publicBase) return null;
    const prefix = publicBase.endsWith('/') ? publicBase : `${publicBase}/`;
    if (!url.startsWith(prefix)) return null;
    return decodeURIComponent(url.slice(prefix.length));
}

/** Supprime un objet R2 par URL (best-effort). Loggue et ignore en cas d'échec. */
export async function deleteR2Object(url: string): Promise<void> {
    const key = r2KeyFromUrl(url);
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    if (!key || !endpoint || !accessKeyId || !secretAccessKey || !bucket) {
        console.error('[deleteR2Object] clé/variables R2 manquantes pour', url);
        return;
    }
    try {
        const r2 = getR2Client(endpoint, accessKeyId, secretAccessKey);
        await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch (e) {
        console.error('[deleteR2Object]', url, e);
    }
}
```

- [ ] **Step 4: Ajouter `cloudinaryPublicIdFromUrl` et `deleteCloudinaryAssetByUrl` dans `cloudinary.server.ts`**

Dans `src/shared/lib/cloudinary.server.ts`, ajouter :

```ts
/** Déduit le public_id Cloudinary (folder/name sans version ni extension) d'une secure_url. */
export function cloudinaryPublicIdFromUrl(url: string): string | null {
    const marker = '/upload/';
    const i = url.indexOf(marker);
    if (i === -1) return null;
    let path = url.slice(i + marker.length);
    path = path.replace(/^v\d+\//, '');           // retire le segment version éventuel
    path = path.replace(/\.[^/.]+$/, '');          // retire l'extension
    return path || null;
}

/** Supprime un asset Cloudinary par URL (best-effort). Loggue et ignore en cas d'échec. */
export async function deleteCloudinaryAssetByUrl(url: string): Promise<void> {
    const publicId = cloudinaryPublicIdFromUrl(url);
    if (!publicId) {
        console.error('[deleteCloudinaryAssetByUrl] public_id introuvable pour', url);
        return;
    }
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (e) {
        console.error('[deleteCloudinaryAssetByUrl]', url, e);
    }
}
```

- [ ] **Step 5: Lancer le test pour vérifier le succès**

Run: `npx vitest run src/shared/lib/storage-keys.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/shared/lib/upload.ts src/shared/lib/cloudinary.server.ts src/shared/lib/storage-keys.test.ts
git commit -m "feat(purge): helpers de derivation cle R2 / public_id Cloudinary depuis URL"
```

---

## Task 7: Fonction de purge des données de santé

**Files:**
- Create: `src/shared/lib/purge-sante.ts`
- Test: `src/shared/lib/purge-sante.test.ts`

- [ ] **Step 1: Écrire le test de purge (échoue)**

`src/shared/lib/purge-sante.test.ts` :

```ts
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  findMany: vi.fn(), qDelete: vi.fn(), docDeleteMany: vi.fn(), inscUpdateMany: vi.fn(),
  deleteR2: vi.fn(), deleteCloud: vi.fn(),
}));

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    inscription: { findMany: h.findMany, updateMany: h.inscUpdateMany },
    questionnaireSante: { deleteMany: h.qDelete },
    document: { deleteMany: h.docDeleteMany },
  },
}));
vi.mock('@/shared/lib/upload', () => ({ deleteR2Object: h.deleteR2 }));
vi.mock('@/shared/lib/cloudinary.server', () => ({ deleteCloudinaryAssetByUrl: h.deleteCloud }));

import { purgerDonneesSanteSaison } from './purge-sante';

beforeEach(() => {
  vi.clearAllMocks();
  h.qDelete.mockResolvedValue({ count: 0 });
  h.docDeleteMany.mockResolvedValue({ count: 0 });
  h.inscUpdateMany.mockResolvedValue({ count: 0 });
});

describe('purgerDonneesSanteSaison', () => {
  it('supprime fichiers, questionnaires et documents puis reset les inscriptions', async () => {
    h.findMany.mockResolvedValue([
      { id: 1, documents: [
        { type: 'MEDICAL_CERTIFICATE', url: 'https://pub.r2.dev/c/1.pdf' },
        { type: 'ID_PHOTO', url: 'https://res.cloudinary.com/d/image/upload/v1/p/a.jpg' },
      ] },
    ]);

    const res = await purgerDonneesSanteSaison([1]);

    expect(h.deleteR2).toHaveBeenCalledWith('https://pub.r2.dev/c/1.pdf');
    expect(h.deleteCloud).toHaveBeenCalledWith('https://res.cloudinary.com/d/image/upload/v1/p/a.jpg');
    expect(h.qDelete).toHaveBeenCalledWith({ where: { inscriptionId: { in: [1] } } });
    expect(h.docDeleteMany).toHaveBeenCalledWith({ where: { inscriptionId: { in: [1] }, type: { in: ['MEDICAL_CERTIFICATE', 'ID_PHOTO'] } } });
    expect(h.inscUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: [1] } },
      data: { photo: null, certificatMedical: 'non_fourni', certificatMedicalReq: false },
    });
    expect(res.documentsPurges).toBe(2);
  });

  it('ne touche à rien si la liste d’inscriptions est vide', async () => {
    const res = await purgerDonneesSanteSaison([]);
    expect(h.findMany).not.toHaveBeenCalled();
    expect(res).toEqual({ questionnairesPurges: 0, documentsPurges: 0 });
  });

  it('continue malgré l’échec de suppression d’un fichier', async () => {
    h.findMany.mockResolvedValue([{ id: 1, documents: [{ type: 'ID_PHOTO', url: 'https://res.cloudinary.com/d/image/upload/v1/p/a.jpg' }] }]);
    h.deleteCloud.mockRejectedValue(new Error('boom'));
    await expect(purgerDonneesSanteSaison([1])).resolves.toBeDefined();
    expect(h.qDelete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npx vitest run src/shared/lib/purge-sante.test.ts`
Expected: FAIL — `Cannot find module './purge-sante'`.

- [ ] **Step 3: Implémenter la purge**

`src/shared/lib/purge-sante.ts` :

```ts
import { prisma } from '@/shared/lib/prisma';
import { deleteR2Object } from '@/shared/lib/upload';
import { deleteCloudinaryAssetByUrl } from '@/shared/lib/cloudinary.server';

const TYPES_SANTE = ['MEDICAL_CERTIFICATE', 'ID_PHOTO'] as const;

/**
 * Purge RGPD des données de santé pour les inscriptions données :
 * supprime les fichiers (R2 certificat, Cloudinary photo), les questionnaires
 * (cascade réponses) et les documents, puis réinitialise les champs santé.
 * Best-effort sur les fichiers ; la suppression en base est la garantie.
 */
export async function purgerDonneesSanteSaison(inscriptionIds: number[]) {
  if (inscriptionIds.length === 0) return { questionnairesPurges: 0, documentsPurges: 0 };

  const inscriptions = await prisma.inscription.findMany({
    where: { id: { in: inscriptionIds } },
    select: { id: true, documents: { select: { type: true, url: true } } },
  });

  let documentsPurges = 0;
  for (const insc of inscriptions) {
    for (const doc of insc.documents) {
      if (doc.type !== 'MEDICAL_CERTIFICATE' && doc.type !== 'ID_PHOTO') continue;
      documentsPurges++;
      try {
        if (doc.type === 'MEDICAL_CERTIFICATE') await deleteR2Object(doc.url);
        else await deleteCloudinaryAssetByUrl(doc.url);
      } catch (e) {
        console.error('[purgerDonneesSanteSaison] suppression fichier', doc.url, e);
      }
    }
  }

  const q = await prisma.questionnaireSante.deleteMany({ where: { inscriptionId: { in: inscriptionIds } } });
  await prisma.document.deleteMany({ where: { inscriptionId: { in: inscriptionIds }, type: { in: [...TYPES_SANTE] } } });
  await prisma.inscription.updateMany({
    where: { id: { in: inscriptionIds } },
    data: { photo: null, certificatMedical: 'non_fourni', certificatMedicalReq: false },
  });

  return { questionnairesPurges: q.count, documentsPurges };
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `npx vitest run src/shared/lib/purge-sante.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/purge-sante.ts src/shared/lib/purge-sante.test.ts
git commit -m "feat(purge): fonction purgerDonneesSanteSaison (questionnaire + documents + fichiers)"
```

---

## Task 8: Brancher la purge dans le cron de réinitialisation

**Files:**
- Modify: `src/app/api/cron/reinitialisation-saison/route.ts`

- [ ] **Step 1: Appeler la purge sur les inscriptions réinitialisées**

Remplacer `src/app/api/cron/reinitialisation-saison/route.ts` par :

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { sendOuvertureInscriptions } from '@/shared/lib/mail';
import { purgerDonneesSanteSaison } from '@/shared/lib/purge-sante';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const inscriptions = await prisma.inscription.findMany({
        where: { inscriptionValide: true, statut: { not: 'ESSAYANT' } },
        include: { membre: { select: { email: true, prenom: true } } },
    });

    await prisma.inscription.updateMany({
        where: { inscriptionValide: true, statut: { not: 'ESSAYANT' } },
        data: { inscriptionValide: false },
    });

    // Purge RGPD des données de santé conservées 1 an (cf. consentement art. 9.2.a).
    const purge = await purgerDonneesSanteSaison(inscriptions.map((i) => i.id));

    let envoyes = 0;
    for (const insc of inscriptions) {
        try {
            await sendOuvertureInscriptions({ email: insc.membre.email, prenom: insc.membre.prenom });
            envoyes++;
        } catch (e) { console.error('[cron/reinitialisation-saison]', insc.membre.email, e); }
    }

    return NextResponse.json({
        ok: true,
        reinitialises: inscriptions.length,
        emailsEnvoyes: envoyes,
        questionnairesPurges: purge.questionnairesPurges,
        documentsPurges: purge.documentsPurges,
    });
}
```

- [ ] **Step 2: Vérifier typecheck + build**

Run: `npm run typecheck`
Expected: PASS (0 erreur).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cron/reinitialisation-saison/route.ts
git commit -m "feat(purge): cron reinitialisation-saison purge les donnees de sante (RGPD 1 an)"
```

---

## Task 9: Vérification finale

- [ ] **Step 1: Suite complète + lint + typecheck**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 erreur ; lint 0 erreur ; tous les tests au vert (les nouveaux + les ~408 existants).

- [ ] **Step 2: Build de production**

Run: `npm run build`
Expected: build réussi (les pages prérendent, le client Prisma régénéré inclut les nouveaux champs).

- [ ] **Step 3: Commit éventuel de finalisation**

S'il reste des ajustements (formatage), les committer :

```bash
git add -A
git commit -m "chore(consent): finalisation verification consentement sante + purge"
```

---

## Notes de validation (hors code)

- **Texte de consentement** (`CONSENT_SANTE.texte`) : à faire **valider par le responsable de traitement** avant la mise en prod. Si modifié, incrémenter `CONSENT_SANTE.version`.
- La purge dépend de la dérivation d'URL → si Cloudinary/R2 change de schéma d'URL, la suppression du fichier échoue (loguée) mais la donnée en base est tout de même purgée.
