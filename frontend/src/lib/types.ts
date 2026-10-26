export type SimulationStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIAL"
  | "FAILED";

export type BankOfferStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "APPROVED"
  | "DENIED"
  | "TIMEOUT"
  | "ERROR";

export type BankId = "BANK_GOLD" | "BANK_SILVER";

export type CloseReason = "WORKER" | "DEADLINE";

export interface BankOffer {
  bankId: BankId;
  status: BankOfferStatus;
  approvedAmountCents: number | null;
  installmentCents: number | null;
  totalCents: number | null;
  monthlyRateBps: number | null;
  reason: string | null;
  latencyMs: number | null;
  attempts: number;
  errorCode: string | null;
}

export interface Simulation {
  id: string;
  status: SimulationStatus;
  idempotencyKey: string | null;
  cpfMasked: string;
  requestedAmountCents: number;
  installments: number;
  deadlineAt: string;
  createdAt: string;
  completedAt: string | null;
  closeReason: CloseReason | null;
  offers: BankOffer[];
}

const OPEN_SIMULATION_STATUSES: ReadonlySet<SimulationStatus> = new Set([
  "QUEUED",
  "PROCESSING",
]);

export function isSimulationOpen(status: SimulationStatus): boolean {
  return OPEN_SIMULATION_STATUSES.has(status);
}
