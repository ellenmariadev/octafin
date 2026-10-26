import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "@/infra/database/prisma.module";
import { SimulationModule } from "@/modules/simulation/simulation.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SimulationModule,
  ],
})
export class AppModule {}
