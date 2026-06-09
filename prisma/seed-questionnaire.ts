import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Adulte : 7 questions officielles FNSMR (Cerfa 15699-01)
const QUESTIONS_ADULTE = [
    { code: "q1", label: "Votre médecin vous a dit que vous étiez atteint d'un problème cardiaque, d'une hypertension artérielle, d'une affection de longue durée (ALD) ou d'une autre maladie chronique", ordre: 1 },
    { code: "q2", label: "Avez-vous ressenti une douleur dans la poitrine, des palpitations, un essoufflement inhabituel ou un malaise durant les 12 derniers mois ?", ordre: 2 },
    { code: "q3", label: "Ressentez-vous une douleur, un manque de force ou une raideur suite à un problème osseux, articulaire ou musculaire (fracture, entorse, luxation, déchirure, tendinite, etc.) survenu durant les 12 derniers mois ?", ordre: 3 },
    { code: "q4", label: "Un membre de votre famille est-il décédé subitement d'une cause cardiaque ou inexpliquée avant 60 ans ?", ordre: 4 },
    { code: "q5", label: "Avez-vous eu un épisode de respiration sifflante (asthme) durant les 12 derniers mois ?", ordre: 5 },
    { code: "q6", label: "Avez-vous eu une perte de connaissance durant les 12 derniers mois ?", ordre: 6 },
    { code: "q7", label: "Pensez-vous avoir besoin d'un avis médical pour poursuivre votre pratique sportive ?", ordre: 7 },
];

// Enfant : 24 questions FNSMR avec section
const QUESTIONS_ENFANT = [
    // Section 1 : Depuis l'année dernière (q1-q12)
    { code: "q1",  label: "Es-tu allé(e) à l'hôpital pendant toute une journée ou plusieurs jours ?", ordre: 1,  section: "Depuis l'année dernière" },
    { code: "q2",  label: "As-tu été opéré(e) ?", ordre: 2,  section: "Depuis l'année dernière" },
    { code: "q3",  label: "As-tu beaucoup plus grandi que les autres années ?", ordre: 3,  section: "Depuis l'année dernière" },
    { code: "q4",  label: "As-tu beaucoup maigri ou grossi ?", ordre: 4,  section: "Depuis l'année dernière" },
    { code: "q5",  label: "As-tu eu la tête qui tourne pendant un effort ?", ordre: 5,  section: "Depuis l'année dernière" },
    { code: "q6",  label: "As-tu perdu connaissance ou es-tu tombé(e) sans te souvenir de ce qui s'était passé ?", ordre: 6,  section: "Depuis l'année dernière" },
    { code: "q7",  label: "As-tu reçu un ou plusieurs chocs violents qui t'ont obligé(e) à interrompre un moment une séance de sport ?", ordre: 7,  section: "Depuis l'année dernière" },
    { code: "q8",  label: "As-tu eu beaucoup de mal à respirer pendant un effort par rapport à d'habitude ?", ordre: 8,  section: "Depuis l'année dernière" },
    { code: "q9",  label: "As-tu eu beaucoup de mal à respirer après un effort ?", ordre: 9,  section: "Depuis l'année dernière" },
    { code: "q10", label: "As-tu eu mal dans la poitrine ou des palpitations (le cœur qui bat très vite) ?", ordre: 10, section: "Depuis l'année dernière" },
    { code: "q11", label: "As-tu commencé à prendre un nouveau médicament tous les jours et pour longtemps ?", ordre: 11, section: "Depuis l'année dernière" },
    { code: "q12", label: "As-tu arrêté le sport à cause d'un problème de santé pendant un mois ou plus ?", ordre: 12, section: "Depuis l'année dernière" },
    // Section 2 : Depuis un certain temps (plus de 2 semaines) (q13-q18)
    { code: "q13", label: "Te sens-tu très fatigué(e) ?", ordre: 13, section: "Depuis un certain temps (plus de 2 semaines)" },
    { code: "q14", label: "As-tu du mal à t'endormir ou te réveilles-tu souvent dans la nuit ?", ordre: 14, section: "Depuis un certain temps (plus de 2 semaines)" },
    { code: "q15", label: "Sens-tu que tu as moins faim ? que tu manges moins ?", ordre: 15, section: "Depuis un certain temps (plus de 2 semaines)" },
    { code: "q16", label: "Te sens-tu triste ou inquiet(e) ?", ordre: 16, section: "Depuis un certain temps (plus de 2 semaines)" },
    { code: "q17", label: "Pleures-tu plus souvent ?", ordre: 17, section: "Depuis un certain temps (plus de 2 semaines)" },
    { code: "q18", label: "Ressens-tu une douleur ou un manque de force à cause d'une blessure que tu t'es faite cette année ?", ordre: 18, section: "Depuis un certain temps (plus de 2 semaines)" },
    // Section 3 : Aujourd'hui (q19-q21)
    { code: "q19", label: "Penses-tu quelquefois à arrêter de faire du sport ou à changer de sport ?", ordre: 19, section: "Aujourd'hui" },
    { code: "q20", label: "Penses-tu avoir besoin de voir ton médecin pour continuer le sport ?", ordre: 20, section: "Aujourd'hui" },
    { code: "q21", label: "Souhaites-tu signaler quelque chose de plus concernant ta santé ?", ordre: 21, section: "Aujourd'hui" },
    // Section 4 : Questions à faire remplir par les parents (q22-q24)
    { code: "q22", label: "Quelqu'un dans votre famille proche a-t-il eu une maladie grave du cœur ou du cerveau, ou est-il décédé subitement avant l'âge de 50 ans ?", ordre: 22, section: "Questions à faire remplir par les parents" },
    { code: "q23", label: "Êtes-vous inquiet(e) pour son poids ? Trouvez-vous qu'il/elle se nourrit trop ou pas assez ?", ordre: 23, section: "Questions à faire remplir par les parents" },
    { code: "q24", label: "Avez-vous manqué l'examen de santé prévu à l'âge de votre enfant chez le médecin ? (prévu à 2 ans, 3 ans, 4 ans, 5 ans, entre 8 et 9 ans, entre 11 et 13 ans et entre 15 et 16 ans)", ordre: 24, section: "Questions à faire remplir par les parents" },
];

async function main() {
    // Adulte : upsert 7 questions officielles FNSMR
    for (const q of QUESTIONS_ADULTE) {
        await prisma.questionnaireSanteQuestion.upsert({
            where: { code: q.code },
            update: { label: q.label, ordre: q.ordre },
            create: q,
        });
    }
    // Supprimer les anciennes q8 et q9 adulte si elles existent
    await prisma.questionnaireSanteQuestion.deleteMany({ where: { code: { in: ['q8', 'q9'] } } });

    // Enfant : upsert 24 questions FNSMR
    for (const q of QUESTIONS_ENFANT) {
        await prisma.questionnaireSanteQuestionEnfant.upsert({
            where: { code: q.code },
            update: { label: q.label, ordre: q.ordre, section: q.section },
            create: q,
        });
    }
    console.log("✓ 7 questions adulte + 24 questions enfant seedées");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
