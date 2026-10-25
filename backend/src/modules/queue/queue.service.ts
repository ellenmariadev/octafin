import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import type PgBoss from "pg-boss";
import { PGBOSS } from "./queue.constants";

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(PGBOSS) private readonly boss: PgBoss) {}

  async onModuleInit(): Promise<void> {
    await this.boss.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.boss.stop({ graceful: true, wait: true });
  }

  send(name: string, data: object, options?: PgBoss.SendOptions): Promise<string | null> {
    return options === undefined ? this.boss.send(name, data) : this.boss.send(name, data, options);
  }

  sendAfter(
    name: string,
    data: object,
    options: PgBoss.SendOptions,
    when: Date | string | number,
  ): Promise<string | null> {
    if (when instanceof Date) {
      return this.boss.sendAfter(name, data, options, when);
    }
    if (typeof when === "number") {
      return this.boss.sendAfter(name, data, options, when);
    }
    return this.boss.sendAfter(name, data, options, when);
  }

  schedule(
    name: string,
    cron: string,
    data?: object,
    options?: PgBoss.ScheduleOptions,
  ): Promise<void> {
    return this.boss.schedule(name, cron, data, options);
  }

  work<ReqData>(name: string, handler: PgBoss.WorkHandler<ReqData>): Promise<string> {
    return this.boss.work(name, handler);
  }
}
