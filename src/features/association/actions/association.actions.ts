'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type AssociationData = {
    email: string;
    telephone: string;
    lieu: string;
    president: string | null;
    secretaire: string | null;
    viceSecretaire: string | null;
    tresorier: string | null;
    viceTresoriere: string | null;
    instagramUrl: string | null;
    xUrl: string | null;
    youtubeUrl: string | null;
};

// Valeurs par défaut = données historiquement codées en dur (page contact / footer).
// Sert de fallback tant que l'admin n'a pas enregistré la config : le site ne casse jamais.
const ASSOCIATION_PAR_DEFAUT: AssociationData = {
    email: 'lesgantsmeleciens@gmail.com',
    telephone: '07 66 99 94 80',
    lieu: 'Complexe sportif de la Madeleine, Route Josselin 56420 PLUMELEC',
    president: 'Christophe Barbereau',
    secretaire: 'Sophie Le Guennec',
    viceSecretaire: 'Dephine Ciotta',
    tresorier: 'Sylvain Trouillard',
    viceTresoriere: 'Emmanuelle Trouillard',
    instagramUrl: null,
    xUrl: null,
    youtubeUrl: null,
};

export async function getAssociationAction(): Promise<AssociationData> {
    const asso = await prisma.association.findFirst({ orderBy: { id: 'desc' } });
    return asso ?? ASSOCIATION_PAR_DEFAUT;
}

// URL optionnelle : accepte une URL http(s) valide ou une chaîne vide (normalisée en null).
// On restreint au protocole http/https pour exclure les schémas dangereux (javascript:, data:…).
const urlHttp = z.string().url().refine(
    (u) => /^https?:\/\//i.test(u),
    { message: 'URL http(s) attendue' },
);
const urlOptionnelle = z.union([urlHttp, z.literal('')]);

const UpdateAssociationSchema = z.object({
    email: z.string().email(),
    telephone: z.string().min(1),
    lieu: z.string().min(1),
    president: z.string().optional(),
    secretaire: z.string().optional(),
    viceSecretaire: z.string().optional(),
    tresorier: z.string().optional(),
    viceTresoriere: z.string().optional(),
    instagramUrl: urlOptionnelle,
    xUrl: urlOptionnelle,
    youtubeUrl: urlOptionnelle,
});

const versNull = (v: string | undefined) => (v && v.trim() !== '' ? v : null);

export async function updateAssociationAction(data: z.infer<typeof UpdateAssociationSchema>) {
    const { userId } = await auth();
    if (!userId) return { success: false as const, error: 'Non autorisé' };

    const parsed = UpdateAssociationSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: 'Données invalides' };

    const d = parsed.data;
    await prisma.association.create({
        data: {
            email: d.email,
            telephone: d.telephone,
            lieu: d.lieu,
            president: versNull(d.president),
            secretaire: versNull(d.secretaire),
            viceSecretaire: versNull(d.viceSecretaire),
            tresorier: versNull(d.tresorier),
            viceTresoriere: versNull(d.viceTresoriere),
            instagramUrl: versNull(d.instagramUrl),
            xUrl: versNull(d.xUrl),
            youtubeUrl: versNull(d.youtubeUrl),
            modifieLe: new Date(),
            modifiePar: userId,
        },
    });

    revalidatePath('/admin/config/association');
    revalidatePath('/contact');
    revalidatePath('/', 'layout'); // footer présent sur tout le site
    return { success: true as const };
}
