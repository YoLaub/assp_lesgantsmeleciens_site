import Stripe from 'stripe';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

function isMineur(dateDeNaissance: Date): boolean {
  const today = new Date();
  let age = today.getFullYear() - dateDeNaissance.getFullYear();
  const m = today.getMonth() - dateDeNaissance.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateDeNaissance.getDate())) age--;
  return age < 18;
}

export async function createCheckoutUseCase(token: string, appUrl: string) {
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) throw new Error('Lien invalide ou expiré');
  if (inscription.typePaiement !== 'en_ligne') throw new Error('Mode de paiement non applicable');
  if (inscription.inscriptionValide) throw new Error('Inscription déjà validée');
  if (!inscription.montantSnapshot) throw new Error('Montant introuvable');

  const documentsRequis = [
    inscription.reglementSigne,
    ...(inscription.certificatMedicalReq ? [inscription.certificatMedical] : []),
    ...(isMineur(inscription.membre.dateDeNaissance) ? [inscription.autorisationParentale] : []),
  ];
  if (!documentsRequis.every((s) => s === 'valide')) throw new Error('Documents en attente de validation');

  const saison = await inscriptionRepository.getCurrentSaison();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price_data: { currency: 'eur', unit_amount: Math.round(inscription.montantSnapshot * 100), product_data: { name: `Inscription ${saison} — Les Gants Méléciens` } }, quantity: 1 }],
    success_url: `${appUrl}/mon-dossier?token=${token}&paiement=succes`,
    cancel_url: `${appUrl}/mon-dossier?token=${token}&paiement=annule`,
  });

  await inscriptionRepository.update(inscription.id, { stripeSessionId: session.id });
  return session.url;
}
