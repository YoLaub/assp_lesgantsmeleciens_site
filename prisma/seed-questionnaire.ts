import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const QUESTIONS = [
    { code: "q1", label: "Un membre de votre famille est-il décédé subitement d'une cause cardiaque ou inexpliquée ?", ordre: 1 },
    { code: "q2", label: "Avez-vous ressenti une douleur dans la poitrine, des palpitations, un essoufflement inhabituel ou un malaise ?", ordre: 2 },
    { code: "q3", label: "Avez-vous eu un épisode de respiration sifflante (asthme) ?", ordre: 3 },
    { code: "q4", label: "Avez-vous eu une perte de connaissance ?", ordre: 4 },
    { code: "q5", label: "Si vous avez arrêté le sport pendant 30 jours ou plus pour des raisons de santé, avez-vous repris sans l'accord d'un médecin ?", ordre: 5 },
    { code: "q6", label: "Avez-vous débuté un traitement médical de longue durée (hors contraception et désensibilisation aux allergies) ?", ordre: 6 },
    { code: "q7", label: "Ressentez-vous une douleur, un manque de force ou une raideur suite à un problème osseux, articulaire ou musculaire survenu durant les 12 derniers mois ?", ordre: 7 },
    { code: "q8", label: "Votre pratique sportive est-elle interrompue pour des raisons de santé ?", ordre: 8 },
    { code: "q9", label: "Pensez-vous avoir besoin d'un avis médical pour poursuivre votre pratique sportive ?", ordre: 9 },
];

async function main() {
    for (const q of QUESTIONS) {
        await prisma.questionnaireSanteQuestion.upsert({
            where: { code: q.code },
            update: { label: q.label, ordre: q.ordre },
            create: q,
        });
    }
    console.log("✓ 9 questions du questionnaire de santé seedées");
}

main()
    .catch(console.error)
    .finally(() => pool.end());
