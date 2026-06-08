import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { sendRappelDossierIncomplet } from '@/shared/lib/mail';

export async function GET(req: NextRequest) {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const ilYaUnMois = new Date();
    ilYaUnMois.setDate(ilYaUnMois.getDate() - 30);

    const adherents = await prisma.membre.findMany({
        where: {
            statut: { not: 'ESSAYANT' },
            inscriptionValide: false,
            dateInscription: { lt: ilYaUnMois },
        },
        select: { email: true, prenom: true, numeroAdherent: true },
    });

    let envoyes = 0;
    for (const adherent of adherents) {
        try {
            await sendRappelDossierIncomplet({
                email: adherent.email,
                prenom: adherent.prenom,
                numeroAdherent: adherent.numeroAdherent ?? '',
            });
            envoyes++;
        } catch (e) {
            console.error('[cron/dossier-incomplet] email:', adherent.email, e);
        }
    }

    return NextResponse.json({ ok: true, envoyes, total: adherents.length });
}
