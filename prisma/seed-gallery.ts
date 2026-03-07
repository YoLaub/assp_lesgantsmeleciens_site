import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { fetchAndUploadImageThrottled, cleanupSeedImages } from "./seed-utils";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const IMAGE_CATEGORIES = [
  { slug: "entrainements", name: "Entrainements" },
  { slug: "competitions", name: "Competitions" },
  { slug: "evenements", name: "Evenements" },
  { slug: "portraits", name: "Portraits" },
  { slug: "installations", name: "Installations" },
  { slug: "autre", name: "Autre" },
  { slug: "carousel", name: "Carousel" },
];

const titles = [
  "Entraînement boxe anglaise",
  "Cours de kick-boxing",
  "Gala annuel 2024",
  "Séance de sparring",
  "Remise des ceintures",
  "Tournoi inter-clubs",
  "Échauffement collectif",
  "Combat exhibition",
  "Stage été boxe thaï",
  "Cours enfants",
  "Initiation self-défense",
  "Préparation physique",
  "Open de boxe régional",
  "Soirée portes ouvertes",
  "Entraînement sac de frappe",
  "Cours technique pieds-poings",
  "Compétition départementale",
  "Photo de groupe club",
  "Remise des médailles",
  "Séance cardio-boxing",
];

const dimensions = [
  { width: 800, height: 600 },
  { width: 1200, height: 800 },
  { width: 1024, height: 768 },
  { width: 1600, height: 1200 },
  { width: 640, height: 480 },
  { width: 1920, height: 1080 },
];

function randomDate(monthsBack: number): Date {
  const now = Date.now();
  const past = now - monthsBack * 30 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

export async function seedGallery() {
  console.log("Deleting existing data...");
  await prisma.actualite.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.image.deleteMany();
  await prisma.imageCategory.deleteMany();

  console.log("Creating image categories...");
  const categoryRecords: Record<string, string> = {};
  for (const cat of IMAGE_CATEGORIES) {
    const record = await prisma.imageCategory.create({ data: cat });
    categoryRecords[cat.slug] = record.id;
  }
  console.log(`Created ${IMAGE_CATEGORIES.length} categories.`);

  console.log("Cleaning up old seed images from Cloudinary...");
  await cleanupSeedImages();

  const categorySeeds: {
    slug: string;
    count: number;
    width: number;
    height: number;
    titles: string[];
  }[] = [
    {
      slug: "carousel",
      count: 6,
      width: 1920,
      height: 1080,
      titles: ["Carousel"],
    },
    {
      slug: "entrainements",
      count: 6,
      width: 1200,
      height: 800,
      titles: [
        "Entraînement boxe anglaise",
        "Séance de sparring",
        "Échauffement collectif",
        "Entraînement sac de frappe",
        "Cours technique pieds-poings",
        "Séance cardio-boxing",
      ],
    },
    {
      slug: "competitions",
      count: 6,
      width: 1200,
      height: 800,
      titles: [
        "Open de boxe régional",
        "Compétition départementale",
        "Tournoi inter-clubs",
        "Remise des médailles",
        "Combat exhibition",
        "Remise des ceintures",
      ],
    },
    {
      slug: "evenements",
      count: 6,
      width: 1200,
      height: 800,
      titles: [
        "Gala annuel 2024",
        "Soirée portes ouvertes",
        "Stage été boxe thaï",
        "Initiation self-défense",
        "Cours enfants",
        "Photo de groupe club",
      ],
    },
    {
      slug: "portraits",
      count: 4,
      width: 800,
      height: 800,
      titles: ["Portrait boxeur", "Portrait coach", "Portrait adhérent", "Portrait équipe"],
    },
    {
      slug: "installations",
      count: 4,
      width: 1600,
      height: 1200,
      titles: ["Salle de boxe", "Ring", "Espace musculation", "Vestiaires"],
    },
  ];

  const totalImages = categorySeeds.reduce((sum, c) => sum + c.count, 0);
  let uploaded = 0;

  for (const cat of categorySeeds) {
    console.log(`\nUploading ${cat.count} images for "${cat.slug}"...`);
    for (let i = 0; i < cat.count; i++) {
      uploaded++;
      const title = cat.titles[i % cat.titles.length];
      console.log(`  [${uploaded}/${totalImages}] ${title} (${cat.width}x${cat.height})...`);
      const imageData = await fetchAndUploadImageThrottled(cat.width, cat.height, "seed/gallery");

      await prisma.image.create({
        data: {
          title: cat.count > cat.titles.length ? `${title} #${i + 1}` : title,
          alt: `Photo - ${title}`,
          categoryId: categoryRecords[cat.slug],
          ...imageData,
          order: i,
          createdAt: randomDate(6),
        },
      });
    }
  }
  console.log(`\nInserted ${totalImages} gallery images.`);

  return categoryRecords;
}

// Allow running standalone
if (require.main === module) {
  seedGallery()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
