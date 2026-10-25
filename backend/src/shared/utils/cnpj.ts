const CNPJ_LENGTH = 14;
const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Remove qualquer caractere que não seja dígito. */
export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, "");
}

/** Aplica a máscara `XX.XXX.XXX/0001-XX` a um CNPJ numérico. */
export function maskCnpj(value: string): string {
  const digits = normalizeCnpj(value);
  if (digits.length !== CNPJ_LENGTH) {
    return value;
  }
  return (
    `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}` +
    `/${digits.slice(8, 12)}-${digits.slice(12)}`
  );
}

function isAllSameDigit(digits: string): boolean {
  return digits.split("").every((digit) => digit === digits[0]);
}

function computeCheckDigit(base: string, weights: readonly number[]): number {
  const sum = base.split("").reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Valida a estrutura e os dígitos verificadores de um CNPJ. */
export function isValidCnpj(value: string): boolean {
  const digits = normalizeCnpj(value);
  if (digits.length !== CNPJ_LENGTH) {
    return false;
  }
  if (isAllSameDigit(digits)) {
    return false;
  }

  const firstDigit = computeCheckDigit(digits.slice(0, 12), CNPJ_FIRST_WEIGHTS);
  const secondDigit = computeCheckDigit(digits.slice(0, 13), CNPJ_SECOND_WEIGHTS);

  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13]);
}
