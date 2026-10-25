export function calculateInstallmentCents(
  principalCents: number,
  monthlyRateBps: number,
  installments: number,
): number {
  const i = monthlyRateBps / 10_000;
  const factor = Math.pow(1 + i, installments);
  const payment = (principalCents * i * factor) / (factor - 1);
  return Math.round(payment);
}
