-- CreateTable
CREATE TABLE "RegisteredCharity" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,

    CONSTRAINT "RegisteredCharity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredCharity_registrationNumber_key" ON "RegisteredCharity"("registrationNumber");
