-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "reason" TEXT NOT NULL,
    "personToMeet" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "allocatedMinutes" INTEGER,
    "passId" TEXT NOT NULL,
    "qrUrl" TEXT,
    "photoUrl" TEXT,
    "requestTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalTime" TIMESTAMP(3),
    "entryTime" TIMESTAMP(3),
    "exitTime" TIMESTAMP(3),
    "expiryTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_passId_key" ON "Visitor"("passId");
