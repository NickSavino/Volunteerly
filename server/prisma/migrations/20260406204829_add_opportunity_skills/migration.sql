-- CreateTable
CREATE TABLE "opportunity_skills" (
    "id" TEXT NOT NULL,
    "vol_id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_skills_vol_id_opportunity_id_skill_name_key" ON "opportunity_skills"("vol_id", "opportunity_id", "skill_name");

-- AddForeignKey
ALTER TABLE "opportunity_skills" ADD CONSTRAINT "opportunity_skills_vol_id_fkey" FOREIGN KEY ("vol_id") REFERENCES "volunteers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_skills" ADD CONSTRAINT "opportunity_skills_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
