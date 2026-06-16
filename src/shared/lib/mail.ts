const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER = { name: 'Les Gants Méléciens', email: process.env.CLUB_EMAIL ?? 'lesgantsmeleciens@gmail.com' };

async function sendEmail(to: { email: string; name: string }, subject: string, htmlContent: string) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error('[mail] BREVO_API_KEY manquant');
        return;
    }

    const res = await fetch(BREVO_URL, {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: SENDER, to: [to], subject, htmlContent }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`[mail] Brevo ${res.status} → ${to.email} (${subject}) :`, body);
        return;
    }

    console.log(`[mail] envoyé → ${to.email} (${subject})`);
}

// ─── Emails adhérents ───────────────────────────────────────────────────────

/** Email 1 — Confirmation soumission (→ adhérent) */
export async function sendConfirmationInscription(params: {
    email: string;
    prenom: string;
    numeroAdherent: string;
    certificatRequis: boolean;
}) {
    const certifBlock = params.certificatRequis
        ? `<p>⚠️ <strong>Un certificat médical est obligatoire.</strong><br>
           Votre dossier restera en attente jusqu'à sa réception et validation.</p>`
        : '';

    await sendEmail(
        { email: params.email, name: params.prenom },
        "Votre dossier d'inscription a bien été reçu",
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Votre dossier a été enregistré.</p>
            <p><strong>Numéro d'adhérent : ${params.numeroAdherent}</strong></p>
            ${certifBlock}
            <p>Suivez votre dossier et effectuez votre paiement en ligne :<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier">
                ${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier
            </a><br>
            (email + numéro d'adhérent)</p>
        </body></html>`,
    );
}

/** Email 2 — Notification nouveau dossier (→ admin) */
export async function sendNotificationNouveauDossier(params: {
    nom: string;
    prenom: string;
    numeroAdherent: string;
    categorie: string;
    montant: number;
    typePaiement?: string | null;
    certificatRequis: boolean;
    adherentId: string;
}) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const certifBlock = params.certificatRequis
        ? `<p>⚠️ <strong>CERTIFICAT MÉDICAL OBLIGATOIRE — dossier en attente</strong></p>`
        : '';

    await sendEmail(
        { email: adminEmail, name: 'Admin' },
        `Nouveau dossier — ${params.nom} ${params.prenom}`,
        `<html><body>
            <p>${params.nom} ${params.prenom} · ${params.numeroAdherent} · ${params.categorie} · ${params.montant} € · ${params.typePaiement ?? 'À définir'}</p>
            ${certifBlock}
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/club/adherents/${params.adherentId}">
                Voir le dossier dans l'interface admin
            </a></p>
        </body></html>`,
    );
}

/** Email 3 — Lien accès dossier (→ adhérent, après demande) */
export async function sendLienAccesDossier(params: {
    email: string;
    prenom: string;
    token: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        "Accès à votre dossier d'inscription",
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Voici votre lien d'accès à votre dossier (valable 1 heure) :</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier?token=${params.token}">
                Accéder à mon dossier
            </a></p>
            <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        </body></html>`,
    );
}

/** Email 4 — Confirmation paiement (→ adhérent, après webhook Stripe) */
export async function sendConfirmationPaiement(params: {
    email: string;
    prenom: string;
    numeroAdherent: string;
    montant: number;
    saison: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        'Paiement reçu — votre inscription est confirmée',
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Paiement de <strong>${params.montant} €</strong> reçu.</p>
            <p>Inscription saison ${params.saison} confirmée.</p>
            <p>Numéro d'adhérent : <strong>${params.numeroAdherent}</strong></p>
        </body></html>`,
    );
}

/** Email 5 — Notification paiement reçu (→ admin, après webhook Stripe) */
export async function sendNotificationPaiementRecu(params: {
    nom: string;
    prenom: string;
    numeroAdherent: string;
    montant: number;
}) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    await sendEmail(
        { email: adminEmail, name: 'Admin' },
        `Paiement reçu — ${params.nom} ${params.prenom}`,
        `<html><body>
            <p>${params.montant} € reçu pour ${params.nom} ${params.prenom} (${params.numeroAdherent}).</p>
            <p>Inscription validée automatiquement.</p>
        </body></html>`,
    );
}

/** Email 6 — Document validé par l'admin (→ adhérent) */
export async function sendDocumentValide(params: {
    email: string;
    prenom: string;
    labelDocument: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        `Votre ${params.labelDocument} a été validé`,
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Votre <strong>${params.labelDocument}</strong> a été vérifié et validé par le club.</p>
            <p>Accédez à votre dossier pour suivre l'avancement de votre inscription :<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier">Mon dossier</a></p>
        </body></html>`,
    );
}

/** Email 7 — Document rejeté par l'admin (→ adhérent) */
export async function sendDocumentRejete(params: {
    email: string;
    prenom: string;
    labelDocument: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        `Action requise — ${params.labelDocument}`,
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Votre <strong>${params.labelDocument}</strong> n'a pas pu être validé.</p>
            <p>Merci de fournir un nouveau document depuis votre dossier :<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier">Mon dossier</a></p>
        </body></html>`,
    );
}

/** Email 9 — Rappel dossier incomplet après 1 mois (→ adhérent, cron) */
export async function sendRappelDossierIncomplet(params: {
    email: string;
    prenom: string;
    numeroAdherent: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        'Votre dossier d\'inscription est toujours en attente',
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Votre dossier d'inscription aux Gants Méléciens (n° <strong>${params.numeroAdherent}</strong>) est en attente depuis plus d'un mois.</p>
            <p>Complétez-le dès maintenant pour finaliser votre adhésion :<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier">Accéder à mon dossier</a>
            (identifiez-vous avec votre email et votre numéro d'adhérent)</p>
            <p>Si vous n'êtes plus intéressé(e), vous pouvez ignorer cet email.</p>
        </body></html>`,
    );
}

/** Email 10 — Ouverture inscriptions nouvelle saison (→ adhérent, cron juillet) */
export async function sendOuvertureInscriptions(params: {
    email: string;
    prenom: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        'Les inscriptions pour la nouvelle saison ouvrent en septembre !',
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>La saison se termine — merci pour votre fidélité aux Gants Méléciens !</p>
            <p>Les inscriptions pour la prochaine saison ouvriront en <strong>septembre</strong>.</p>
            <p>Vous recevrez un email dès l'ouverture. À très bientôt !</p>
        </body></html>`,
    );
}

/** Email 8 — Bon CAF validé — instructions remboursement (→ adhérent) */
export async function sendBonCafValide(params: {
    email: string;
    prenom: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        'Votre aide CAF a bien été prise en compte',
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Votre aide CAF a été enregistrée.</p>
            <p>Pour obtenir le remboursement :</p>
            <ol>
                <li>Téléchargez le bon d'aide de votre espace CAF.</li>
                <li>Envoyez-le signé directement à votre CAF en demandant le remboursement.</li>
                <li>La CAF vous remboursera directement — aucune déduction n'est appliquée sur le montant à régler au club.</li>
            </ol>
            <p>En cas de question, contactez-nous à <a href="mailto:${process.env.CLUB_EMAIL ?? 'lesgantsmeleciens@gmail.com'}">${process.env.CLUB_EMAIL ?? 'lesgantsmeleciens@gmail.com'}</a>.</p>
        </body></html>`,
    );
}

// ─── Emails essayants ───────────────────────────────────────────────────────

/** Email 1 Essayant — Bienvenue (→ essayant, à la création) */
export async function sendBienvenueEssayant(params: {
    email: string;
    prenom: string;
    numeroAdherent: string;
    accesToken: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        "Bienvenue pour vos cours d'essai !",
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Votre numéro : <strong>${params.numeroAdherent}</strong> — conservez-le précieusement.</p>
            <p>Suivez vos cours d'essai et votre progression ici :<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-essai?token=${params.accesToken}">
                Accéder à mon suivi d'essai
            </a></p>
            <p style="font-size:12px;color:#999">Ce lien est valable 7 jours. Passé ce délai, vous pourrez en demander un nouveau sur la même page.</p>
        </body></html>`,
    );
}

/** Email 2 Essayant — Notification admin (→ admin, à la création) */
export async function sendNotificationNouvelEssayant(params: {
    nom: string;
    prenom: string;
    numeroAdherent: string;
    email: string;
    telephone: string;
}) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    await sendEmail(
        { email: adminEmail, name: 'Admin' },
        `Nouvel essayant — ${params.nom} ${params.prenom}`,
        `<html><body>
            <p>${params.numeroAdherent} · ${params.email} · ${params.telephone}</p>
        </body></html>`,
    );
}

/** Email 3 Essayant — Relance après cours 1 ou 2 (→ essayant) */
export async function sendRelanceEssayant(params: {
    email: string;
    prenom: string;
    numeroAdherent: string;
    nombrePresences: number;
}) {
    const restant = 3 - params.nombrePresences;
    await sendEmail(
        { email: params.email, name: params.prenom },
        `${params.prenom}, encore ${restant} cours d'essai avant de rejoindre le club !`,
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Il vous reste <strong>${restant} cours d'essai</strong>.</p>
            <p>Vous pouvez déjà commencer votre inscription :<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-essai">Mon essai</a>
            (votre numéro : ${params.numeroAdherent})</p>
        </body></html>`,
    );
}

/** Email 4 Essayant — Conversion après cours 3 (→ essayant) */
export async function sendConversionEssayant(params: {
    email: string;
    prenom: string;
    numeroAdherent: string;
    accesToken: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        "Vos cours d'essai sont terminés — rejoignez le club !",
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Vous avez effectué vos 3 cours d'essai.</p>
            <p>Pour continuer à pratiquer, complétez votre inscription :<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/inscription?conversion=${params.numeroAdherent}&token=${params.accesToken}">
                Commencer mon inscription
            </a></p>
            <p>Vos informations seront pré-remplies automatiquement.</p>
        </body></html>`,
    );
}

/** Email 5 Essayant — Notification admin après cours 3 (→ admin) */
export async function sendNotificationConversionAdmin(params: {
    nom: string;
    prenom: string;
    numeroAdherent: string;
}) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    await sendEmail(
        { email: adminEmail, name: 'Admin' },
        `Essayant à convertir — ${params.nom} ${params.prenom}`,
        `<html><body>
            <p>${params.numeroAdherent} a effectué ses 3 cours d'essai. Email de conversion envoyé.</p>
        </body></html>`,
    );
}

/** Email lien accès Mon Essai (→ essayant, après demande) */
export async function sendLienAccesEssai(params: {
    email: string;
    prenom: string;
    token: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        "Accès à votre suivi d'essai",
        `<html><body>
            <h2>Bonjour ${params.prenom},</h2>
            <p>Voici votre lien d'accès (valable 1 heure) :</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-essai?token=${params.token}">
                Accéder à mon suivi d'essai
            </a></p>
            <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        </body></html>`,
    );
}

/** Email — Notification rejet dossier (→ adhérent, depuis admin) */
export async function sendNotificationRejetDossier(params: {
    email: string;
    prenom: string;
}) {
    await sendEmail(
        { email: params.email, name: params.prenom },
        "Votre dossier d'inscription — action requise",
        `<html><body>
      <h2>Bonjour ${params.prenom},</h2>
      <p>Votre dossier d'inscription aux Gants Méléciens n'a pas pu être validé en l'état.</p>
      <p>Merci de prendre contact avec le club pour régulariser votre situation :<br>
      <a href="mailto:${process.env.CLUB_EMAIL ?? 'lesgantsmeleciens@gmail.com'}">${process.env.CLUB_EMAIL ?? 'lesgantsmeleciens@gmail.com'}</a></p>
    </body></html>`,
    );
}

// ─── Compat ancien code ─────────────────────────────────────────────────────

/** @deprecated Utiliser sendConfirmationInscription */
export async function sendConfirmationEmail(email: string, name: string) {
    await sendEmail(
        { email, name },
        "Confirmation de votre demande d'adhésion",
        `<html><body>
            <h1>Bonjour ${name}</h1>
            <p>Votre inscription a été reçue. Nous vous rappelons que vous bénéficiez de <b>3 cours d'essai gratuits</b> avant validation définitive.</p>
        </body></html>`,
    );
}
