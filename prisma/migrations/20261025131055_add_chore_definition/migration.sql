-- CreateEnum
CREATE TYPE "ChoreDefinitionSource" AS ENUM ('CUSTOM', 'FROM_SUGGESTED_TEMPLATE');

-- CreateTable
CREATE TABLE "chore_definitions" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" "ChoreDefinitionSource" NOT NULL DEFAULT 'CUSTOM',
    "suggestedTemplateKey" TEXT,
    "recurrenceRule" JSONB,
    "rotationConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chore_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chore_definitions_householdId_idx" ON "chore_definitions"("householdId");

-- AddForeignKey
ALTER TABLE "chore_definitions" ADD CONSTRAINT "chore_definitions_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
