-- CreateEnum
CREATE TYPE "OpportunityState" AS ENUM ('OPEN', 'FILLED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('IN_PERSON', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "CommitmentLevel" AS ENUM ('FLEXIBLE', 'PART_TIME', 'FULL_TIME');

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "vol_id" TEXT,
    "status" "OpportunityState" NOT NULL DEFAULT 'OPEN',
    "name" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "candidate_desc" TEXT NOT NULL DEFAULT '',
    "work_type" "WorkType" NOT NULL DEFAULT 'IN_PERSON',
    "commitment_level" "CommitmentLevel" NOT NULL DEFAULT 'FLEXIBLE',
    "length" TEXT NOT NULL DEFAULT '',
    "deadline_date" TIMESTAMP(3),
    "availability" JSONB NOT NULL DEFAULT '[]',
    "posted_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_vol_id_fkey" FOREIGN KEY ("vol_id") REFERENCES "volunteers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
