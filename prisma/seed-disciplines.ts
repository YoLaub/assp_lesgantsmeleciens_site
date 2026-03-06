import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const disciplines = [
  {
    title: "Boxe Anglaise",
    coach: "Karim Benziane",
    category: "boxe",
    citation: "La boxe, c\u2019est avant tout le respect de l\u2019adversaire.",
    description:
      "La boxe anglaise est un sport de combat où seuls les poings sont utilisés. Nos cours couvrent les fondamentaux : garde, déplacements, esquives, directs, crochets et uppercuts. Adapté à tous les niveaux, du débutant au compétiteur.",
    tags: ["boxe", "compétition", "adultes"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Boxe Anglaise - Les Gants Méléciens",
      description:
        "Découvrez nos cours de boxe anglaise pour tous niveaux au club Les Gants Méléciens.",
    },
    order: 0,
  },
  {
    title: "Kick-Boxing",
    coach: "Sébastien Morel",
    category: "pieds-poings",
    citation: "Chaque coup de pied est une leçon de discipline.",
    description:
      "Le kick-boxing combine les techniques de poings de la boxe anglaise avec les coups de pieds. Discipline complète, elle développe la coordination, la puissance et l\u2019endurance. Cours ouverts aux adultes et adolescents.",
    tags: ["kick-boxing", "pieds-poings", "adultes", "ados"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Kick-Boxing - Les Gants Méléciens",
      description:
        "Cours de kick-boxing pour adultes et adolescents au club Les Gants Méléciens.",
    },
    order: 1,
  },
  {
    title: "Boxe Thaïlandaise (Muay Thaï)",
    coach: "Thanapong Srisuk",
    category: "pieds-poings",
    citation: "Le Muay Thaï forge le corps et l\u2019esprit.",
    description:
      "Art martial traditionnel thaïlandais utilisant les poings, les coudes, les genoux et les tibias. Nos cours mettent l\u2019accent sur la technique, le clinch et le travail au sac. Préparation physique incluse.",
    tags: ["muay-thai", "pieds-poings", "compétition", "adultes"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Muay Thaï - Les Gants Méléciens",
      description:
        "Entraînez-vous en Muay Thaï avec un coach expérimenté au club Les Gants Méléciens.",
    },
    order: 2,
  },
  {
    title: "Self-Défense",
    coach: "Laurent Dupont",
    category: "self-defense",
    citation: "Savoir se défendre, c\u2019est gagner en confiance.",
    description:
      "Apprenez les techniques essentielles de self-défense adaptées aux situations réelles. Nos cours combinent des techniques issues de différentes disciplines pour une approche pragmatique et efficace. Ouvert à tous, hommes et femmes.",
    tags: ["self-defense", "tous-niveaux", "mixte"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Self-Défense - Les Gants Méléciens",
      description:
        "Cours de self-défense pour tous au club Les Gants Méléciens. Techniques pratiques et efficaces.",
    },
    order: 3,
  },
  {
    title: "Cardio-Boxing",
    coach: "Amina Chérif",
    category: "fitness",
    citation: "Transpirer ensemble, progresser ensemble.",
    description:
      "Le cardio-boxing est un entraînement fitness intensif basé sur les mouvements de boxe. Sans contact, il permet de se dépenser, tonifier son corps et évacuer le stress. Idéal pour ceux qui veulent les bénéfices de la boxe sans le combat.",
    tags: ["cardio", "fitness", "sans-contact", "tous-niveaux"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Cardio-Boxing - Les Gants Méléciens",
      description:
        "Séances de cardio-boxing fitness au club Les Gants Méléciens. Entraînement sans contact.",
    },
    order: 4,
  },
  {
    title: "Boxe Éducative (Enfants)",
    coach: "Sophie Martin",
    category: "boxe",
    citation: "Apprendre en s\u2019amusant, grandir en boxant.",
    description:
      "La boxe éducative est une version adaptée de la boxe anglaise pour les enfants de 6 à 12 ans. L\u2019accent est mis sur la coordination, le respect des règles, la confiance en soi et le fair-play. Les contacts sont légers et contrôlés.",
    tags: ["enfants", "boxe-educative", "6-12-ans"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Boxe Éducative Enfants - Les Gants Méléciens",
      description:
        "Cours de boxe éducative pour enfants de 6 à 12 ans au club Les Gants Méléciens.",
    },
    order: 5,
  },
  {
    title: "MMA (Mixed Martial Arts)",
    coach: "Romain Lefèvre",
    category: "mixte",
    citation: "Le MMA, c\u2019est l\u2019art de maîtriser toutes les distances.",
    description:
      "Le MMA combine les techniques de striking (debout) et de grappling (au sol). Nos cours abordent la boxe, la lutte, le jiu-jitsu brésilien et les transitions entre les phases de combat. Réservé aux adultes avec un minimum d\u2019expérience.",
    tags: ["mma", "combat-mixte", "adultes", "compétition"],
    active: true,
    photoCount: 2,
    seo: {
      title: "MMA - Les Gants Méléciens",
      description:
        "Cours de MMA (Mixed Martial Arts) au club Les Gants Méléciens.",
    },
    order: 6,
  },
  {
    title: "Préparation Physique",
    coach: "Julien Garnier",
    category: "fitness",
    citation: "Un corps préparé est un combattant redoutable.",
    description:
      "Sessions de préparation physique spécifique aux sports de combat. Renforcement musculaire, explosivité, endurance et souplesse. Ces cours complètent parfaitement les entraînements techniques et sont ouverts à tous les adhérents.",
    tags: ["préparation-physique", "renforcement", "tous-niveaux"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Préparation Physique - Les Gants Méléciens",
      description:
        "Séances de préparation physique pour sports de combat au club Les Gants Méléciens.",
    },
    order: 7,
  },
  {
    title: "Boxe Féminine",
    coach: "Clara Rousseau",
    category: "boxe",
    citation: "La boxe n\u2019a pas de genre, seulement de la détermination.",
    description:
      "Cours de boxe anglaise réservés aux femmes dans une ambiance bienveillante. Travail technique, renforcement et sparring adapté. Que vous soyez débutante ou expérimentée, venez découvrir la boxe dans un cadre motivant.",
    tags: ["boxe", "femmes", "tous-niveaux"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Boxe Féminine - Les Gants Méléciens",
      description:
        "Cours de boxe féminine au club Les Gants Méléciens. Ambiance conviviale et bienveillante.",
    },
    order: 8,
  },
  {
    title: "Savate Boxe Française",
    coach: "Philippe Arnaud",
    category: "pieds-poings",
    citation: "L\u2019élégance du geste, la précision du mouvement.",
    description:
      "La savate boxe française est un art martial français alliant coups de pieds et coups de poings avec élégance et précision. Discipline technique par excellence, elle développe la souplesse, la coordination et le sens tactique.",
    tags: ["savate", "boxe-française", "pieds-poings", "adultes"],
    active: true,
    photoCount: 2,
    seo: {
      title: "Savate Boxe Française - Les Gants Méléciens",
      description:
        "Cours de savate boxe française au club Les Gants Méléciens.",
    },
    order: 9,
  },
];

