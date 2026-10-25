import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SimulationModule } from "@/modules/simulation/simulation.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SimulationModule,
  ],
})
export class AppModule {}
