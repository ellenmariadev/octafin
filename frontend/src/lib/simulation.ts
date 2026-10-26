import type { BankId, BankOffer } from "./types";

export const BANK_LABELS: Record<BankId, string> = {
  BANK_GOLD: "Banco Ouro",
  BANK_SILVER: "Banco Prata",
};

export const BANK_IDS: BankId[] = ["BANK_GOLD", "BANK_SILVER"];

/**
 * Seleciona a melhor oferta: apenas ofertas `APPROVED` com parcela não nula.
 * Escolhe a menor parcela e, em empate, o menor `bankId` lexicograficamente.
 */
export function getBestOffer(offers: BankOffer[]): BankOffer | null {
  let best: BankOffer | null = null;

  for (const offer of offers) {
    if (offer.status !== "APPROVED" || offer.installmentCents == null) {
      continue;
    }

    if (best === null || best.installmentCents == null) {
      best = offer;
      continue;
    }

    if (offer.installmentCents < best.installmentCents) {
      best = offer;
      continue;
    }

    if (
      offer.installmentCents === best.installmentCents &&
      offer.bankId.localeCompare(best.bankId) < 0
    ) {
      best = offer;
    }
  }

  return best;
}
