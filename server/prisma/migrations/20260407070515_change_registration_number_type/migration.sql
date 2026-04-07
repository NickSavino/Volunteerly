/*
  Warnings:

  - Changed the type of `organizationName` on the `RegisteredCharity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "RegisteredCharity" DROP COLUMN "organizationName",
ADD COLUMN     "organizationName" INTEGER NOT NULL;
