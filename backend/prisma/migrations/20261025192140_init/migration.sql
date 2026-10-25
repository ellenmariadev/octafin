-- CreateEnum
CREATE TYPE "SimulationStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "BankOfferStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'DENIED', 'TIMEOUT', 'ERROR');

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "status" "SimulationStatus" NOT NULL DEFAULT 'QUEUED',
    "idempotencyKey" TEXT,
    "cpfMasked" TEXT NOT NULL,
    "requestedAmountCents" INTEGER NOT NULL,
    "installments" INTEGER NOT NULL,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankOffer" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "status" "BankOfferStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAmountCents" INTEGER,
    "installmentCents" INTEGER,
    "totalCents" INTEGER,
    "monthlyRateBps" INTEGER,
    "reason" TEXT,
    "latencyMs" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Simulation_idempotencyKey_key" ON "Simulation"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Simulation_status_deadlineAt_idx" ON "Simulation"("status", "deadlineAt");

-- CreateIndex
CREATE INDEX "BankOffer_simulationId_idx" ON "BankOffer"("simulationId");

-- CreateIndex
CREATE UNIQUE INDEX "BankOffer_simulationId_bankId_key" ON "BankOffer"("simulationId", "bankId");

-- AddForeignKey
ALTER TABLE "BankOffer" ADD CONSTRAINT "BankOffer_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
