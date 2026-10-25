export const BANK_IDS = ["BANCO_OURO", "BANCO_PRATA"] as const;

export type BankId = (typeof BANK_IDS)[number];

export function isBankId(value: unknown): value is BankId {
  return typeof value === "string" && (BANK_IDS as readonly string[]).includes(value);
}
