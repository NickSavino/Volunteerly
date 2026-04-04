/*
  Warnings:

  - You are about to drop the column `leadership` on the `volunteer_skill_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `soft` on the `volunteer_skill_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "volunteer_skill_profiles" DROP COLUMN "leadership",
DROP COLUMN "soft",
ADD COLUMN     "non_technical" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "volunteer_work_experiences" (
    "id" TEXT NOT NULL,
    "vol_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "start_date" TEXT NOT NULL DEFAULT '',
    "end_date" TEXT NOT NULL DEFAULT '',
    "responsibilities" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_educations" (
    "id" TEXT NOT NULL,
    "vol_id" TEXT NOT NULL,
    "institution" TEXT NOT NULL DEFAULT '',
    "degree" TEXT NOT NULL DEFAULT '',
    "graduation_year" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_educations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "volunteer_work_experiences" ADD CONSTRAINT "volunteer_work_experiences_vol_id_fkey" FOREIGN KEY ("vol_id") REFERENCES "volunteers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_educations" ADD CONSTRAINT "volunteer_educations_vol_id_fkey" FOREIGN KEY ("vol_id") REFERENCES "volunteers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
