create extension if not exists vector;

-- AlterTable
ALTER TABLE "volunteers" ADD COLUMN     "skill_vector" vector(3072);
