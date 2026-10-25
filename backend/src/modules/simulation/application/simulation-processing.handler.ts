import { Injectable } from "@nestjs/common";
import type PgBoss from "pg-boss";
import { BankGateway } from "@/modules/banks/application/bank-gateway";
import type {
  BankEvaluationRequest,
  BankEvaluationResult,
} from "@/modules/banks/contracts/bank-adapter";
import { BANK_IDS } from "@type/bank-id";

export interface SimulationProcessingResult {
  simulationId: string;
  results: BankEvaluationResult[];
}

/**
 * Handler do worker. Contrato: retorna os resultados normalizados em caso de
 * sucesso; lança em caso de falha irrecuperável, para que o PgBoss aplique a
 * política de retry.
 */
@Injectable()
export class SimulationProcessingHandler {
  constructor(private readonly gateway: BankGateway) {}

  async handle(jobs: PgBoss.Job<BankEvaluationRequest>[]): Promise<SimulationProcessingResult[]> {
    const output: SimulationProcessingResult[] = [];

    for (const job of jobs) {
      const request = job.data;
      const results = await Promise.all(
        BANK_IDS.map((bankId) => this.gateway.evaluate(bankId, request)),
      );
      output.push({ simulationId: request.simulationId, results });
    }

    return output;
  }
}
