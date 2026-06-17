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
