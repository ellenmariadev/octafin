import type PgBoss from "pg-boss";

export const SIMULATION_QUEUE = "simulation.process";

export const SIMULATION_QUEUE_OPTIONS: PgBoss.SendOptions = {
  retryLimit: 3,
  retryDelay: 5,
  retryBackoff: true,
  expireInSeconds: 60,
  retentionSeconds: 3600,
};
