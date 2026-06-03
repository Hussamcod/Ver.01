-- CreateTable
CREATE TABLE "ICP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industries" TEXT NOT NULL,
    "companySizes" TEXT NOT NULL,
    "geographies" TEXT NOT NULL,
    "jobTitles" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "revenueMin" INTEGER,
    "revenueMax" INTEGER,
    "keywords" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BuyerPersona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "titles" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "painPoints" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "valueProps" TEXT NOT NULL,
    "toneStyle" TEXT NOT NULL DEFAULT 'professional',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apolloId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "title" TEXT NOT NULL,
    "seniority" TEXT,
    "company" TEXT NOT NULL,
    "industry" TEXT,
    "companySize" TEXT,
    "geography" TEXT,
    "linkedinUrl" TEXT,
    "website" TEXT,
    "technologies" TEXT NOT NULL,
    "intentSignals" TEXT NOT NULL,
    "icpScore" REAL NOT NULL DEFAULT 0,
    "personaMatch" TEXT,
    "intentScore" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'new',
    "callScript" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_apolloId_key" ON "Lead"("apolloId");
