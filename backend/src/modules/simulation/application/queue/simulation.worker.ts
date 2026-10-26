import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import type PgBoss from "pg-boss";
import { QueueService } from "@/modules/queue/queue.service";
import { SimulationProcessingHandler } from "./simulation-processing.handler";
import { SimulationDeadlineService, type DeadlineJob } from "./simulation-deadline.service";
import {
  DEADLINE_QUEUE,
  REAPER_CRON,
  REAPER_SCHEDULE_NAME,
  SIMULATION_QUEUE,
} from "./simulation-queue.constants";
import type { BankEvaluationRequest } from "@/modules/banks/contracts/bank-adapter";

@Injectable()
export class SimulationWorker implements OnApplicationBootstrap {
  constructor(
    private readonly queue: QueueService,
    private readonly handler: SimulationProcessingHandler,
    private readonly deadline: SimulationDeadlineService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.queue.createQueue(SIMULATION_QUEUE);
    await this.queue.createQueue(DEADLINE_QUEUE);
    await this.queue.createQueue(REAPER_SCHEDULE_NAME);

    await this.queue.work<BankEvaluationRequest>(SIMULATION_QUEUE, (jobs) =>
      this.handler.handle(jobs),
    );

    await this.queue.work<DeadlineJob>(DEADLINE_QUEUE, (jobs) => this.handleDeadlineJobs(jobs));

    await this.queue.schedule(REAPER_SCHEDULE_NAME, REAPER_CRON, {});
    await this.queue.work(REAPER_SCHEDULE_NAME, () => this.deadline.reapExpired());
  }

  private async handleDeadlineJobs(jobs: PgBoss.Job<DeadlineJob>[]): Promise<void> {
    for (const job of jobs) {
      await this.deadline.handleDeadline(job.data.simulationId);
    }
  }
}
