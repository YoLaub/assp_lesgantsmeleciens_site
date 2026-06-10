-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('ESSAYANT', 'ACTIF', 'BLOQUE', 'ARCHIVE');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_membreId_fkey";

-- DropForeignKey
ALTER TABLE "PresenceEssai" DROP CONSTRAINT "PresenceEssai_membreId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionnaireSanteReponses" DROP CONSTRAINT "QuestionnaireSanteReponses_membreId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionnaireSanteReponsesEnfant" DROP CONSTRAINT "QuestionnaireSanteReponsesEnfant_membreId_fkey";

-- DropIndex
DROP INDEX "Inscription_email_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "membreId",
ADD COLUMN     "inscriptionId" INTEGER NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" VARCHAR(50) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_pkey",
DROP COLUMN "address",
DROP COLUMN "birthDate",
DROP COLUMN "city",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "paymentMethod",
DROP COLUMN "phone",
DROP COLUMN "postalCode",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "accesBloque" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autorisationParentale" "StatutDocument" NOT NULL DEFAULT 'non_fourni',
ADD COLUMN     "bonCaf" "StatutDocument" NOT NULL DEFAULT 'non_fourni',
ADD COLUMN     "categorie" "Categorie",
ADD COLUMN     "certificatMedical" "StatutDocument" NOT NULL DEFAULT 'non_fourni',
ADD COLUMN     "certificatMedicalReq" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "codePassSport" VARCHAR(100),
ADD COLUMN     "couponSport" "StatutDocument" NOT NULL DEFAULT 'non_fourni',
ADD COLUMN     "dateInscription" TIMESTAMP(3),
ADD COLUMN     "droitImage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "engagementPrisConnaissance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fnsmr" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inscriptionValide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "membreId" TEXT NOT NULL,
ADD COLUMN     "montantSnapshot" DECIMAL(8,2),
ADD COLUMN     "nombrePresences" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "oxygene" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photo" VARCHAR(255),
ADD COLUMN     "reglementSigne" "StatutDocument" NOT NULL DEFAULT 'non_fourni',
ADD COLUMN     "renouvellement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saison" VARCHAR(100) NOT NULL,
ADD COLUMN     "statut" "StatutInscription" NOT NULL DEFAULT 'ESSAYANT',
ADD COLUMN     "telephone2" VARCHAR(20),
ADD COLUMN     "typePaiement" "TypePaiement",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "stripeSessionId" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Membre" DROP CONSTRAINT "Membre_pkey",
DROP COLUMN "accesBloque",
DROP COLUMN "autorisationParentale",
DROP COLUMN "bonCaf",
DROP COLUMN "categorie",
DROP COLUMN "certificatMedical",
DROP COLUMN "certificatMedicalReq",
DROP COLUMN "codePassSport",
DROP COLUMN "couponSport",
DROP COLUMN "dateInscription",
DROP COLUMN "droitImage",
DROP COLUMN "engagementPrisConnaissance",
DROP COLUMN "fnsmr",
DROP COLUMN "inscriptionValide",
DROP COLUMN "montantSnapshot",
DROP COLUMN "nombrePresences",
DROP COLUMN "oxygene",
DROP COLUMN "photo",
DROP COLUMN "reglementSigne",
DROP COLUMN "renouvellement",
DROP COLUMN "statut",
DROP COLUMN "stripeSessionId",
DROP COLUMN "telephone2",
DROP COLUMN "typePaiement",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Membre_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Membre_id_seq";

-- AlterTable
ALTER TABLE "PresenceEssai" DROP COLUMN "membreId",
ADD COLUMN     "inscriptionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "QuestionnaireSanteQuestion";

-- DropTable
DROP TABLE "QuestionnaireSanteQuestionEnfant";

-- DropTable
DROP TABLE "QuestionnaireSanteReponses";

-- DropTable
DROP TABLE "QuestionnaireSanteReponsesEnfant";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "InscriptionStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "StatutMembre";

-- CreateTable
CREATE TABLE "QuestionnaireSante" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inscriptionId" INTEGER NOT NULL,

    CONSTRAINT "QuestionnaireSante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "ordre" INTEGER NOT NULL,
    "section" VARCHAR(100),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reponse" (
    "id" SERIAL NOT NULL,
    "reponse" BOOLEAN,
    "questionnaireSanteId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "Reponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interroge" (
    "questionnaireSanteId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "Interroge_pkey" PRIMARY KEY ("questionnaireSanteId","questionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireSante_inscriptionId_key" ON "QuestionnaireSante"("inscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_label_key" ON "Question"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Reponse_questionnaireSanteId_questionId_key" ON "Reponse"("questionnaireSanteId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_membreId_saison_key" ON "Inscription"("membreId", "saison");

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceEssai" ADD CONSTRAINT "PresenceEssai_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSante" ADD CONSTRAINT "QuestionnaireSante_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reponse" ADD CONSTRAINT "Reponse_questionnaireSanteId_fkey" FOREIGN KEY ("questionnaireSanteId") REFERENCES "QuestionnaireSante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reponse" ADD CONSTRAINT "Reponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interroge" ADD CONSTRAINT "Interroge_questionnaireSanteId_fkey" FOREIGN KEY ("questionnaireSanteId") REFERENCES "QuestionnaireSante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interroge" ADD CONSTRAINT "Interroge_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
