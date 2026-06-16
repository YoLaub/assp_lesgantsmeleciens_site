-- Migration: fusion Essayant + Adherent → Membre
-- Ce fichier crée l'ensemble du domaine adhésion à partir d'une base fraîche.
-- Les tables Essayant/Adherent n'existaient pas dans les migrations Prisma précédentes
-- (elles étaient appliquées hors Prisma). Sur une base de développement après reset,
-- on crée directement la structure cible sans migration de données.

-- 1. Créer les enums du domaine adhésion
CREATE TYPE "StatutDocument" AS ENUM ('non_fourni', 'declare', 'valide');
CREATE TYPE "TypePaiement"   AS ENUM ('sur_place', 'en_ligne');
CREATE TYPE "Categorie"      AS ENUM ('enfant', 'ados', 'adulte');
CREATE TYPE "StatutMembre"   AS ENUM ('ESSAYANT', 'ACTIF', 'BLOQUE', 'ARCHIVE');

-- 2. Créer la table Membre
CREATE TABLE "Membre" (
  "id"                         SERIAL PRIMARY KEY,
  "statut"                     "StatutMembre"   NOT NULL DEFAULT 'ESSAYANT',
  "nom"                        VARCHAR(100)     NOT NULL,
  "prenom"                     VARCHAR(100)     NOT NULL,
  "email"                      VARCHAR(150)     NOT NULL,
  "telephone"                  VARCHAR(20),
  "dateDeNaissance"            DATE             NOT NULL,
  "dateCreation"               TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "accesToken"                 VARCHAR(255),
  "accesTokenExpireLe"         TIMESTAMP(3),
  "nombrePresences"            INTEGER          NOT NULL DEFAULT 0,
  "accesBloque"                BOOLEAN          NOT NULL DEFAULT false,
  "numeroAdherent"             VARCHAR(10),
  "sexe"                       VARCHAR(10),
  "categorie"                  "Categorie",
  "photo"                      VARCHAR(255),
  "telephone2"                 VARCHAR(20),
  "adresse"                    TEXT,
  "codePostal"                 VARCHAR(5),
  "ville"                      VARCHAR(100),
  "oxygene"                    BOOLEAN          NOT NULL DEFAULT false,
  "renouvellement"             BOOLEAN          NOT NULL DEFAULT false,
  "fnsmr"                      BOOLEAN          NOT NULL DEFAULT false,
  "reglementSigne"             "StatutDocument" NOT NULL DEFAULT 'non_fourni',
  "certificatMedical"          "StatutDocument" NOT NULL DEFAULT 'non_fourni',
  "certificatMedicalReq"       BOOLEAN          NOT NULL DEFAULT false,
  "autorisationParentale"      "StatutDocument" NOT NULL DEFAULT 'non_fourni',
  "couponSport"                "StatutDocument" NOT NULL DEFAULT 'non_fourni',
  "bonCaf"                     "StatutDocument" NOT NULL DEFAULT 'non_fourni',
  "droitImage"                 BOOLEAN          NOT NULL DEFAULT false,
  "codePassSport"              VARCHAR(100),
  "engagementPrisConnaissance" BOOLEAN          NOT NULL DEFAULT false,
  "montantSnapshot"            DECIMAL(8,2),
  "typePaiement"               "TypePaiement",
  "stripeSessionId"            VARCHAR(255),
  "inscriptionValide"          BOOLEAN          NOT NULL DEFAULT false,
  "dateInscription"            TIMESTAMP(3)
);
CREATE UNIQUE INDEX "Membre_email_key"         ON "Membre"("email");
CREATE UNIQUE INDEX "Membre_numeroAdherent_key" ON "Membre"("numeroAdherent") WHERE "numeroAdherent" IS NOT NULL;

-- 3. Créer la table PresenceEssai (référence Membre)
CREATE TABLE "PresenceEssai" (
  "id"        SERIAL PRIMARY KEY,
  "membreId"  INTEGER      NOT NULL,
  "pointeLe"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pointePar" VARCHAR(100) NOT NULL,
  CONSTRAINT "PresenceEssai_membreId_fkey"
    FOREIGN KEY ("membreId") REFERENCES "Membre"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Créer la table QuestionnaireSanteReponses (référence Membre)
CREATE TABLE "QuestionnaireSanteReponses" (
  "id"       SERIAL PRIMARY KEY,
  "membreId" INTEGER NOT NULL,
  "q1" BOOLEAN NOT NULL,
  "q2" BOOLEAN NOT NULL,
  "q3" BOOLEAN NOT NULL,
  "q4" BOOLEAN NOT NULL,
  "q5" BOOLEAN NOT NULL,
  "q6" BOOLEAN NOT NULL,
  "q7" BOOLEAN NOT NULL,
  "q8" BOOLEAN NOT NULL,
  "q9" BOOLEAN NOT NULL,
  "rempliLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionnaireSanteReponses_membreId_fkey"
    FOREIGN KEY ("membreId") REFERENCES "Membre"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "QuestionnaireSanteReponses_membreId_key" ON "QuestionnaireSanteReponses"("membreId");

-- 5. Créer la table ConfigTarifs
CREATE TABLE "ConfigTarifs" (
  "id"                   SERIAL PRIMARY KEY,
  "saison"               VARCHAR(50)  NOT NULL,
  "tarifEnfant"          DECIMAL(8,2) NOT NULL,
  "tarifAdos"            DECIMAL(8,2) NOT NULL,
  "tarifAdulte"          DECIMAL(8,2) NOT NULL,
  "supplementOxygene"    DECIMAL(8,2) NOT NULL DEFAULT 45.00,
  "deductionCouponSport" DECIMAL(8,2) NOT NULL DEFAULT 50.00,
  "modifieLe"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiePar"           TEXT
);

-- 6. Créer la table CoachToken
CREATE TABLE "CoachToken" (
  "id"       SERIAL PRIMARY KEY,
  "token"    VARCHAR(255) NOT NULL,
  "expireLe" TIMESTAMP(3) NOT NULL,
  "creeLe"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "creePar"  TEXT
);
CREATE UNIQUE INDEX "CoachToken_token_key" ON "CoachToken"("token");

-- 7. Créer la table ReglementInterieur
CREATE TABLE "ReglementInterieur" (
  "id"         SERIAL PRIMARY KEY,
  "contenu"    TEXT         NOT NULL,
  "modifieLe"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiePar" TEXT
);

-- 8. Migrer Document : remplacer adherentId TEXT → membreId INT (FK Membre)
--    Sur base fraîche, Document est vide donc on supprime juste la colonne et on en ajoute une nouvelle.
ALTER TABLE "Document" DROP CONSTRAINT "Document_adherentId_fkey";
ALTER TABLE "Document" DROP COLUMN "adherentId";
ALTER TABLE "Document" ADD COLUMN "membreId" INTEGER NOT NULL DEFAULT 0;
-- Supprimer la contrainte DEFAULT maintenant que la colonne existe
ALTER TABLE "Document" ALTER COLUMN "membreId" DROP DEFAULT;
ALTER TABLE "Document"
  ADD CONSTRAINT "Document_membreId_fkey"
  FOREIGN KEY ("membreId") REFERENCES "Membre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
