import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const QUESTIONS_ADULTE = [
    { label: "Votre médecin vous a dit que vous étiez atteint d'un problème cardiaque, d'une hypertension artérielle, d'une affection de longue durée (ALD) ou d'une autre maladie chronique", type: "majeur", ordre: 1 },
    { label: "Avez-vous ressenti une douleur dans la poitrine, des palpitations, un essoufflement inhabituel ou un malaise durant les 12 derniers mois ?", type: "majeur", ordre: 2 },
    { label: "Ressentez-vous une douleur, un manque de force ou une raideur suite à un problème osseux, articulaire ou musculaire survenu durant les 12 derniers mois ?", type: "majeur", ordre: 3 },
    { label: "Un membre de votre famille est-il décédé subitement d'une cause cardiaque ou inexpliquée avant 60 ans ?", type: "majeur", ordre: 4 },
    { label: "Avez-vous eu un épisode de respiration sifflante (asthme) durant les 12 derniers mois ?", type: "majeur", ordre: 5 },
    { label: "Avez-vous eu une perte de connaissance durant les 12 derniers mois ?", type: "majeur", ordre: 6 },
    { label: "Pensez-vous avoir besoin d'un avis médical pour poursuivre votre pratique sportive ?", type: "majeur", ordre: 7 },
];

const QUESTIONS_ENFANT = [
    { label: "Es-tu allé(e) à l'hôpital pendant toute une journée ou plusieurs jours ?", type: "mineur", ordre: 1, section: "Depuis l'année dernière" },
    { label: "As-tu été opéré(e) ?", type: "mineur", ordre: 2, section: "Depuis l'année dernière" },
    { label: "As-tu beaucoup plus grandi que les autres années ?", type: "mineur", ordre: 3, section: "Depuis l'année dernière" },
    { label: "As-tu beaucoup maigri ou grossi ?", type: "mineur", ordre: 4, section: "Depuis l'année dernière" },
    { label: "As-tu eu la tête qui tourne pendant un effort ?", type: "mineur", ordre: 5, section: "Depuis l'année dernière" },
    { label: "As-tu perdu connaissance ou es-tu tombé(e) sans te souvenir de ce qui s'était passé ?", type: "mineur", ordre: 6, section: "Depuis l'année dernière" },
    { label: "As-tu reçu un ou plusieurs chocs violents qui t'ont obligé(e) à interrompre un moment une séance de sport ?", type: "mineur", ordre: 7, section: "Depuis l'année dernière" },
    { label: "As-tu eu beaucoup de mal à respirer pendant un effort par rapport à d'habitude ?", type: "mineur", ordre: 8, section: "Depuis l'année dernière" },
    { label: "As-tu eu beaucoup de mal à respirer après un effort ?", type: "mineur", ordre: 9, section: "Depuis l'année dernière" },
    { label: "As-tu eu mal dans la poitrine ou des palpitations (le cœur qui bat très vite) ?", type: "mineur", ordre: 10, section: "Depuis l'année dernière" },
    { label: "As-tu commencé à prendre un nouveau médicament tous les jours et pour longtemps ?", type: "mineur", ordre: 11, section: "Depuis l'année dernière" },
    { label: "As-tu arrêté le sport à cause d'un problème de santé pendant un mois ou plus ?", type: "mineur", ordre: 12, section: "Depuis l'année dernière" },
    { label: "Te sens-tu très fatigué(e) ?", type: "mineur", ordre: 13, section: "Depuis un certain temps (plus de 2 semaines)" },
    { label: "As-tu du mal à t'endormir ou te réveilles-tu souvent dans la nuit ?", type: "mineur", ordre: 14, section: "Depuis un certain temps (plus de 2 semaines)" },
    { label: "Sens-tu que tu as moins faim ? que tu manges moins ?", type: "mineur", ordre: 15, section: "Depuis un certain temps (plus de 2 semaines)" },
    { label: "Te sens-tu triste ou inquiet(e) ?", type: "mineur", ordre: 16, section: "Depuis un certain temps (plus de 2 semaines)" },
    { label: "Pleures-tu plus souvent ?", type: "mineur", ordre: 17, section: "Depuis un certain temps (plus de 2 semaines)" },
    { label: "Ressens-tu une douleur ou un manque de force à cause d'une blessure que tu t'es faite cette année ?", type: "mineur", ordre: 18, section: "Depuis un certain temps (plus de 2 semaines)" },
    { label: "Penses-tu quelquefois à arrêter de faire du sport ou à changer de sport ?", type: "mineur", ordre: 19, section: "Aujourd'hui" },
    { label: "Penses-tu avoir besoin de voir ton médecin pour continuer le sport ?", type: "mineur", ordre: 20, section: "Aujourd'hui" },
    { label: "Souhaites-tu signaler quelque chose de plus concernant ta santé ?", type: "mineur", ordre: 21, section: "Aujourd'hui" },
    { label: "Quelqu'un dans votre famille proche a-t-il eu une maladie grave du cœur ou du cerveau, ou est-il décédé subitement avant l'âge de 50 ans ?", type: "mineur", ordre: 22, section: "Questions à faire remplir par les parents" },
    { label: "Êtes-vous inquiet(e) pour son poids ? Trouvez-vous qu'il/elle se nourrit trop ou pas assez ?", type: "mineur", ordre: 23, section: "Questions à faire remplir par les parents" },
    { label: "Avez-vous manqué l'examen de santé prévu à l'âge de votre enfant chez le médecin ?", type: "mineur", ordre: 24, section: "Questions à faire remplir par les parents" },
];

async function main() {
    for (const q of [...QUESTIONS_ADULTE, ...QUESTIONS_ENFANT]) {
        await prisma.question.upsert({
            where: { label: q.label },
            update: { type: q.type, ordre: q.ordre, section: q.section ?? null },
            create: q,
        });
    }
    console.log("✓ 7 questions adulte + 24 questions enfant seedées dans Question");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
