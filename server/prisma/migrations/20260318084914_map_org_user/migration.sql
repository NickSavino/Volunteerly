-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
