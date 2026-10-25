import { Injectable } from "@nestjs/common";
import type {
  BankAdapter,
  BankEvaluationRequest,
  NormalizedBankResponse,
} from "../contracts/bank-adapter";
import { calculateInstallmentCents } from "../utils/amortization";
import type { BankId } from "@type/bank-id";

const MONTHLY_RATE_BPS = 190;
const MAX_INSTALLMENT_SHARE = 0.3;

export interface BankGoldRawResponse {
  success: boolean;
  approved_value?: number;
  monthly_tax?: number;
  rejection_reason?: string;
}

export function normalizeBankGold(
  raw: BankGoldRawResponse,
  requestedAmountCents: number,
  installments: number,
): NormalizedBankResponse {
  if (!raw.success) {
    return {
      approved: false,
      approvedAmountCents: null,
      installmentCents: null,
      totalCents: null,
      monthlyRateBps: null,
      reason: raw.rejection_reason ?? "reprovado pelo banco",
    };
  }
  const installmentCents = calculateInstallmentCents(
    requestedAmountCents,
    MONTHLY_RATE_BPS,
    installments,
  );
  return {
    approved: true,
    approvedAmountCents: requestedAmountCents,
    installmentCents,
    totalCents: installmentCents * installments,
    monthlyRateBps: MONTHLY_RATE_BPS,
    reason: null,
  };
}

@Injectable()
export class BankGoldAdapter implements BankAdapter {
  readonly bankId: BankId = "BANK_GOLD";

  async evaluate(request: BankEvaluationRequest): Promise<NormalizedBankResponse> {
    const installmentCents = calculateInstallmentCents(
      request.requestedAmountCents,
      MONTHLY_RATE_BPS,
      request.installments,
    );
    const maxInstallmentCents = Math.floor(request.monthlySalaryCents * MAX_INSTALLMENT_SHARE);
    const approved = installmentCents <= maxInstallmentCents;

    const raw: BankGoldRawResponse = approved
      ? {
          success: true,
          approved_value: request.requestedAmountCents,
          monthly_tax: MONTHLY_RATE_BPS,
        }
      : {
          success: false,
          rejection_reason: "comprometimento de renda acima do limite permitido",
        };

    return normalizeBankGold(raw, request.requestedAmountCents, request.installments);
  }
}
