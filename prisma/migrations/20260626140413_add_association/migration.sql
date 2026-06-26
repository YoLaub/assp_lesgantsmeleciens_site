-- CreateTable
CREATE TABLE "Association" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(30) NOT NULL,
    "lieu" VARCHAR(255) NOT NULL,
    "president" VARCHAR(120),
    "secretaire" VARCHAR(120),
    "viceSecretaire" VARCHAR(120),
    "tresorier" VARCHAR(120),
    "viceTresoriere" VARCHAR(120),
    "instagramUrl" VARCHAR(255),
    "xUrl" VARCHAR(255),
    "youtubeUrl" VARCHAR(255),
    "modifieLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiePar" TEXT,

    CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);
