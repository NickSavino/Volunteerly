-- AlterEnum
ALTER TYPE "OrganizationState" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "rejection_reason" TEXT NOT NULL DEFAULT '';