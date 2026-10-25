import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { QueueService } from "@/modules/queue/queue.service";
import { SimulationProcessingHandler } from "./simulation-processing.handler";
import { SIMULATION_QUEUE } from "./simulation-queue.constants";
import type { BankEvaluationRequest } from "@/modules/banks/contracts/bank-adapter";

@Injectable()
export class SimulationWorker implements OnApplicationBootstrap {
  constructor(
    private readonly queue: QueueService,
    private readonly handler: SimulationProcessingHandler,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.queue.work<BankEvaluationRequest>(SIMULATION_QUEUE, (jobs) =>
      this.handler.handle(jobs),
    );
  }
}
