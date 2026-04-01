-- CreateEnum
CREATE TYPE "VolunteerState" AS ENUM ('CLEAR', 'FLAGGED', 'RESOLVED', 'CLOSED');

-- AlterTable
ALTER TABLE "volunteers" ADD COLUMN     "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" "VolunteerState" NOT NULL DEFAULT 'CLEAR';

-- CreateTable
CREATE TABLE "volunteer_reports" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "reported_user_id" TEXT NOT NULL,
    "reporting_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_reports" ADD CONSTRAINT "volunteer_reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_reports" ADD CONSTRAINT "volunteer_reports_reporting_user_id_fkey" FOREIGN KEY ("reporting_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
