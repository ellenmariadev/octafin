import { Injectable } from "@nestjs/common";
import type {
  BankAdapter,
  BankEvaluationRequest,
  NormalizedBankResponse,
} from "../contracts/bank-adapter";
import { calculateInstallmentCents } from "../utils/amortization";
import type { BankId } from "@type/bank-id";

const MONTHLY_RATE_BPS = 220;
const MAX_LOAN_TO_SALARY = 3;

/** Resposta bruta do BANK SILVER (formato distinto do GOLD). */
export interface BankSilverRawResponse {
  status: "APROVADO" | "REPROVADO";
  limite_concedido?: number;
  juros_mensal?: number;
  motivo_recusa?: string;
}

/** Converte a resposta bruta do BANK SILVER para o formato normalizado. */
export function normalizeBankSilver(
  raw: BankSilverRawResponse,
  requestedAmountCents: number,
  installments: number,
): NormalizedBankResponse {
  if (raw.status !== "APROVADO") {
    return {
      approved: false,
      approvedAmountCents: null,
      installmentCents: null,
      totalCents: null,
      monthlyRateBps: null,
      reason: raw.motivo_recusa ?? "reprovado pelo banco",
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
export class BankSilverAdapter implements BankAdapter {
  readonly bankId: BankId = "BANK_SILVER";

  async evaluate(request: BankEvaluationRequest): Promise<NormalizedBankResponse> {
    const maxAmountCents = Math.floor(request.monthlySalaryCents * MAX_LOAN_TO_SALARY);
    const approved = request.requestedAmountCents <= maxAmountCents;

    const raw: BankSilverRawResponse = approved
      ? {
          status: "APROVADO",
          limite_concedido: request.requestedAmountCents,
          juros_mensal: MONTHLY_RATE_BPS,
        }
      : {
          status: "REPROVADO",
          motivo_recusa: "valor solicitado acima do limite de crédito",
        };

    return normalizeBankSilver(raw, request.requestedAmountCents, request.installments);
  }
}
