import type { SimulationStatus } from "@type/simulation-status";
import type { CloseReason } from "@type/close-reason";

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
  closeReason: CloseReason | null;
}
