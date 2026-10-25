import type { SimulationStatus } from "@types/simulation.status";

export interface Simulation {
  id: string;
  status: SimulationStatus;
  idempotencyKey: string | null;
  cpfMasked: string;
  requestedAmountCents: number;
  installments: number;
  deadlineAt: Date;
  createdAt: Date;
  completedAt: Date | null;
}
