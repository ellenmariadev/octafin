export const BANK_OFFER_STATUS = [
  "PENDING",
  "IN_PROGRESS",
  "APPROVED",
  "DENIED",
  "TIMEOUT",
  "ERROR",
] as const;

export type BankOfferStatus = (typeof BANK_OFFER_STATUS)[number];

const TERMINAL_STATUS: ReadonlySet<BankOfferStatus> = new Set<BankOfferStatus>([
  "APPROVED",
  "DENIED",
  "TIMEOUT",
  "ERROR",
]);

export const BANK_OFFER_TRANSITIONS: Readonly<
  Record<BankOfferStatus, ReadonlySet<BankOfferStatus>>
> = {
  PENDING: new Set<BankOfferStatus>(["IN_PROGRESS", "TIMEOUT", "ERROR"]),
  IN_PROGRESS: new Set<BankOfferStatus>(["APPROVED", "DENIED", "TIMEOUT", "ERROR"]),
  APPROVED: new Set<BankOfferStatus>(),
  DENIED: new Set<BankOfferStatus>(),
  TIMEOUT: new Set<BankOfferStatus>(),
  ERROR: new Set<BankOfferStatus>(),
};

export function isBankOfferTerminal(status: BankOfferStatus): boolean {
  return TERMINAL_STATUS.has(status);
}

export function isBankOfferActive(status: BankOfferStatus): boolean {
  return !isBankOfferTerminal(status);
}

export function canTransitionOffer(from: BankOfferStatus, to: BankOfferStatus): boolean {
  return BANK_OFFER_TRANSITIONS[from].has(to);
}
