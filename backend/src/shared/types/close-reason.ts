export const CLOSE_REASONS = ["WORKER", "DEADLINE"] as const;

export type CloseReason = (typeof CLOSE_REASONS)[number];

export function isCloseReason(value: unknown): value is CloseReason {
  return typeof value === "string" && (CLOSE_REASONS as readonly string[]).includes(value);
}
