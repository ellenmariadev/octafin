import { Module } from "@nestjs/common";
import { SimulationProducerService } from "./application/simulation-producer.service";
import { SimulationProcessingHandler } from "./application/simulation-processing.handler";
import { SimulationWorker } from "./application/simulation.worker";
import { BanksModule } from "@/modules/banks/banks.module";
import { QueueModule } from "@/modules/queue/queue.module";

@Module({
  imports: [BanksModule, QueueModule],
  providers: [SimulationProducerService, SimulationProcessingHandler, SimulationWorker],
  exports: [SimulationProducerService],
})
export class SimulationModule {}
