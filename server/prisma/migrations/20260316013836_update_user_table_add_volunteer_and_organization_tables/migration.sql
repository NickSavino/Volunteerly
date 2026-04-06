/*
  Warnings:

  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountState" AS ENUM ('VERIFIED', 'UNVERIFIED', 'FLAGGED', 'BANNED');

-- CreateEnum
CREATE TYPE "OrganizationState" AS ENUM ('CREATED', 'APPLIED', 'VERIFIED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "status" "AccountState" NOT NULL DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL DEFAULT '',
    "status" "OrganizationState" NOT NULL DEFAULT 'CREATED',
    "charity_num" INTEGER NOT NULL DEFAULT 0,
    "doc_id" TEXT NOT NULL DEFAULT '',
    "contact_name" TEXT NOT NULL DEFAULT '',
    "contact_email" TEXT NOT NULL DEFAULT '',
    "contact_num" INTEGER NOT NULL DEFAULT 0,
    "hq_adr" TEXT NOT NULL DEFAULT '',
    "mission_statement" TEXT NOT NULL DEFAULT '',
    "cause_category" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "impact_highlights" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL DEFAULT '',
    "last_name" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "availability" JSONB NOT NULL DEFAULT '[]',
    "hourly_value" INTEGER NOT NULL DEFAULT 0,
    "organizations_assisted" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);
