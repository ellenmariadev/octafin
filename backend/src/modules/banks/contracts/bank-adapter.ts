import type { BankId } from "@type/bank-id";
import type { BankOfferStatus } from "@type/bank-offer-status";

export interface BankEvaluationRequest {
  simulationId: string;
  cpf: string;
  requestedAmountCents: number;
  installments: number;
  monthlySalaryCents: number;
  employerCnpj: string;
  birthDate: string;
}

export interface NormalizedBankResponse {
  approved: boolean;
  approvedAmountCents: number | null;
  installmentCents: number | null;
  totalCents: number | null;
  monthlyRateBps: number | null;
  reason: string | null;
}

export interface BankEvaluationResult {
  bankId: BankId;
  status: BankOfferStatus;
  approvedAmountCents: number | null;
  installmentCents: number | null;
  totalCents: number | null;
  monthlyRateBps: number | null;
  reason: string | null;
  errorCode: string | null;
  attempts: number;
  latencyMs: number;
}

export interface BankAdapter {
  readonly bankId: BankId;
  evaluate(request: BankEvaluationRequest): Promise<NormalizedBankResponse>;
}
