-- CreateTable QuestionnaireSanteQuestionEnfant
CREATE TABLE "QuestionnaireSanteQuestionEnfant" (
  "code"    TEXT        NOT NULL,
  "label"   TEXT        NOT NULL,
  "ordre"   INTEGER     NOT NULL,
  "section" VARCHAR(100) NOT NULL,
  CONSTRAINT "QuestionnaireSanteQuestionEnfant_pkey" PRIMARY KEY ("code")
);

-- CreateTable QuestionnaireSanteReponsesEnfant
CREATE TABLE "QuestionnaireSanteReponsesEnfant" (
  "id"       SERIAL      PRIMARY KEY,
  "membreId" INTEGER     NOT NULL,
  "q1"  BOOLEAN NOT NULL,
  "q2"  BOOLEAN NOT NULL,
  "q3"  BOOLEAN NOT NULL,
  "q4"  BOOLEAN NOT NULL,
  "q5"  BOOLEAN NOT NULL,
  "q6"  BOOLEAN NOT NULL,
  "q7"  BOOLEAN NOT NULL,
  "q8"  BOOLEAN NOT NULL,
  "q9"  BOOLEAN NOT NULL,
  "q10" BOOLEAN NOT NULL,
  "q11" BOOLEAN NOT NULL,
  "q12" BOOLEAN NOT NULL,
  "q13" BOOLEAN NOT NULL,
  "q14" BOOLEAN NOT NULL,
  "q15" BOOLEAN NOT NULL,
  "q16" BOOLEAN NOT NULL,
  "q17" BOOLEAN NOT NULL,
  "q18" BOOLEAN NOT NULL,
  "q19" BOOLEAN NOT NULL,
  "q20" BOOLEAN NOT NULL,
  "q21" BOOLEAN NOT NULL,
  "q22" BOOLEAN NOT NULL,
  "q23" BOOLEAN NOT NULL,
  "q24" BOOLEAN NOT NULL,
  "rempliLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionnaireSanteReponsesEnfant_membreId_fkey"
    FOREIGN KEY ("membreId") REFERENCES "Membre"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "QuestionnaireSanteReponsesEnfant_membreId_key"
  ON "QuestionnaireSanteReponsesEnfant"("membreId");
