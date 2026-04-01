import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { fetchAndUploadImageThrottled } from "./seed-utils";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const actualites = [
  {
    title: "Ouverture des inscriptions saison 2025-2026",
    description:
      "Les inscriptions pour la nouvelle saison sont ouvertes ! Rendez-vous au gymnase ou sur notre site pour vous inscrire. Tarifs préférentiels pour les familles et les étudiants. N\u2019hésitez pas à venir faire un cours d\u2019essai gratuit avant de vous engager.",
    tags: ["inscriptions", "saison", "nouveaux-membres"],
    active: true,
    featured: true,
    photoCount: 2,
    seo: {
      title: "Inscriptions saison 2025-2026 - Les Gants Méléciens",
      description:
        "Les inscriptions pour la saison 2025-2026 sont ouvertes au club Les Gants Méléciens.",
    },
    publishedAt: daysAgo(5),
  },
  {
    title: "Résultats du championnat départemental",
    description:
      "Nos boxeurs ont brillé lors du championnat départemental ce week-end. 3 médailles d\u2019or, 2 d\u2019argent et 4 de bronze. Félicitations à tous les participants pour leur engagement et leur esprit sportif. Un grand merci aux coachs pour leur préparation.",
    tags: ["compétition", "résultats", "championnat"],
    active: true,
    featured: true,
    photoCount: 2,
    seo: {
      title: "Résultats championnat départemental - Les Gants Méléciens",
      description:
        "Découvrez les résultats de nos boxeurs au championnat départemental.",
    },
    publishedAt: daysAgo(12),
  },
  {
    title: "Stage de Muay Thaï pendant les vacances de février",
    description:
      "Pendant les vacances scolaires de février, le club organise un stage intensif de Muay Thaï sur 3 jours. Au programme : technique, sparring et préparation physique. Ouvert aux licenciés à partir de 16 ans. Places limitées à 20 participants.",
    tags: ["stage", "muay-thai", "vacances"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Stage Muay Thaï vacances février - Les Gants Méléciens",
      description:
        "Stage intensif de Muay Thaï pendant les vacances de février au club Les Gants Méléciens.",
    },
    publishedAt: daysAgo(20),
  },
  {
    title: "Nouveau cours de cardio-boxing le mercredi soir",
    description:
      "À partir du mois de mars, un nouveau créneau de cardio-boxing est ouvert le mercredi de 19h à 20h. Ce cours sans contact est idéal pour se défouler après le travail. Animé par Amina, il est ouvert à tous les niveaux.",
    tags: ["planning", "cardio-boxing", "nouveau-cours"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Nouveau cours cardio-boxing - Les Gants Méléciens",
      description:
        "Nouveau créneau de cardio-boxing le mercredi soir au club Les Gants Méléciens.",
    },
    publishedAt: daysAgo(30),
  },
  {
    title: "Gala de boxe annuel : save the date !",
    description:
      "Le gala annuel du club aura lieu le samedi 15 mars au gymnase municipal. Au programme : combats amateurs, démonstrations et remise des récompenses. Entrée gratuite, buvette sur place. Venez nombreux soutenir nos boxeurs !",
    tags: ["gala", "événement", "combats"],
    active: true,
    featured: true,
    photoCount: 3,
    seo: {
      title: "Gala de boxe annuel - Les Gants Méléciens",
      description:
        "Gala annuel de boxe du club Les Gants Méléciens. Combats, démonstrations et récompenses.",
    },
    publishedAt: daysAgo(8),
  },
  {
    title: "Portes ouvertes : venez découvrir nos disciplines",
    description:
      "Le club ouvre ses portes le samedi 20 janvier de 10h à 17h. Venez découvrir toutes nos disciplines avec des initiations gratuites encadrées par nos coachs. Matériel fourni, tenue de sport obligatoire. Inscriptions sur place possibles.",
    tags: ["portes-ouvertes", "découverte", "initiation"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Portes ouvertes - Les Gants Méléciens",
      description:
        "Journée portes ouvertes au club Les Gants Méléciens. Initiations gratuites.",
    },
    publishedAt: daysAgo(45),
  },
  {
    title: "Fermeture exceptionnelle du club le 1er mai",
    description:
      "Le club sera exceptionnellement fermé le mercredi 1er mai. Les cours reprendront normalement le jeudi 2 mai. Profitez-en pour vous reposer et revenir en pleine forme !",
    tags: ["fermeture", "info-pratique"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Fermeture 1er mai - Les Gants Méléciens",
      description: "Le club Les Gants Méléciens sera fermé le 1er mai.",
    },
    publishedAt: daysAgo(60),
  },
  {
    title: "Nos jeunes boxeurs sélectionnés en équipe régionale",
    description:
      "Deux de nos jeunes boxeurs, Yanis (15 ans) et Léa (14 ans), ont été sélectionnés en équipe régionale Île-de-France. Une belle reconnaissance de leur travail et de leur talent. Toute l\u2019équipe du club est fière d\u2019eux !",
    tags: ["sélection", "jeunes", "équipe-régionale"],
    active: true,
    featured: true,
    photoCount: 1,
    seo: {
      title: "Sélection équipe régionale - Les Gants Méléciens",
      description:
        "Deux jeunes boxeurs des Gants Méléciens sélectionnés en équipe régionale.",
    },
    publishedAt: daysAgo(15),
  },
  {
    title: "Assemblée générale du club",
    description:
      "L\u2019assemblée générale annuelle se tiendra le vendredi 7 février à 19h au gymnase. Bilan de la saison, projets pour l\u2019année prochaine et élection du bureau. La présence de tous les adhérents est souhaitée.",
    tags: ["assemblée-générale", "club", "vie-associative"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Assemblée générale - Les Gants Méléciens",
      description:
        "Assemblée générale annuelle du club Les Gants Méléciens.",
    },
    publishedAt: daysAgo(35),
  },
  {
    title: "Partenariat avec la salle de musculation FitZone",
    description:
      "Le club a signé un partenariat avec la salle FitZone. Tous les adhérents des Gants Méléciens bénéficient désormais de -20% sur l\u2019abonnement FitZone. Renseignements à l\u2019accueil du club.",
    tags: ["partenariat", "musculation", "avantage-adhérents"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Partenariat FitZone - Les Gants Méléciens",
      description:
        "Nouveau partenariat entre Les Gants Méléciens et la salle FitZone.",
    },
    publishedAt: daysAgo(25),
  },
  {
    title: "Retour en images sur le tournoi inter-clubs",
    description:
      "Revivez les meilleurs moments du tournoi inter-clubs qui s\u2019est tenu le week-end dernier. Plus de 50 combats, 8 clubs représentés et une ambiance de folie. Retrouvez toutes les photos dans notre galerie.",
    tags: ["tournoi", "inter-clubs", "photos"],
    active: true,
    featured: false,
    photoCount: 3,
    seo: {
      title: "Tournoi inter-clubs - Les Gants Méléciens",
      description:
        "Retour en images sur le tournoi inter-clubs organisé par Les Gants Méléciens.",
    },
    publishedAt: daysAgo(40),
  },
  {
    title: "Changement d\u2019horaires pour les cours enfants",
    description:
      "À compter du 15 mars, les cours de boxe éducative enfants passent de 14h-15h à 14h30-15h30 le mercredi. Ce changement permet de mieux s\u2019adapter aux horaires de sortie scolaire. Les cours du samedi restent inchangés.",
    tags: ["horaires", "enfants", "info-pratique"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Nouveaux horaires cours enfants - Les Gants Méléciens",
      description:
        "Changement d\u2019horaires pour les cours enfants au club Les Gants Méléciens.",
    },
    publishedAt: daysAgo(18),
  },
  {
    title: "Le club recherche des bénévoles",
    description:
      "Pour le bon fonctionnement du club et l\u2019organisation de nos événements, nous recherchons des bénévoles. Que ce soit pour l\u2019accueil, l\u2019accompagnement aux compétitions ou l\u2019organisation du gala, toute aide est la bienvenue. Contactez-nous !",
    tags: ["bénévolat", "vie-associative", "recrutement"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Recherche bénévoles - Les Gants Méléciens",
      description:
        "Le club Les Gants Méléciens recherche des bénévoles pour ses événements.",
    },
    publishedAt: daysAgo(50),
  },
  {
    title: "Interview de notre champion Karim en vidéo",
    description:
      "Découvrez l\u2019interview exclusive de Karim Benziane, coach et ancien champion régional, qui revient sur son parcours et sa vision de la boxe. Une discussion inspirante sur la discipline, le dépassement de soi et la transmission.",
    tags: ["interview", "vidéo", "coach"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Interview coach Karim - Les Gants Méléciens",
      description:
        "Interview vidéo de Karim Benziane, coach au club Les Gants Méléciens.",
    },
    publishedAt: daysAgo(55),
  },
  {
    title: "Collecte de matériel pour les clubs partenaires au Sénégal",
    description:
      "Le club organise une collecte de matériel de boxe (gants, protège-dents, casques, bandages) à destination de clubs partenaires au Sénégal. Déposez vos dons à l\u2019accueil jusqu\u2019au 30 mars. Merci pour votre générosité !",
    tags: ["solidarité", "collecte", "international"],
    active: true,
    featured: false,
    photoCount: 1,
    seo: {
      title: "Collecte matériel Sénégal - Les Gants Méléciens",
      description:
        "Collecte de matériel de boxe pour des clubs au Sénégal par Les Gants Méléciens.",
    },
    publishedAt: daysAgo(10),
  },
];

