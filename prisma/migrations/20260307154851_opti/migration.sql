/*
  Warnings:

  - You are about to drop the column `photo` on the `Actualite` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `Discipline` table. All the data in the column will be lost.
  - You are about to drop the column `photo_coach` on the `Discipline` table. All the data in the column will be lost.
  - You are about to drop the `GalleryImage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `coachImageId` to the `Discipline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Actualite" DROP COLUMN "photo",
ADD COLUMN     "imageOrder" TEXT[];

-- AlterTable
ALTER TABLE "Discipline" DROP COLUMN "photo",
DROP COLUMN "photo_coach",
ADD COLUMN     "coachImageId" TEXT NOT NULL,
ADD COLUMN     "imageOrder" TEXT[];

-- DropTable
DROP TABLE "GalleryImage";

-- CreateTable
CREATE TABLE "ImageCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "ImageCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "publicId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DisciplineToImage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DisciplineToImage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActualiteToImage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActualiteToImage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageCategory_slug_key" ON "ImageCategory"("slug");

-- CreateIndex
CREATE INDEX "_DisciplineToImage_B_index" ON "_DisciplineToImage"("B");

-- CreateIndex
CREATE INDEX "_ActualiteToImage_B_index" ON "_ActualiteToImage"("B");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ImageCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_coachImageId_fkey" FOREIGN KEY ("coachImageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplineToImage" ADD CONSTRAINT "_DisciplineToImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplineToImage" ADD CONSTRAINT "_DisciplineToImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActualiteToImage" ADD CONSTRAINT "_ActualiteToImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Actualite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActualiteToImage" ADD CONSTRAINT "_ActualiteToImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
