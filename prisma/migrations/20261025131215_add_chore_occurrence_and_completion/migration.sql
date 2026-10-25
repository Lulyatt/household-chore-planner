-- CreateEnum
CREATE TYPE "ChoreOccurrenceStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "chore_occurrences" (
    "id" TEXT NOT NULL,
    "choreDefinitionId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" "ChoreOccurrenceStatus" NOT NULL DEFAULT 'PENDING',
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chore_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completions" (
    "id" TEXT NOT NULL,
    "choreOccurrenceId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    "photoUrl" TEXT,
    "completedByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chore_occurrences_householdId_idx" ON "chore_occurrences"("householdId");

-- CreateIndex
CREATE INDEX "chore_occurrences_choreDefinitionId_idx" ON "chore_occurrences"("choreDefinitionId");

-- CreateIndex
CREATE INDEX "chore_occurrences_assigneeId_idx" ON "chore_occurrences"("assigneeId");

-- CreateIndex
CREATE UNIQUE INDEX "completions_choreOccurrenceId_key" ON "completions"("choreOccurrenceId");

-- CreateIndex
CREATE INDEX "completions_completedByMemberId_idx" ON "completions"("completedByMemberId");

-- AddForeignKey
ALTER TABLE "chore_occurrences" ADD CONSTRAINT "chore_occurrences_choreDefinitionId_fkey" FOREIGN KEY ("choreDefinitionId") REFERENCES "chore_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_occurrences" ADD CONSTRAINT "chore_occurrences_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_occurrences" ADD CONSTRAINT "chore_occurrences_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completions" ADD CONSTRAINT "completions_choreOccurrenceId_fkey" FOREIGN KEY ("choreOccurrenceId") REFERENCES "chore_occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completions" ADD CONSTRAINT "completions_completedByMemberId_fkey" FOREIGN KEY ("completedByMemberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
