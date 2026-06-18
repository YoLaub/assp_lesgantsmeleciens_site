# Tunnel d'inscription — Les Gants Méléciens

> Architecture Next.js 16 App Router · Prisma 7 · PostgreSQL · Stripe · Brevo

---

## Vue d'ensemble

```
/inscription ──► createAdherentAction ──► createAdherentUseCase ──► DB
                                                                      │
/mon-dossier ◄── lien par email (token) ◄────────────────────────────┘
     │
     ├── questionnaire santé
     ├── règlement intérieur
     ├── upload documents
     ├── choix paiement (sur place | en ligne)
     └── Stripe Checkout ──► webhook ──► inscriptionValide = true
```

---

## Étape 1 — Page d'inscription (`/inscription`)

```tsx
// src/app/(front)/inscription/page.tsx
export default async function InscriptionPage({ searchParams }: InscriptionPageProps) {
    const params = await searchParams;
    let prefill = undefined;

    // Conversion depuis un essayant : pré-remplissage du formulaire
    if (params.token) {
        const result = await getEssayantConversionDataAction(params.token);
        if (result.success && result.data) {
            prefill = {
                nom: result.data.nom, prenom: result.data.prenom,
                email: result.data.email, telephone1: result.data.telephone ?? undefined,
                dateDeNaissance: result.data.dateDeNaissance,
                membreId: result.data.membreId,
            };
        }
    }

    return (
        <main className="container mx-auto py-20 px-5">
            <InscriptionSection prefill={prefill} />
        </main>
    );
}
```

---

## Étape 2 — Server Action : validation & création

```ts
// src/features/adherents/actions/create-adherent.actions.ts
export async function createAdherentAction(input: CreateAdherentInput) {
  const allowed = await checkRateLimit('adhesion');
  if (!allowed) return { success: false, error: 'Trop de tentatives.' };

  const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

  const parsed = CreateAdherentSchema.safeParse(input);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const { membre, numeroAdherent, montant, categorie } = await createAdherentUseCase({ ... });

  await sendConfirmationInscription({ email: membre.email, prenom: membre.prenom, numeroAdherent, ... });
  await sendNotificationNouveauDossier({ ... });

  return { success: true, numeroAdherent };
}
```

---

## Étape 3 — Use case : logique métier

```ts
// src/features/adherents/domain/use-cases/create-adherent.use-case.ts
export async function createAdherentUseCase(input: CreateAdherentInput) {
  const categorie = calculerCategorie(input.dateDeNaissance); // enfant | ados | adulte
  const saison    = await inscriptionRepository.getCurrentSaison();
  const config    = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });

  // Calcul du montant
  let montant = categorie === 'enfant' ? config.tarifEnfant
              : categorie === 'ados'   ? config.tarifAdos
              :                          config.tarifAdulte;
  if (input.oxygene)    montant += config.supplementOxygene;
  if (input.couponSport) montant -= config.deductionCouponSport;

  if (input.membreId) {
    // Conversion ESSAYANT → ACTIF : mise à jour de l'inscription existante
    await inscriptionRepository.update(inscriptionExistante.id, { statut: 'ACTIF', categorie, montantSnapshot: montant, ... });
    return { membre, numeroAdherent: membre.numeroAdherent!, montant, categorie };
  }

  // Nouvelle inscription directe
  const numeroAdherent = await membreRepository.generateUniqueNumero();
  const membre = await membreRepository.create({
    ...input, numeroAdherent,
    accesToken: crypto.randomUUID(),
    accesTokenExpireLe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
  });

  await inscriptionRepository.create({ statut: 'ACTIF', saison, membreId: membre.id, categorie, montantSnapshot: montant, ... });
  return { membre, numeroAdherent, montant, categorie };
}
```

---

## Étape 4 — Accès au dossier par token

```ts
// src/features/adherents/actions/mon-dossier.actions.ts

// L'adhérent reçoit un email avec un lien ?token=xxx
export async function requestAccesDossierAction(input: { email: string; numeroAdherent: string; hcaptchaToken: string }) {
  const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

  const membre = await prisma.membre.findFirst({ where: { email: input.email, numeroAdherent: input.numeroAdherent } });
  if (membre) {
    const token    = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
    await prisma.membre.update({ where: { id: membre.id }, data: { accesToken: token, accesTokenExpireLe: expireLe } });
    await sendLienAccesDossier({ email: membre.email, prenom: membre.prenom, token });
  }
  return { success: true }; // réponse identique même si email inconnu (sécurité)
}

// Toutes les actions du dossier vérifient le token en amont
export async function signerReglementAction(token: string) {
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await signerReglementUseCase(inscription.id);
  return { success: true };
}
```

---

## Étape 5 — Page dossier (`/mon-dossier`)

