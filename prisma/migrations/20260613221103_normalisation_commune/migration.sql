/*
  Warnings:

  - You are about to drop the column `ville` on the `Membre` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Membre" DROP COLUMN "ville",
ADD COLUMN     "codeInsee" VARCHAR(5);

-- CreateTable
CREATE TABLE "Commune" (
    "codeInsee" VARCHAR(5) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("codeInsee")
);

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_codeInsee_fkey" FOREIGN KEY ("codeInsee") REFERENCES "Commune"("codeInsee") ON DELETE SET NULL ON UPDATE CASCADE;
