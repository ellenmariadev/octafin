import { Module } from "@nestjs/common";
import { SimulationProducerService } from "./application/queue/simulation-producer.service";
import { SimulationProcessingHandler } from "./application/queue/simulation-processing.handler";
import { SimulationWorker } from "./application/queue/simulation.worker";
import { SimulationDeadlineService } from "./application/queue/simulation-deadline.service";
import { SimulationService } from "./application/simulation.service";
import { SimulationRepository } from "./infra/prisma/simulation.repository";
import { SimulationController } from "./http/simulation.controller";
import { BanksModule } from "@/modules/banks/banks.module";
import { QueueModule } from "@/modules/queue/queue.module";

@Module({
  imports: [BanksModule, QueueModule],
  controllers: [SimulationController],
  providers: [
    SimulationRepository,
    SimulationService,
    SimulationProducerService,
    SimulationProcessingHandler,
    SimulationDeadlineService,
    SimulationWorker,
  ],
  exports: [SimulationService],
})
export class SimulationModule {}
