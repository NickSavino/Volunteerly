/*
  Warnings:

  - A unique constraint covering the columns `[flag_issuer_id,opportunity_id]` on the table `flags` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "flags" ADD COLUMN     "opportunity_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "flags_flag_issuer_id_opportunity_id_key" ON "flags"("flag_issuer_id", "opportunity_id");

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
