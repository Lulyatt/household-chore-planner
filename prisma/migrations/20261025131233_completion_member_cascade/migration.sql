-- DropForeignKey
ALTER TABLE "completions" DROP CONSTRAINT "completions_completedByMemberId_fkey";

-- AddForeignKey
ALTER TABLE "completions" ADD CONSTRAINT "completions_completedByMemberId_fkey" FOREIGN KEY ("completedByMemberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
