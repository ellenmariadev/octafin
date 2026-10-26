-- CreateEnum
CREATE TYPE "CloseReason" AS ENUM ('WORKER', 'DEADLINE');

-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN "closeReason" "CloseReason";
