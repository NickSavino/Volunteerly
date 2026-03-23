/*
  Warnings:

  - You are about to drop the column `hoursContributed` on the `progress_updates` table. All the data in the column will be lost.
  - You are about to drop the column `typeOfTree` on the `skill_trees` table. All the data in the column will be lost.
  - Added the required column `type_of_tree` to the `skill_trees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "progress_updates" DROP COLUMN "hoursContributed",
ADD COLUMN     "hours_contributed" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "skill_trees" DROP COLUMN "typeOfTree",
ADD COLUMN     "type_of_tree" "SkillCategory" NOT NULL;
