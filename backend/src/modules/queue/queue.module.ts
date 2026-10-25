import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import PgBoss from "pg-boss";
import { PGBOSS } from "./queue.constants";
import { QueueService } from "./queue.service";

@Module({
  providers: [
    {
      provide: PGBOSS,
      useFactory: (config: ConfigService) =>
        new PgBoss({
          connectionString: config.getOrThrow<string>("DATABASE_URL"),
          application_name: "octafin-worker",
        }),
      inject: [ConfigService],
    },
    QueueService,
  ],
  exports: [QueueService],
})
export class QueueModule {}
