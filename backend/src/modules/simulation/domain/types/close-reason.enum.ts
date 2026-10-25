export const CLOSE_REASONS = ["WORKER", "DEADLINE"] as const;

export type CloseReason = (typeof CLOSE_REASONS)[number];
