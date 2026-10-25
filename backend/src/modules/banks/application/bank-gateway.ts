import { Injectable } from "@nestjs/common";
import type {
  BankAdapter,
  BankEvaluationRequest,
  BankEvaluationResult,
} from "../contracts/bank-adapter";
import {
  executeWithRetry,
  RetryExhaustedError,
  TimeoutError,
  type RetryPolicy,
} from "../utils/retry";
import type { BankId } from "@type/bank-id";
import { InternalError } from "@/shared/errors/app-error";

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  timeoutMs: 5_000,
  baseDelayMs: 250,
  backoffFactor: 2,
};

/**
 * Orquestra a chamada aos adapters aplicando timeout, retries e backoff,
 * e converte o resultado (ou a falha) em {@link BankEvaluationResult}.
 */
@Injectable()
export class BankGateway {
  private readonly adapters = new Map<BankId, BankAdapter>();

  constructor(
    adapters: BankAdapter[],
    private readonly policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  ) {
    for (const adapter of adapters) {
      this.adapters.set(adapter.bankId, adapter);
    }
  }

  async evaluate(bankId: BankId, request: BankEvaluationRequest): Promise<BankEvaluationResult> {
    const adapter = this.adapters.get(bankId);
    if (!adapter) {
      throw new InternalError(`nenhum adaptador registrado para o banco ${bankId}`);
    }

    const startedAt = Date.now();

    try {
      const { value, attempts } = await executeWithRetry(
        () => adapter.evaluate(request),
        this.policy,
      );
      return {
        bankId,
        status: value.approved ? "APPROVED" : "DENIED",
        approvedAmountCents: value.approvedAmountCents,
        installmentCents: value.installmentCents,
        totalCents: value.totalCents,
        monthlyRateBps: value.monthlyRateBps,
        reason: value.reason,
        errorCode: null,
        attempts,
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      const attempts = error instanceof RetryExhaustedError ? error.attempts : 1;
      const cause = error instanceof RetryExhaustedError ? error.cause : error;
      const isTimeout = cause instanceof TimeoutError;
      return {
        bankId,
        status: isTimeout ? "TIMEOUT" : "ERROR",
        approvedAmountCents: null,
        installmentCents: null,
        totalCents: null,
        monthlyRateBps: null,
        reason: null,
        errorCode: isTimeout ? "TIMEOUT" : "BANK_ERROR",
        attempts,
        latencyMs: Date.now() - startedAt,
      };
    }
  }
}
