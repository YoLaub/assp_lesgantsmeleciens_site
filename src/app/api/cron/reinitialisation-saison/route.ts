import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { sendOuvertureInscriptions } from '@/shared/lib/mail';

export async function GET(req: NextRequest) {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const adherents = await prisma.membre.findMany({
        where: { inscriptionValide: true, statut: { not: 'ESSAYANT' } },
        select: { id: true, email: true, prenom: true },
    });

    await prisma.membre.updateMany({
        where: { inscriptionValide: true, statut: { not: 'ESSAYANT' } },
        data: { inscriptionValide: false },
    });

    let envoyes = 0;
    for (const adherent of adherents) {
        try {
            await sendOuvertureInscriptions({
                email: adherent.email,
                prenom: adherent.prenom,
            });
            envoyes++;
        } catch (e) {
            console.error('[cron/reinitialisation-saison] email:', adherent.email, e);
        }
    }

    return NextResponse.json({ ok: true, reinitialises: adherents.length, emailsEnvoyes: envoyes });
}
