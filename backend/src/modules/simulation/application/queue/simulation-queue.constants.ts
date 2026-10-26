import type PgBoss from "pg-boss";

export const SIMULATION_QUEUE = "simulation.process";
export const DEADLINE_QUEUE = "simulation.deadline";
export const REAPER_SCHEDULE_NAME = "simulation.reaper";

/** Frequência do reaper (a cada minuto). */
export const REAPER_CRON = "* * * * *";

export const SIMULATION_QUEUE_OPTIONS: PgBoss.SendOptions = {
  retryLimit: 3,
  retryDelay: 5,
  retryBackoff: true,
  expireInSeconds: 60,
  retentionSeconds: 3600,
};
