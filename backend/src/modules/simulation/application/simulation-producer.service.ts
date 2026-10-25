import { Injectable } from "@nestjs/common";
import { QueueService } from "@/modules/queue/queue.service";
import { SIMULATION_QUEUE, SIMULATION_QUEUE_OPTIONS } from "./simulation-queue.constants";
import type { BankEvaluationRequest } from "@/modules/banks/contracts/bank-adapter";
import { ServiceUnavailableError } from "@/shared/errors/app-error";

@Injectable()
export class SimulationProducerService {
  constructor(private readonly queue: QueueService) {}

  async enqueue(request: BankEvaluationRequest): Promise<string> {
    const jobId = await this.queue.send(SIMULATION_QUEUE, request, SIMULATION_QUEUE_OPTIONS);
    if (!jobId) {
      throw new ServiceUnavailableError("não foi possível enfileirar a simulação");
    }

    return jobId;
  }
}
