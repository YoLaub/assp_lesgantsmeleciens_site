import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/shared/lib/prisma';
import { sendConfirmationPaiement, sendNotificationPaiementRecu } from '@/shared/lib/mail';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    if (!sig) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
        return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const inscription = await prisma.inscription.findFirst({
            where: { stripeSessionId: session.id },
            include: { membre: true },
        });

        if (inscription) {
            await prisma.inscription.update({
                where: { id: inscription.id },
                data: { inscriptionValide: true },
            });

            const config = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
            const m = inscription.membre;

            try {
                await sendConfirmationPaiement({
                    email: m.email, prenom: m.prenom,
                    numeroAdherent: m.numeroAdherent ?? '',
                    montant: inscription.montantSnapshot ? Number(inscription.montantSnapshot) : 0,
                    saison: config?.saison ?? 'en cours',
                });
            } catch (e) { console.error('[stripe webhook] sendConfirmationPaiement', e); }

            try {
                await sendNotificationPaiementRecu({
                    nom: m.nom, prenom: m.prenom,
                    numeroAdherent: m.numeroAdherent ?? '',
                    montant: inscription.montantSnapshot ? Number(inscription.montantSnapshot) : 0,
                });
            } catch (e) { console.error('[stripe webhook] sendNotificationPaiementRecu', e); }
        }
    }

    return NextResponse.json({ received: true });
}
