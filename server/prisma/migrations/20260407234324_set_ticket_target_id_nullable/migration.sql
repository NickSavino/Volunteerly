-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_target_id_fkey";

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "target_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
