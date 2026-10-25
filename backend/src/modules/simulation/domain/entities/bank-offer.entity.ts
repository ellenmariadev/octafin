import type { BankId } from "@types/bank-id.enum";
import type { BankOfferStatus } from "@types/bank-offer.status";

export interface BankOffer {
  id: string;
  simulationId: string;
  bankId: BankId;
  status: BankOfferStatus;
  approvedAmountCents: number | null;
  installmentCents: number | null;
  totalCents: number | null;
  monthlyRateBps: number | null;
  reason: string | null;
  latencyMs: number | null;
  attempts: number;
  errorCode: string | null;
  updatedAt: Date;
}