```tsx
// src/app/(front)/mon-dossier/page.tsx
export default async function MonDossierPage({ searchParams }: MonDossierPageProps) {
    const params = await searchParams;
    const [questions, questionsEnfant] = await Promise.all([
        getQuestionsAction(),      // 7 questions adulte (FNSMR)
        getQuestionsEnfantAction(), // 24 questions enfant (FNSMR)
    ]);
    return (
        <MonDossierView
            token={params.token}
            paiementStatus={params.paiement as 'succes' | 'annule' | undefined}
            questions={questions.map(q => ({ ...q, code: `q${q.ordre}`, section: q.section ?? '' }))}
            questionsEnfant={questionsEnfant.map(q => ({ ...q, code: `q${q.ordre}`, section: q.section ?? '' }))}
        />
    );
}
```

---

## Étape 6 — Actions dossier (questionnaire, upload, paiement)

```ts
// src/features/adherents/actions/mon-dossier.actions.ts

// Questionnaire santé adulte (7 questions FNSMR)
export async function soumettreQuestionnaireAction(token: string, reponses: {...}) {
  const inscription = await inscriptionRepository.findByToken(token);
  const result = await soumettreQuestionnaireUseCase(inscription.id, 'majeur', parsed.data);
  return { success: true, certificatMedicalReq: result.certificatMedicalReq };
}

// Upload document (cert. médical, photo) → Cloudinary, 5 Mo max
export async function uploadDocumentAdherentAction(token: string, formData: FormData, type: 'MEDICAL_CERTIFICATE' | 'ID_PHOTO') {
  const file = formData.get('file') as File;
  if (!TYPES_AUTORISES.includes(file.type)) return { success: false, error: 'Format non accepté (JPEG, PNG, WebP, PDF)' };
  if (file.size > 5 * 1024 * 1024)          return { success: false, error: 'Fichier trop volumineux (5 Mo max)' };
  const inscription = await inscriptionRepository.findByToken(token);
  const url = await uploadDocumentAdherentUseCase(inscription.id, file, type);
  return { success: true, url };
}

// Paiement en ligne → génère une session Stripe Checkout
export async function createCheckoutAction(token: string) {
  const url = await createCheckoutUseCase(token, process.env.NEXT_PUBLIC_APP_URL!);
  return { success: true, url };
}
```

---

## Étape 7 — Webhook Stripe (confirmation paiement)

```ts
// src/app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
    const sig = req.headers.get('stripe-signature');
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
        const inscription = await prisma.inscription.findFirst({
            where: { stripeSessionId: session.id },
            include: { membre: true },
        });

        if (inscription) {
            await prisma.inscription.update({
                where: { id: inscription.id },
                data: { inscriptionValide: true }, // ← dossier validé
            });
            await sendConfirmationPaiement({ email, prenom, numeroAdherent, montant, saison });
            await sendNotificationPaiementRecu({ nom, prenom, numeroAdherent, montant });
        }
    }

    return NextResponse.json({ received: true });
}
```

---

## Schéma de données (extrait)

```prisma
model Membre {
  id              String      @id @default(uuid())
  email           String      @unique
  numeroAdherent  String?     @unique
  accesToken      String?     // token d'accès dossier
  accesTokenExpireLe DateTime?
  inscriptions    Inscription[]
}

model Inscription {
  id                 Int               @id @default(autoincrement())
  statut             StatutInscription @default(ESSAYANT) // ESSAYANT | ACTIF | BLOQUE | ARCHIVE
  saison             String
  categorie          Categorie?        // enfant | ados | adulte
  montantSnapshot    Decimal?
  inscriptionValide  Boolean           @default(false)
  stripeSessionId    String?
  typePaiement       TypePaiement?     // sur_place | en_ligne
  certificatMedical  StatutDocument    @default(non_fourni)
  reglementSigne     StatutDocument    @default(non_fourni)
  questionnaire      QuestionnaireSante?
  documents          Document[]
  membreId           String
  membre             Membre            @relation(...)
  @@unique([membreId, saison])
}
```

---

## Règles métier clés

| Règle | Localisation |
|---|---|
| Rate limiting formulaire (hCaptcha + Redis) | `create-adherent.actions.ts` |
| Token accès dossier — expiration 1h (demande) / 7j (création) | `mon-dossier.actions.ts` |
| Réponse identique si email inconnu | `requestAccesDossierAction` |
| Catégorie calculée depuis la date de naissance | `adherent-utils.ts:calculerCategorie` |
| Conversion ESSAYANT → ACTIF via `membreId` | `createAdherentUseCase` |
| Questionnaire adulte 7q / enfant 24q (FNSMR) | `mon-dossier.actions.ts` |
| `inscriptionValide = true` uniquement via webhook Stripe | `api/webhooks/stripe/route.ts` |
