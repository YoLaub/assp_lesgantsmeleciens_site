-- DropForeignKey
ALTER TABLE "Discipline" DROP CONSTRAINT "Discipline_coachImageId_fkey";

-- AlterTable
ALTER TABLE "Discipline" ALTER COLUMN "coachImageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_coachImageId_fkey" FOREIGN KEY ("coachImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
