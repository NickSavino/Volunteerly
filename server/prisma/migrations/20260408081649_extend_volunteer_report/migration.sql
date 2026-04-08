-- CreateEnum
CREATE TYPE "VolunteerReportAction" AS ENUM ('WARNING', 'SUSPEND', 'ESCALATE');

-- AlterTable
ALTER TABLE "volunteer_reports" ADD COLUMN     "action_taken" "VolunteerReportAction",
ADD COLUMN     "details" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "moderated_by_id" TEXT,
ADD COLUMN     "moderator_note" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resolved_at" TIMESTAMP(3),
ADD COLUMN     "severity" "UrgencyRating",
ADD COLUMN     "suspension_until" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "volunteer_reports_reported_user_id_is_open_idx" ON "volunteer_reports"("reported_user_id", "is_open");

-- AddForeignKey
ALTER TABLE "volunteer_reports" ADD CONSTRAINT "volunteer_reports_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "moderators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
