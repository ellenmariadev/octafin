import { Injectable } from "@nestjs/common";
import { QueueService } from "@/modules/queue/queue.service";
import { SimulationRepository } from "../../infra/prisma/simulation.repository";
import { DEADLINE_QUEUE } from "./simulation-queue.constants";
import { isSimulationTerminal } from "@type/simulation-status";

export interface DeadlineJob {
  simulationId: string;
}

/**
 * Cuida do prazo (deadline) das simulações: agenda um job de fechamento por
 * simulação e expõe o reaper, que varre simulações vencidas de forma idempotente.
 */
@Injectable()
export class SimulationDeadlineService {
  constructor(
    private readonly queue: QueueService,
    private readonly repository: SimulationRepository,
  ) {}

  /** Agenda o fechamento da simulação para o instante do deadline. */
  async schedule(simulationId: string, deadlineAt: Date): Promise<void> {
    await this.queue.sendAfter(
      DEADLINE_QUEUE,
      { simulationId } satisfies DeadlineJob,
      {},
      deadlineAt,
    );
  }

  /** Fecha a simulação vencida (chamado pelo job de deadline). */
  async handleDeadline(simulationId: string): Promise<void> {
    const simulation = await this.repository.findById(simulationId);
    if (!simulation || isSimulationTerminal(simulation.status)) {
      return;
    }
    if (simulation.deadlineAt.getTime() > Date.now()) {
      return;
    }
    await this.repository.closeSimulation(simulationId, "FAILED", "DEADLINE");
  }

  /** Varre e fecha todas as simulações abertas com prazo expirado. */
  async reapExpired(): Promise<number> {
    const overdue = await this.repository.findOverdue(new Date());
    for (const simulation of overdue) {
      await this.repository.closeSimulation(simulation.id, "FAILED", "DEADLINE");
    }
    return overdue.length;
  }
}
