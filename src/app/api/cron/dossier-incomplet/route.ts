import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { sendRappelDossierIncomplet } from '@/shared/lib/mail';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const ilYaUnMois = new Date();
    ilYaUnMois.setDate(ilYaUnMois.getDate() - 30);

    const inscriptions = await prisma.inscription.findMany({
        where: {
            statut: { not: 'ESSAYANT' },
            inscriptionValide: false,
            dateInscription: { lt: ilYaUnMois },
        },
        include: { membre: { select: { email: true, prenom: true, numeroAdherent: true } } },
    });

    let envoyes = 0;
    for (const insc of inscriptions) {
        try {
            await sendRappelDossierIncomplet({
                email: insc.membre.email,
                prenom: insc.membre.prenom,
                numeroAdherent: insc.membre.numeroAdherent ?? '',
            });
            envoyes++;
        } catch (e) { console.error('[cron/dossier-incomplet]', insc.membre.email, e); }
    }

    return NextResponse.json({ ok: true, envoyes, total: inscriptions.length });
}
