import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = ["entrainements", "competitions", "evenements", "portraits", "installations", "autre"];

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

async function main() {
  console.log("Deleting existing gallery images...");
  const { count: deleted } = await prisma.galleryImage.deleteMany();
  console.log(`Deleted ${deleted} existing images.`);

  const images = Array.from({ length: 100 }, (_, i) => {
    const dim = dimensions[i % dimensions.length];
    const title = titles[i % titles.length];
    const category = categories[i % categories.length];

    return {
      title: `${title} #${i + 1}`,
      alt: `Photo - ${title}`,
      category,
      src: `https://picsum.photos/seed/gallery${i}/${dim.width}/${dim.height}`,
      width: dim.width,
      height: dim.height,
      order: i,
      createdAt: randomDate(6),
    };
  });

  console.log("Inserting 100 gallery images...");
  const { count } = await prisma.galleryImage.createMany({ data: images });
  console.log(`Inserted ${count} images.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
