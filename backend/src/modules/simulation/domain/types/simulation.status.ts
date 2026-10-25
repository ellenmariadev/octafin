export const SIMULATION_STATUS = [
  "QUEUED",
  "PROCESSING",
  "COMPLETED",
  "PARTIAL",
  "FAILED",
] as const;

export type SimulationStatus = (typeof SIMULATION_STATUS)[number];

const TERMINAL_STATUS: ReadonlySet<SimulationStatus> = new Set<SimulationStatus>([
  "COMPLETED",
  "PARTIAL",
  "FAILED",
]);

export function isSimulationTerminal(status: SimulationStatus): boolean {
  return TERMINAL_STATUS.has(status);
}

export function isSimulationOpen(status: SimulationStatus): boolean {
  return !isSimulationTerminal(status);
}
