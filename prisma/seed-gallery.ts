import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

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
  console.log("Deleting existing images and categories...");
  await prisma.image.deleteMany();
  await prisma.imageCategory.deleteMany();

  console.log("Creating image categories...");
  const categoryRecords: Record<string, string> = {};
  for (const cat of IMAGE_CATEGORIES) {
    const record = await prisma.imageCategory.create({ data: cat });
    categoryRecords[cat.slug] = record.id;
  }
  console.log(`Created ${IMAGE_CATEGORIES.length} categories.`);

  const categorySlugs = IMAGE_CATEGORIES.map((c) => c.slug);

  console.log("Creating 100 gallery images...");
  for (let i = 0; i < 100; i++) {
    const dim = dimensions[i % dimensions.length];
    const title = titles[i % titles.length];
    const slug = categorySlugs[i % categorySlugs.length];

    await prisma.image.create({
      data: {
        title: `${title} #${i + 1}`,
        alt: `Photo - ${title}`,
        categoryId: categoryRecords[slug],
        publicId: `gants-meleciens/gallery/seed-${i}`,
        version: 1719307544,
        format: "jpg",
        width: dim.width,
        height: dim.height,
        bytes: Math.floor(Math.random() * 500000) + 50000,
        order: i,
        createdAt: randomDate(6),
      },
    });
  }
  console.log("Inserted 100 images.");

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
