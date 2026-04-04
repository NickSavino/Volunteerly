/*
  Warnings:

  - You are about to drop the column `skill_id` on the `skill_nodes` table. All the data in the column will be lost.
  - You are about to drop the `skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `volunteer_skills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "skill_nodes" DROP CONSTRAINT "skill_nodes_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "volunteer_skills" DROP CONSTRAINT "volunteer_skills_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "volunteer_skills" DROP CONSTRAINT "volunteer_skills_vol_id_fkey";

-- AlterTable
ALTER TABLE "skill_nodes" DROP COLUMN "skill_id",
ADD COLUMN     "skill_name" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "skills";

-- DropTable
DROP TABLE "volunteer_skills";

-- CreateTable
CREATE TABLE "volunteer_skill_profiles" (
    "vol_id" TEXT NOT NULL,
    "technical" JSONB NOT NULL DEFAULT '[]',
    "soft" JSONB NOT NULL DEFAULT '[]',
    "leadership" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_skill_profiles_pkey" PRIMARY KEY ("vol_id")
);

-- AddForeignKey
ALTER TABLE "volunteer_skill_profiles" ADD CONSTRAINT "volunteer_skill_profiles_vol_id_fkey" FOREIGN KEY ("vol_id") REFERENCES "volunteers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