export async function seedDisciplines(categoryRecords: Record<string, string>) {
  const entrainementsCategoryId = categoryRecords["entrainements"];
  const portraitsCategoryId = categoryRecords["portraits"];

  console.log("Deleting existing disciplines...");
  await prisma.discipline.deleteMany();

  console.log("Inserting disciplines with image relations...");
  let imgIndex = 0;
  for (const disc of disciplines) {
    const { photoCount, ...discData } = disc;

    // Create coach image
    const coachImage = await prisma.image.create({
      data: {
        title: `Coach ${disc.coach}`,
        alt: `Photo de ${disc.coach}, coach de ${disc.title}`,
        categoryId: portraitsCategoryId,
        publicId: `gants-meleciens/coaches/seed-${imgIndex}`,
        version: 1719307544,
        format: "jpg",
        width: 400,
        height: 400,
        bytes: 80000,
        order: 0,
      },
    });
    imgIndex++;

    // Create discipline gallery images
    const imageIds: string[] = [];
    for (let j = 0; j < photoCount; j++) {
      const img = await prisma.image.create({
        data: {
          title: `${disc.title} - photo ${j + 1}`,
          alt: `Photo de ${disc.title}`,
          categoryId: entrainementsCategoryId,
          publicId: `gants-meleciens/disciplines/seed-${imgIndex}`,
          version: 1719307544,
          format: "jpg",
          width: 1200,
          height: 800,
          bytes: 150000,
          order: j,
        },
      });
      imageIds.push(img.id);
      imgIndex++;
    }

    await prisma.discipline.create({
      data: {
        ...discData,
        coachImageId: coachImage.id,
        images: { connect: imageIds.map((id) => ({ id })) },
        imageOrder: imageIds,
      },
    });
  }
  console.log(`Inserted ${disciplines.length} disciplines.`);
}

// Allow running standalone
if (require.main === module) {
  prisma.imageCategory
    .findMany()
    .then((cats) => {
      const categoryRecords: Record<string, string> = {};
      for (const cat of cats) {
        categoryRecords[cat.slug] = cat.id;
      }
      return seedDisciplines(categoryRecords);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
