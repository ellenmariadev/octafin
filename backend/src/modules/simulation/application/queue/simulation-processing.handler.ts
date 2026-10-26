import { Injectable } from "@nestjs/common";
import type PgBoss from "pg-boss";
import { BankGateway } from "@/modules/banks/application/bank-gateway";
import type {
  BankEvaluationRequest,
  BankEvaluationResult,
} from "@/modules/banks/contracts/bank-adapter";
import { SimulationRepository } from "../../infra/prisma/simulation.repository";
import { BANK_IDS } from "@type/bank-id";
import type { SimulationStatus } from "@type/simulation-status";

export interface SimulationProcessingResult {
  simulationId: string;
  results: BankEvaluationResult[];
}

/**
 * Handler do worker. Orquestra o processamento de uma simulação:
 * trava a linha (`markProcessing`), avalia cada banco e consolida o resultado
 * final. Respostas tardias são ignoradas (a oferta já foi fechada pelo deadline).
 */
@Injectable()
export class SimulationProcessingHandler {
  constructor(
    private readonly gateway: BankGateway,
    private readonly repository: SimulationRepository,
  ) {}

  async handle(jobs: PgBoss.Job<BankEvaluationRequest>[]): Promise<SimulationProcessingResult[]> {
    const output: SimulationProcessingResult[] = [];

    for (const job of jobs) {
      const request = job.data;

      const simulation = await this.repository.markProcessing(request.simulationId);
      if (!simulation || simulation.status !== "PROCESSING") {
        continue;
      }

      const results = await this.processOffers(request);
      await this.repository.closeSimulation(request.simulationId, this.resolveStatus(results));

      output.push({ simulationId: request.simulationId, results });
    }

    return output;
  }

  private async processOffers(request: BankEvaluationRequest): Promise<BankEvaluationResult[]> {
    const results: BankEvaluationResult[] = [];

    for (const bankId of BANK_IDS) {
      const processable = await this.repository.markOfferInProgress(request.simulationId, bankId);
      if (!processable) {
        continue;
      }

      const result = await this.gateway.evaluate(bankId, request);
      const saved = await this.repository.saveOffer(request.simulationId, bankId, result);
      if (saved) {
        results.push(result);
      }
    }

    return results;
  }

  private resolveStatus(results: BankEvaluationResult[]): SimulationStatus {
    const approved = results.filter((result) => result.status === "APPROVED").length;
    if (results.length > 0 && approved === results.length) {
      return "COMPLETED";
    }
    if (approved > 0) {
      return "PARTIAL";
    }
    return "FAILED";
  }
}
