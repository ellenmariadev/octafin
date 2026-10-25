const CENTS_PER_REAL = 100;

// Limites expressos em centavos (inteiros).
export const MIN_REQUESTED_AMOUNT_CENTS = 10_000; // R$ 100,00
export const MAX_REQUESTED_AMOUNT_CENTS = 10_000_000; // R$ 100.000,00

export const MIN_SALARY_CENTS = 10_000; // R$ 100,00
export const MAX_SALARY_CENTS = 100_000_000; // R$ 1.000.000,00

export const MIN_INSTALLMENTS = 12;
export const MAX_INSTALLMENTS = 96;

/**
 * Converte um valor em reais (número) para centavos (inteiro).
 */
export function toCents(valueInReais: number): number {
  return Math.round(valueInReais * CENTS_PER_REAL);
}

/** Converte um valor em centavos (inteiro) para reais (número). */
export function fromCents(valueInCents: number): number {
  return valueInCents / CENTS_PER_REAL;
}

/** Formata um valor em centavos como moeda brasileira. */
export function formatBRL(valueInCents: number): string {
  return (valueInCents / CENTS_PER_REAL).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
