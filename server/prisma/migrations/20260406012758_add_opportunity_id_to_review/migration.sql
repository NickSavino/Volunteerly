/*
  Warnings:

  - You are about to drop the column `latitude` on the `opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `opportunities` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[issuer_id,opportunity_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `opportunity_id` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "opportunities" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "opportunity_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_issuer_id_opportunity_id_key" ON "reviews"("issuer_id", "opportunity_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
