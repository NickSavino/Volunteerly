/*
  Warnings:

  - Changed the type of `registrationNumber` on the `RegisteredCharity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "RegisteredCharity" DROP COLUMN "registrationNumber",
ADD COLUMN     "registrationNumber" INTEGER NOT NULL,
ALTER COLUMN "organizationName" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredCharity_registrationNumber_key" ON "RegisteredCharity"("registrationNumber");