export async function seedActualites(categoryRecords: Record<string, string>) {
  const actualiteCategoryId = categoryRecords["actualite"];

  console.log("Deleting existing actualités...");
  await prisma.actualite.deleteMany();

  console.log("Inserting actualités with image relations...");
  for (let i = 0; i < actualites.length; i++) {
    const actu = actualites[i];
    const { photoCount, ...actuData } = actu;
    console.log(`  [${i + 1}/${actualites.length}] ${actu.title}`);

    // Create Image records for this actualite
    const imageIds: string[] = [];
    for (let j = 0; j < photoCount; j++) {
      console.log(`    Uploading image ${j + 1}/${photoCount}...`);
      const imageData = await fetchAndUploadImageThrottled(1200, 800, "seed/actualites");
      const img = await prisma.image.create({
        data: {
          title: `${actu.title} - photo ${j + 1}`,
          alt: `Photo de ${actu.title}`,
          categoryId: actualiteCategoryId,
          ...imageData,
          order: j,
        },
      });
      imageIds.push(img.id);
    }

    await prisma.actualite.create({
      data: {
        ...actuData,
        images: { connect: imageIds.map((id) => ({ id })) },
        imageOrder: imageIds,
      },
    });
  }
  console.log(`Inserted ${actualites.length} actualités.`);
}

// Allow running standalone
if (require.main === module) {
  // When running standalone, we need to fetch existing category records
  prisma.imageCategory
    .findMany()
    .then((cats) => {
      const categoryRecords: Record<string, string> = {};
      for (const cat of cats) {
        categoryRecords[cat.slug] = cat.id;
      }
      return seedActualites(categoryRecords);
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
