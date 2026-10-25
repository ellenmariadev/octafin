export const BANK_IDS = ["BANK_GOLD", "BANK_SILVER"] as const;

export type BankId = (typeof BANK_IDS)[number];

export function isBankId(value: unknown): value is BankId {
  return typeof value === "string" && (BANK_IDS as readonly string[]).includes(value);
}
